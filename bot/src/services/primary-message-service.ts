import type { Context } from '@maxhub/max-bot-api'
import { PrimaryMessage } from '../domain/primary-message.js'
import { BackendClient, type UserProfileInput } from './backend-client.js'

export class PrimaryMessageService {
  constructor(private readonly backend: BackendClient) {}

  async sendOrReplace(
    ctx: Context,
    message: PrimaryMessage,
    alwaysCreateNew = false,
  ): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const existingMessageId = await this.backend.getPrimaryMessageId(profile)

    if (alwaysCreateNew && existingMessageId) {
      await this.sendReplacement(ctx, profile, existingMessageId, message)
      return
    }

    if (existingMessageId) {
      let result
      try {
        result = await ctx.api.editMessage(existingMessageId, message.editOptions())
      } catch (error) {
        if (!this.isMissingMessageError(error)) throw error
        await this.sendReplacement(ctx, profile, existingMessageId, message)
        return
      }

      if (result.success || this.isUnchangedMessageError(result.message)) return
      if (this.isMissingMessageError(new Error(result.message))) {
        await this.sendReplacement(ctx, profile, existingMessageId, message)
        return
      }
      throw new Error(`Could not edit Primary message: ${result.message}`)
    }

    const sent = await ctx.reply(message.text, message.extra)
    await this.backend.savePrimaryMessage(profile, sent.body.mid)
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

  private async sendReplacement(
    ctx: Context,
    profile: UserProfileInput,
    previousMessageId: string,
    message: PrimaryMessage,
  ): Promise<void> {
    const replacement = await ctx.reply(message.text, message.extra)
    const deletion = await ctx.api.deleteMessage(previousMessageId)
    if (!deletion.success && !this.isMissingMessageError(new Error(deletion.message))) {
      throw new Error(`Could not remove previous Primary message: ${deletion.message}`)
    }
    await this.backend.savePrimaryMessage(profile, replacement.body.mid)
  }

  private isUnchangedMessageError(message?: string): boolean {
    return message?.toLowerCase().includes('not modified') ?? false
  }

  private isMissingMessageError(error: unknown): boolean {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
    return message.includes('not found') || message.includes('message not exist') || message.includes('message_id_invalid')
  }
}
