import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lock,
  XCircle,
} from 'lucide-react'
import type { MetricItem, TaxonomyData } from '../types'
import styles from './TaxonomyCard.module.css'

interface TaxonomyCardProps {
  title: string
  icon: React.ReactNode
  unit: string
  metric: MetricItem<TaxonomyData>
  linkTo?: string
  linkLabel?: string
}

export const TaxonomyCard: React.FC<TaxonomyCardProps> = ({
  title,
  icon,
  unit,
  metric,
  linkTo,
  linkLabel,
}) => {
  const { status, data, error, endpoint, notes } = metric
  const [showItems, setShowItems] = useState<boolean>(false)

  const hasItems = data?.items && data.items.length > 0

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <div className={styles.iconWrapper} aria-hidden="true">
            {icon}
          </div>
          <h4 className={styles.cardTitle}>{title}</h4>
        </div>

        {status === 'ready' && (
          <span className={`${styles.badge} ${styles.badgeReady}`}>
            <CheckCircle2 size={10} />
            API
          </span>
        )}
        {status === 'pending_backend' && (
          <span className={`${styles.badge} ${styles.badgeGap}`}>
            <AlertTriangle size={10} />
            Gap
          </span>
        )}
        {status === 'unauthorized' && (
          <span className={`${styles.badge} ${styles.badgeGap}`}>
            <Lock size={10} />
            Auth
          </span>
        )}
        {status === 'error' && (
          <span className={`${styles.badge} ${styles.badgeError}`}>
            <XCircle size={10} />
            Err
          </span>
        )}
      </header>

      <div className={styles.valueRow}>
        <span className={styles.value}>
          {status === 'ready' && data !== undefined ? data.count : '—'}
        </span>
        <span className={styles.valueUnit}>{unit}</span>
      </div>

      {endpoint && (
        <span className={styles.endpointText} title={endpoint}>
          {endpoint}
        </span>
      )}

      {status === 'error' && error && (
        <span className={styles.errorText}>{error}</span>
      )}

      {status === 'unauthorized' && (
        <span className={styles.errorText} style={{ color: 'var(--color-warning)' }}>
          {notes || 'Требуется пароль администратора'}
        </span>
      )}

      {hasItems && (
        <>
          <button
            type="button"
            className={styles.detailsToggle}
            onClick={() => setShowItems(!showItems)}
            aria-expanded={showItems}
          >
            <span>{showItems ? 'Скрыть список' : `Список (${data.items.length})`}</span>
            {showItems ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showItems && (
            <div className={styles.itemsList} role="region" aria-label={`Список ${title}`}>
              {data.items.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <span>{item.name}</span>
                  {item.subtext && (
                    <span className={styles.itemSubtext}>{item.subtext}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {linkTo && (
        <Link to={linkTo} className={styles.actionLink}>
          <span>{linkLabel || 'Управление'}</span>
          <ExternalLink size={14} />
        </Link>
      )}
    </article>
  )
}
