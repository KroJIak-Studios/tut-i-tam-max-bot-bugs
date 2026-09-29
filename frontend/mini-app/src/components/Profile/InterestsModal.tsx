import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconClose, IconCheck } from '../Icons'
import styles from './InterestsModal.module.css'

export interface ApiInterest { id: string; name: string; color: string }
interface Props { interests: ApiInterest[]; currentInterestIds: string[]; smartInterestRotation: boolean; onClose: () => void; onSave: (ids: string[], automatic: boolean) => void }
export const InterestsModal: React.FC<Props> = ({ interests, currentInterestIds, smartInterestRotation, onClose, onSave }) => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(currentInterestIds)
  const [automatic, setAutomatic] = useState(smartInterestRotation)
  useEffect(() => { const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [onClose])
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 5 ? [...current, id] : current)
  return <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label={t('profile.interests')}><div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
    <div className={styles.headerRow}><h3 className={styles.title}>{t('profile.interests')}</h3><button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t('common.close')}><IconClose size={18} /></button></div>
    <div className={styles.subtitle}>{t('profile.chooseInterestsSubtitle')}</div>
    <div className={styles.interestsGrid}>{interests.map((interest) => { const active = selected.includes(interest.id); return <button key={interest.id} type="button" className={`${styles.interestChip} ${active ? styles.interestChipSelected : ''}`} style={{ borderColor: interest.color }} onClick={() => toggle(interest.id)} aria-pressed={active}>{active && <span className={styles.checkIcon}><IconCheck size={14} color="#FFF" /></span>}{interest.name}</button> })}</div>
    <label className={styles.automaticRow}><span><strong>{t('profile.smartInterests')}</strong><small>{t('profile.smartInterestsDescription')}</small></span><span className={styles.switchControl}><input type="checkbox" className={styles.switchInput} checked={automatic} onChange={() => setAutomatic((value) => !value)} aria-label={t('profile.smartInterests')} /><span className={styles.switchTrack} /></span></label>
    <div className={styles.actionsRow}><button type="button" className={styles.saveBtn} onClick={() => { onSave(selected, automatic); onClose() }}>{t('common.save')}</button></div>
  </div></div>
}
