import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NavTabId } from '../../types'
import { apiRequest, closeMaxMiniApp } from '../../services/api'
import { localizedName, type CatalogInterest, type CatalogItem } from '../../catalogNames'
import { useUserPreferences } from '../../context/useUserPreferences'
import { ProfileTopBar } from './ProfileTopBar'
import { ProfileHero } from './ProfileHero'
import { ProfileCitySelect, type ProfileCity } from './ProfileCitySelect'
import { ProfileInterests } from './ProfileInterests'
import { InterestsModal } from './InterestsModal'
import { ProfileSettings } from './ProfileSettings'
import { AppMapModal } from './AppMapModal'
import { NotificationsModal } from './NotificationsModal'
import { LanguageModal } from './LanguageModal'
import { DeleteDataModal } from './DeleteDataModal'
import { BottomNavigation } from '../BottomNavigation'
import styles from './ProfilePage.module.css'

type Me = { first_name: string; last_name?: string | null; avatar_url: string | null; locale: string; city: CatalogItem | null; interests: CatalogInterest[]; smart_interest_rotation: boolean; notifications_enabled: boolean; notifications_silent: boolean; notify_event_reminders: boolean; notify_schedule_changes: boolean }
type Modal = 'interests' | 'notifications' | 'language' | 'map' | 'delete' | null

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { preferences, setAppMapProvider, setLocale, resetPreferences } = useUserPreferences()
  const [me, setMe] = useState<Me | null>(null)
  const [cities, setCities] = useState<CatalogItem[]>([])
  const [interests, setInterests] = useState<CatalogInterest[]>([])
  const [modal, setModal] = useState<Modal>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(false)

  useEffect(() => {
    Promise.all([apiRequest<Me>('/me'), apiRequest<CatalogItem[]>('/cities'), apiRequest<CatalogInterest[]>('/interests')]).then(([profile, cityList, interestList]) => {
      setMe(profile)
      setCities(cityList)
      setInterests(interestList)
      setLocale(profile.locale)
    })
  }, [setLocale])
  if (!me) return null

  const city = me.city ? { id: String(me.city.id), name: localizedName(me.city.names, me.locale) } : null
  const displayCities: ProfileCity[] = cities.map((item) => ({ id: String(item.id), name: localizedName(item.names, me.locale) }))
  const displayInterests = me.interests.map((item) => ({ id: String(item.id), name: localizedName(item.names, me.locale), color: item.color }))
  const modalInterests = interests.map((item) => ({ id: String(item.id), name: localizedName(item.names, me.locale), color: item.color }))
  const patch = async (body: Record<string, unknown>) => {
    const updated = await apiRequest<Me>('/me', { method: 'PATCH', body: JSON.stringify(body) })
    setMe(updated)
    return updated
  }
  const deleteData = async () => {
    setIsDeleting(true)
    setDeleteError(false)
    try {
      await apiRequest<void>('/me', { method: 'DELETE' })
      resetPreferences()
      closeMaxMiniApp()
    } catch {
      setDeleteError(true)
      setIsDeleting(false)
    }
  }
  const interestIds = me.interests.map((item) => String(item.id))
  const notifications = { notificationsEnabled: me.notifications_enabled, notificationsSilent: me.notifications_silent, eventReminders: me.notify_event_reminders, scheduleChanges: me.notify_schedule_changes }
  const tab = (id: NavTabId) => id === 'home' ? navigate('/') : id === 'chat' ? navigate('/chat') : id === 'map' ? navigate('/map') : id === 'plans' ? navigate('/plans') : undefined
  return <div className={styles.pageWrapper}><ProfileTopBar /><main className={styles.scrollArea}><ProfileHero firstName={me.first_name} lastName={me.last_name} avatarUrl={me.avatar_url} />
    <ProfileCitySelect currentCity={city} cities={displayCities} onSelectCity={(item) => void patch({ city_id: Number(item.id) })} />
    <ProfileInterests interests={displayInterests} onEditInterests={() => setModal('interests')} />
    <ProfileSettings appMapProvider={preferences.appMapProvider} currentLocale={me.locale} onOpenLanguageModal={() => setModal('language')} onOpenAppMapModal={() => setModal('map')} onOpenNotificationsModal={() => setModal('notifications')} onOpenDeleteDataModal={() => { setDeleteError(false); setModal('delete') }} />
  </main><BottomNavigation activeTab="profile" onTabChange={tab} />
    {modal === 'interests' && <InterestsModal interests={modalInterests} currentInterestIds={interestIds} smartInterestRotation={me.smart_interest_rotation} onClose={() => setModal(null)} onSave={(ids, automatic) => void patch({ interest_ids: ids.map(Number), smart_interest_rotation: automatic })} />}
    {modal === 'language' && <LanguageModal currentLocale={me.locale} onClose={() => setModal(null)} onSelect={(locale) => { setLocale(locale); void patch({ locale }) }} />}
    {modal === 'map' && <AppMapModal currentProvider={preferences.appMapProvider} onClose={() => setModal(null)} onSelect={setAppMapProvider} />}
    {modal === 'notifications' && <NotificationsModal settings={notifications} onClose={() => setModal(null)} onChange={(change) => { const body: Record<string, unknown> = {}; if ('notificationsEnabled' in change) body.notifications_enabled = change.notificationsEnabled; if ('notificationsSilent' in change) body.notifications_silent = change.notificationsSilent; if ('eventReminders' in change) body.notify_event_reminders = change.eventReminders; if ('scheduleChanges' in change) body.notify_schedule_changes = change.scheduleChanges; void patch(body) }} />}
    {modal === 'delete' && <DeleteDataModal isDeleting={isDeleting} error={deleteError} onClose={() => setModal(null)} onConfirm={() => void deleteData()} />}
  </div>
}
