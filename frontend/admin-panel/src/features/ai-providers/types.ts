export type AiPurpose = 'chat' | 'embedding'

export interface AiProvider {
  id: number
  purpose: AiPurpose
  protocol: string
  base_url: string
  api_key: string
  model: string
  enabled: boolean
}

export interface AiProviderDraft {
  base_url: string
  api_key: string
  model: string
}

export interface AiProviderCheck {
  ok: boolean
  models: string[]
  detail: string | null
}
