import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NavTabId } from '../../types'
import { useUserPreferences } from '../../context/useUserPreferences'
import { ProfileTopBar } from './ProfileTopBar'
import { ProfileHero } from './ProfileHero'
import { ProfileCitySelect } from './ProfileCitySelect'
import { ProfileInterests } from './ProfileInterests'
import { InterestsModal } from './InterestsModal'
import { ProfileSettings } from './ProfileSettings'
import { DefaultMapModal } from './DefaultMapModal'
import { NotificationsModal } from './NotificationsModal'
import { LanguageModal } from './LanguageModal'
import { BottomNavigation } from '../BottomNavigation'
import styles from './ProfilePage.module.css'

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const {
    preferences,
    updateProfile,
    updateInterests,
    setDefaultMapProvider,
    updateNotifications,
    setLocale,
  } = useUserPreferences()

  const [isInterestsOpen, setIsInterestsOpen] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') {
      navigate('/')
    } else if (tab === 'chat') {
      navigate('/chat')
    } else if (tab === 'map') {
      navigate('/map')
    } else if (tab === 'plans') {
      navigate('/plans')
    }
  }

  const handleCitySelect = (newCity: string) => {
    updateProfile(preferences.name, newCity)
  }

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Header */}
      <ProfileTopBar />

      {/* 2. Scrollable content */}
      <main className={styles.scrollArea}>
        {/* Hero: Avatar, Name (Display only) */}
        <ProfileHero
          name={preferences.name}
          avatarUrl={preferences.avatarUrl}
        />

        {/* City Select Section before Interests */}
        <ProfileCitySelect
          currentCity={preferences.city}
          onSelectCity={handleCitySelect}
        />

        {/* Interests Card */}
        <ProfileInterests
          interests={preferences.interests}
          onEditInterests={() => setIsInterestsOpen(true)}
        />

        {/* Settings Card: Language, Default maps, Notifications */}
        <ProfileSettings
          defaultMapProvider={preferences.defaultMapProvider}
          currentLocale={preferences.locale}
          onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
          onOpenMapModal={() => setIsMapModalOpen(true)}
          onOpenNotificationsModal={() => setIsNotificationsOpen(true)}
        />
      </main>

      {/* 3. Bottom navigation */}
      <BottomNavigation
        activeTab="profile"
        onTabChange={handleTabChange}
      />

      {/* Modals */}
      {isLanguageModalOpen && (
        <LanguageModal
          currentLocale={preferences.locale}
          onClose={() => setIsLanguageModalOpen(false)}
          onSelect={setLocale}
        />
      )}

      {isInterestsOpen && (
        <InterestsModal
          currentInterests={preferences.interests}
          onClose={() => setIsInterestsOpen(false)}
          onSave={updateInterests}
        />
      )}

      {isMapModalOpen && (
        <DefaultMapModal
          currentProvider={preferences.defaultMapProvider}
          onClose={() => setIsMapModalOpen(false)}
          onSelect={setDefaultMapProvider}
        />
      )}

      {isNotificationsOpen && (
        <NotificationsModal
          settings={preferences.notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onChange={updateNotifications}
        />
      )}
    </div>
  )
}
