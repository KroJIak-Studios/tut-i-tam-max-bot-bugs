import React from 'react'
import { Pencil, MapPin } from 'lucide-react'
import type { City, Locale } from '../types/city'
import {
  getCityAdditionalNames,
  getCityMainName,
} from '../constants/locales'
import styles from './CityCard.module.css'

interface CityCardProps {
  city: City
  locales: Locale[]
  fallbackLocale: Locale
  onEdit: (city: City) => void
}

export const CityCard: React.FC<CityCardProps> = ({
  city,
  fallbackLocale,
  onEdit,
}) => {
  const mainName = getCityMainName(city, fallbackLocale.code)
  const additionalNames = getCityAdditionalNames(city, fallbackLocale.code)
  const hasCoords = city.latitude != null && city.longitude != null

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <div className={styles.titleRow}>
            <span className={styles.cityId}>#{city.id}</span>
            <h3 className={styles.cityName}>{mainName}</h3>
          </div>

          <div className={styles.translationsRow}>
            {additionalNames.length > 0 ? (
              additionalNames.map((name) => (
                <span key={name.locale_code} className={styles.transPill}>
                  <span className={styles.transCode}>{name.locale_code}</span>
                  <span>{name.text}</span>
                </span>
              ))
            ) : (
              <span className={styles.transEmpty}>
                (только {fallbackLocale.native_name})
              </span>
            )}
          </div>
        </div>

        <div className={styles.coordsGroup}>
          {hasCoords ? (
            <div className={`${styles.coordsBadge} ${styles.coordsActive}`}>
              <MapPin size={12} />
              <span>
                {city.latitude?.toFixed(4)}, {city.longitude?.toFixed(4)}
              </span>
            </div>
          ) : (
            <div
              className={`${styles.coordsBadge} ${styles.coordsMissing}`}
              title="Координаты не возвращаются сервером при текущей версии API"
            >
              <MapPin size={12} />
              <span>Координаты: N/A</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => onEdit(city)}
          title="Редактировать город"
          aria-label={`Редактировать город ${mainName}`}
        >
          <Pencil size={15} />
          <span>Редактировать</span>
        </button>
      </div>
    </div>
  )
}
