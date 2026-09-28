import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ChatMessage, NavTabId } from '../../types'
import { sendChatMessage } from '../../services/chatService'
import { ChatTopBar } from './ChatTopBar'
import { ChatMessageItem } from './ChatMessageItem'
import { ChatComposer } from './ChatComposer'
import { BottomNavigation } from '../BottomNavigation'
import { IconSparkles } from '../Icons'
import styles from './ChatPage.module.css'

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'ai',
    text: '',
    timestamp: Date.now(),
    suggestions: [
      'evening',
      'free',
      'kids',
      'volunteer',
    ],
  },
]

export const ChatPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem('tut_i_tam_chat_history')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Ensure welcome message uses stable suggestions
        return parsed.map((m: ChatMessage) => {
          if (m.id === 'msg-welcome') {
            return {
              ...m,
              suggestions: ['evening', 'free', 'kids', 'volunteer'],
            }
          }
          return m
        })
      }
      return INITIAL_MESSAGES
    } catch {
      return INITIAL_MESSAGES
    }
  })
  const [isTyping, setIsTyping] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const latestAiMessageRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(messages.length)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('tut_i_tam_chat_history', JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages])

  // Intelligent auto-scroll
  useEffect(() => {
    const isNew = messages.length > prevMessagesLengthRef.current
    prevMessagesLengthRef.current = messages.length

    if (!isNew && !isTyping) return

    const lastMsg = messages[messages.length - 1]

    if (lastMsg?.sender === 'ai' && !isTyping) {
      // Scroll to start of new AI message so the response text and top of card are immediately visible
      const timer = setTimeout(() => {
        if (latestAiMessageRef.current) {
          latestAiMessageRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      }, 60)
      return () => clearTimeout(timer)
    } else {
      // User sent message or AI is typing: scroll so bottom activity is visible
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [messages, isTyping])

  const showToast = (text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastMessage(text)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 2400)
  }

  const handleSendMessage = async (textOrId: string) => {
    const displayText = textOrId.startsWith('chat.suggestions.')
      ? t(textOrId)
      : t(`chat.suggestions.${textOrId}`, { defaultValue: textOrId })

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: displayText,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      const response = await sendChatMessage(textOrId, i18n.language)
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: Date.now(),
        event: response.event,
        suggestions: response.suggestions,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error('Chat AI error:', err)
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'ai',
        text: t('chat.errorText'),
        timestamp: Date.now(),
        suggestions: ['evening', 'free'],
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleOpenOnMap = (eventId: string) => {
    navigate(`/map?event=${eventId}`)
  }

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') {
      navigate('/')
    } else if (tab === 'map') {
      navigate('/map')
    } else if (tab === 'plans') {
      navigate('/plans')
    } else if (tab === 'profile') {
      navigate('/profile')
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header */}
      <ChatTopBar />

      {/* 2. Messages List */}
      <main className={styles.scrollArea}>
        <div className={styles.messagesList}>
          {messages.map((msg, index) => {
            const isLatestAi =
              msg.sender === 'ai' &&
              (index === messages.length - 1 ||
                messages.slice(index + 1).every((m) => m.sender === 'user'))
            const showAiBadge =
              msg.sender === 'ai' &&
              (index === 0 || messages[index - 1].sender !== 'ai')

            return (
              <ChatMessageItem
                key={msg.id}
                ref={isLatestAi ? latestAiMessageRef : undefined}
                message={msg}
                onOpenOnMap={handleOpenOnMap}
                onSelectSuggestion={handleSendMessage}
                onToast={showToast}
                isLatestAi={isLatestAi}
                showAiBadge={showAiBadge}
                disabled={isTyping}
              />
            )
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className={styles.typingRow}>
              <div className={styles.aiBadge}>
                <IconSparkles size={13} color="#2563EB" />
                <span>{t('chat.assistant')}</span>
              </div>
              <div className={styles.typingBubble}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className={styles.endAnchor} />
        </div>
      </main>

      {/* 3. Floating Toast */}
      {toastMessage && (
        <div className={styles.toastNotification} role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Composer */}
      <ChatComposer onSendMessage={handleSendMessage} disabled={isTyping} />

      {/* 5. Bottom Navigation */}
      <BottomNavigation activeTab="chat" onTabChange={handleTabChange} />
    </div>
  )
}
