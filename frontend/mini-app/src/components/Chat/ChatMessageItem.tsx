import React from 'react'
import { useTranslation } from 'react-i18next'
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
  showAiBadge?: boolean
  disabled?: boolean
}

export const ChatMessageItem = React.forwardRef<HTMLDivElement, ChatMessageItemProps>(
  (
    {
      message,
      onOpenOnMap,
      onSelectSuggestion,
      onToast,
      isLatestAi = false,
      showAiBadge = true,
      disabled = false,
    },
    ref
  ) => {
    const { t } = useTranslation()
    const isUser = message.sender === 'user'

    if (isUser) {
      return (
        <div ref={ref} className={styles.userMessageRow}>
          <div className={styles.userBubble}>
            <p className={styles.messageText}>{message.text}</p>
          </div>
        </div>
      )
    }

    const messageText = message.id === 'msg-welcome' ? t('chat.welcomeText') : message.text

    return (
      <div ref={ref} className={styles.aiMessageRow}>
        {showAiBadge && (
          <div className={styles.aiHeader}>
            <div className={styles.aiBadge}>
              <IconSparkles size={13} color="#2563EB" />
              <span>{t('chat.assistant')}</span>
            </div>
          </div>
        )}

        <div className={styles.aiBubble}>
          <p className={styles.messageText}>{messageText}</p>

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
)

ChatMessageItem.displayName = 'ChatMessageItem'
