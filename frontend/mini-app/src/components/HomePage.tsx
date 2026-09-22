import React, { useState } from 'react'
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
  const [activeTab, setActiveTab] = useState<NavTabId>('home')

  const handleHeroClick = () => {
    // В будущих шагах: переход к поиску рядом
  }

  const handleQuickAction = (_id: string) => {
    // В будущих шагах: переход к Каталогу / Сегодня вечером
  }

  const handleCompactAction = (_id: string) => {
    // В будущих шагах: переход к Пушкинской / Волонтёрам
  }

  const handleEventClick = (_id: string) => {
    // В будущих шагах: переход к карточке мероприятия
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
        onTabChange={setActiveTab}
      />
    </div>
  )
}
