import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { NotificationSettings } from '../../types'
import { IconClose } from '../Icons'
import styles from './NotificationsModal.module.css'

interface Props { settings: NotificationSettings; onClose: () => void; onChange: (settings: Partial<NotificationSettings>) => void }
export const NotificationsModal: React.FC<Props> = ({ settings, onClose, onChange }) => {
  const { t } = useTranslation()
  useEffect(() => { const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [onClose])
  const topics: { id: 'eventReminders' | 'scheduleChanges'; label: string }[] = [{ id: 'eventReminders', label: t('profile.notificationReminders') }, { id: 'scheduleChanges', label: t('profile.notificationScheduleChanges') }]
  return <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true"><div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
    <div className={styles.headerRow}><h3 className={styles.title}>{t('profile.notifications')}</h3><button type="button" className={styles.closeBtn} onClick={onClose}><IconClose size={18} /></button></div>
    <div className={styles.switchesList}>
      <Switch label={t('profile.allNotifications')} checked={settings.notificationsEnabled} onChange={() => onChange({ notificationsEnabled: !settings.notificationsEnabled })} />
      <Switch label={t('profile.silentNotifications')} checked={settings.notificationsSilent} disabled={!settings.notificationsEnabled} onChange={() => onChange({ notificationsSilent: !settings.notificationsSilent })} />
    </div>
    <div className={styles.switchesList}>{topics.map((item) => <Switch key={item.id} label={item.label} checked={settings[item.id]} disabled={!settings.notificationsEnabled} onChange={() => onChange({ [item.id]: !settings[item.id] })} />)}</div>
    <div className={styles.actionsRow}><button type="button" className={styles.doneBtn} onClick={onClose}>{t('common.done')}</button></div>
  </div></div>
}
function Switch({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: () => void }) { return <label className={`${styles.switchRow} ${disabled ? styles.switchRowDisabled : ''}`}><span className={styles.switchLabel}>{label}</span><div className={styles.switchControl}><input type="checkbox" className={styles.switchInput} checked={checked} disabled={disabled} onChange={onChange} /><span className={styles.switchTrack} /></div></label> }
