import type { MapEvent } from './index'

export interface ChatActionLink {
  label: string
  path: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: number
  event?: MapEvent
  suggestions?: string[]
  actions?: ChatActionLink[]
  needsLocation?: boolean
}

export interface ChatResponse {
  text: string
  event?: MapEvent
  suggestions: string[]
}
