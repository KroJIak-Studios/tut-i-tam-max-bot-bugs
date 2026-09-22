import type { MapEvent } from './index'

export interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: number
  event?: MapEvent
  suggestions?: string[]
}

export interface ChatResponse {
  text: string
  event?: MapEvent
  suggestions: string[]
}
