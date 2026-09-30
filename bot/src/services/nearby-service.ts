import { Keyboard, type Context } from '@maxhub/max-bot-api'
import { PendingMessageRegistry } from '../domain/pending-message-registry.js'
import { I18n } from '../i18n/i18n.js'
import { BackendClient, type UserProfileInput } from './backend-client.js'
import { MeetingsService } from './meetings-service.js'
import { StartService } from './start-service.js'

const WAITING = new Set<number>()
const ORIGIN = new Map<number, { latitude: number; longitude: number }>()
const ASK_MESSAGE = new Map<number, string>()

export class NearbyService {
  constructor(
    private readonly backend: BackendClient,
    private readonly pending: PendingMessageRegistry,
    private readonly fallbackLocale: string,
    private readonly menu: StartService,
    private readonly meetings: MeetingsService,
  ) {}

  async open(ctx: Context): Promise<void> {
    const profile = await this.loadProfile(ctx)
    WAITING.add(profile.chatId)
    const i18n = await this.i18n(profile)
    const sent = await this.pending.sendPending(ctx, i18n.translate('nearby.ask'), {
      format: 'html',
      attachments: [Keyboard.inlineKeyboard([
        [Keyboard.button.requestGeoLocation(`📍 ${i18n.translate('nearby.share')}`, { quick: false })],
        [Keyboard.button.callback(`🏠 ${i18n.translate('nearby.menu')}`, 'nearby:menu')],
      ])],
    })
    ASK_MESSAGE.set(profile.chatId, sent.body.mid)
  }

  isWaiting(chatId: number | undefined): boolean {
    return chatId !== undefined && WAITING.has(chatId)
  }

  async receive(ctx: Context, latitude: number, longitude: number): Promise<void> {
    const profile = await this.loadProfile(ctx)
    WAITING.delete(profile.chatId)
    const i18n = await this.i18n(profile)
    const searching = await ctx.reply(i18n.translate('nearby.searching'))
    await this.backend.trackPendingMessage(profile.chatId, searching.body.mid)
    const event = await this.backend.nearbyEvent(profile, latitude, longitude)
    await ctx.api.deleteMessage(searching.body.mid).catch(() => undefined)
    await this.backend.removePendingMessage(profile.chatId, searching.body.mid)
    await this.clearButtons(ctx, ASK_MESSAGE.get(profile.chatId), i18n.translate('nearby.ask'))
    if (!event) {
      await this.showEmpty(ctx, i18n)
      return
    }
    ORIGIN.set(profile.chatId, { latitude, longitude })
    await this.sendCard(ctx, profile, i18n, event.id)
  }

  async again(ctx: Context): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const origin = ORIGIN.get(profile.chatId)
    if (!origin || !ctx.messageId) {
      await this.open(ctx)
      return
    }
    const i18n = await this.i18n(profile)
    const event = await this.backend.nearbyEvent(profile, origin.latitude, origin.longitude)
    if (!event) {
      await this.showEmpty(ctx, i18n, ctx.messageId)
      return
    }
    await this.sendCard(ctx, profile, i18n, event.id, ctx.messageId)
  }

  async toggle(ctx: Context, eventId: number): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const current = await this.backend.meetingCard(profile, eventId)
    if (!current || !ctx.messageId) return
    const meeting = await this.backend.setMeetingAttendance(profile, eventId, !current.going)
    if (!meeting) return
    const i18n = await this.i18n(profile)
    await this.sendCard(ctx, profile, i18n, meeting.id, ctx.messageId)
  }

  private async sendCard(ctx: Context, profile: UserProfileInput, i18n: I18n, eventId: number, messageId?: string): Promise<void> {
    const meeting = await this.backend.meetingCard(profile, eventId)
    if (!meeting) return
    const status = await this.backend.getAccessStatus(profile)
    const card = await this.meetings.cardContent(ctx, profile, meeting, i18n, status.locale)
    const goingLabel = meeting.going
      ? `🙋 ${i18n.translate('meetings.going')} ✅`
      : `🙋 ${i18n.translate('meetings.join')}`
    const rows = [
      ...card.rows.map((row) => row.map((button) => (
        button.type === 'callback' && String(button.payload).startsWith('meetings:going:')
          ? Keyboard.button.callback(goingLabel, `nearby:going:${meeting.id}`)
          : button
      ))),
      [Keyboard.button.callback(`🔄 ${i18n.translate('nearby.another')}`, 'nearby:again')],
      [Keyboard.button.callback(`🏠 ${i18n.translate('nearby.menu')}`, 'nearby:menu')],
    ]
    const attachments = [...card.images.slice(0, 3), Keyboard.inlineKeyboard(rows)]
    if (messageId) {
      await ctx.api.editMessage(messageId, { text: card.text, format: 'html', attachments })
      return
    }
    await ctx.reply(card.text, { format: 'html', attachments })
  }

  private async clearButtons(ctx: Context, messageId: string | undefined, text: string): Promise<void> {
    if (!messageId) return
    try {
      await ctx.api.editMessage(messageId, { text, format: 'html', attachments: [] })
    } catch {
      return
    }
  }

  private async showEmpty(ctx: Context, i18n: I18n, messageId?: string): Promise<void> {
    const extra = {
      format: 'html' as const,
      attachments: [Keyboard.inlineKeyboard([[Keyboard.button.callback(`🏠 ${i18n.translate('nearby.menu')}`, 'nearby:menu')]])],
    }
    if (messageId) {
      await ctx.api.editMessage(messageId, { text: i18n.translate('nearby.empty'), ...extra })
      return
    }
    await ctx.reply(i18n.translate('nearby.empty'), extra)
  }

  async close(ctx: Context): Promise<void> {
    if (ctx.chatId != null) WAITING.delete(ctx.chatId)
    const messageId = ctx.messageId
    const text = ctx.message?.body.text
    if (ctx.chatId != null && messageId) {
      try {
        await ctx.api.editMessage(messageId, { text: text ?? '', format: 'html', attachments: [] })
      } catch {
        await ctx.api.deleteMessage(messageId).catch(() => undefined)
      }
      await this.backend.removePendingMessage(ctx.chatId, messageId)
    }
    await this.menu.handleStart(ctx, true)
  }

  private async i18n(profile: UserProfileInput): Promise<I18n> {
    const status = await this.backend.getAccessStatus(profile)
    return new I18n(status.locale, this.fallbackLocale)
  }

  private async loadProfile(ctx: Context): Promise<UserProfileInput> {
    const chatId = ctx.chatId
    if (chatId === undefined || chatId === null || !ctx.user) throw new Error('User and chat are required')
    const chat = await ctx.getChat(chatId)
    return { user: ctx.user, chatId, avatarUrl: chat.dialog_with_user?.avatar_url, fullAvatarUrl: chat.dialog_with_user?.full_avatar_url }
  }
}
