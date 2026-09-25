import type { User } from '@maxhub/max-bot-api/types'
import { normalizeLocale } from '../i18n/i18n.js'

export interface AccessStatusResponse {
  access_required: boolean
  access_granted: boolean
  locale: string
}

interface PrimaryMessageResponse {
  primary_message_id: string | null
}

interface UserAccessResponse extends AccessStatusResponse {
  max_user_id: number
  access_granted_at: string | null
}

export interface UserProfileInput {
  user: User
  chatId: number
  locale?: string | null
  avatarUrl?: string | null
  fullAvatarUrl?: string | null
}

export class BackendClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fallbackLocale: string,
  ) {}
  async getAccessStatus(input: UserProfileInput): Promise<AccessStatusResponse> {
    return this.request<AccessStatusResponse>('/api/bot/access/status', this.identity(input))
  }

  async verifyAccessCode(input: UserProfileInput, code: string): Promise<UserAccessResponse> {
    return this.request<UserAccessResponse>('/api/bot/access/verify', {
      ...this.identity(input),
      code,
    })
  }

  async getPrimaryMessageId(input: UserProfileInput): Promise<string | null> {
    const response = await this.request<PrimaryMessageResponse>(
      '/api/bot/access/primary-message/current',
      this.identity(input),
    )
    return response.primary_message_id
  }

  async savePrimaryMessage(input: UserProfileInput, primaryMessageId: string | null): Promise<void> {
    await this.request<void>('/api/bot/access/primary-message', {
      ...this.identity(input),
      primary_message_id: primaryMessageId,
    })
  }

  private identity(input: UserProfileInput): object {
    return {
      max_user_id: input.user.user_id,
      first_name: input.user.first_name,
      last_name: input.user.last_name ?? null,
      username: input.user.username,
      avatar_url: input.avatarUrl ?? null,
      full_avatar_url: input.fullAvatarUrl ?? null,
      locale: input.locale ? normalizeLocale(input.locale, this.fallbackLocale) : null,
      max_chat_id: input.chatId,
    }
  }

  private async request<T>(path: string, body: object): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }
}
