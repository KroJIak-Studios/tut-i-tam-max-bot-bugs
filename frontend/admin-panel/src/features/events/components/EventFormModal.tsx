import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { AdminDateTime } from '../../../components/AdminDateTime'
import { AdminSelect } from '../../../components/AdminSelect'
import { CityMapPicker } from '../../cities/components/CityMapPicker'
import { eventsApi, formatEventApiError } from '../api/eventsApi'
import { resolveCityName, resolveCategoryName } from '../utils/eventFormatters'
import type { City } from '../../cities/types/city'
import type { EventCategory } from '../../categories/types'
import type { AdminEventItem } from '../types'
import styles from './EventFormModal.module.css'

interface EventFormModalProps {
  event: AdminEventItem | null
  isOpen: boolean
  cities: City[]
  categories: EventCategory[]
  onClose: () => void
  onSaved: () => void
}

interface DraftPhoto {
  key: string
  id?: number
  url: string
  file?: File
}

function toLocalInput(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  event,
  isOpen,
  cities,
  categories,
  onClose,
  onSaved,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cityId, setCityId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [price, setPrice] = useState('0')
  const [pushkin, setPushkin] = useState(false)
  const [visible, setVisible] = useState(true)
  const [chatUrl, setChatUrl] = useState('')
  const [photos, setPhotos] = useState<DraftPhoto[]>([])
  const [removedIds, setRemovedIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const userEvent = event?.origin === 'user'

  useEffect(() => {
    if (!isOpen) return
    setTitle(event?.title ?? '')
    setDescription(event?.description ?? '')
    setCityId(event ? String(event.city_id) : cities[0] ? String(cities[0].id) : '')
    setCategoryId(event?.category_id ? String(event.category_id) : '')
    setAddress(event?.address ?? '')
    setLatitude(event ? String(event.latitude) : cities[0]?.latitude != null ? String(cities[0].latitude) : '')
    setLongitude(event ? String(event.longitude) : cities[0]?.longitude != null ? String(cities[0].longitude) : '')
    setStartsAt(toLocalInput(event?.starts_at ?? null))
    setEndsAt(toLocalInput(event?.ends_at ?? null))
    setPrice(String(event?.price_rub ?? 0))
    setPushkin(Boolean(event?.pushkin_card))
    setVisible(event?.visible ?? true)
    setChatUrl(event?.chat_invite_url ?? '')
    setPhotos((event?.images ?? []).map((image) => ({ key: `saved-${image.id}`, id: image.id, url: image.url })))
    setRemovedIds([])
    setError(null)
  }, [isOpen, event, cities])

  const keptPhotos = useMemo(() => photos.filter((photo) => !removedIds.includes(photo.id ?? -1)), [photos, removedIds])
  const priceNumber = price.trim() === '' ? 0 : Number(price)
  const pushkinEnabled = !userEvent && priceNumber > 0

  if (!isOpen) return null

  const coordinate = (value: string) => /^-?\d+(\.\d+)?$/.test(value.trim()) ? Number(value) : null

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const room = 10 - keptPhotos.length
    const next = Array.from(list).slice(0, room).map((file) => ({
      key: `new-${file.name}-${file.lastModified}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }))
    setPhotos((current) => [...current, ...next])
  }

  const removePhoto = (photo: DraftPhoto) => {
    if (photo.id) setRemovedIds((current) => [...current, photo.id!])
    else setPhotos((current) => current.filter((item) => item.key !== photo.key))
  }

  const save = async () => {
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (!title.trim() || !cityId || !address.trim() || !startsAt || Number.isNaN(lat) || Number.isNaN(lng)) {
      setError('Заполните название, город, адрес, дату и координаты.')
      return
    }
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setError('Время окончания должно быть позже времени начала.')
      return
    }
    setSaving(true)
    setError(null)
    const fields = {
      title: title.trim(),
      description: description.trim(),
      city_id: Number(cityId),
      category_id: categoryId ? Number(categoryId) : null,
      address: address.trim(),
      latitude: lat,
      longitude: lng,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      visible,
      chat_invite_url: chatUrl.trim() || null,
    }
    try {
      const saved = event
        ? await eventsApi.updateEvent(event.id, userEvent ? fields : { ...fields, price_rub: priceNumber, pushkin_card: pushkinEnabled && pushkin })
        : await eventsApi.createEvent({ ...fields, price_rub: priceNumber, pushkin_card: pushkinEnabled && pushkin })
      for (const photoId of removedIds) await eventsApi.deletePhoto(saved.id, photoId)
      for (const photo of keptPhotos) {
        if (photo.file) await eventsApi.uploadPhoto(saved.id, photo.file)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(formatEventApiError(err, 'Не удалось сохранить мероприятие'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={(click) => { if (click.target === click.currentTarget && !saving) onClose() }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="event-form-title">
        <header className={styles.header}>
          <h2 id="event-form-title">{event ? 'Редактировать мероприятие' : 'Новое мероприятие'}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </header>
        <div className={styles.body}>
          <label className={styles.wide}>Название<input value={title} onChange={(input) => setTitle(input.target.value)} /></label>
          <label>Город
            <AdminSelect value={cityId} onChange={setCityId} options={cities.map((city) => ({ value: String(city.id), label: resolveCityName(city.id, cities) }))} />
          </label>
          <div className={styles.categoryRow}>
            <label>Категория
              <AdminSelect value={categoryId} onChange={setCategoryId} placeholder="Без категории" options={[{ value: '', label: 'Без категории' }, ...categories.map((category) => ({ value: String(category.id), label: resolveCategoryName(category.id, categories) }))]} />
            </label>
            <label>Стоимость
              <input className={styles.price} inputMode="numeric" value={price} disabled={userEvent} placeholder="Бесплатно" onChange={(input) => { setPrice(input.target.value); if (!Number(input.target.value)) setPushkin(false) }} />
            </label>
            <button type="button" className={pushkin && pushkinEnabled ? styles.switchOn : styles.switch} disabled={!pushkinEnabled} onClick={() => setPushkin((value) => !value)}>Пушкинская карта</button>
          </div>
          <label>Начало<AdminDateTime value={startsAt} onChange={setStartsAt} /></label>
          <label>Окончание<AdminDateTime value={endsAt} onChange={setEndsAt} /></label>
          <div className={styles.addressRow}>
            <label>Адрес<input value={address} onChange={(input) => setAddress(input.target.value)} /></label>
            <div className={styles.visibility} role="group" aria-label="Видимость в каталоге">
              <button type="button" className={visible ? styles.switchOn : styles.switch} onClick={() => setVisible(true)}>Показан</button>
              <button type="button" className={!visible ? styles.switchOn : styles.switch} onClick={() => setVisible(false)}>Скрыт</button>
            </div>
          </div>
          <div className={styles.wide}>
            <span className={styles.photoLabel}>Точка на карте</span>
            <CityMapPicker latitude={coordinate(latitude)} longitude={coordinate(longitude)} onChange={(lat, lng) => { setLatitude(lat == null ? '' : String(lat)); setLongitude(lng == null ? '' : String(lng)) }} />
            <div className={styles.coords}>
              <label>Широта<input value={latitude} onChange={(input) => setLatitude(input.target.value)} /></label>
              <label>Долгота<input value={longitude} onChange={(input) => setLongitude(input.target.value)} /></label>
            </div>
          </div>
          <label className={styles.wide}>Ссылка на чат MAX<input value={chatUrl} onChange={(input) => setChatUrl(input.target.value)} placeholder="https://max.ru/join/..." /></label>
          <label className={styles.wide}>Описание<textarea rows={4} value={description} onChange={(input) => setDescription(input.target.value)} /></label>
          <div className={styles.wide}>
            <span className={styles.photoLabel}>Фотографии ({keptPhotos.length}/10)</span>
            <div className={styles.photos}>
              {keptPhotos.map((photo) => (
                <div key={photo.key} className={styles.photo}>
                  <img src={photo.url} alt="" />
                  <button type="button" aria-label="Убрать фотографию" onClick={() => removePhoto(photo)}><X size={14} /></button>
                </div>
              ))}
              {keptPhotos.length < 10 && (
                <button type="button" className={styles.add} aria-label="Добавить фотографию" onClick={() => fileInputRef.current?.click()}><Plus size={28} /></button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(input) => { addFiles(input.target.files); input.target.value = '' }} />
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
        <footer className={styles.footer}>
          <button type="button" onClick={onClose} disabled={saving}>Отмена</button>
          <button type="button" className={styles.save} onClick={save} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
        </footer>
      </div>
    </div>
  )
}
