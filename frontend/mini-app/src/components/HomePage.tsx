import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { EventItem, NavTabId } from '../types'
import { useUserPreferences } from '../context/useUserPreferences'
import { Header } from './Header'
import { HomeHero } from './HomeHero'
import { QuickActionCard } from './QuickActionCard'
import { FeaturedEventCard } from './FeaturedEventCard'
import { BottomNavigation } from './BottomNavigation'
import { getCatalogEvents } from '../services/mapService'
import { VOLUNTEERING_CATEGORY_CODE } from '../services/eventCategoryService'
import styles from './HomePage.module.css'

const HOME_ACTIONS = [
  { id: 'catalog', icon: 'grid', theme: 'purple' },
  { id: 'tonight', icon: 'calendar', theme: 'orange' },
  { id: 'pushkinskaya', icon: 'location', theme: 'green' },
  { id: 'volunteers', icon: 'heart', theme: 'pink' },
] as const

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { preferences } = useUserPreferences()
  const [activeTab, setActiveTab] = useState<NavTabId>('home')
  const [featured, setFeatured] = useState<EventItem | null>(null)

  useEffect(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    void getCatalogEvents({ startsAfter: start.toISOString(), startsBefore: end.toISOString(), limit: 1 })
      .then((events) => {
        const event = events[0]
        if (!event) return
        setFeatured({
          id: String(event.id),
          title: event.title,
          date: event.startTime ? `${event.date} · ${event.startTime}` : event.date,
          price: event.isFree ? '0' : String(event.price),
          imageUrl: event.image ?? '',
          tag: '',
        })
      })
      .catch(() => setFeatured(null))
  }, [])

  const handleHeroClick = () => {
    navigate('/map')
  }

  const handleTabChange = (tab: NavTabId) => {
    setActiveTab(tab)
    if (tab === 'map') navigate('/map')
    else if (tab === 'chat') navigate('/chat')
    else if (tab === 'plans') navigate('/plans')
    else if (tab === 'profile') navigate('/profile')
  }

  const handleActionClick = (id: string) => {
    if (id === 'catalog') navigate('/catalog')
    else if (id === 'tonight') navigate('/map')
    else if (id === 'pushkinskaya') navigate('/catalog?pushkin=true')
    else if (id === 'volunteers') navigate(`/catalog?category_code=${VOLUNTEERING_CATEGORY_CODE}`)
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.scrollArea}>
        <Header city={preferences.city} />

        <div className={styles.contentBlock}>
          <HomeHero onClick={handleHeroClick} />

          <div className={styles.gridTwoByTwo}>
            {HOME_ACTIONS.map((item) => (
              <QuickActionCard
                key={item.id}
                item={{ ...item, title: '', subtitle: '' }}
                onClick={handleActionClick}
              />
            ))}
          </div>

          {featured && (
            <FeaturedEventCard
              event={featured}
              onClick={(id) => navigate(`/events/${id}`)}
            />
          )}
        </div>
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  )
}