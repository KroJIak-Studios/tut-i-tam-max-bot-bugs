import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { NavTabId } from '../../../types'
import { getEventCategories, getOwnEvent, updateOwnEvent, uploadOwnPhoto, deleteOwnPhoto, orderOwnPhotos, type EventCategoryRecord, type OwnEventRecord } from '../../../services/mapService'
import { getEventCategoryName } from '../../../services/eventCategoryService'
import { FALLBACK_LOCALE } from '../../../i18n'
import { RequestsTopBar } from './RequestsTopBar'
import { EventPhotoGrid, type EventPhotoItem } from '../../EventPhotos/EventPhotoGrid'
import { CreateEventLocationPreview } from '../../CreateEvent/CreateEventLocationPreview'
import { BottomNavigation } from '../../BottomNavigation'
import { formatEventDateTimeRange } from '../../../utils/formatters'
import styles from './RequestDetailPage.module.css'

type Status = OwnEventRecord['moderationStatus']

export const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [request, setRequest] = useState<OwnEventRecord | null>(null)
  const [categories, setCategories] = useState<EventCategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photos, setPhotos] = useState<EventPhotoItem[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', address: '', startDate: '', startTime: '', endDate: '', endTime: '' })

  useEffect(() => {
    let active = true
    if (!requestId) return
    Promise.all([getOwnEvent(requestId), getEventCategories()])
      .then(([event, categoryItems]) => {
        if (!active) return
        if (!event.moderationStatus) {
          setMissing(true)
          return
        }
        setRequest(event)
        setPhotos(event.photos ?? [])
        setCategories(categoryItems)
      })
      .catch(() => { if (active) setMissing(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [requestId])

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/')
    else if (tab === 'chat') navigate('/chat')
    else if (tab === 'map') navigate('/map')
    else if (tab === 'plans') navigate('/plans')
    else if (tab === 'profile') navigate('/profile')
  }
  const back = () => navigate('/plans?tab=requests')

  const startEdit = () => {
    if (!request) return
    const start = { date: request.startDate || request.date, time: request.startTime }
    const end = { date: request.endDate || start.date, time: request.endTime || '' }
    setForm({
      title: request.title,
      description: request.description,
      categoryId: request.categoryId == null ? '' : String(request.categoryId),
      address: request.address || '',
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
    })
    setError(null)
    setEditing(true)
  }

  const changePhotos = async (next: EventPhotoItem[]) => {
    if (!request) return
    const previous = photos
    setPhotos(next)
    setPhotoError(null)
    try {
      const added = next.filter((photo) => photo.file && !previous.some((item) => item.id === photo.id))
      let current = next
      for (const photo of added) {
        const saved = await uploadOwnPhoto(request.id, photo.file as File)
        current = current.map((item) => item.id === photo.id ? { id: String(saved.id), url: saved.url } : item)
      }
      const removed = previous.filter((photo) => !next.some((item) => item.id === photo.id) && !photo.file)
      for (const photo of removed) await deleteOwnPhoto(request.id, photo.id)
      const ids = current.filter((photo) => !photo.file).map((photo) => photo.id)
      if (ids.length) await orderOwnPhotos(request.id, ids)
      setPhotos(current)
    } catch (err) {
      setPhotos(previous)
      setPhotoError(err instanceof Error ? err.message : t('eventPhotos.failed'))
    }
  }

  const save = async () => {
    if (!request || saving) return
    if (!form.title.trim() || !form.description.trim() || !form.address.trim() || !form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      setError(t('requestDetail.editRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await updateOwnEvent(request.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: form.categoryId ? Number(form.categoryId) : null,
        address: form.address.trim(),
        starts_at: new Date(`${form.startDate}T${form.startTime}`).toISOString(),
        ends_at: new Date(`${form.endDate}T${form.endTime}`).toISOString(),
      })
      setRequest(updated)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('requestDetail.editFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={styles.pageWrapper}><RequestsTopBar title={t('requestDetail.title')} onBack={back} /><main className={styles.scrollArea}><div className={styles.loadingWrapper} aria-busy="true"><span className={styles.spinner} /></div></main><BottomNavigation activeTab="plans" onTabChange={handleTabChange} /></div>
  }
  if (missing || !request) {
    return <div className={styles.pageWrapper}><RequestsTopBar title={t('requestDetail.title')} onBack={back} /><main className={styles.scrollArea}><div className={styles.notFoundWrapper}><h2 className={styles.notFoundTitle}>{t('requestDetail.notFoundTitle')}</h2><p className={styles.notFoundDescription}>{t('requestDetail.notFoundDescription')}</p><button type="button" className={styles.backToRequestsBtn} onClick={back}>{t('requestDetail.backToRequests')}</button></div></main><BottomNavigation activeTab="plans" onTabChange={handleTabChange} /></div>
  }

  const status = request.moderationStatus as Status
  const categoryName = categories.find((item) => item.id === request.categoryId)
  const datetime = formatEventDateTimeRange(request, i18n.language)
  const statusText = {
    pending: t('requestDetail.statusPendingDesc'),
    approved: t('requestDetail.statusApprovedDesc'),
    rejected: t('requestDetail.statusRejectedDesc'),
    changes_requested: t('requestDetail.statusChangesDesc'),
  }[status]
  const canEdit = status === 'changes_requested'
  const canOpenPublic = status === 'approved'

  return (
    <div className={styles.pageWrapper}>
      <RequestsTopBar title={t('requestDetail.title')} onBack={back} />
      <main className={styles.scrollArea} aria-label={request.title}>
        <section className={styles.card}>
          <div className={styles.statusHeader}>
            <span className={styles.sectionLabel}>{t('requestDetail.statusTitle')}</span>
            <span className={`${styles.statusBadge} ${styles[status]}`}><span className={styles.statusDot} />{t(`plans.requests.status.${status}`)}</span>
          </div>
          <p className={styles.statusDescription}>{statusText}</p>
          {request.moderationComment && (
            <div className={styles.commentBox}>
              <span className={styles.detailLabel}>{t('requestDetail.moderatorComment')}</span>
              <p>{request.moderationComment}</p>
            </div>
          )}
        </section>

        {!editing && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{t('requestDetail.detailsTitle')}</h2>
            <div className={styles.detailRow}><span className={styles.detailLabel}>{t('requestDetail.titleLabel')}</span><span className={styles.detailValuePrimary}>{request.title}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>{t('requestDetail.categoryLabel')}</span><span className={styles.detailValue}>{categoryName ? getEventCategoryName(categoryName, i18n.language, FALLBACK_LOCALE) : '—'}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>{t('requestDetail.datetimeLabel')}</span><span className={styles.detailValue}>{datetime}</span></div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{t('requestDetail.locationLabel')}</span>
              <span className={styles.detailValue}>{request.address || '—'}</span>
              <div className={styles.mapPreviewWrapper}>
                <CreateEventLocationPreview
                  mode={request.area?.length ? 'area' : 'point'}
                  point={{ lat: request.latitude, lng: request.longitude }}
                  area={request.area?.length ? { points: request.area.map(([lat, lng]) => ({ lat, lng })) } : undefined}
                  height={140}
                />
              </div>
            </div>
            {photos.length > 0 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('eventPhotos.reviewLabel')}</span>
                <div className={styles.photoRow}>
                  {photos.map((photo) => <img key={photo.id} src={photo.url} alt="" />)}
                </div>
              </div>
            )}
            <div className={styles.detailRow}><span className={styles.detailLabel}>{t('requestDetail.descriptionLabel')}</span><span className={styles.detailValueDescription}>{request.description || '—'}</span></div>
          </section>
        )}

        {editing && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{t('requestDetail.editTitle')}</h2>
            <label className={styles.field}>{t('requestDetail.titleLabel')}<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
            <label className={styles.field}>{t('requestDetail.descriptionLabel')}<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <label className={styles.field}>{t('requestDetail.categoryLabel')}
              <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                <option value="">—</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{getEventCategoryName(category, i18n.language, FALLBACK_LOCALE)}</option>)}
              </select>
            </label>
            <div className={styles.timeGrid}>
              <label className={styles.field}>{t('createEvent.fields.startDateLabel')}<input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
              <label className={styles.field}>{t('createEvent.fields.startTimeLabel')}<input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} /></label>
              <label className={styles.field}>{t('createEvent.fields.endDateLabel')}<input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></label>
              <label className={styles.field}>{t('createEvent.fields.endTimeLabel')}<input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} /></label>
            </div>
            <label className={styles.field}>{t('requestDetail.locationLabel')}<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
            <div className={styles.field}>
              <span>{t('eventPhotos.label', { count: photos.length })}</span>
              <EventPhotoGrid photos={photos} onChange={(next) => void changePhotos(next)} onReject={setPhotoError} />
              {photoError && <p className={styles.formError} role="alert">{photoError}</p>}
            </div>
            {error && <p className={styles.formError} role="alert">{error}</p>}
            <div className={styles.editActions}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setEditing(false)} disabled={saving}>{t('common.cancel')}</button>
              <button type="button" className={styles.submitBtn} onClick={() => void save()} disabled={saving}>{saving ? t('requestDetail.saving') : t('requestDetail.resubmit')}</button>
            </div>
          </section>
        )}

        {!editing && canEdit && <button type="button" className={styles.backToRequestsBtn} onClick={startEdit}>{t('requestDetail.fixAndResubmit')}</button>}
        {!editing && canOpenPublic && <button type="button" className={styles.backToRequestsBtn} onClick={() => navigate(`/events/${request.id}`)}>{t('requestDetail.openEvent')}</button>}
      </main>
      <BottomNavigation activeTab="plans" onTabChange={handleTabChange} />
    </div>
  )
}
