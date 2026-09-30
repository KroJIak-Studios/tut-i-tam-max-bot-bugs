import { Keyboard, type Context } from '@maxhub/max-bot-api'
import { AssistantAction } from '../domain/assistant-action.js'
import { I18n } from '../i18n/i18n.js'
import { BackendClient, type AssistantTurn, type UserProfileInput } from './backend-client.js'
import { StartService } from './start-service.js'

const ACTIVE_CHATS = new Set<number>()
const GREETING_MESSAGES = new Map<number, string>()
const SUGGESTIONS = new Map<string, string[]>()
const CHOSEN = new Set<string>()

interface MenuMessage {
  id: string
  text: string
  phrases: string[]
  chosen: number | null
}

const LAST_MENU = new Map<number, MenuMessage>()
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
    const text = i18n.translate(key)
    await this.detachMenu(ctx, profile.chatId, i18n)
    const sent = await ctx.reply(text, this.keyboard(i18n, []))
    LAST_MENU.set(profile.chatId, { id: sent.body.mid, text, phrases: [], chosen: null })
    await this.backend.trackPendingMessage(profile.chatId, sent.body.mid)
    GREETING_MESSAGES.set(profile.chatId, sent.body.mid)
  }

  isActive(chatId: number | undefined): boolean {
    return chatId !== undefined && ACTIVE_CHATS.has(chatId)
  }

  async handleText(ctx: Context, text: string): Promise<void> {
    await this.answer(ctx, text, null)
  }

  async choose(ctx: Context, index: number): Promise<void> {
    const messageId = ctx.messageId
    const phrases = messageId ? SUGGESTIONS.get(messageId) : undefined
    if (!messageId || !phrases || CHOSEN.has(messageId) || index < 0 || index >= phrases.length) return
    CHOSEN.add(messageId)
    const profile = await this.loadProfile(ctx)
    const i18n = await this.i18n(profile)
    const current = ctx.chatId !== undefined && ctx.chatId !== null ? LAST_MENU.get(ctx.chatId) : undefined
    if (current?.id === messageId) current.chosen = index
    const text = current?.text ?? ctx.message?.body.text ?? ''
    try {
      await ctx.api.editMessage(messageId, {
        text,
        format: 'html',
        attachments: [Keyboard.inlineKeyboard([
          ...this.lockedRows(phrases, index),
          [Keyboard.button.callback(`🏠 ${i18n.translate('assistant.menu')}`, AssistantAction.Menu)],
        ])],
      })
    } catch {
      CHOSEN.delete(messageId)
      return
    }
    await this.answer(ctx, phrases[index], null)
  }

  async handleLocation(ctx: Context, latitude: number, longitude: number): Promise<void> {
    await this.answer(ctx, '', { latitude, longitude })
  }

  async close(ctx: Context): Promise<void> {
    if (ctx.chatId !== undefined && ctx.chatId !== null) {
      const previous = LAST_MENU.get(ctx.chatId)
      LAST_MENU.delete(ctx.chatId)
      ACTIVE_CHATS.delete(ctx.chatId)
      if (previous) {
        try {
          await ctx.api.editMessage(previous.id, { text: previous.text, format: 'html', attachments: [] })
        } catch {
          // The menu is already gone if MAX rejects the edit.
        }
      }
    }
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
    await this.detachMenu(ctx, profile.chatId, i18n)
    const phrases = turn.status === 'location_required' ? [] : turn.suggestions.slice(0, 4)
    const sent = await ctx.reply(turn.text, this.keyboard(i18n, phrases))
    LAST_MENU.set(profile.chatId, { id: sent.body.mid, text: turn.text, phrases, chosen: null })
    if (phrases.length) SUGGESTIONS.set(sent.body.mid, phrases)
  }

  private async detachMenu(ctx: Context, chatId: number, i18n: I18n): Promise<void> {
    const previous = LAST_MENU.get(chatId)
    if (!previous) return
    LAST_MENU.delete(chatId)
    const rows = previous.chosen === null
      ? this.suggestionRows(previous.phrases)
      : this.lockedRows(previous.phrases, previous.chosen)
    try {
      await ctx.api.editMessage(previous.id, {
        text: previous.text,
        format: 'html',
        attachments: rows.length ? [Keyboard.inlineKeyboard(rows)] : [],
      })
    } catch {
      return
    }
    void i18n
  }

  private keyboard(i18n: I18n, suggestions: string[]) {
    const phrases = suggestions.slice(0, 4).map((phrase) => phrase.split(/\s+/).slice(0, 2).join(' '))
    const rows = this.suggestionRows(phrases)
    rows.push([Keyboard.button.callback(`🏠 ${i18n.translate('assistant.menu')}`, AssistantAction.Menu)])
    return { format: 'html' as const, attachments: [Keyboard.inlineKeyboard(rows)] }
  }

  private suggestionRows(phrases: string[]) {
    return this.pack(phrases).map((row, rowIndex) => row.map((phrase, column) => {
      const index = this.phraseIndex(phrases, rowIndex, column)
      return Keyboard.button.callback(phrase, `${AssistantAction.PickPrefix}${index}`)
    }))
  }

  private lockedRows(phrases: string[], chosen: number) {
    const labels = phrases.map((phrase, index) => index === chosen ? `✅ ${phrase}` : this.strike(phrase))
    return this.pack(labels).map((row) => row.map((label) => Keyboard.button.callback(label, AssistantAction.Stay)))
  }

  private phraseIndex(phrases: string[], rowIndex: number, column: number): number {
    return this.pack(phrases).slice(0, rowIndex).reduce((total, row) => total + row.length, 0) + column
  }

  private strike(value: string): string {
    return [...value].map((character) => `${character}\u0336`).join('')
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
