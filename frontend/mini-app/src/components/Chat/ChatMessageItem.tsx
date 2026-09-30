import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ChatMessage } from '../../types'
import { IconLocationPin, IconSparkles } from '../Icons'
import { AssistantText } from './AssistantText'
import { ChatSuggestions } from './ChatSuggestions'
import styles from './ChatMessageItem.module.css'

interface ChatMessageItemProps {
  message: ChatMessage
  onSelectSuggestion: (text: string, context: string) => void
  onShareLocation: () => void
  isLatestAi?: boolean
  showAiBadge?: boolean
  disabled?: boolean
}

export const ChatMessageItem = React.forwardRef<HTMLDivElement, ChatMessageItemProps>(
  (
    {
      message,
      onSelectSuggestion,
      onShareLocation,
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
        <div ref={ref} className={`${styles.userMessageRow} ${styles.appear}`}>
          <div className={styles.userBubble}>
            <p className={styles.messageText}>{message.text}</p>
          </div>
        </div>
      )
    }

    return (
      <div ref={ref} className={`${styles.aiMessageRow} ${styles.appear}`}>
        {showAiBadge && (
          <div className={styles.aiHeader}>
            <div className={styles.aiBadge}>
              <IconSparkles size={13} color="#2563EB" />
              <span>{t('chat.assistant')}</span>
            </div>
          </div>
        )}

        <div className={styles.aiBubble}>
          <AssistantText text={message.text} />

          {isLatestAi && message.actions && message.actions.length > 0 && (
            <div className={styles.actions}>
              {message.actions.map((action) => (
                <Link key={action.path} to={action.path} className={styles.actionLink}>
                  {action.label}
                </Link>
              ))}
            </div>
          )}

          {isLatestAi && message.needsLocation && (
            <button
              type="button"
              className={styles.locationButton}
              onClick={onShareLocation}
              disabled={disabled}
            >
              <IconLocationPin size={16} />
              <span>{t('chat.shareLocation')}</span>
            </button>
          )}
        </div>

        {isLatestAi && message.suggestions && message.suggestions.length > 0 && (
          <ChatSuggestions
            suggestions={message.suggestions}
            onSelectSuggestion={(text) => onSelectSuggestion(text, message.text)}
            disabled={disabled}
          />
        )}
      </div>
    )
  }
)

ChatMessageItem.displayName = 'ChatMessageItem'
