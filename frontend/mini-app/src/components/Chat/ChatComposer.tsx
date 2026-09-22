import React, { useState } from 'react'
import { IconSend } from '../Icons'
import styles from './ChatComposer.module.css'

interface ChatComposerProps {
  onSendMessage: (text: string) => void
  disabled?: boolean
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSendMessage(trimmed)
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const isSendActive = text.trim().length > 0 && !disabled

  return (
    <div className={styles.composerWrapper}>
      <form className={styles.composerForm} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.inputField}
          placeholder="Спросить..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={300}
        />
        <button
          type="submit"
          className={`${styles.sendBtn} ${isSendActive ? styles.sendBtnActive : ''}`}
          disabled={!isSendActive}
          aria-label="Отправить сообщение"
        >
          <IconSend size={18} color={isSendActive ? '#FFFFFF' : '#9CA3AF'} />
        </button>
      </form>
    </div>
  )
}
