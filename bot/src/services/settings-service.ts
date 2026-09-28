import { Keyboard, type Context } from '@maxhub/max-bot-api'
import { SettingsAction } from '../domain/settings-action.js'
import { PendingMessageRegistry } from '../domain/pending-message-registry.js'
import { I18n, normalizeLocale } from '../i18n/i18n.js'
import { BackendClient, type NotificationPreference, type UserProfileInput } from './backend-client.js'

export class SettingsService {
  constructor(
    private readonly backend: BackendClient,
    private readonly pending: PendingMessageRegistry,
    private readonly fallbackLocale: string,
  ) {}

  async open(ctx: Context): Promise<void> {
    await this.showMenu(ctx, 'root')
  }

  async showMenu(
    ctx: Context,
    menu: 'root' | 'notifications' | 'language' | 'delete',
    notice?: string,
  ): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const status = await this.backend.getAccessStatus(profile)
    const i18n = new I18n(status.locale, this.fallbackLocale)

    if (menu === 'root') {
      await this.pending.sendOrUpdatePending(ctx, i18n.translate('settings.title'), {
        format: 'html',
        attachments: [Keyboard.inlineKeyboard([
          [Keyboard.button.callback(`🔔 ${i18n.translate('settings.notifications')}`, SettingsAction.Notifications)],
          [Keyboard.button.callback(`🌐 ${i18n.translate('settings.language')}`, SettingsAction.Language)],
          [Keyboard.button.callback(`❌ ${i18n.translate('settings.delete_data')}`, SettingsAction.DeleteData)],
          [Keyboard.button.callback(`↩️ ${i18n.translate('common.back')}`, SettingsAction.BackToMenu)],
        ])],
      })
      return
    }

    if (menu === 'notifications') {
      const current = await this.backend.getNotificationPreference(profile)
      const options: Array<[NotificationPreference, string, string]> = [
        ['enabled', '🔔', i18n.translate('settings.notification_enabled')],
        ['silent', '🔕', i18n.translate('settings.notification_silent')],
        ['disabled', '🚫', i18n.translate('settings.notification_disabled')],
      ]
      const callbacks = [SettingsAction.NotificationsEnabled, SettingsAction.NotificationsSilent, SettingsAction.NotificationsDisabled]
      const rows = options.map(([value, icon, title], index) => [
        Keyboard.button.callback(`${icon} ${title}${current === value ? ' ✅' : ''}`, callbacks[index]!),
      ])
      rows.push([Keyboard.button.callback(`↩️ ${i18n.translate('common.back')}`, SettingsAction.BackToRoot)])
      const text = [i18n.translate('settings.notifications_title'), notice].filter(Boolean).join('\n\n')
      await this.pending.sendOrUpdatePending(ctx, text, {
        format: 'html',
        attachments: [Keyboard.inlineKeyboard(rows)],
      })
      return
    }

    if (menu === 'language') {
      const languageEntries = Object.keys(i18n.languageNames())
      const rows = languageEntries.map((locale) => {
        const selected = locale === status.locale
        const displayName = selected ? i18n.languageNames()[locale]! : i18n.languageDisplayName(locale)
        const icon = this.flagForLocale(locale)
        return [Keyboard.button.callback(`${icon} ${displayName}${selected ? ' ✅' : ''}`, `${SettingsAction.LanguagePrefix}${locale}`)]
      })
      rows.push([Keyboard.button.callback(`↩️ ${i18n.translate('common.back')}`, SettingsAction.BackToRoot)])
      const quote = `<blockquote>${i18n.translate('settings.current_language', { language: i18n.languageNames()[status.locale] ?? status.locale })}</blockquote>`
      const text = [i18n.translate('settings.language_title'), quote, notice].filter(Boolean).join('\n\n')
      await this.pending.sendOrUpdatePending(ctx, text, {
        format: 'html',
        attachments: [Keyboard.inlineKeyboard(rows)],
      })
      return
    }

    await this.pending.sendOrUpdatePending(ctx, i18n.translate('settings.delete_title'), {
      format: 'html',
      attachments: [Keyboard.inlineKeyboard([
        [Keyboard.button.callback(`❌ ${i18n.translate('settings.delete_yes')}`, SettingsAction.DeleteConfirm)],
        [Keyboard.button.callback(`↩️ ${i18n.translate('settings.delete_no')}`, SettingsAction.DeleteCancel)],
      ])],
    })
  }

  async setNotification(ctx: Context, preference: NotificationPreference): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const status = await this.backend.getAccessStatus(profile)
    const i18n = new I18n(status.locale, this.fallbackLocale)
    const selected = await this.backend.setNotificationPreference(profile, preference)
    const label = this.notificationLabel(i18n, selected)
    await this.showMenu(ctx, 'notifications', i18n.translate('settings.notification_changed', { name: label }))
  }

  async setLocale(ctx: Context, locale: string): Promise<void> {
    const profile = await this.loadProfile(ctx)
    await this.backend.setLocale(profile, normalizeLocale(locale, this.fallbackLocale))
  }

  async confirmDelete(ctx: Context): Promise<void> {
    await this.pending.deleteCurrent(ctx.api, ctx.chatId!, ctx.messageId!)
    const profile = await this.loadProfile(ctx)
    const primaryMessageId = await this.backend.getPrimaryMessageId(profile)
    if (primaryMessageId) {
      await ctx.api.deleteMessage(primaryMessageId)
      await this.backend.savePrimaryMessage(profile, null)
    }
    await this.backend.deleteUserData(profile)
  }

  private notificationLabel(i18n: I18n, value: NotificationPreference): string {
    const keys: Record<NotificationPreference, string> = {
      enabled: 'settings.notification_enabled',
      silent: 'settings.notification_silent',
      disabled: 'settings.notification_disabled',
    }
    return i18n.translate(keys[value])
  }

  private flagForLocale(locale: string): string {
    const region = locale.split('-')[1]
    if (!region || region.length !== 2) return '🌐'
    return String.fromCodePoint(...[...region.toUpperCase()].map((character) => 127397 + character.charCodeAt(0)))
  }

  private async loadProfile(ctx: Context): Promise<UserProfileInput> {
    if (ctx.chatId === undefined || ctx.chatId === null || !ctx.user) {
      throw new Error('User and chat are required for settings')
    }
    const chat = await ctx.getChat(ctx.chatId)
    return {
      user: ctx.user,
      chatId: ctx.chatId,
      avatarUrl: chat.dialog_with_user?.avatar_url,
      fullAvatarUrl: chat.dialog_with_user?.full_avatar_url,
    }
  }
}
