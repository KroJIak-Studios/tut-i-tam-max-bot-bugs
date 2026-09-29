import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const botDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
dotenv.config({ path: resolve(botDirectory, '.env.local') })

type UpdateTransport = 'long-polling' | 'webhook'

const requiredEnv = (name: string): string => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

const updateTransport = process.env.BOT_UPDATE_TRANSPORT ?? 'long-polling'

if (updateTransport !== 'long-polling' && updateTransport !== 'webhook') {
  throw new Error('BOT_UPDATE_TRANSPORT must be "long-polling" or "webhook"')
}

const webhookDomain = process.env.BOT_WEBHOOK_DOMAIN
const webhookSecret = process.env.BOT_WEBHOOK_SECRET

if (updateTransport === 'webhook' && (!webhookDomain || !webhookSecret)) {
  throw new Error(
    'BOT_WEBHOOK_DOMAIN and BOT_WEBHOOK_SECRET are required when BOT_UPDATE_TRANSPORT=webhook',
  )
}

export const config = {
  token: requiredEnv('BOT_TOKEN'),
  backendUrl: requiredEnv('BACKEND_URL'),
  fallbackLocale: process.env.FALLBACK_LOCALE ?? 'ru-ru',
  updateTransport,
  webhookDomain,
  webhookSecret,
} as const

export const webhook = {
  path: '/max/webhook',
  port: 3000,
} as const
