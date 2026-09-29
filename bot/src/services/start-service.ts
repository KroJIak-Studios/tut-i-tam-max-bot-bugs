import { Keyboard, type Context } from '@maxhub/max-bot-api'
import { MenuAction } from '../domain/menu-action.js'
import { PrimaryMessage } from '../domain/primary-message.js'
import { TemporaryMessageRegistry } from '../domain/temporary-message.js'
import { escapeHtml, I18n } from '../i18n/i18n.js'
import { BackendClient, type UserProfileInput } from './backend-client.js'
import { PendingMessageRegistry } from '../domain/pending-message-registry.js'
import { PrimaryMessageService } from './primary-message-service.js'

export class StartService {
  private readonly primaryMessages: PrimaryMessageService
  private readonly temporaryMessages = new TemporaryMessageRegistry()

  constructor(
    private readonly backend: BackendClient,
    private readonly fallbackLocale: string,
    private readonly pending: PendingMessageRegistry,
  ) {
    this.primaryMessages = new PrimaryMessageService(backend)
  }

  async hasAccess(ctx: Context): Promise<boolean> {
    const profile = await this.loadProfile(ctx)
    const status = await this.backend.getAccessStatus(profile)
    return !status.access_required || status.access_granted
  }

  async requireAccess(ctx: Context): Promise<boolean> {
    if (await this.hasAccess(ctx)) return true
    await this.handleStart(ctx)
    return false
  }

  async handleStart(ctx: Context, forceNewPrimary = false, locale?: string | null): Promise<void> {
    const profile = await this.loadProfile(ctx, locale)
    const status = await this.backend.getAccessStatus(profile)
    const i18n = new I18n(status.locale, this.fallbackLocale)

    if (status.access_required && !status.access_granted) {
      await this.pending.sendOrUpdatePending(ctx, i18n.translate('access.request_code'))
      return
    }

    const meetingCount = await this.meetingCount(profile)

    await this.primaryMessages.sendOrReplace(
      ctx,
      this.createPrimary(i18n, profile.user.first_name, meetingCount, status.assistant_available),
      forceNewPrimary,
    )
    await this.clearPending(ctx)
  }

  async handleText(ctx: Context, text: string): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const status = await this.backend.getAccessStatus(profile)
    const i18n = new I18n(status.locale, this.fallbackLocale)

    if (!status.access_required || status.access_granted) return

    const result = await this.backend.verifyAccessCode(profile, text)

    if (!result.access_granted) {
      await this.pending.sendOrUpdatePending(ctx, i18n.translate('access.invalid_code'))
      return
    }

    await this.primaryMessages.sendOrReplace(
      ctx,
      this.createPrimary(new I18n(result.locale, this.fallbackLocale), profile.user.first_name, (await this.backend.listMeetings(profile)).total, result.assistant_available),
    )
    await this.clearPending(ctx)
  }

  async handleNotReady(ctx: Context): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const status = await this.backend.getAccessStatus(profile)
    const text = new I18n(status.locale, this.fallbackLocale).translate('common.not_ready')
    await this.temporaryMessages.send(ctx, text)
  }

  async clearPending(ctx: Context, exceptMessageId?: string): Promise<void> {
    if (ctx.chatId !== undefined && ctx.chatId !== null) {
      await this.pending.deleteSnapshot(ctx.api, ctx.chatId, exceptMessageId)
    }
  }

  private async loadProfile(ctx: Context, locale?: string | null): Promise<UserProfileInput> {
    const identity = this.requireIdentity(ctx)
    const dialog = await ctx.getChat(identity.chatId)
    const dialogUser = dialog.dialog_with_user

    return {
      user: identity.user,
      chatId: identity.chatId,
      locale,
      avatarUrl: dialogUser?.avatar_url,
      fullAvatarUrl: dialogUser?.full_avatar_url,
    }
  }

  private createPrimary(i18n: I18n, firstName: string, meetingCount: number, assistantAvailable: boolean): PrimaryMessage {
    const text = [
      i18n.translate('start.title'),
      '',
      i18n.translate('start.greeting', { name: escapeHtml(firstName) }),
      '',
      `<blockquote>${i18n.translate('start.quote')}</blockquote>`,
    ].join('\n')

    const buttons = [
      [
        Keyboard.button.callback(`📍 ${i18n.translate('start.nearby_events')}`, MenuAction.NearbyEvents),
        Keyboard.button.callback(`🗓️ ${i18n.translate('start.my_meetings')}${this.meetingBadge(meetingCount)}`, MenuAction.MyMeetings),
      ],
      ...(assistantAvailable ? [[Keyboard.button.callback(`🤖 ${i18n.translate('start.ai_assistant')}`, MenuAction.AiAssistant)]] : []),
      [Keyboard.button.callback(`⚙️ ${i18n.translate('start.settings')}`, MenuAction.Settings)],
    ]
    return new PrimaryMessage(text, {
      format: 'html',
      attachments: [Keyboard.inlineKeyboard(buttons)],
    })

  }

  private async meetingCount(profile: UserProfileInput): Promise<number> {
    return (await this.backend.listMeetings(profile)).total
  }

  private meetingBadge(count: number): string {
    if (count <= 0) return ''
    const shown = count > 9 ? '9+' : String(count)
    const digits = [...shown].map((character) => character === '+' ? '➕' : `${character}\uFE0F\u20E3`).join('')
    return ` (${digits})`
  }

  private requireIdentity(ctx: Context): { chatId: number; user: NonNullable<Context['user']> } {
    if (ctx.chatId === undefined || ctx.chatId === null || !ctx.user) {
      throw new Error('User and chat are required for the start flow')
    }

    return { chatId: ctx.chatId, user: ctx.user }
  }
}
