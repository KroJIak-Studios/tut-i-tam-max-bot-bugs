import { Keyboard, type Context } from '@maxhub/max-bot-api'
import { MenuAction } from '../domain/menu-action.js'
import { PrimaryMessage } from '../domain/primary-message.js'
import { escapeHtml, I18n } from '../i18n/i18n.js'
import { BackendClient, type UserProfileInput } from './backend-client.js'
import { PrimaryMessageService } from './primary-message-service.js'

export class StartService {
  private readonly primaryMessages: PrimaryMessageService

  constructor(private readonly backend: BackendClient, private readonly fallbackLocale: string) {
    this.primaryMessages = new PrimaryMessageService(backend)
  }

  async handleBotStarted(ctx: Context, locale: string | null | undefined): Promise<void> {
    await this.backend.getAccessStatus(await this.loadProfile(ctx, locale))
  }

  async handleStart(ctx: Context): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const status = await this.backend.getAccessStatus(profile)
    const i18n = new I18n(status.locale, this.fallbackLocale)

    if (status.access_required && !status.access_granted) {
      await ctx.reply(i18n.translate('access.request_code'))
      return
    }

    await this.primaryMessages.sendOrReplace(
      ctx,
      this.createPrimary(i18n, profile.user.first_name),
      true,
    )
  }

  async handleText(ctx: Context, text: string): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const status = await this.backend.getAccessStatus(profile)
    const i18n = new I18n(status.locale, this.fallbackLocale)

    if (!status.access_required || status.access_granted) {
      return
    }

    const result = await this.backend.verifyAccessCode(profile, text)

    if (!result.access_granted) {
      await ctx.reply(i18n.translate('access.invalid_code'))
      return
    }

    await this.primaryMessages.sendOrReplace(
      ctx,
      this.createPrimary(new I18n(result.locale, this.fallbackLocale), profile.user.first_name),
    )
  }

  async handleNotReady(ctx: Context): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const status = await this.backend.getAccessStatus(profile)
    await ctx.answerOnCallback({})
    await ctx.reply(new I18n(status.locale, this.fallbackLocale).translate('common.not_ready'))
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

  private createPrimary(i18n: I18n, firstName: string): PrimaryMessage {
    const text = [
      `<b>${i18n.translate('start.title')}</b>`,
      '',
      i18n.translate('start.greeting', { name: escapeHtml(firstName) }),
      i18n.translate('start.description'),
      '',
      `<blockquote>${i18n.translate('start.quote')}</blockquote>`,
    ].join('\n')

    return new PrimaryMessage(text, {
      format: 'html',
      attachments: [
        Keyboard.inlineKeyboard([
          [Keyboard.button.callback(i18n.translate('start.open_mini_app'), MenuAction.OpenMiniApp)],
          [Keyboard.button.callback(i18n.translate('start.nearby_events'), MenuAction.NearbyEvents)],
          [Keyboard.button.callback(i18n.translate('start.my_meetings'), MenuAction.MyMeetings)],
          [Keyboard.button.callback(i18n.translate('start.ai_assistant'), MenuAction.AiAssistant)],
          [Keyboard.button.callback(i18n.translate('start.settings'), MenuAction.Settings)],
        ]),
      ],
    })
  }

  private requireIdentity(ctx: Context): { chatId: number; user: NonNullable<Context['user']> } {
    if (ctx.chatId === undefined || ctx.chatId === null || !ctx.user) {
      throw new Error('User and chat are required for the start flow')
    }

    return { chatId: ctx.chatId, user: ctx.user }
  }
}
