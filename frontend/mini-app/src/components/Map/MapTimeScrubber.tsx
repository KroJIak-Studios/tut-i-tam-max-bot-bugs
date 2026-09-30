import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IconClock } from '../Icons'
import styles from './MapTimeScrubber.module.css'

interface MapTimeScrubberProps {
  selectedMinutes: number | null
  onChangeMinutes: (minutes: number) => void
  isToday?: boolean
  minMinutes?: number
  maxMinutes?: number
  step?: number
}

function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function thumbLeft(percentage: number): string {
  return `calc(${percentage}% + ${(0.5 - percentage / 100) * 22}px)`
}

export const MapTimeScrubber: React.FC<MapTimeScrubberProps> = ({
  selectedMinutes,
  onChangeMinutes,
  isToday = true,
  minMinutes = 0,
  maxMinutes = 23 * 60,
  step = 15,
}) => {
  const { t } = useTranslation()
  const nowMinutes = useMemo(() => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  }, [])
  const fallbackMinutes = isToday ? nowMinutes : minMinutes
  const clampedMinutes = Math.max(minMinutes, Math.min(maxMinutes, selectedMinutes ?? fallbackMinutes))
  const range = maxMinutes - minMinutes
  const percentage = range <= 0 ? 0 : Math.max(0, Math.min(100, ((clampedMinutes - minMinutes) / range) * 100))
  const nowPercentage = range <= 0 ? 0 : Math.max(0, Math.min(100, ((nowMinutes - minMinutes) / range) * 100))
  const showNow = nowMinutes >= minMinutes
  const timeLabel = formatMinutesToTime(clampedMinutes)
  const ticks = [0, 6, 12, 18, 23].map((hour) => ({ minutes: hour * 60, label: `${String(hour).padStart(2, '0')}:00` }))

  return (
    <div className={styles.scrubberCard} role="group" aria-label={t('map.scrubberAriaLabel', 'Выбор времени на карте')}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <span className={styles.clockIcon} aria-hidden="true"><IconClock size={18} color="currentColor" /></span>
          <span>{t('map.selectedTime', 'Выбранное время')}: {timeLabel} {t('map.selectedTimeAfter', 'и после')}</span>
        </div>
      </div>
      <div className={styles.trackContainer}>
        <div className={styles.floatingBubble} style={{ left: thumbLeft(percentage) }} aria-hidden="true">{timeLabel}</div>
        {showNow && Math.abs(clampedMinutes - nowMinutes) > 20 && <span className={styles.nowLine} style={{ left: thumbLeft(nowPercentage) }} />}
        <input
          type="range"
          min={minMinutes}
          max={maxMinutes}
          step={step}
          value={clampedMinutes}
          onChange={(event) => onChangeMinutes(Number(event.target.value))}
          className={styles.rangeInput}
          style={{ background: `linear-gradient(to right, #2563EB 0%, #2563EB ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)` }}
          aria-label={`${t('map.selectedTime', 'Выбранное время')}: ${timeLabel}`}
          aria-valuenow={clampedMinutes}
          aria-valuetext={timeLabel}
        />
      </div>
      <div className={styles.ticksRow} aria-hidden="true">
        {showNow && <span className={styles.nowMark} style={{ left: thumbLeft(nowPercentage) }}>{t('map.now', 'Сейчас')}</span>}
        {ticks.map((tick) => {
          const tickPercentage = range <= 0 ? 0 : ((tick.minutes - minMinutes) / range) * 100
          return (
            <button key={tick.minutes} type="button" tabIndex={-1} className={`${styles.tickBtn} ${Math.abs(clampedMinutes - tick.minutes) <= 15 ? styles.tickBtnActive : ''}`} style={{ left: thumbLeft(tickPercentage) }} onClick={() => onChangeMinutes(tick.minutes)}>
              {tick.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
