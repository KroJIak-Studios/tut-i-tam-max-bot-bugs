import React from 'react'
import type { NavTabId } from '../types'
import {
  IconHomeFilled,
  IconChat,
  IconGlobe,
  IconPlans,
  IconUser,
} from './Icons'
import styles from './BottomNavigation.module.css'

interface BottomNavigationProps {
  activeTab?: NavTabId
  onTabChange?: (tab: NavTabId) => void
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab = 'home',
  onTabChange,
}) => {
  const isMapActive = activeTab === 'map'

  return (
    <nav
      className={`${styles.navBarWrapper} ${isMapActive ? styles.mapActive : styles.mapInactive}`}
      aria-label="Основная навигация"
    >
      <div className={styles.navBar}>
        {/* Tab 1: Главная */}
        <button
          type="button"
          className={`${styles.navItem} ${activeTab === 'home' ? styles.navItemActive : ''}`}
          onClick={() => onTabChange?.('home')}
          aria-label="Главная"
          aria-current={activeTab === 'home' ? 'page' : undefined}
        >
          <IconHomeFilled size={24} color={activeTab === 'home' ? '#2563EB' : '#9CA3AF'} />
          <span className={styles.navLabel}>Главная</span>
        </button>

        {/* Tab 2: Чат */}
        <button
          type="button"
          className={`${styles.navItem} ${activeTab === 'chat' ? styles.navItemActive : ''}`}
          onClick={() => onTabChange?.('chat')}
          aria-label="Чат"
          aria-current={activeTab === 'chat' ? 'page' : undefined}
        >
          <IconChat size={24} color={activeTab === 'chat' ? '#2563EB' : '#9CA3AF'} />
          <span className={styles.navLabel}>Чат</span>
        </button>

        {/* Center Tab: Карта */}
        <div className={styles.centerItemWrapper}>
          <div className={`${styles.centerRingArc} ${isMapActive ? '' : styles.arcHidden}`} aria-hidden="true" />
          <button
            type="button"
            className={`${styles.centerButton} ${isMapActive ? '' : styles.centerButtonInactive}`}
            onClick={() => onTabChange?.('map')}
            aria-label="Карта"
            aria-current={isMapActive ? 'page' : undefined}
          >
            <IconGlobe size={isMapActive ? 26 : 18} color="#FFFFFF" />
          </button>
          <span
            className={`${styles.centerLabel} ${isMapActive ? styles.centerLabelActive : ''}`}
            onClick={() => onTabChange?.('map')}
          >
            Карта
          </span>
        </div>

        {/* Tab 4: Планы */}
        <button
          type="button"
          className={`${styles.navItem} ${activeTab === 'plans' ? styles.navItemActive : ''}`}
          onClick={() => onTabChange?.('plans')}
          aria-label="Планы"
          aria-current={activeTab === 'plans' ? 'page' : undefined}
        >
          <IconPlans size={24} color={activeTab === 'plans' ? '#2563EB' : '#9CA3AF'} />
          <span className={styles.navLabel}>Планы</span>
        </button>

        {/* Tab 5: Профиль */}
        <button
          type="button"
          className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
          onClick={() => onTabChange?.('profile')}
          aria-label="Профиль"
          aria-current={activeTab === 'profile' ? 'page' : undefined}
        >
          <IconUser size={24} color={activeTab === 'profile' ? '#2563EB' : '#9CA3AF'} />
          <span className={styles.navLabel}>Профиль</span>
        </button>
      </div>
    </nav>
  )
}
