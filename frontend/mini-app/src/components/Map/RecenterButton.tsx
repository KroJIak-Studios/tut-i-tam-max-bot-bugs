import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconCrosshair } from '../Icons'
import styles from './RecenterButton.module.css'

interface Props { disabled: boolean; onClick: () => void }
export const RecenterButton: React.FC<Props> = ({ disabled, onClick }) => {
  const { t } = useTranslation()
  return <button type="button" className={styles.button} disabled={disabled} onClick={onClick} aria-label={t('geolocation.recenter')} title={t('geolocation.recenter')}>
    <IconCrosshair size={22} color="currentColor" />
  </button>
}
