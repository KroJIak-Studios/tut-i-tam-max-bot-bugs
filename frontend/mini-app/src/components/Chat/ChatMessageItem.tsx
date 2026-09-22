import React from 'react'
import type { ChatMessage } from '../../types'
import { IconSparkles } from '../Icons'
import { ChatRecommendationCard } from './ChatRecommendationCard'
import { ChatSuggestions } from './ChatSuggestions'
import styles from './ChatMessageItem.module.css'

interface ChatMessageItemProps {
  message: ChatMessage
  onOpenOnMap: (eventId: string) => void
  onSelectSuggestion: (text: string) => void
  onToast: (text: string) => void
  isLatestAi?: boolean
  disabled?: boolean
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onOpenOnMap,
  onSelectSuggestion,
  onToast,
  isLatestAi = false,
  disabled = false,
}) => {
  const isUser = message.sender === 'user'

  if (isUser) {
    return (
      <div className={styles.userMessageRow}>
        <div className={styles.userBubble}>
          <p className={styles.messageText}>{message.text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.aiMessageRow}>
      <div className={styles.aiHeader}>
        <div className={styles.aiBadge}>
          <IconSparkles size={13} color="#2563EB" />
          <span>Ассистент</span>
        </div>
      </div>

      <div className={styles.aiBubble}>
        <p className={styles.messageText}>{message.text}</p>

        {message.event && (
          <ChatRecommendationCard
            event={message.event}
            onOpenOnMap={onOpenOnMap}
            onToast={onToast}
          />
        )}
      </div>

      {isLatestAi && message.suggestions && message.suggestions.length > 0 && (
        <ChatSuggestions
          suggestions={message.suggestions}
          onSelectSuggestion={onSelectSuggestion}
          disabled={disabled}
        />
      )}
    </div>
  )
}
