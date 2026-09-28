import type { Api, Context } from '@maxhub/max-bot-api'
import { BackendClient, type PendingRecoveryChat } from '../services/backend-client.js'

type DeleteResult = Awaited<ReturnType<Api['deleteMessage']>>
type EditResult = Awaited<ReturnType<Api['editMessage']>>
type MessageExtra = NonNullable<Parameters<Context['reply']>[1]>

interface CleanupResult {
  deletedMessages: number
  failedMessages: number
}

const DELETE_INTERVAL_MS = 550

export class PendingMessageRegistry {
  private readonly cleanupByChat = new Map<number, Promise<unknown>>()
  private readonly lastDeleteAtByChat = new Map<number, number>()

  constructor(private readonly backend: BackendClient) {}

  async isTracked(chatId: number, messageId: string): Promise<boolean> {
    return (await this.backend.getPendingSnapshot(chatId)).includes(messageId)
  }

  async sendOrUpdatePending(ctx: Context, text: string, extra: MessageExtra = {}): Promise<void> {
    const chatId = ctx.chatId
    const currentMessageId = ctx.messageId
    const payload = { format: 'html' as const, ...extra, text }

    if (chatId !== undefined && chatId !== null && currentMessageId && await this.isTracked(chatId, currentMessageId)) {
      const editResult = await ctx.api.editMessage(currentMessageId, payload)
      this.logUpdated(chatId, currentMessageId, editResult)

      if (editResult.success || this.isUnchanged(editResult.message)) return

      const replacement = await ctx.reply(text, { format: 'html', ...extra })
      await this.backend.trackPendingMessage(chatId, replacement.body.mid)
      this.logCreated(chatId, replacement.body.mid, 'pending-fallback')
      await this.deleteMessage(ctx.api, chatId, currentMessageId)
      return
    }

    await this.sendPending(ctx, text, extra)
  }

  async deleteCurrent(api: Api, chatId: number, messageId: string): Promise<void> {
    if (!(await this.isTracked(chatId, messageId))) return
    await this.deleteMessage(api, chatId, messageId)
    if ((await this.backend.getPendingSnapshot(chatId)).includes(messageId)) {
      await this.backend.removePendingMessage(chatId, messageId)
    }
  }

  async sendPending(ctx: Context, text: string, extra: MessageExtra = {}): Promise<void> {
    const message = await ctx.reply(text, { format: 'html', ...extra })
    const chatId = ctx.chatId
    if (chatId === undefined || chatId === null) return

    try {
      await this.backend.trackPendingMessage(chatId, message.body.mid)
    } catch (error) {
      const cleanup = await ctx.api.deleteMessage(message.body.mid)
      this.logDeleted(chatId, message.body.mid, cleanup)
      throw error
    }
    this.logCreated(chatId, message.body.mid, 'pending')
  }

  async deleteSnapshot(api: Api, chatId: number, exceptMessageId?: string): Promise<CleanupResult> {
    return this.enqueueCleanup(chatId, async () => {
      const messageIds = await this.backend.getPendingSnapshot(chatId, exceptMessageId)
      return this.deleteMessages(api, chatId, messageIds)
    })
  }

  async recoverAfterRestart(api: Api): Promise<CleanupResult> {
    const chats = await this.backend.getPendingRecoverySnapshot()
    const total: CleanupResult = { deletedMessages: 0, failedMessages: 0 }

    for (const chat of chats) {
      const result = await this.enqueueCleanup(chat.max_chat_id, () =>
        this.deleteMessages(api, chat.max_chat_id, chat.message_ids),
      )
      total.deletedMessages += result.deletedMessages
      total.failedMessages += result.failedMessages
    }

    return total
  }

  private async deleteMessages(api: Api, chatId: number, messageIds: string[]): Promise<CleanupResult> {
    const successfullyDeleted: string[] = []
    let failedMessages = 0

    for (const messageId of messageIds) {
      const result = await this.deleteMessage(api, chatId, messageId)
      if (result.success) successfullyDeleted.push(messageId)
      else failedMessages += 1
    }

    if (successfullyDeleted.length > 0) {
      await this.backend.removePendingMessages(chatId, successfullyDeleted)
    }

    return { deletedMessages: successfullyDeleted.length, failedMessages }
  }

  private async deleteMessage(api: Api, chatId: number, messageId: string): Promise<DeleteResult> {
    await this.waitForRateLimit(chatId)
    try {
      const result = await api.deleteMessage(messageId)
      this.logDeleted(chatId, messageId, result)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (this.isMissingMessage(message)) {
        await this.backend.removePendingMessage(chatId, messageId)
        return { success: true }
      }
      console.error('Pending MAX delete failed', { chatId, messageId, error: message })
      return { success: false, message }
    }
  }

  private async waitForRateLimit(chatId: number): Promise<void> {
    const lastDeleteAt = this.lastDeleteAtByChat.get(chatId) ?? 0
    const waitMs = Math.max(0, DELETE_INTERVAL_MS - (Date.now() - lastDeleteAt))
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs))
    this.lastDeleteAtByChat.set(chatId, Date.now())
  }

  private async enqueueCleanup<T>(chatId: number, operation: () => Promise<T>): Promise<T> {
    const previous = this.cleanupByChat.get(chatId) ?? Promise.resolve()
    const current = previous.catch(() => undefined).then(operation)
    this.cleanupByChat.set(chatId, current)
    try {
      return await current
    } finally {
      if (this.cleanupByChat.get(chatId) === current) this.cleanupByChat.delete(chatId)
    }
  }

  private isUnchanged(message?: string): boolean {
    return message?.toLowerCase().includes('not modified') ?? false
  }

  private isMissingMessage(message: string): boolean {
    const normalized = message.toLowerCase()
    return normalized.includes('not found') || normalized.includes('message not exist') || normalized.includes('message_id_invalid')
  }

  private logCreated(chatId: number, messageId: string, kind: string): void {
    console.info('BOT_MESSAGE_CREATED', { chatId, messageId, kind, at: new Date().toISOString() })
  }

  private logUpdated(chatId: number, messageId: string, response: EditResult): void {
    console.info('BOT_MESSAGE_UPDATED', {
      chatId,
      messageId,
      success: response.success,
      message: response.success ? undefined : response.message,
      at: new Date().toISOString(),
    })
  }

  private logDeleted(chatId: number, messageId: string, response: DeleteResult): void {
    console.info('BOT_MESSAGE_DELETED', {
      chatId,
      messageId,
      success: response.success,
      message: response.success ? undefined : response.message,
      at: new Date().toISOString(),
    })
  }
}
