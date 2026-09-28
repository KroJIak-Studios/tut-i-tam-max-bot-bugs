import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  IconLogo,
  IconRequests,
  IconEvents,
  IconUsers,
  IconSettings,
  IconRefreshCw,
} from '../Icons'
import {
  getRequestsStats,
  resetToDefaults,
  ADMIN_REQUESTS_CHANGED_EVENT,
} from '../../services/adminRequestsRepository'
import styles from './AdminLayout.module.css'

export const AdminLayout: React.FC = () => {
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [resetting, setResetting] = useState<boolean>(false)
  const location = useLocation()

  const refreshStats = () => {
    getRequestsStats().then((stats) => {
      setPendingCount(stats.pending)
    })
  }

  useEffect(() => {
    refreshStats()
    window.addEventListener(ADMIN_REQUESTS_CHANGED_EVENT, refreshStats)
    return () => {
      window.removeEventListener(ADMIN_REQUESTS_CHANGED_EVENT, refreshStats)
    }
  }, [])

  const handleReset = async () => {
    if (window.confirm('Сбросить демо-данные заявок к исходному состоянию?')) {
      setResetting(true)
      await resetToDefaults()
      setResetting(false)
    }
  }

  const isRequestsActive =
    location.pathname === '/' || location.pathname.startsWith('/requests')

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <IconLogo size={30} />
          <span className={styles.brandTitle}>
            Тут и Там
            <span className={styles.adminBadge}>Админка</span>
          </span>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={resetting}
            title="Восстановить исходные 5 заявок для тестирования"
          >
            <IconRefreshCw size={14} />
            <span>Сбросить демо</span>
          </button>

          <div className={styles.userProfile}>
            <div className={styles.avatar}>АК</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Анна К.</span>
              <span className={styles.userRole}>Модератор</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.mainBody}>
        <aside className={styles.sidebar}>
          <div className={styles.navSectionTitle}>Основное</div>

          <NavLink
            to="/requests"
            className={`${styles.navItem} ${isRequestsActive ? styles.active : ''}`}
          >
            <div className={styles.navItemLeft}>
              <IconRequests size={18} />
              <span className={styles.navItemText}>Заявки</span>
            </div>
            {pendingCount > 0 && (
              <span
                className={styles.badgePending}
                title={`${pendingCount} на проверке`}
              >
                {pendingCount}
              </span>
            )}
          </NavLink>

          <div className={styles.navSectionTitle}>Управление</div>

          <div
            className={`${styles.navItem} ${styles.disabled}`}
            title="Раздел находится в разработке"
          >
            <div className={styles.navItemLeft}>
              <IconEvents size={18} />
              <span className={styles.navItemText}>Мероприятия</span>
            </div>
            <span className={styles.badgeLater}>Позже</span>
          </div>

          <div
            className={`${styles.navItem} ${styles.disabled}`}
            title="Раздел находится в разработке"
          >
            <div className={styles.navItemLeft}>
              <IconUsers size={18} />
              <span className={styles.navItemText}>Пользователи</span>
            </div>
            <span className={styles.badgeLater}>Позже</span>
          </div>

          <div
            className={`${styles.navItem} ${styles.disabled}`}
            title="Раздел находится в разработке"
          >
            <div className={styles.navItemLeft}>
              <IconSettings size={18} />
              <span className={styles.navItemText}>Настройки</span>
            </div>
            <span className={styles.badgeLater}>Позже</span>
          </div>
        </aside>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
