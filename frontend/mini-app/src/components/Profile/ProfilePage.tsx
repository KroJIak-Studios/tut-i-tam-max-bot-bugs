import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NavTabId } from '../../types'
import { useUserPreferences } from '../../context/useUserPreferences'
import { ProfileTopBar } from './ProfileTopBar'
import { ProfileHero } from './ProfileHero'
import { EditProfileModal } from './EditProfileModal'
import { ProfileInterests } from './ProfileInterests'
import { InterestsModal } from './InterestsModal'
import { ProfileSettings } from './ProfileSettings'
import { DefaultMapModal } from './DefaultMapModal'
import { NotificationsModal } from './NotificationsModal'
import { BottomNavigation } from '../BottomNavigation'
import { IconLocationPin } from '../Icons'
import styles from './ProfilePage.module.css'

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const {
    preferences,
    updateProfile,
    updateInterests,
    togglePushkinCard,
    setDefaultMapProvider,
    updateNotifications,
  } = useUserPreferences()

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isInterestsOpen, setIsInterestsOpen] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

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

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Header */}
      <ProfileTopBar />

      {/* 2. Scrollable content */}
      <main className={styles.scrollArea}>
        {/* Hero: Avatar, Name, City, Edit */}
        <ProfileHero
          name={preferences.name}
          city={preferences.city}
          avatarUrl={preferences.avatarUrl}
          onEditProfile={() => setIsEditProfileOpen(true)}
        />

        {/* Interests Card */}
        <ProfileInterests
          interests={preferences.interests}
          onEditInterests={() => setIsInterestsOpen(true)}
        />

        {/* Settings Card: Pushkin card, Default maps, Notifications */}
        <ProfileSettings
          pushkinCard={preferences.pushkinCard}
          defaultMapProvider={preferences.defaultMapProvider}
          onTogglePushkinCard={togglePushkinCard}
          onOpenMapModal={() => setIsMapModalOpen(true)}
          onOpenNotificationsModal={() => setIsNotificationsOpen(true)}
        />

        {/* Footer info note */}
        <div className={styles.footerNote}>
          <IconLocationPin size={13} color="#9CA3AF" />
          <span>Пока сервис работает в Казани</span>
        </div>
      </main>

      {/* 3. Bottom navigation */}
      <BottomNavigation
        activeTab="profile"
        onTabChange={handleTabChange}
      />

      {/* Modals */}
      {isEditProfileOpen && (
        <EditProfileModal
          currentName={preferences.name}
          currentCity={preferences.city}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={updateProfile}
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
