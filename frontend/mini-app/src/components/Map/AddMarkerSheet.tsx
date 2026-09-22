import React, { useState } from 'react'
import type { EventCategory } from '../../types'
import { IconClose } from '../Icons'
import styles from './AddMarkerSheet.module.css'

interface AddMarkerSheetProps {
  latitude: number
  longitude: number
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    category: EventCategory
    startTime: string
    description?: string
  }) => void
}

export const AddMarkerSheet: React.FC<AddMarkerSheetProps> = ({
  latitude,
  longitude,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<EventCategory>('user')
  const [startTime, setStartTime] = useState('19:30')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      category,
      startTime,
      description: description.trim(),
    })
    setTitle('')
    setDescription('')
  }

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handleBar} />

        <div className={styles.headerRow}>
          <h2 className={styles.title}>Добавить метку</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <IconClose size={20} color="currentColor" />
          </button>
        </div>

        <div className={styles.locationHint}>
          Координаты точки: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Название активности</label>
            <input
              type="text"
              required
              placeholder="Например: Встреча любителей скетчинга"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Категория</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className={styles.select}
            >
              <option value="user">Пользовательская активность</option>
              <option value="events">Мероприятие</option>
              <option value="sports">Спорт</option>
              <option value="volunteer">Волонтёрство</option>
              <option value="parks">Парк / Отдых</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Время начала</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Краткое описание (необязательно)</label>
            <input
              type="text"
              placeholder="Что планируется делать, что брать с собой"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.freeNotice}>
            Пользовательские активности всегда бесплатные и открыты для всех
          </div>

          <button type="submit" className={styles.submitBtn}>
            Добавить метку
          </button>
        </form>
      </div>
    </div>
  )
}
