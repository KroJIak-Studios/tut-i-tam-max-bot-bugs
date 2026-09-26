import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './ChatSuggestions.module.css'

interface ChatSuggestionsProps {
  suggestions: string[]
  onSelectSuggestion: (text: string) => void
  disabled?: boolean
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  disabled = false,
}) => {
  const { t } = useTranslation()
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className={styles.suggestionsContainer} role="group" aria-label={t('chat.quickPromptsAriaLabel')}>
      {suggestions.map((item, idx) => {
        const label = item.startsWith('chat.suggestions.')
          ? t(item)
          : t(`chat.suggestions.${item}`, { defaultValue: item })
        return (
          <button
            key={idx}
            type="button"
            className={styles.chip}
            onClick={() => onSelectSuggestion(item)}
            disabled={disabled}
          >
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
