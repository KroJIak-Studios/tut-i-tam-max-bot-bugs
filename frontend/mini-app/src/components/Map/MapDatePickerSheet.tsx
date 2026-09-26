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

interface MapDatePickerSheetProps {
  selectedDate: string
  onClose: () => void
  onSelectDate: (isoDate: string) => void
}

const WEEKDAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const WEEKDAY_NAMES_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export const MapDatePickerSheet: React.FC<MapDatePickerSheetProps> = ({
  selectedDate,
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

  const handlePickDate = (iso: string) => {
    onSelectDate(iso)
    onClose()
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
            className={`${styles.quickBtn} ${selectedDate === todayIso ? styles.quickBtnActive : ''}`}
            onClick={() => handlePickDate(todayIso)}
            aria-pressed={selectedDate === todayIso}
          >
            {t('dates.today')}
          </button>
          <button
            type="button"
            className={`${styles.quickBtn} ${selectedDate === tomorrowIso ? styles.quickBtnActive : ''}`}
            onClick={() => handlePickDate(tomorrowIso)}
            aria-pressed={selectedDate === tomorrowIso}
          >
            {t('dates.tomorrow')}
          </button>
          <button
            type="button"
            className={`${styles.quickBtn} ${selectedDate === weekendIso ? styles.quickBtnActive : ''}`}
            onClick={() => handlePickDate(weekendIso)}
            aria-pressed={selectedDate === weekendIso}
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
            const isSelected = day.iso === selectedDate
            return (
              <button
                key={day.iso}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`${styles.stripItem} ${isSelected ? styles.stripItemActive : ''}`}
                onClick={() => handlePickDate(day.iso)}
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
              const classNames = [
                styles.dayCell,
                day.isDisabled ? styles.dayCellDisabled : '',
                day.isToday ? styles.dayCellToday : '',
                day.isSelected ? styles.dayCellSelected : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <button
                  key={`${day.iso}-${idx}`}
                  type="button"
                  disabled={day.isDisabled}
                  className={classNames}
                  onClick={() => !day.isDisabled && handlePickDate(day.iso)}
                  aria-label={`${day.dayNum}, ${day.iso}`}
                  aria-selected={day.isSelected}
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
