import React, { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { aiProvidersApi, formatProviderError } from '../api/aiProvidersApi'
import type { AiProvider, AiPurpose } from '../types'
import { ProviderCard } from './ProviderCard'
import styles from './AiProvidersView.module.css'

const BLOCKS: Array<{ purpose: AiPurpose; title: string; description: string }> = [
  {
    purpose: 'chat',
    title: 'Чат-модель',
    description: 'Провайдер ответов помощника в боте и мини-приложении.',
  },
  {
    purpose: 'embedding',
    title: 'Embedding-модель',
    description: 'Провайдер векторов для поиска похожих мероприятий и интересов.',
  },
]

export const AiProvidersView: React.FC = () => {
  const [providers, setProviders] = useState<AiProvider[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    aiProvidersApi.list()
      .then((items) => { if (!ignore) setProviders(items) })
      .catch((reason) => {
        if (!ignore) setError(formatProviderError(reason, 'Не удалось загрузить провайдеров'))
      })
    return () => { ignore = true }
  }, [])

  const replace = (saved: AiProvider) => {
    setProviders((current) => {
      const others = (current ?? []).filter((item) => item.purpose !== saved.purpose || item.id === saved.id)
      return [...others.filter((item) => item.id !== saved.id), saved]
    })
  }

  return (
    <div className={styles.page}>
      <header>
        <h1>Модели</h1>
        <p>Адрес, ключ и модель хранятся на сервере. Ключ в браузере не сохраняется.</p>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {providers === null && !error ? (
        <p className={styles.loading}>Загрузка провайдеров…</p>
      ) : (
        <div className={styles.grid}>
          {BLOCKS.map((block) => (
            <ProviderCard
              key={block.purpose}
              purpose={block.purpose}
              title={block.title}
              description={block.description}
              provider={(providers ?? []).find((item) => item.purpose === block.purpose && item.enabled)
                ?? (providers ?? []).find((item) => item.purpose === block.purpose)
                ?? null}
              onSaved={replace}
            />
          ))}
        </div>
      )}
    </div>
  )
}
