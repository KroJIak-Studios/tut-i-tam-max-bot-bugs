import { Keyboard, type Context } from '@maxhub/max-bot-api'
import { AssistantAction } from '../domain/assistant-action.js'
import { I18n } from '../i18n/i18n.js'
import { BackendClient, type AssistantTurn, type UserProfileInput } from './backend-client.js'
import { StartService } from './start-service.js'

const ACTIVE_CHATS = new Set<number>()
const GREETING_MESSAGES = new Map<number, string>()
const GREETING_KEYS = ['assistant.greetings.one', 'assistant.greetings.two', 'assistant.greetings.three', 'assistant.greetings.four', 'assistant.greetings.five']

export class AssistantChatService {
  constructor(
    private readonly backend: BackendClient,
    private readonly fallbackLocale: string,
    private readonly menu: StartService,
  ) {}

  async open(ctx: Context): Promise<void> {
    const profile = await this.loadProfile(ctx)
    ACTIVE_CHATS.add(profile.chatId)
    const i18n = await this.i18n(profile)
    const key = GREETING_KEYS[Math.floor(Math.random() * GREETING_KEYS.length)] ?? GREETING_KEYS[0]
    const sent = await ctx.reply(i18n.translate(key), this.keyboard(i18n, []))
    await this.backend.trackPendingMessage(profile.chatId, sent.body.mid)
    GREETING_MESSAGES.set(profile.chatId, sent.body.mid)
  }

  isActive(chatId: number | undefined): boolean {
    return chatId !== undefined && ACTIVE_CHATS.has(chatId)
  }

  async handleText(ctx: Context, text: string): Promise<void> {
    await this.answer(ctx, text, null)
  }

  async handleSuggestion(ctx: Context, text: string): Promise<void> {
    await this.answer(ctx, text, null)
  }

  async handleLocation(ctx: Context, latitude: number, longitude: number): Promise<void> {
    await this.answer(ctx, '', { latitude, longitude })
  }

  async close(ctx: Context): Promise<void> {
    if (ctx.chatId !== undefined && ctx.chatId !== null) ACTIVE_CHATS.delete(ctx.chatId)
    await this.menu.handleStart(ctx, true)
  }

  async leaveForStart(ctx: Context): Promise<void> {
    if (ctx.chatId !== undefined && ctx.chatId !== null) {
      ACTIVE_CHATS.delete(ctx.chatId)
      GREETING_MESSAGES.delete(ctx.chatId)
    }
  }

  private async answer(ctx: Context, text: string, location: { latitude: number; longitude: number } | null): Promise<void> {
    const profile = await this.loadProfile(ctx)
    ACTIVE_CHATS.add(profile.chatId)
    const greetingId = GREETING_MESSAGES.get(profile.chatId)
    if (greetingId) {
      GREETING_MESSAGES.delete(profile.chatId)
      await this.backend.removePendingMessage(profile.chatId, greetingId)
    }
    const i18n = await this.i18n(profile)
    await ctx.sendAction('typing_on')
    const turn = await this.backend.assistantTurn(profile, text, location)
    if (turn.status === 'location_required') {
      await ctx.reply(turn.text, { format: 'html' })
      return
    }
    await ctx.reply(turn.text, this.keyboard(i18n, turn.suggestions))
  }

  private keyboard(i18n: I18n, suggestions: string[]) {
    const phrases = suggestions.slice(0, 4).map((phrase) => phrase.split(/\s+/).slice(0, 2).join(' '))
    const rows = this.pack(phrases).map((row) => row.map((phrase) => Keyboard.button.callback(phrase, `${AssistantAction.SuggestPrefix}${phrase}`)))
    rows.push([Keyboard.button.callback(`🏠 ${i18n.translate('assistant.menu')}`, AssistantAction.Menu)])
    return { format: 'html' as const, attachments: [Keyboard.inlineKeyboard(rows)] }
  }

  private pack(phrases: string[]): string[][] {
    const rows: string[][] = []
    let row: string[] = []
    let width = 0
    for (const phrase of phrases) {
      const next = width + phrase.length
      if (row.length === 3 || (row.length > 0 && next > 28)) {
        rows.push(row)
        row = []
        width = 0
      }
      row.push(phrase)
      width += phrase.length
    }
    if (row.length) rows.push(row)
    return rows
  }

  private async i18n(profile: UserProfileInput): Promise<I18n> {
    const status = await this.backend.getAccessStatus(profile)
    return new I18n(status.locale, this.fallbackLocale)
  }

  private async loadProfile(ctx: Context): Promise<UserProfileInput> {
    if (ctx.chatId === undefined || ctx.chatId === null || !ctx.user) throw new Error('User and chat are required')
    const chat = await ctx.getChat(ctx.chatId)
    return {
      user: ctx.user,
      chatId: ctx.chatId,
      avatarUrl: chat.dialog_with_user?.avatar_url,
      fullAvatarUrl: chat.dialog_with_user?.full_avatar_url,
    }
  }
}
