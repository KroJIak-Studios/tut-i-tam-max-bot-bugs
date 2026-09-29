import React from 'react'
import { Building2, UserCheck } from 'lucide-react'
import type { EventsStats } from '../types'
import type { ModerationCounts } from '../../moderation/types'
import styles from './EventCompositionChart.module.css'

interface BarSegmentProps {
  label: string
  value: number
  total: number
  color: 'official' | 'user' | 'pending' | 'approved' | 'rejected' | 'changes'
  icon?: React.ReactNode
}

const BarSegment: React.FC<BarSegmentProps> = ({ label, value, total, color, icon }) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className={styles.segment}>
      <div className={styles.segmentMeta}>
        <div className={styles.segmentLabel}>
          {icon && <span className={styles.segmentIcon}>{icon}</span>}
          <span>{label}</span>
        </div>
        <div className={styles.segmentNumbers}>
          <span className={styles.segmentValue}>{value.toLocaleString('ru-RU')}</span>
          <span className={styles.segmentPercent}>{percent}%</span>
        </div>
      </div>
      <div className={styles.barTrack}>
        <div
          className={`${styles.barFill} ${styles[`bar_${color}`]}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${value} (${percent}%)`}
        />
      </div>
    </div>
  )
}

interface EventCompositionChartProps {
  events: EventsStats
  moderationCounts: ModerationCounts | null
}

export const EventCompositionChart: React.FC<EventCompositionChartProps> = ({
  events,
  moderationCounts,
}) => {
  const eventsTotal = events.total

  return (
    <section className={styles.card} aria-label="Состав мероприятий">
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Состав мероприятий</h3>
        <span className={styles.totalBadge}>
          {eventsTotal.toLocaleString('ru-RU')} всего
        </span>
      </header>

      <div className={styles.chartArea}>
        <div className={styles.groupTitle}>По источнику</div>
        <BarSegment
          label="Официальные"
          value={events.official}
          total={eventsTotal}
          color="official"
          icon={<Building2 size={13} />}
        />
        <BarSegment
          label="Пользовательские"
          value={events.userCreated}
          total={eventsTotal}
          color="user"
          icon={<UserCheck size={13} />}
        />

        {moderationCounts !== null && (
          <>
            <div className={`${styles.groupTitle} ${styles.groupTitleSpaced}`}>
              Модерация заявок
            </div>
            <BarSegment
              label="Ожидают проверки"
              value={moderationCounts.pending}
              total={events.userCreated || 1}
              color="pending"
            />
            <BarSegment
              label="Одобрено"
              value={moderationCounts.approved}
              total={events.userCreated || 1}
              color="approved"
            />
            <BarSegment
              label="На доработку"
              value={moderationCounts.changes_requested}
              total={events.userCreated || 1}
              color="changes"
            />
            <BarSegment
              label="Отклонено"
              value={moderationCounts.rejected}
              total={events.userCreated || 1}
              color="rejected"
            />
          </>
        )}
      </div>
    </section>
  )
}
