import { apiClient } from '../../../services/api/apiClient'
import { ApiError } from '../../../services/api/types'
import type { AiProvider, AiProviderCheck, AiProviderDraft, AiPurpose } from '../types'

const DETAILS: Record<string, string> = {
  provider_unreachable: 'Сервер провайдера не отвечает',
  provider_rejected: 'Провайдер отклонил ключ или адрес',
  provider_key_unreadable: 'Сохранённый ключ не читается',
  provider_not_found: 'Провайдер не найден',
}

export function formatProviderError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return DETAILS[error.message] ?? error.message
  }
  return error instanceof Error ? error.message : fallback
}

export const aiProvidersApi = {
  list(): Promise<AiProvider[]> {
    return apiClient.get<AiProvider[]>('/admin/ai-providers')
  },

  create(purpose: AiPurpose, draft: AiProviderDraft): Promise<AiProvider> {
    return apiClient.post<AiProvider>('/admin/ai-providers', {
      purpose,
      protocol: 'chat_completions',
      base_url: draft.base_url,
      api_key: draft.api_key,
      model: draft.model,
      enabled: true,
    })
  },

  update(id: number, draft: AiProviderDraft): Promise<AiProvider> {
    return apiClient.patch<AiProvider>(`/admin/ai-providers/${id}`, {
      base_url: draft.base_url,
      api_key: draft.api_key,
      model: draft.model,
      enabled: true,
    })
  },

  probe(baseUrl: string, apiKey: string): Promise<AiProviderCheck> {
    return apiClient.post<AiProviderCheck>('/admin/ai-providers/probe', {
      base_url: baseUrl,
      api_key: apiKey,
    })
  },
}
