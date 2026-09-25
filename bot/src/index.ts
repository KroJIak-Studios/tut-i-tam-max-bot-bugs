import { Bot, Webhook } from '@maxhub/max-bot-api'
import { MenuAction } from './domain/menu-action.js'
import { config, webhook } from './config.js'
import { BackendClient } from './services/backend-client.js'
import { StartService } from './services/start-service.js'

const bot = new Bot(config.token)
const startService = new StartService(new BackendClient(config.backendUrl, config.fallbackLocale), config.fallbackLocale)

bot.on('bot_started', async (ctx) => {
  await startService.handleBotStarted(
    ctx,
    ctx.update.user_locale as unknown as string | undefined,
  )
})

bot.command('start', async (ctx) => {
  await startService.handleStart(ctx)
})

bot.on('message_created', async (ctx) => {
  const text = ctx.message?.body.text

  if (text && !text.startsWith('/')) {
    await startService.handleText(ctx, text)
  }
})

for (const action of Object.values(MenuAction)) {
  bot.action(action, async (ctx) => {
    // TODO: replace each menu stub with its product scenario.
    await startService.handleNotReady(ctx)
  })
}

if (config.updateTransport === 'webhook') {
  if (!config.webhookDomain || !config.webhookSecret) {
    throw new Error('Webhook settings are not configured')
  }

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
  await bot.start({ mode: 'polling' })
}
