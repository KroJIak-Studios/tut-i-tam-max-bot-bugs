import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IconClose, IconChevronLeft, IconChevronRight } from '../Icons'
import {
  getIsoDate,
  parseIsoDate,
  getNextDays,
  getWeekendIsoDate,
  formatMonthYear,
  generateMonthCalendar,
} from '../../utils/dateUtils'
import styles from './MapDatePickerSheet.module.css'

export type DatePreset = 'today' | 'tomorrow' | 'weekend' | 'custom'

interface MapDatePickerSheetProps {
  selectedDate: string
  dateEnd?: string
  activePreset?: 'today' | 'tomorrow' | 'weekend' | 'custom' | 'all'
  onClose: () => void
  onSelectDate: (isoDate: string, preset?: DatePreset, endDate?: string) => void
}

const WEEKDAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const WEEKDAY_NAMES_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export const MapDatePickerSheet: React.FC<MapDatePickerSheetProps> = ({
  selectedDate,
  dateEnd,
  activePreset,
  onClose,
  onSelectDate,
}) => {
  const { t, i18n } = useTranslation()

  // Calendar month navigation state
  const initialMonth = useMemo(() => {
    try {
      return parseIsoDate(selectedDate)
    } catch {
      return new Date()
    }
  }, [selectedDate])

  const [viewMonthDate, setViewMonthDate] = useState<Date>(initialMonth)
  const [rangeStart, setRangeStart] = useState<string | null>(selectedDate !== 'all' ? selectedDate : null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(dateEnd && dateEnd !== selectedDate ? dateEnd : null)

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const todayIso = useMemo(() => getIsoDate(0), [])
  const tomorrowIso = useMemo(() => getIsoDate(1), [])
  const weekendIso = useMemo(() => getWeekendIsoDate(), [])
  const next7Days = useMemo(() => getNextDays(7, i18n.language), [i18n.language])
  const weekdayNames = i18n.language.startsWith('en') ? WEEKDAY_NAMES_EN : WEEKDAY_NAMES_RU

  // Mutually exclusive active preset determination
  const resolvedActivePreset = useMemo<DatePreset | null>(() => {
    // 1. Explicit activePreset prop passed
    if (activePreset === 'weekend') {
      return selectedDate === weekendIso ? 'weekend' : null
    }
    if (activePreset === 'tomorrow') {
      return selectedDate === tomorrowIso ? 'tomorrow' : null
    }
    if (activePreset === 'today') {
      return selectedDate === todayIso ? 'today' : null
    }
    if (activePreset === 'custom' || activePreset === 'all') {
      return null
    }

    // 2. Fallback inference when no activePreset is specified
    if (selectedDate === todayIso) {
      return 'today'
    }
    if (selectedDate === tomorrowIso) {
      return 'tomorrow'
    }
    return null
  }, [activePreset, selectedDate, todayIso, tomorrowIso, weekendIso])

  // Can user navigate to previous month?
  const canGoPrev = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const viewYear = viewMonthDate.getFullYear()
    const viewMonth = viewMonthDate.getMonth()
    return viewYear > currentYear || (viewYear === currentYear && viewMonth > currentMonth)
  }, [viewMonthDate])

  const handlePrevMonth = () => {
    if (!canGoPrev) return
    setViewMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const calendarDays = useMemo(() => {
    return generateMonthCalendar(viewMonthDate, selectedDate)
  }, [viewMonthDate, selectedDate])

  const handlePickDate = (iso: string, preset: DatePreset = 'custom') => {
    setRangeStart(iso)
    setRangeEnd(null)
    onSelectDate(iso, preset)
  }

  const handleMonthDay = (iso: string, currentMonth: boolean) => {
    if (!currentMonth) setViewMonthDate(parseIsoDate(iso))
    if (!rangeStart || rangeEnd) {
      setRangeStart(iso)
      setRangeEnd(null)
      return
    }
    const from = rangeStart < iso ? rangeStart : iso
    const to = rangeStart < iso ? iso : rangeStart
    const span = Math.round(Math.abs(parseIsoDate(from).getTime() - parseIsoDate(to).getTime()) / 86_400_000)
    if (span > 20) {
      setRangeStart(iso)
      setRangeEnd(null)
      return
    }
    setRangeStart(from)
    setRangeEnd(to)
    onSelectDate(from, 'custom', to)
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('dates.selectDate')}
    >
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Шапка: Заголовок и кнопка закрытия */}
        <div className={styles.headerRow}>
          <h2 className={styles.title}>{t('dates.selectDate')}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <IconClose size={18} color="currentColor" />
          </button>
        </div>

        {/* Быстрые кнопки: Сегодня, Завтра, Выходные */}
        <div className={styles.quickRow} role="group" aria-label={t('dates.quickSelectAriaLabel')}>
          <button
            type="button"
            className={`${styles.quickBtn} ${resolvedActivePreset === 'today' ? styles.quickBtnActive : ''}`}
            onClick={() => handlePickDate(todayIso, 'today')}
            aria-pressed={resolvedActivePreset === 'today'}
          >
            {t('dates.today')}
          </button>
          <button
            type="button"
            className={`${styles.quickBtn} ${resolvedActivePreset === 'tomorrow' ? styles.quickBtnActive : ''}`}
            onClick={() => handlePickDate(tomorrowIso, 'tomorrow')}
            aria-pressed={resolvedActivePreset === 'tomorrow'}
          >
            {t('dates.tomorrow')}
          </button>
          <button
            type="button"
            className={`${styles.quickBtn} ${resolvedActivePreset === 'weekend' ? styles.quickBtnActive : ''}`}
            onClick={() => handlePickDate(weekendIso, 'weekend')}
            aria-pressed={resolvedActivePreset === 'weekend'}
          >
            {t('dates.weekend')}
          </button>
        </div>

        {/* 7-дневная горизонтальная полоса */}
        <div
          className={styles.daysStrip}
          role="listbox"
          aria-label={t('dates.upcomingDaysAriaLabel')}
          tabIndex={0}
        >
          {next7Days.map((day) => {
            const rangeFrom = rangeStart && rangeEnd ? (rangeStart < rangeEnd ? rangeStart : rangeEnd) : rangeStart
            const rangeTo = rangeStart && rangeEnd ? (rangeStart < rangeEnd ? rangeEnd : rangeStart) : rangeStart
            const isEndpoint = day.iso === rangeFrom || day.iso === rangeTo
            const inRange = Boolean(rangeFrom && rangeTo && day.iso >= rangeFrom && day.iso <= rangeTo)
            return (
              <button
                key={day.iso}
                type="button"
                role="option"
                aria-selected={isEndpoint}
                className={`${styles.stripItem} ${inRange ? styles.stripItemActive : ''}`}
                onClick={() => handlePickDate(day.iso, 'custom')}
              >
                <span className={styles.stripWeekday}>{day.dayOfWeek}</span>
                <span className={styles.stripDayNum}>{day.dayNum}</span>
              </button>
            )
          })}
        </div>

        {/* Компактный календарь месяца */}
        <div className={styles.calendarContainer}>
          <div className={styles.monthNav}>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={handlePrevMonth}
              disabled={!canGoPrev}
              aria-label={t('dates.prevMonth')}
            >
              <IconChevronLeft size={16} color="currentColor" />
            </button>
            <span className={styles.monthTitle}>{formatMonthYear(viewMonthDate, i18n.language)}</span>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={handleNextMonth}
              aria-label={t('dates.nextMonth')}
            >
              <IconChevronRight size={16} color="currentColor" />
            </button>
          </div>

          <div className={styles.weekdayHeader} aria-hidden="true">
            {weekdayNames.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className={styles.calendarGrid} role="grid" aria-label={t('dates.calendarAriaLabel')}>
            {calendarDays.map((day, idx) => {
              const inRange = Boolean(rangeStart && rangeEnd && day.iso > rangeStart && day.iso < rangeEnd)
              const isEndpoint = day.iso === rangeStart || day.iso === rangeEnd
              const classNames = [
                styles.dayCell,
                !day.isCurrentMonth ? styles.dayCellOutside : '',
                day.isDisabled ? styles.dayCellDisabled : '',
                day.isToday ? styles.dayCellToday : '',
                inRange ? styles.dayCellInRange : '',
                isEndpoint ? styles.dayCellSelected : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <button
                  key={`${day.iso}-${idx}`}
                  type="button"
                  disabled={day.isDisabled}
                  className={classNames}
                  onClick={() => !day.isDisabled && handleMonthDay(day.iso, day.isCurrentMonth)}
                  aria-label={`${day.dayNum}, ${day.iso}`}
                  aria-selected={isEndpoint}
                >
                  {day.dayNum}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
