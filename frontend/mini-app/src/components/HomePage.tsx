import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NavTabId } from '../types'
import { useUserPreferences } from '../context/useUserPreferences'
import { Header } from './Header'
import { HomeHero } from './HomeHero'
import { QuickActionCard } from './QuickActionCard'
import { FeaturedEventCard } from './FeaturedEventCard'
import { BottomNavigation } from './BottomNavigation'
import {
  HERO_DATA,
  HOME_ACTIONS,
  FEATURED_EVENT,
} from '../data/mockData'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { preferences } = useUserPreferences()
  const [activeTab, setActiveTab] = useState<NavTabId>('home')

  const handleHeroClick = () => {
    navigate('/map')
  }

  const handleTabChange = (tab: NavTabId) => {
    setActiveTab(tab)
    if (tab === 'map') {
      navigate('/map')
    } else if (tab === 'chat') {
      navigate('/chat')
    } else if (tab === 'plans') {
      navigate('/plans')
    } else if (tab === 'profile') {
      navigate('/profile')
    }
  }

  const handleActionClick = (id: string) => {
    if (id === 'catalog') {
      navigate('/catalog')
    } else if (id === 'tonight') {
      navigate('/map')
    } else if (id === 'pushkinskaya') {
      navigate('/map?pushkin=true')
    } else if (id === 'volunteers') {
      navigate('/map?category=volunteer')
    }
  }

  const handleEventClick = (id: string) => {
    navigate(`/events/${id}`)
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.scrollArea}>
        {/* Header и блок приветствия */}
        <Header city={preferences.city} />

        <div className={styles.contentBlock}>
          {/* Основная Hero-card */}
          <HomeHero
            title={HERO_DATA.title}
            imageUrl={HERO_DATA.imageUrl}
            alt={HERO_DATA.alt}
            onClick={handleHeroClick}
          />

          {/* 4 Quick Action Cards в единой сетке 2x2 */}
          <div className={styles.gridTwoByTwo}>
            {HOME_ACTIONS.map((item) => (
              <QuickActionCard
                key={item.id}
                item={item}
                onClick={handleActionClick}
              />
            ))}
          </div>

          {/* Шаг 9: Карточка рекомендуемого мероприятия */}
          <FeaturedEventCard
            event={FEATURED_EVENT}
            onClick={handleEventClick}
          />
        </div>
      </main>

      {/* Шаг 11: Нижняя навигация */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  )
}
