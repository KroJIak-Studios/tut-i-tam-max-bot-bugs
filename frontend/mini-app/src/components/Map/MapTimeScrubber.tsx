import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IconClock } from '../Icons'
import styles from './MapTimeScrubber.module.css'

interface MapTimeScrubberProps {
  selectedMinutes: number | null
  onChangeMinutes: (minutes: number) => void
  onResetTime?: () => void
  isToday?: boolean
  minMinutes?: number
  maxMinutes?: number
  step?: number
}

function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const hStr = h < 10 ? `0${h}` : `${h}`
  const mStr = m < 10 ? `0${m}` : `${m}`
  return `${hStr}:${mStr}`
}

export const MapTimeScrubber: React.FC<MapTimeScrubberProps> = ({
  selectedMinutes,
  onChangeMinutes,
  onResetTime,
  isToday = true,
  minMinutes = 9 * 60, // 09:00
  maxMinutes = 23 * 60 + 45, // 23:45
  step = 15,
}) => {
  const { t } = useTranslation()

  // Prime Kazan default for today is 19:00 (1140 min), or 09:00 for future days
  const defaultMinutes = isToday ? 19 * 60 : 9 * 60
  const currentMinutes = selectedMinutes ?? defaultMinutes

  const clampedMinutes = Math.max(minMinutes, Math.min(maxMinutes, currentMinutes))

  const percentage = useMemo(() => {
    const range = maxMinutes - minMinutes
    if (range <= 0) return 0
    return Math.max(0, Math.min(100, ((clampedMinutes - minMinutes) / range) * 100))
  }, [clampedMinutes, minMinutes, maxMinutes])

  const timeLabel = useMemo(() => {
    return formatMinutesToTime(clampedMinutes)
  }, [clampedMinutes])

  const isAtNowOrPrime = isToday && clampedMinutes === 19 * 60

  // Tick marks
  const tickValues = useMemo(() => {
    return [
      { minutes: 9 * 60, label: isToday ? '09:00' : '09:00' },
      { minutes: 12 * 60, label: '12:00' },
      { minutes: 15 * 60, label: '15:00' },
      { minutes: 18 * 60, label: '18:00' },
      { minutes: 21 * 60, label: '21:00' },
    ]
  }, [isToday])

  // Custom inline background style for filled track
  const trackStyle = {
    background: `linear-gradient(to right, #2563EB 0%, #2563EB ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`,
  }

  // Clamped bubble position to prevent edge overflow
  const bubbleLeftStyle = `clamp(26px, ${percentage}%, calc(100% - 26px))`

  return (
    <div
      className={styles.scrubberCard}
      role="group"
      aria-label={t('map.scrubberAriaLabel', 'Выбор времени на карте')}
    >
      {/* 1. Card Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <span className={styles.clockIcon} aria-hidden="true">
            <IconClock size={15} color="currentColor" />
          </span>
          <span>{t('map.selectedTime', 'Выбранное время')}:</span>
          <span className={styles.selectedTimeText}>{timeLabel}</span>
          {isAtNowOrPrime && (
            <span className={styles.nowBadge}>{t('map.now', 'Сейчас')}</span>
          )}
        </div>

        <div className={styles.actionsArea}>
          {isToday && clampedMinutes !== 19 * 60 && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => onChangeMinutes(19 * 60)}
              aria-label={t('map.now', 'Сейчас')}
            >
              {t('map.now', 'Сейчас')}
            </button>
          )}

          {selectedMinutes !== null && onResetTime && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={onResetTime}
              aria-label={t('map.allDay', 'Весь день')}
            >
              {t('map.allDay', 'Весь день')}
            </button>
          )}
        </div>
      </div>

      {/* 2. Track & Range Slider */}
      <div className={styles.trackContainer}>
        <div
          className={styles.floatingBubble}
          style={{ left: bubbleLeftStyle }}
          aria-hidden="true"
        >
          {timeLabel}
        </div>

        <input
          type="range"
          min={minMinutes}
          max={maxMinutes}
          step={step}
          value={clampedMinutes}
          onChange={(e) => onChangeMinutes(Number(e.target.value))}
          className={styles.rangeInput}
          style={trackStyle}
          role="slider"
          aria-label={`${t('map.selectedTime', 'Выбранное время')}: ${timeLabel}`}
          aria-valuenow={clampedMinutes}
          aria-valuetext={timeLabel}
        />
      </div>

      {/* 3. Ticks Row */}
      <div className={styles.ticksRow} aria-hidden="true">
        {tickValues.map((tVal) => {
          const isActive = Math.abs(clampedMinutes - tVal.minutes) <= 15
          return (
            <button
              key={tVal.minutes}
              type="button"
              tabIndex={-1}
              className={`${styles.tickBtn} ${isActive ? styles.tickBtnActive : ''}`}
              onClick={() => onChangeMinutes(tVal.minutes)}
            >
              {tVal.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
