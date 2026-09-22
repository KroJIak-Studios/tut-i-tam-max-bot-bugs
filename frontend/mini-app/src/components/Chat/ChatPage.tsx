import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
    text: 'Привет! Помогу найти, куда сходить в Казани. Спроси меня о местах, событиях или активностях рядом.',
    timestamp: Date.now(),
    suggestions: [
      'Куда пойти вечером?',
      'Что есть бесплатного рядом?',
      'Куда сходить с детьми?',
      'Есть волонтёрство?',
    ],
  },
]

export const ChatPage: React.FC = () => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem('tut_i_tam_chat_history')
      return stored ? JSON.parse(stored) : INITIAL_MESSAGES
    } catch {
      return INITIAL_MESSAGES
    }
  })
  const [isTyping, setIsTyping] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('tut_i_tam_chat_history', JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages])

  // Scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages, isTyping])

  const showToast = (text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastMessage(text)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 2400)
  }

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      const response = await sendChatMessage(text)
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
        text: 'Не получилось подобрать варианты. Попробуйте задать вопрос иначе или повторить чуть позже.',
        timestamp: Date.now(),
        suggestions: ['Куда пойти вечером?', 'Что есть бесплатного?'],
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

            return (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onOpenOnMap={handleOpenOnMap}
                onSelectSuggestion={handleSendMessage}
                onToast={showToast}
                isLatestAi={isLatestAi}
                disabled={isTyping}
              />
            )
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className={styles.typingRow}>
              <div className={styles.aiBadge}>
                <IconSparkles size={13} color="#2563EB" />
                <span>Ассистент</span>
              </div>
              <div className={styles.typingBubble}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          )}

          {/* Spacer so bottom message/suggestions are never obscured by composer */}
          <div className={styles.scrollSpacer} />
          <div ref={messagesEndRef} />
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
