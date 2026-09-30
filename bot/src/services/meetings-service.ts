import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { Keyboard, type Context } from '@maxhub/max-bot-api'
import { MeetingsAction } from '../domain/meetings-action.js'
import { PendingMessageRegistry } from '../domain/pending-message-registry.js'
import { escapeHtml, I18n } from '../i18n/i18n.js'
import { BackendClient, type BotMeeting, type BotMeetingCard, type BotMeetingPhoto, type UserProfileInput } from './backend-client.js'

const PAGE_SIZE = 4

export class MeetingsService {
  private botUsername: string | null = null

  constructor(
    private readonly backend: BackendClient,
    private readonly pending: PendingMessageRegistry,
    private readonly fallbackLocale: string,
    private readonly apiBaseUrl: string,
  ) {}

  async open(ctx: Context, page = 1): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const status = await this.backend.getAccessStatus(profile)
    const i18n = new I18n(status.locale, this.fallbackLocale)
    const { meetings } = await this.backend.listMeetings(profile)
    const pageCount = Math.max(1, Math.ceil(meetings.length / PAGE_SIZE))
    const currentPage = Math.min(Math.max(page, 1), pageCount)
    const message = this.listMessage(i18n, meetings, currentPage, pageCount, status.locale)
    await this.pending.sendOrUpdatePending(ctx, message.text, message.extra)
  }

  async show(ctx: Context, meetingId: number): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const meeting = await this.backend.meetingCard(profile, meetingId)
    await this.renderCard(ctx, profile, meeting)
  }

  async toggleAttendance(ctx: Context, meetingId: number): Promise<void> {
    const profile = await this.loadProfile(ctx)
    const current = await this.backend.meetingCard(profile, meetingId)
    if (!current) {
      await this.renderCard(ctx, profile, null)
      return
    }
    const meeting = await this.backend.setMeetingAttendance(profile, meetingId, !current.going)
    await this.renderCard(ctx, profile, meeting)
  }

  async renderCard(ctx: Context, profile: UserProfileInput, meeting: BotMeetingCard | null, extraRows: ReturnType<typeof Keyboard.button.callback>[][] = []): Promise<void> {
    const status = await this.backend.getAccessStatus(profile)
    const i18n = new I18n(status.locale, this.fallbackLocale)
    if (!meeting) {
      await this.pending.sendOrUpdatePending(ctx, [i18n.translate('meetings.title'), i18n.translate('meetings.missing')].join('\n\n'), {
        format: 'html',
        attachments: [Keyboard.inlineKeyboard([[Keyboard.button.callback(`↩️ ${i18n.translate('meetings.back')}`, MeetingsAction.BackToList)]])],
      })
      return
    }

    const card = await this.cardContent(ctx, profile, meeting, i18n, status.locale)
    const rows = extraRows.length
      ? [...card.rows, ...extraRows]
      : [...card.rows, [Keyboard.button.callback(`↩️ ${i18n.translate('meetings.back')}`, MeetingsAction.BackToList)]]
    await this.pending.sendOrUpdatePending(ctx, card.text, {
      format: 'html',
      attachments: [...card.images.slice(0, 3), Keyboard.inlineKeyboard(rows)],
    })
  }

  async cardContent(ctx: Context, profile: UserProfileInput, meeting: BotMeetingCard, i18n: I18n, locale: string) {
    const startParam = `event-${meeting.id}`
    const botName = await this.botName(ctx)
    const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(meeting.starts_at))
    const blocks = [`<b>${escapeHtml(meeting.title)}</b>`, this.schedule(i18n, date, meeting)]
    if (meeting.address.trim()) blocks.push(`${i18n.translate('meetings.address')} ${escapeHtml(meeting.address)}`)
    if (meeting.description.trim()) blocks.push(`<blockquote>${escapeHtml(meeting.description)}</blockquote>`)
    if (meeting.chat_invite_url) blocks.push(i18n.translate('meetings.chat', { url: escapeHtml(meeting.chat_invite_url) }))
    if (meeting.attendees_count > 0) blocks.push(i18n.translate('meetings.attendees', { count: String(meeting.attendees_count) }))
    const goingLabel = meeting.going
      ? `🙋 ${i18n.translate('meetings.going')} ✅`
      : `🙋 ${i18n.translate('meetings.join')}`
    return {
      text: blocks.join('\n\n'),
      images: (await this.photoTokens(ctx, profile, meeting.images.slice(0, 3))).map((token) => ({ type: 'image' as const, payload: { token } })),
      rows: [
        [Keyboard.button.openApp(`📱 ${i18n.translate('meetings.open_mini_app')}`, botName ?? '', undefined, startParam)],
        [Keyboard.button.callback(goingLabel, `${MeetingsAction.GoingPrefix}${meeting.id}`)],
        [
          Keyboard.button.link(`📍 ${i18n.translate('meetings.yandex')}`, `https://yandex.ru/maps/?pt=${meeting.longitude},${meeting.latitude}&z=16&text=${meeting.latitude},${meeting.longitude}`),
          Keyboard.button.link(`📍 ${i18n.translate('meetings.gis')}`, `https://2gis.ru/geo/${meeting.longitude},${meeting.latitude}`),
        ],
      ],
    }
  }

  private schedule(i18n: I18n, date: string, meeting: BotMeetingCard): string {
    const lines = [`<u>${escapeHtml(date)}</u>`]
    if (meeting.price_rub !== null && meeting.price_rub > 0) {
      const price = i18n.translate('meetings.price', { amount: String(meeting.price_rub), unit: this.rubleUnit(meeting.price_rub, i18n) })
      lines.push(meeting.pushkin_card ? `${price} | ${i18n.translate('meetings.pushkin')}` : price)
    }
    return lines.join('\n')
  }

  private rubleUnit(amount: number, i18n: I18n): string {
    const value = Math.abs(amount) % 100
    const last = value % 10
    if (value > 10 && value < 20) return i18n.translate('meetings.rubles_many')
    if (last === 1) return i18n.translate('meetings.ruble')
    if (last > 1 && last < 5) return i18n.translate('meetings.rubles_few')
    return i18n.translate('meetings.rubles_many')
  }

  private listMessage(i18n: I18n, meetings: BotMeeting[], currentPage: number, pageCount: number, locale: string): { text: string; extra: NonNullable<Parameters<Context['reply']>[1]> } {
    const visible = meetings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    const rows = visible.map((meeting) => [
      Keyboard.button.callback(this.buttonLabel(meeting, locale), `${MeetingsAction.OpenPrefix}${meeting.id}`),
    ])
    if (meetings.length > PAGE_SIZE) {
      rows.push([
        Keyboard.button.callback(currentPage === 1 ? 'ㅤ' : '⬅️', currentPage === 1 ? MeetingsAction.Stay : `${MeetingsAction.PagePrefix}${currentPage - 1}`),
        Keyboard.button.callback(`${currentPage}/${pageCount}`, MeetingsAction.Stay),
        Keyboard.button.callback(currentPage === pageCount ? 'ㅤ' : '➡️', currentPage === pageCount ? MeetingsAction.Stay : `${MeetingsAction.PagePrefix}${currentPage + 1}`),
      ])
    }
    rows.push([Keyboard.button.callback(`↩️ ${i18n.translate('common.back')}`, MeetingsAction.Back)])
    const empty = meetings.length === 0 ? i18n.translate('meetings.empty') : ''
    const text = [i18n.translate('meetings.title'), `<blockquote>${i18n.translate('meetings.quote')}</blockquote>`, empty].filter(Boolean).join('\n\n')
    return { text, extra: { format: 'html', attachments: [Keyboard.inlineKeyboard(rows)] } }
  }

  private async botName(ctx: Context): Promise<string | null> {
    if (this.botUsername !== null) return this.botUsername
    const info = await ctx.api.getMyInfo()
    this.botUsername = info.username || ''
    return this.botUsername || null
  }

  private async photoTokens(ctx: Context, profile: UserProfileInput, photos: BotMeetingPhoto[]): Promise<string[]> {
    const tokens: string[] = []
    for (const photo of photos.slice(0, 3)) {
      if (photo.max_image_token) {
        tokens.push(photo.max_image_token)
        continue
      }
      const token = await this.uploadPhoto(ctx, profile, photo)
      if (token) tokens.push(token)
    }
    return tokens
  }

  private async uploadPhoto(ctx: Context, profile: UserProfileInput, photo: BotMeetingPhoto): Promise<string | null> {
    const fileUrl = this.photoFileUrl(photo.url)
    if (!fileUrl) return null
    const response = await fetch(fileUrl)
    if (!response.ok || !(response.headers.get('content-type') ?? '').startsWith('image/')) return null
    const extension = this.imageExtension(photo.url, response.headers.get('content-type'))
    const directory = await mkdtemp(join(tmpdir(), 'meeting-photo-'))
    const filePath = join(directory, `photo${extension}`)
    try {
      await writeFile(filePath, Buffer.from(await response.arrayBuffer()))
      const uploaded = await ctx.api.uploadImage({ source: filePath })
      const token = this.imageToken(uploaded)
      if (!token) return null
      return await this.backend.savePhotoToken(profile, photo.id, token)
    } catch (error) {
      console.info('MEETING_PHOTO_UPLOAD_FAILED', { photoId: photo.id, message: error instanceof Error ? error.message : 'upload failed' })
      return null
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  }

  private photoFileUrl(path: string): string | null {
    if (path.startsWith('https://') || path.startsWith('http://')) return path
    if (!path.startsWith('/')) return null
    return `${this.apiBaseUrl.replace(/\/$/, '')}${path}`
  }

  private imageExtension(path: string, contentType: string | null): string {
    const fromPath = extname(path.split('?')[0] ?? '').toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fromPath)) return fromPath
    if (contentType?.includes('png')) return '.png'
    if (contentType?.includes('gif')) return '.gif'
    if (contentType?.includes('webp')) return '.webp'
    return '.jpg'
  }

  private imageToken(result: unknown): string | null {
    if (!result || typeof result !== 'object' || !('photos' in result)) return null
    const photos = (result as { photos?: Record<string, { token?: string }> }).photos
    if (!photos) return null
    for (const photo of Object.values(photos)) {
      if (photo?.token) return photo.token
    }
    return null
  }

  private buttonLabel(meeting: BotMeeting, locale: string): string {
    const date = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(meeting.starts_at))
    const label = `${date} ${meeting.title}`
    return label.length > 60 ? `${label.slice(0, 59)}…` : label
  }

  private async loadProfile(ctx: Context): Promise<UserProfileInput> {
    if (ctx.chatId === undefined || ctx.chatId === null || !ctx.user) {
      throw new Error('User and chat are required for meetings')
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
