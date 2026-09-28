import type { Api, Context } from '@maxhub/max-bot-api'

const LIFETIME_MS = 3000
const DELETE_INTERVAL_MS = 550

type DeleteResult = Awaited<ReturnType<Api['deleteMessage']>>

export class TemporaryMessageRegistry {
  private readonly lastDeleteAtByChat = new Map<number, number>()
  private readonly deleteChainByChat = new Map<number, Promise<void>>()

  async send(ctx: Context, text: string): Promise<void> {
    const chatId = ctx.chatId
    if (chatId === undefined || chatId === null) {
      throw new Error('Chat is required for a temporary message')
    }

    const message = await ctx.reply(text, { format: 'html' })
    const messageId = message.body.mid
    console.info('BOT_MESSAGE_CREATED', {
      chatId,
      messageId,
      kind: 'temporary',
      at: new Date().toISOString(),
    })

    setTimeout(() => {
      void this.remove(ctx.api, chatId, messageId)
    }, LIFETIME_MS)
  }

  private async remove(api: Api, chatId: number, messageId: string): Promise<void> {
    const previous = this.deleteChainByChat.get(chatId) ?? Promise.resolve()
    const current = previous
      .catch(() => undefined)
      .then(() => this.deleteMessage(api, chatId, messageId))
    this.deleteChainByChat.set(chatId, current)
    try {
      await current
    } finally {
      if (this.deleteChainByChat.get(chatId) === current) {
        this.deleteChainByChat.delete(chatId)
      }
    }
  }

  private async deleteMessage(api: Api, chatId: number, messageId: string): Promise<void> {
    const lastDeleteAt = this.lastDeleteAtByChat.get(chatId) ?? 0
    const waitMs = Math.max(0, DELETE_INTERVAL_MS - (Date.now() - lastDeleteAt))
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs))
    this.lastDeleteAtByChat.set(chatId, Date.now())

    let result: DeleteResult
    try {
      result = await api.deleteMessage(messageId)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (this.isMissingMessage(message)) {
        result = { success: true }
      } else {
        console.error('Temporary MAX delete failed', { chatId, messageId, error: message })
        result = { success: false, message }
      }
    }

    console.info('BOT_MESSAGE_DELETED', {
      chatId,
      messageId,
      success: result.success,
      message: result.success ? undefined : result.message,
      at: new Date().toISOString(),
    })
  }

  private isMissingMessage(message: string): boolean {
    const normalized = message.toLowerCase()
    return normalized.includes('not found')
      || normalized.includes('message not exist')
      || normalized.includes('message_id_invalid')
  }
}
