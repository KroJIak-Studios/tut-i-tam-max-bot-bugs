import type { Context } from '@maxhub/max-bot-api'
import { PrimaryMessage } from '../domain/primary-message.js'
import { BackendClient, type UserProfileInput } from './backend-client.js'

export class PrimaryMessageService {
  constructor(private readonly backend: BackendClient) {}

  async sendOrReplace(ctx: Context, message: PrimaryMessage, reset = false): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const previousMessageId = reset
      ? await this.backend.getPrimaryMessageId(profile)
      : undefined

    if (previousMessageId) {
      await this.deleteMessage(ctx, previousMessageId)
      await this.backend.savePrimaryMessage(profile, null)
    }

    const sent = await ctx.reply(message.text, message.extra)
    await this.backend.savePrimaryMessage(profile, sent.body.mid)
  }

  async editOrReplace(ctx: Context, message: PrimaryMessage): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const currentMessageId = await this.backend.getPrimaryMessageId(profile)

    if (!currentMessageId) {
      await this.sendOrReplace(ctx, message)
      return
    }

    const result = await ctx.api.editMessage(currentMessageId, message.editOptions())

    if (result.success) {
      return
    }

    const replacement = await ctx.reply(message.text, message.extra)
    await ctx.api.deleteMessage(currentMessageId)
    await this.backend.savePrimaryMessage(profile, replacement.body.mid)
  }

  private async loadProfile(ctx: Context): Promise<UserProfileInput> {
    if (ctx.chatId === undefined || ctx.chatId === null || !ctx.user) {
      throw new Error('User and chat are required for Primary message')
    }

    const dialog = await ctx.getChat(ctx.chatId)
    return {
      user: ctx.user,
      chatId: ctx.chatId,
      avatarUrl: dialog.dialog_with_user?.avatar_url,
      fullAvatarUrl: dialog.dialog_with_user?.full_avatar_url,
    }
  }

  private async deleteMessage(ctx: Context, messageId: string): Promise<void> {
    await ctx.api.deleteMessage(messageId)
  }
}
