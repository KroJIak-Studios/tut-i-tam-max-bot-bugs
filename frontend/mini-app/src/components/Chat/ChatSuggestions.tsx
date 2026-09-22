import React from 'react'
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
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className={styles.suggestionsContainer} role="group" aria-label="Быстрые подсказки">
      {suggestions.map((item, idx) => (
        <button
          key={idx}
          type="button"
          className={styles.chip}
          onClick={() => onSelectSuggestion(item)}
          disabled={disabled}
        >
          <span>{item}</span>
        </button>
      ))}
    </div>
  )
}
