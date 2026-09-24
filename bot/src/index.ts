import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { Bot } from '@maxhub/max-bot-api'

const botDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
dotenv.config({ path: resolve(botDirectory, '.env.local') })

const token = process.env.BOT_TOKEN

if (!token) {
  throw new Error('BOT_TOKEN is required')
}

const bot = new Bot(token)

bot.on('message_created', async (ctx) => {
  const text = ctx.message?.body?.text

  if (text) {
    await ctx.reply(text)
  }
})

await bot.start()
