import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ChatMessage, NavTabId } from '../../types'
import {
  clearAssistantHistory,
  loadAssistantHistory,
  sendAssistantTurn,
  type AssistantTurnResult,
} from '../../services/assistantChat'
import { ChatTopBar } from './ChatTopBar'
import { ChatMessageItem } from './ChatMessageItem'
import { ChatComposer } from './ChatComposer'
import { BottomNavigation } from '../BottomNavigation'
import { IconSparkles } from '../Icons'
import styles from './ChatPage.module.css'

const WELCOME_ID = 'msg-welcome'

const WELCOME_SUGGESTIONS = [
  'Куда пойти вечером?',
  'Что есть бесплатного рядом?',
  'Куда сходить с детьми?',
  'Есть волонтёрство?',
]

function welcomeMessage(text: string): ChatMessage {
  return {
    id: WELCOME_ID,
    sender: 'ai',
    text,
    timestamp: Date.now(),
    suggestions: WELCOME_SUGGESTIONS,
  }
}

function historyToMessages(
  items: { id: number; role: 'user' | 'assistant'; text: string }[],
): ChatMessage[] {
  return items.map((item) => ({
    id: `msg-${item.id}`,
    sender: item.role === 'user' ? 'user' : 'ai',
    text: item.text,
    timestamp: item.id,
  }))
}

export const ChatPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLElement>(null)
  const prevMessagesLengthRef = useRef(0)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    let active = true
    loadAssistantHistory()
      .then((history) => {
        if (!active) return
        setMessages(
          history.messages.length > 0
            ? historyToMessages(history.messages)
            : [welcomeMessage(t('chat.welcomeText'))],
        )
      })
      .catch(() => {
        if (!active) return
        setMessages([
          welcomeMessage(t('chat.welcomeText')),
          {
            id: `msg-err-${Date.now()}`,
            sender: 'ai',
            text: t('chat.errorText'),
            timestamp: Date.now(),
          },
        ])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [t])

  useEffect(() => {
    const isNew = messages.length > prevMessagesLengthRef.current
    prevMessagesLengthRef.current = messages.length

    if (!isNew && !isTyping) return

    const scrollDown = () => {
      const area = scrollAreaRef.current
      if (!area) return
      area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' })
    }
    const timer = setTimeout(scrollDown, 60)
    const area = scrollAreaRef.current
    const photos = area ? Array.from(area.querySelectorAll('img')) : []
    const pending = photos.filter((photo) => !photo.complete)
    pending.forEach((photo) => photo.addEventListener('load', scrollDown, { once: true }))
    return () => {
      clearTimeout(timer)
      pending.forEach((photo) => photo.removeEventListener('load', scrollDown))
    }
  }, [messages, isTyping])

  const showToast = (text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastMessage(text)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 2400)
  }

  const appendAssistantReply = (response: AssistantTurnResult) => {
    const aiMsg: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      sender: 'ai',
      text: response.text,
      timestamp: Date.now(),
      suggestions: response.suggestions,
      actions: response.actions,
      needsLocation: response.status === 'location_required',
    }
    setMessages((prev) => [...prev, aiMsg])
  }

  const runTurn = async (
    text: string,
    choiceContext: string,
    location?: { latitude: number; longitude: number },
  ) => {
    const requestId = ++requestIdRef.current
    setIsTyping(true)
    try {
      const response = await sendAssistantTurn(text, choiceContext, location)
      if (requestId !== requestIdRef.current) return
      appendAssistantReply(response)
    } catch {
      if (requestId !== requestIdRef.current) return
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: t('chat.errorText'),
          timestamp: Date.now(),
        },
      ])
    } finally {
      if (requestId === requestIdRef.current) setIsTyping(false)
    }
  }

  const handleSendMessage = (text: string, choiceContext = '') => {
    const trimmed = text.trim()
    if (!trimmed || isTyping || loading) return
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: Date.now(),
      },
    ])
    void runTurn(trimmed, choiceContext)
  }

  const handleShareLocation = () => {
    if (isTyping || loading) return
    if (!navigator.geolocation) {
      showToast(t('chat.locationDenied'))
      return
    }
    const requestId = ++requestIdRef.current
    setIsTyping(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== requestIdRef.current) return
        void runTurn('', '', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        if (requestId === requestIdRef.current) setIsTyping(false)
        showToast(t('chat.locationDenied'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const handleClearHistory = async () => {
    if (loading || isTyping || !messages.some((message) => message.id !== WELCOME_ID)) return
    requestIdRef.current += 1
    setIsTyping(false)
    try {
      await clearAssistantHistory()
      setMessages([welcomeMessage(t('chat.welcomeText'))])
    } catch {
      showToast(t('chat.errorText'))
    }
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

  const canClear = !loading && messages.some((message) => message.id !== WELCOME_ID)

  return (
    <div className={styles.pageContainer}>
      <ChatTopBar onClear={() => void handleClearHistory()} canClear={canClear} />

      <main className={styles.scrollArea} ref={scrollAreaRef}>
        <div className={styles.messagesList}>
          {loading ? (
            <div className={styles.loadingState} role="status" aria-label={t('chat.assistant')} />
          ) : (
            messages.map((msg, index) => {
              const isLatestAi =
                msg.sender === 'ai' &&
                index === messages.length - 1 &&
                !(isTyping && !msg.needsLocation)
              const showAiBadge =
                msg.sender === 'ai' &&
                (index === 0 || messages[index - 1].sender !== 'ai')

              return (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  onSelectSuggestion={handleSendMessage}
                  onShareLocation={handleShareLocation}
                  isLatestAi={isLatestAi}
                  showAiBadge={showAiBadge}
                  disabled={isTyping}
                />
              )
            })
          )}

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

          <div className={styles.endAnchor} />
        </div>
      </main>

      {toastMessage && (
        <div className={styles.toastNotification} role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      <ChatComposer onSendMessage={(text) => handleSendMessage(text)} disabled={isTyping || loading} />

      <BottomNavigation activeTab="chat" onTabChange={handleTabChange} />
    </div>
  )
}
