import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NavTabId } from '../types'
import { Header } from './Header'
import { HomeHero } from './HomeHero'
import { QuickActionCard } from './QuickActionCard'
import { CompactActionCard } from './CompactActionCard'
import { FeaturedEventCard } from './FeaturedEventCard'
import { BottomNavigation } from './BottomNavigation'
import {
  HERO_DATA,
  QUICK_ACTIONS,
  COMPACT_ACTIONS,
  FEATURED_EVENT,
} from '../data/mockData'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
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

  const handleQuickAction = (id: string) => {
    if (id === 'catalog') {
      navigate('/catalog')
    } else if (id === 'tonight') {
      navigate('/map')
    }
  }

  const handleCompactAction = (id: string) => {
    if (id === 'pushkinskaya') {
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
        {/* Шаг 5: Header и блок приветствия */}
        <Header
          city="Казань"
          greeting="Добрый вечер"
        />

        <div className={styles.contentBlock}>
          {/* Шаг 6: Основная Hero-card */}
          <HomeHero
            title={HERO_DATA.title}
            subtitle={HERO_DATA.subtitle}
            imageUrl={HERO_DATA.imageUrl}
            alt={HERO_DATA.alt}
            onClick={handleHeroClick}
          />

          {/* Шаг 7: Две большие Quick Action Cards */}
          <div className={styles.gridTwoCols}>
            {QUICK_ACTIONS.map((item) => (
              <QuickActionCard
                key={item.id}
                item={item}
                onClick={handleQuickAction}
              />
            ))}
          </div>

          {/* Шаг 8: Две компактные карточки */}
          <div className={styles.gridTwoCols}>
            {COMPACT_ACTIONS.map((item) => (
              <CompactActionCard
                key={item.id}
                item={item}
                onClick={handleCompactAction}
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
