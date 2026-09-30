import { ASSISTANT_API_BASE_URL, apiRequest } from './api'

function assistantRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return apiRequest(path, init, ASSISTANT_API_BASE_URL)
}

export interface AssistantActionLink {
  label: string
  path: string
}

export interface AssistantTurnResult {
  status: string
  text: string
  suggestions: string[]
  actions: AssistantActionLink[]
}

export interface AssistantHistoryItem {
  id: number
  role: 'user' | 'assistant'
  text: string
}

export function loadAssistantHistory(): Promise<{ messages: AssistantHistoryItem[] }> {
  return assistantRequest('/assistant/app/history')
}

export function sendAssistantTurn(
  text: string,
  choiceContext = '',
  location?: { latitude: number; longitude: number },
): Promise<AssistantTurnResult> {
  return assistantRequest('/assistant/app/turns', {
    method: 'POST',
    body: JSON.stringify({ text, choice_context: choiceContext, location: location ?? null, new_conversation: false }),
  })
}

export function clearAssistantHistory(): Promise<void> {
  return assistantRequest('/assistant/app/history', { method: 'DELETE' })
}
