import React, { useMemo } from 'react'
import styles from './MapTimeSlider.module.css'

interface MapTimeSliderProps {
  currentMinutes: number
  onChangeMinutes: (minutes: number) => void
  minMinutes?: number // Default: 18:00 (1080)
  maxMinutes?: number // Default: 23:30 (1410)
}

function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const hStr = h < 10 ? `0${h}` : `${h}`
  const mStr = m < 10 ? `0${m}` : `${m}`
  return `${hStr}:${mStr}`
}

export const MapTimeSlider: React.FC<MapTimeSliderProps> = ({
  currentMinutes,
  onChangeMinutes,
  minMinutes = 18 * 60, // 18:00
  maxMinutes = 23 * 60 + 30, // 23:30
}) => {
  const percentage = useMemo(() => {
    const range = maxMinutes - minMinutes
    if (range <= 0) return 0
    const clamped = Math.max(minMinutes, Math.min(maxMinutes, currentMinutes))
    return ((clamped - minMinutes) / range) * 100
  }, [currentMinutes, minMinutes, maxMinutes])

  const timeLabel = useMemo(() => {
    return formatMinutesToTime(currentMinutes)
  }, [currentMinutes])

  // Custom inline background style for filled track
  const trackStyle = {
    background: `linear-gradient(to right, #2563EB 0%, #2563EB ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`,
  }

  return (
    <div className={styles.sliderWrapper} role="group" aria-label="Фильтр по времени">
      <span className={styles.label}>Сейчас</span>

      <div className={styles.trackContainer}>
        {percentage > 5 && percentage < 95 && (
          <div
            className={styles.timeTooltip}
            style={{ left: `${percentage}%` }}
          >
            {timeLabel}
          </div>
        )}
        <input
          type="range"
          min={minMinutes}
          max={maxMinutes}
          step={15}
          value={currentMinutes}
          onChange={(e) => onChangeMinutes(Number(e.target.value))}
          className={styles.rangeInput}
          style={trackStyle}
          aria-label={`Выбранное время: ${timeLabel}`}
        />
      </div>

      <span className={styles.label}>Поздний вечер</span>
    </div>
  )
}
