import { Bot, Webhook } from '@maxhub/max-bot-api'
import { PendingMessageRegistry } from './domain/pending-message-registry.js'
import { AssistantAction } from './domain/assistant-action.js'
import { MenuAction } from './domain/menu-action.js'
import { MeetingsAction } from './domain/meetings-action.js'
import { SettingsAction } from './domain/settings-action.js'
import { MeetingsService } from './services/meetings-service.js'
import { NearbyService } from './services/nearby-service.js'
import { SettingsService } from './services/settings-service.js'
import { config, webhook } from './config.js'
import { AssistantChatService } from './services/assistant-service.js'
import { BackendClient } from './services/backend-client.js'
import { StartService } from './services/start-service.js'

const bot = new Bot(config.token)
const backend = new BackendClient(config.backendUrl, config.fallbackLocale)
const pending = new PendingMessageRegistry(backend)
const startService = new StartService(backend, config.fallbackLocale, pending)
const settings = new SettingsService(backend, pending, config.fallbackLocale)
const meetings = new MeetingsService(backend, pending, config.fallbackLocale, config.backendUrl)
const nearby = new NearbyService(backend, pending, config.fallbackLocale, startService, meetings)
const assistant = new AssistantChatService(backend, config.fallbackLocale, startService)

bot.on('message_callback', async (ctx, next) => {
  console.info('BOT_CALLBACK_RECEIVED', {
    callbackId: ctx.callback?.callback_id,
    payload: ctx.callback?.payload,
    messageId: ctx.messageId,
    at: new Date().toISOString(),
  })

  const assistantMenu = ctx.callback?.payload === AssistantAction.Menu
  if (!assistantMenu && ctx.chatId !== undefined && ctx.chatId !== null) {
    await pending.deleteSnapshot(bot.api, ctx.chatId, ctx.messageId)
  }

  if (!(await startService.requireAccess(ctx))) return
  await next()
})

bot.catch((error, ctx) => {
  console.error('BOT_UPDATE_FAILED', {
    type: ctx.updateType,
    chatId: ctx.chatId ?? null,
    userId: ctx.user?.user_id ?? null,
    error: error instanceof Error ? error.stack ?? error.message : String(error),
  })
})

bot.use(async (ctx, next) => {
  console.info('BOT_UPDATE_RECEIVED', {
    type: ctx.updateType,
    chatId: ctx.chatId ?? null,
    userId: ctx.user?.user_id ?? null,
    text: ctx.message?.body.text ?? null,
    at: new Date().toISOString(),
  })
  await next()
  console.info('BOT_UPDATE_HANDLED', { type: ctx.updateType, chatId: ctx.chatId ?? null })
})

bot.on('bot_started', async (ctx) => {
  console.info('BOT_STARTED_RECEIVED', {
    chatId: ctx.chatId ?? null,
    userId: ctx.user?.user_id ?? null,
    locale: 'user_locale' in ctx.update ? ctx.update.user_locale ?? null : null,
    payload: ctx.startPayload ?? null,
  })
  await assistant.leaveForStart(ctx)
  console.info('BOT_STARTED_ASSISTANT_LEFT', { chatId: ctx.chatId ?? null })
  const locale = ctx.update.user_locale
  await startService.handleStart(ctx, true, locale ? String(locale) : undefined)
  console.info('BOT_STARTED_WELCOME_SENT', { chatId: ctx.chatId ?? null })
})

bot.command('start', async (ctx) => {
  await assistant.leaveForStart(ctx)
  await startService.handleStart(ctx, true)
})

bot.on('message_created', async (ctx) => {
  const location = ctx.message?.body.attachments?.find((attachment) => attachment.type === 'location')
  if (location && 'latitude' in location && nearby.isWaiting(ctx.chatId ?? undefined)) {
    await nearby.receive(ctx, location.latitude, location.longitude)
    return
  }
  if (assistant.isActive(ctx.chatId ?? undefined) && location && 'latitude' in location) {
    await assistant.handleLocation(ctx, location.latitude, location.longitude)
    return
  }
  const text = ctx.message?.body.text
  if (!text || text.startsWith('/')) return
  if (assistant.isActive(ctx.chatId ?? undefined)) {
    await assistant.handleText(ctx, text)
    return
  }
  await startService.handleText(ctx, text)
})

bot.action(MenuAction.AiAssistant, async (ctx) => {
  await assistant.open(ctx)
})

bot.action(new RegExp(`^${AssistantAction.PickPrefix}(\\d+)$`), async (ctx) => {
  const index = Number(ctx.callback?.payload?.slice(AssistantAction.PickPrefix.length))
  if (Number.isInteger(index)) await assistant.choose(ctx, index)
})

