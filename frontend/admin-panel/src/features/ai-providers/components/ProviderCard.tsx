import React, { useState } from 'react'
import { IconEye, IconEyeOff } from '../../../components/Icons'
import { AdminSelect } from '../../../components/AdminSelect'
import { aiProvidersApi, formatProviderError } from '../api/aiProvidersApi'
import type { AiProvider, AiProviderDraft, AiPurpose } from '../types'
import styles from './ProviderCard.module.css'

interface ProviderCardProps {
  purpose: AiPurpose
  title: string
  description: string
  provider: AiProvider | null
  onSaved: (provider: AiProvider) => void
}

const EMPTY_DRAFT: AiProviderDraft = { base_url: '', api_key: '', model: '' }

export const ProviderCard: React.FC<ProviderCardProps> = ({
  purpose,
  title,
  description,
  provider,
  onSaved,
}) => {
  const [draft, setDraft] = useState<AiProviderDraft>(
    provider
      ? { base_url: provider.base_url, api_key: provider.api_key, model: provider.model }
      : EMPTY_DRAFT,
  )
  const [keyVisible, setKeyVisible] = useState(false)
  const [models, setModels] = useState<string[]>(provider?.model ? [provider.model] : [])
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)

  const update = (patch: Partial<AiProviderDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setStatus(null)
  }

  const probe = async () => {
    if (!draft.base_url.trim() || !draft.api_key.trim()) {
      setError('Для проверки нужны адрес и ключ')
      return
    }
    setChecking(true)
    setError(null)
    setStatus(null)
    try {
      const result = await aiProvidersApi.probe(draft.base_url.trim(), draft.api_key.trim())
      if (!result.ok) {
        setError(formatProviderError(new Error(result.detail ?? ''), 'Подключение не удалось'))
        return
      }
      const next = result.models
      setModels(next)
      setDraft((current) => ({
        ...current,
        model: next.includes(current.model) ? current.model : (next[0] ?? ''),
      }))
      setStatus(next.length > 0 ? `Доступно моделей: ${next.length}` : 'Подключение есть, список моделей пуст')
    } catch (reason) {
      setError(formatProviderError(reason, 'Подключение не удалось'))
    } finally {
      setChecking(false)
    }
  }

  const save = async () => {
    if (!draft.base_url.trim() || !draft.model.trim() || (!provider && !draft.api_key.trim())) {
      setError('Заполните адрес, ключ и модель')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const saved = provider
        ? await aiProvidersApi.update(provider.id, draft)
        : await aiProvidersApi.create(purpose, draft)
      onSaved(saved)
      setDraft({ base_url: saved.base_url, api_key: saved.api_key, model: saved.model })
      setStatus('Сохранено')
    } catch (reason) {
      setError(formatProviderError(reason, 'Не удалось сохранить провайдера'))
    } finally {
      setSaving(false)
    }
  }

  const modelOptions = models.map((model) => ({ value: model, label: model }))

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <label className={styles.field}>
        <span>Адрес API</span>
        <input
          value={draft.base_url}
          autoComplete="off"
          placeholder="https://api.example.com/v1"
          onChange={(event) => update({ base_url: event.target.value })}
        />
      </label>

      <label className={styles.field}>
        <span>Ключ</span>
        <div className={styles.keyRow}>
          <input
            type="text"
            value={draft.api_key}
            className={keyVisible ? undefined : styles.masked}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            placeholder="Ключ провайдера"
            onChange={(event) => update({ api_key: event.target.value })}
          />
          <button
            type="button"
            className={styles.eye}
            aria-label={keyVisible ? 'Скрыть ключ' : 'Показать ключ'}
            onClick={() => setKeyVisible((current) => !current)}
          >
            {keyVisible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>
      </label>

      <div className={styles.actions}>
        <button type="button" className={styles.secondary} disabled={checking} onClick={probe}>
          {checking ? 'Проверка…' : 'Проверить подключение'}
        </button>
      </div>

      <label className={styles.field}>
        <span>Модель</span>
        {modelOptions.length > 0 ? (
          <AdminSelect
            value={draft.model}
            options={modelOptions}
            placeholder="Выберите модель"
            onChange={(model) => update({ model })}
          />
        ) : (
          <input
            value={draft.model}
            autoComplete="off"
            placeholder="Сначала получите список моделей"
            onChange={(event) => update({ model: event.target.value })}
          />
        )}
      </label>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {status && !error && <p className={styles.status}>{status}</p>}

      <button type="button" className={styles.primary} disabled={saving} onClick={save}>
        {saving ? 'Сохранение…' : 'Сохранить'}
      </button>
    </section>
  )
}
