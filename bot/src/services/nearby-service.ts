import { Keyboard, type Context } from '@maxhub/max-bot-api'
import { PendingMessageRegistry } from '../domain/pending-message-registry.js'
import { I18n } from '../i18n/i18n.js'
import { BackendClient, type NearbyEvent, type UserProfileInput } from './backend-client.js'
import { StartService } from './start-service.js'

const WAITING = new Set<number>()

export class NearbyService {
  constructor(
    private readonly backend: BackendClient,
    private readonly pending: PendingMessageRegistry,
    private readonly fallbackLocale: string,
    private readonly menu: StartService,
  ) {}

  async open(ctx: Context): Promise<void> {
    const profile = await this.loadProfile(ctx)
    WAITING.add(profile.chatId)
    const i18n = await this.i18n(profile)
    await this.pending.sendOrUpdatePending(ctx, i18n.translate('nearby.ask'), {
      format: 'html',
      attachments: [Keyboard.inlineKeyboard([
        [Keyboard.button.requestGeoLocation(`📍 ${i18n.translate('nearby.share')}`, { quick: false })],
        [Keyboard.button.callback(`🏠 ${i18n.translate('nearby.menu')}`, 'nearby:menu')],
      ])],
    })
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
    if (!event) {
      await this.pending.sendOrUpdatePending(ctx, i18n.translate('nearby.empty'), {
        format: 'html',
        attachments: [Keyboard.inlineKeyboard([[Keyboard.button.callback(`🏠 ${i18n.translate('nearby.menu')}`, 'nearby:menu')]])],
      })
      return
    }
    await ctx.reply(this.text(event), { format: 'html', attachments: [Keyboard.inlineKeyboard(this.rows(i18n, event.id, event.going))] })
    await this.menu.handleStart(ctx)
  }

  async toggle(ctx: Context, eventId: number): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const card = await this.backend.meetingCard(profile, eventId)
    if (!card || !ctx.messageId) return
    const updated = await this.backend.setMeetingAttendance(profile, eventId, !card.going)
    if (!updated) return
    const i18n = await this.i18n(profile)
    await ctx.api.editMessage(ctx.messageId, {
      text: ctx.message?.body.text ?? '',
      format: 'html',
      attachments: [Keyboard.inlineKeyboard(this.rows(i18n, eventId, updated.going))],
    })
  }

  async again(ctx: Context): Promise<void> {
    await this.open(ctx)
  }

  async close(ctx: Context): Promise<void> {
    if (ctx.chatId != null) WAITING.delete(ctx.chatId)
    await this.menu.handleStart(ctx)
  }

  private text(event: NearbyEvent): string {
    return [`<b>${event.title}</b>`, `<u>${event.starts_at}</u>`, event.address, event.description].filter(Boolean).join('\n\n')
  }

  private rows(i18n: I18n, eventId: number, going: boolean) {
    const label = going ? `✅ ${i18n.translate('nearby.going_done')}` : `🙋 ${i18n.translate('nearby.going')}`
    return [
      [Keyboard.button.callback(label, `nearby:going:${eventId}`)],
      [Keyboard.button.callback(`🔄 ${i18n.translate('nearby.another')}`, 'nearby:again')],
      [Keyboard.button.callback(`🏠 ${i18n.translate('nearby.menu')}`, 'nearby:menu')],
    ]
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