bot.action(AssistantAction.Stay, async () => undefined)

bot.action(AssistantAction.Menu, async (ctx) => {
  await assistant.close(ctx)
})

bot.action(MenuAction.MyMeetings, async (ctx) => {
  await meetings.open(ctx)
})

bot.action(new RegExp(`^${MeetingsAction.PagePrefix}(\\d+)$`), async (ctx) => {
  const page = Number(ctx.callback?.payload?.slice(MeetingsAction.PagePrefix.length))
  if (Number.isInteger(page) && page > 0) await meetings.open(ctx, page)
})

bot.action(new RegExp(`^${MeetingsAction.OpenPrefix}(\\d+)$`), async (ctx) => {
  const meetingId = Number(ctx.callback?.payload?.slice(MeetingsAction.OpenPrefix.length))
  if (Number.isInteger(meetingId)) await meetings.show(ctx, meetingId)
})

bot.action(new RegExp(`^${MeetingsAction.GoingPrefix}(\\d+)$`), async (ctx) => {
  const meetingId = Number(ctx.callback?.payload?.slice(MeetingsAction.GoingPrefix.length))
  if (Number.isInteger(meetingId)) await meetings.toggleAttendance(ctx, meetingId)
})

bot.action(MeetingsAction.Back, async (ctx) => {
  await startService.handleStart(ctx)
})

bot.action(MeetingsAction.BackToList, async (ctx) => {
  await meetings.open(ctx)
})

bot.action(MeetingsAction.Stay, async () => undefined)

bot.action(MenuAction.Settings, async (ctx) => {
  await settings.open(ctx)
})

bot.action(SettingsAction.Notifications, async (ctx) => {
  await settings.showMenu(ctx, 'notifications')
})

bot.action(SettingsAction.Language, async (ctx) => {
  await settings.showMenu(ctx, 'language')
})

bot.action(SettingsAction.DeleteData, async (ctx) => {
  await settings.showMenu(ctx, 'delete')
})

bot.action(SettingsAction.Back, async (ctx) => {
  await startService.handleStart(ctx)
})

bot.action(SettingsAction.BackToMenu, async (ctx) => {
  await startService.handleStart(ctx)
})

bot.action(SettingsAction.BackToRoot, async (ctx) => {
  await settings.showMenu(ctx, 'root')
})

bot.action(SettingsAction.NotificationsEnabled, async (ctx) => {
  await settings.setNotification(ctx, 'enabled')
})

bot.action(SettingsAction.NotificationsSilent, async (ctx) => {
  await settings.setNotification(ctx, 'silent')
})

bot.action(SettingsAction.NotificationsDisabled, async (ctx) => {
  await settings.setNotification(ctx, 'disabled')
})

bot.action(SettingsAction.DeleteConfirm, async (ctx) => {
  await settings.confirmDelete(ctx)
  await startService.handleStart(ctx)
})

bot.action(SettingsAction.DeleteCancel, async (ctx) => {
  await settings.showMenu(ctx, 'root')
})

bot.action(new RegExp(`^${SettingsAction.LanguagePrefix}`), async (ctx) => {
  const locale = ctx.callback?.payload?.slice(SettingsAction.LanguagePrefix.length)
  if (locale) {
    await settings.setLocale(ctx, locale)
    await startService.handleStart(ctx)
  }
})

bot.action(MenuAction.NearbyEvents, async (ctx) => {
  await nearby.open(ctx)
})

bot.action(/^nearby:going:(\d+)$/, async (ctx) => {
  const eventId = Number(ctx.callback?.payload?.slice('nearby:going:'.length))
  if (Number.isInteger(eventId)) await nearby.toggle(ctx, eventId)
})

bot.action('nearby:again', async (ctx) => {
  await nearby.again(ctx)
})

bot.action('nearby:menu', async (ctx) => {
  await nearby.close(ctx)
})

const recovery = await pending.recoverAfterRestart(bot.api)
console.info('PENDING_STARTUP_RECOVERY_COMPLETED', recovery)

if (config.updateTransport === 'webhook') {
  if (!config.webhookDomain || !config.webhookSecret) throw new Error('Webhook settings are not configured')

  await bot.start({
    mode: 'webhook',
    options: {
      domain: config.webhookDomain,
      port: webhook.port,
      path: webhook.path,
      secret: config.webhookSecret,
      allowedUpdates: ['message_created', 'message_callback', 'bot_started'],
    },
  })
} else {
  await Webhook.clearSubscriptions(bot.api)
  await bot.start({
    mode: 'polling',
    options: { allowedUpdates: ['message_created', 'message_callback', 'bot_started'] },
  })
}
