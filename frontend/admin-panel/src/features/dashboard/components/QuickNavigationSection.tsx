import React from 'react'
import { Link } from 'react-router-dom'
import {
  Layers,
  Building,
  Heart,
  Calendar,
  Inbox,
  ArrowRight,
} from 'lucide-react'
import styles from '../Dashboard.module.css'

export const QuickNavigationSection: React.FC = () => {
  return (
    <section className={styles.section} aria-labelledby="quick-nav-title">
      <div className={styles.sectionHeader}>
        <h3 id="quick-nav-title" className={styles.sectionTitle}>
          Быстрый переход к разделам управления
        </h3>
      </div>

      <div className={styles.quickNavGrid}>
        <Link to="/categories" className={styles.quickNavLink}>
          <div className={styles.quickNavLeft}>
            <Layers size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Категории событий</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`${styles.quickNavStatus} ${styles.statusReady}`}>
              API Ready
            </span>
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Link>

        <Link to="/cities" className={styles.quickNavLink}>
          <div className={styles.quickNavLeft}>
            <Building size={18} style={{ color: 'var(--color-info)' }} />
            <span>Справочник городов</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`${styles.quickNavStatus} ${styles.statusGap}`}>
              Справочник
            </span>
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Link>

        <Link to="/interests" className={styles.quickNavLink}>
          <div className={styles.quickNavLeft}>
            <Heart size={18} style={{ color: '#ec4899' }} />
            <span>Интересы пользователей</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`${styles.quickNavStatus} ${styles.statusGap}`}>
              Таксономия
            </span>
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Link>

        <Link to="/events" className={styles.quickNavLink}>
          <div className={styles.quickNavLeft}>
            <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Каталог мероприятий</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`${styles.quickNavStatus} ${styles.statusGap}`}>
              CRUD Gap
            </span>
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Link>

        <Link to="/requests" className={styles.quickNavLink}>
          <div className={styles.quickNavLeft}>
            <Inbox size={18} style={{ color: 'var(--color-warning)' }} />
            <span>Модерация заявок</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`${styles.quickNavStatus} ${styles.statusReady}`}>
              Очередь
            </span>
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </Link>
      </div>
    </section>
  )
}
