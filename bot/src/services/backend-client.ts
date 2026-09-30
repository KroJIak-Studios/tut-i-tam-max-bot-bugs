import type { User } from '@maxhub/max-bot-api/types'
import { normalizeLocale } from '../i18n/i18n.js'

export interface AccessStatusResponse {
  access_required: boolean
  access_granted: boolean
  locale: string
  assistant_available: boolean
}

export type NotificationPreference = 'enabled' | 'silent' | 'disabled'

interface NotificationPreferenceResponse {
  preference: NotificationPreference
}

export interface BotMeeting {
  id: number
  title: string
  description: string
  address: string
  starts_at: string
  ends_at: string | null
  chat_invite_url: string | null
}

export interface AssistantTurn {
  status: 'answer' | 'location_required'
  text: string
  suggestions: string[]
  actions: { label: string; path: string }[]
}

export interface BotMeetingPhoto {
  id: number
  url: string
  max_image_token: string | null
}

export interface BotMeetingCard extends BotMeeting {
  latitude: number
  longitude: number
  price_rub: number | null
  pushkin_card: boolean
  images: BotMeetingPhoto[]
  attendees_count: number
  going: boolean
}

interface BotMeetingsResponse {
  total: number
  meetings: BotMeeting[]
}

interface PendingMessagesResponse {
  message_ids: string[]
}

interface PrimaryMessageResponse {
  primary_message_id: string | null
}
export interface PendingRecoveryChat {
  max_chat_id: number
  message_ids: string[]
}

interface PendingRecoveryResponse {
  chats: PendingRecoveryChat[]
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
    return this.request('/api/bot/access/status', this.identity(input))
  }

  async verifyAccessCode(input: UserProfileInput, code: string): Promise<UserAccessResponse> {
    return this.request('/api/bot/access/verify', { ...this.identity(input), code })
  }

  async getNotificationPreference(input: UserProfileInput): Promise<NotificationPreference> {
    const response = await this.request<NotificationPreferenceResponse>(
      '/api/bot/settings/notifications',
      this.identity(input),
    )
    return response.preference
  }

  async setNotificationPreference(
    input: UserProfileInput,
    preference: NotificationPreference,
  ): Promise<NotificationPreference> {
    const response = await this.request<NotificationPreferenceResponse>(
      '/api/bot/settings/notifications',
      { ...this.identity(input), preference },
      'PUT',
    )
    return response.preference
  }

  async setLocale(input: UserProfileInput, locale: string): Promise<string> {
    const response = await this.request<{ locale: string }>(
      '/api/bot/settings/locale',
      { ...this.identity(input), locale },
      'PUT',
    )
    return response.locale
  }

  async deleteUserData(input: UserProfileInput): Promise<void> {
    await this.request<void>('/api/bot/settings/me', this.identity(input), 'DELETE')
  }

  async trackPendingMessage(chatId: number, messageId: string): Promise<void> {
    await this.request<void>('/api/bot/pending-messages', {
      max_chat_id: chatId,
      message_id: messageId,
    }, 'PUT')
  }

  async removePendingMessage(chatId: number, messageId: string): Promise<void> {
    await this.request<void>('/api/bot/pending-messages', {
      max_chat_id: chatId,
      message_id: messageId,
    }, 'DELETE')
  }

  async removePendingMessages(chatId: number, messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return
    await this.request<void>('/api/bot/pending-messages/batch', {
      max_chat_id: chatId,
      message_ids: messageIds,
    }, 'DELETE')
  }

  async getPendingSnapshot(chatId: number, excludeMessageId?: string): Promise<string[]> {
    const response = await this.request<PendingMessagesResponse>(
      '/api/bot/pending-messages/snapshot',
      { max_chat_id: chatId, exclude_message_id: excludeMessageId ?? null },
    )
    return response.message_ids
  }

  async getPendingRecoverySnapshot(): Promise<PendingRecoveryChat[]> {
    const response = await this.request<PendingRecoveryResponse>(
      '/api/bot/pending-messages/recovery-snapshot',
      undefined,
      'GET',
    )
    return response.chats
  }

  async listMeetings(input: UserProfileInput): Promise<BotMeetingsResponse> {
    return this.request<BotMeetingsResponse>('/api/bot/meetings', this.identity(input))
  }

  async meetingCard(input: UserProfileInput, meetingId: number): Promise<BotMeetingCard | null> {
    return this.meetingRequest(input, `/api/bot/meetings/${meetingId}`)
  }

  async setMeetingAttendance(input: UserProfileInput, meetingId: number, going: boolean): Promise<BotMeetingCard | null> {
    return this.meetingRequest(input, `/api/bot/meetings/${meetingId}/attendance`, { going })
  }

  async savePhotoToken(input: UserProfileInput, photoId: number, token: string): Promise<string | null> {
    const response = await fetch(new URL(`/api/bot/meetings/photos/${photoId}/token`, this.baseUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...this.identity(input), token }),
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Backend request failed: ${response.status}`)
    const body = await response.json() as { token?: string }
    return body.token ?? null
  }

  async assistantTurn(
    input: UserProfileInput,
    text: string,
    location: { latitude: number; longitude: number } | null,
    newConversation = false,
  ): Promise<AssistantTurn> {
    return this.request<AssistantTurn>('/api/assistant/turns', {
      ...this.identity(input),
      channel: 'bot',
      text,
      location,
      new_conversation: newConversation,
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
    await this.request<void>(
      '/api/bot/access/primary-message',
      { ...this.identity(input), primary_message_id: primaryMessageId },
    )
  }

  private async meetingRequest(input: UserProfileInput, path: string, extra: object = {}): Promise<BotMeetingCard | null> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...this.identity(input), ...extra }),
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Backend request failed: ${response.status}`)
    return (await response.json()) as BotMeetingCard
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

  private async request<T>(path: string, body?: object, method = 'POST'): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
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
