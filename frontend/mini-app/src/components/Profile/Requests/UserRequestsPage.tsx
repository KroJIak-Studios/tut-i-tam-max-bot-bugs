import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { NavTabId } from '../../../types'
import { useCreateEventRequests } from '../../../services/useCreateEventRequests'
import { RequestsTopBar } from './RequestsTopBar'
import { UserRequestCard } from './UserRequestCard'
import { BottomNavigation } from '../../BottomNavigation'
import { IconInbox } from '../../Icons'
import styles from './UserRequestsPage.module.css'

export const UserRequestsPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { requests, loading } = useCreateEventRequests()

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/')
    else if (tab === 'chat') navigate('/chat')
    else if (tab === 'map') navigate('/map')
    else if (tab === 'plans') navigate('/plans')
    else if (tab === 'profile') navigate('/profile')
  }

  const handleBack = () => {
    navigate('/profile')
  }

  const handleCardClick = (requestId: string) => {
    navigate(`/profile/requests/${requestId}`)
  }

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Header */}
      <RequestsTopBar
        title={t('userRequests.title')}
        onBack={handleBack}
      />

      {/* 2. Scrollable Body */}
      <main className={styles.scrollArea} aria-label={t('userRequests.title')}>
        {loading ? (
          <div className={styles.loadingWrapper} aria-busy="true">
            <span className={styles.spinner} aria-hidden="true" />
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyWrapper}>
            <div className={styles.emptyIconCircle} aria-hidden="true">
              <IconInbox size={32} color="#9CA3AF" />
            </div>
            <h2 className={styles.emptyTitle}>{t('userRequests.emptyTitle')}</h2>
            <p className={styles.emptyDescription}>{t('userRequests.emptyDescription')}</p>
          </div>
        ) : (
          <div className={styles.requestsList}>
            {requests.map((req) => (
              <UserRequestCard
                key={req.id}
                request={req}
                onClick={() => handleCardClick(req.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 3. Bottom Navigation */}
      <BottomNavigation
        activeTab="profile"
        onTabChange={handleTabChange}
      />
    </div>
  )
}
