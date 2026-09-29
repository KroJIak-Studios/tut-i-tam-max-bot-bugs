import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import {
  IconLogo,
  IconDashboard,
  IconRequests,
  IconEvents,
  IconLayers,
  IconBuilding,
  IconHeart,
  IconLogOut,
  IconMenu,
} from '../Icons'
import { useAuth } from '../../hooks/useAuth'
import {
  getRequestsStats,
  ADMIN_REQUESTS_CHANGED_EVENT,
} from '../../services/adminRequestsRepository'
import styles from './AdminLayout.module.css'

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const displayName = user?.username || 'Администратор'
  const userInitials =
    displayName
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD'

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.menuToggleBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Переключить меню навигации"
          >
            <IconMenu size={20} />
          </button>

          <Link to="/" className={styles.brandGroup} onClick={closeMobileMenu}>
            <IconLogo size={28} />
            <span className={styles.brandTitle}>
              Тут и Там
              <span className={styles.adminBadge}>Панель</span>
            </span>
          </Link>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{userInitials}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userRole}>Администратор</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => logout()}
            title="Выйти из системы"
          >
            <IconLogOut size={16} />
            <span className={styles.logoutText}>Выйти</span>
          </button>
        </div>
      </header>

      <div className={styles.mainBody}>
        {mobileMenuOpen && (
          <div
            className={styles.mobileBackdrop}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        <aside
          className={`${styles.sidebar} ${
            mobileMenuOpen ? styles.mobileOpen : ''
          }`}
        >
          <div className={styles.navSectionTitle}>Обзор</div>

          <NavLink
            to="/dashboard"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <div className={styles.navItemLeft}>
              <IconDashboard size={18} />
              <span className={styles.navItemText}>Дашборд</span>
            </div>
          </NavLink>

          <div className={styles.navSectionTitle}>Модерация</div>

          <NavLink
            to="/requests"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
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

          <div className={styles.navSectionTitle}>Справочники & Данные</div>

          <NavLink
            to="/categories"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <div className={styles.navItemLeft}>
              <IconLayers size={18} />
              <span className={styles.navItemText}>Категории</span>
            </div>
          </NavLink>

          <NavLink
            to="/cities"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <div className={styles.navItemLeft}>
              <IconBuilding size={18} />
              <span className={styles.navItemText}>Города</span>
            </div>
          </NavLink>

          <NavLink
            to="/interests"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <div className={styles.navItemLeft}>
              <IconHeart size={18} />
              <span className={styles.navItemText}>Интересы</span>
            </div>
          </NavLink>

          <div className={styles.navSectionTitle}>События</div>

          <NavLink
            to="/events"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <div className={styles.navItemLeft}>
              <IconEvents size={18} />
              <span className={styles.navItemText}>Мероприятия</span>
            </div>
          </NavLink>
        </aside>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
