import React, { useState } from 'react'
import { Info, X } from 'lucide-react'
import styles from './CityStatusBanner.module.css'

export const CityStatusBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false)

  if (isDismissed) return null

  return (
    <div className={styles.banner} role="note">
      <div className={styles.content}>
        <Info size={18} className={styles.icon} />
        <div className={styles.textGroup}>
          <span className={styles.title}>Статус интеграции City API:</span>
          <p className={styles.description}>
            Справочник подключен к реальному API. На сервере активны эндпоинты:
          </p>
          <div className={styles.codeList}>
            <span className={styles.codeBadge}>GET /api/admin/cities</span>
            <span className={styles.codeBadge}>POST /api/admin/cities</span>
            <span className={styles.codeBadge}>PATCH /api/admin/cities/{'{id}'}</span>
            <span className={styles.codeBadge}>GET /api/admin/locales</span>
          </div>
          <p className={styles.description} style={{ marginTop: 4 }}>
            Ограничения текущей версии бэкенда: координаты центра города не возвращаются
            в ответе GET и игнорируются при PATCH; эндпоинт DELETE на сервере отсутствует.
          </p>
        </div>
      </div>
      <button
        type="button"
        className={styles.dismissBtn}
        onClick={() => setIsDismissed(true)}
        title="Скрыть уведомление"
        aria-label="Скрыть уведомление"
      >
        <X size={16} />
      </button>
    </div>
  )
}
