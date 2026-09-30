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
  IconSettings,
} from '../Icons'
import { useAuth } from '../../hooks/useAuth'
import { useModerationCounts } from '../../features/moderation/hooks/useModerationCounts'
import styles from './AdminLayout.module.css'

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const { pendingCount } = useModerationCounts()
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) closeMobileMenu()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileMenuOpen])

  const userInitials =
    (user?.username || 'AD')
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
            aria-expanded={mobileMenuOpen}
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
            <span className={styles.userName}>Администратор</span>
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
          className={`${styles.sidebar} ${mobileMenuOpen ? styles.mobileOpen : ''}`}
          role="navigation"
          aria-label="Главное меню"
        >
          {/* ОБЗОР */}
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

          {/* СОБЫТИЯ */}
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

          {/* СПРАВОЧНИКИ & ДАННЫЕ */}
          <div className={styles.navSectionTitle}>Справочники &amp; Данные</div>

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

          <div className={styles.navSectionTitle}>Настройки</div>

          <NavLink
            to="/settings/models"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <div className={styles.navItemLeft}>
              <IconSettings size={18} />
              <span className={styles.navItemText}>Модели</span>
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
