import React, { useState } from 'react'
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import styles from './BackendGapNotice.module.css'

export const BackendGapNotice: React.FC = () => {
  const [showContract, setShowContract] = useState<boolean>(false)

  return (
    <section className={styles.noticeCard} aria-labelledby="integration-status-title">
      <div className={styles.noticeHeader}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <Info size={18} />
        </div>
        <div>
          <h3 id="integration-status-title" className={styles.noticeTitle}>
            Статус доступности данных и архитектура API
          </h3>
          <p className={styles.noticeDescription}>
            В соответствии с регламентом продуктовой панели, дашборд отображает
            исключительно подтверждённые API-метрики без клиентских краулеров и синтетических данных.
          </p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.statusTable}>
          <thead>
            <tr>
              <th>Метрика</th>
              <th>Эндпоинт API</th>
              <th>Статус</th>
              <th>Примечание / Архитектура</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Мероприятия (Total & Breakdown)</strong>
              </td>
              <td>
                <span className={styles.codeBadge}>GET /api/admin/stats</span>
              </td>
              <td>
                <span className={styles.badgeGap}>
                  <AlertTriangle size={12} />
                  API Gap
                </span>
              </td>
              <td>
                Требуется серверная агрегация <code>OfficialEvent</code> vs{' '}
                <code>UserEvent</code>. В <code>/api/v1/events</code> отсутствует пагинационный total.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Пользователи (Total)</strong>
              </td>
              <td>
                <span className={styles.codeBadge}>GET /api/admin/stats</span>
              </td>
              <td>
                <span className={styles.badgeGap}>
                  <AlertTriangle size={12} />
                  API Gap
                </span>
              </td>
              <td>
                Таблица <code>max_users</code> в БД заполнена, но отдельный count эндпоинт отсутствует.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Категории событий</strong>
              </td>
              <td>
                <span className={styles.codeBadge}>GET /api/v1/event-categories</span>
              </td>
              <td>
                <span className={styles.badgeReady}>
                  <CheckCircle2 size={12} />
                  Готово
                </span>
              </td>
              <td>
                Реальный справочник платформы активен и возвращает список категорий с переводами.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Города присутствия</strong>
              </td>
              <td>
                <span className={styles.codeBadge}>GET /api/admin/cities</span>
              </td>
              <td>
                <span className={styles.badgeReady}>
                  <CheckCircle2 size={12} />
                  Готово
                </span>
              </td>
              <td>
                Возвращает список городов платформы. Требует авторизацию <code>X-Admin-Password</code>.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Интересы аудитории</strong>
              </td>
              <td>
                <span className={styles.codeBadge}>GET /api/admin/interests</span>
              </td>
              <td>
                <span className={styles.badgeReady}>
                  <CheckCircle2 size={12} />
                  Готово
                </span>
              </td>
              <td>
                Возвращает таксономию интересов с цветовыми hex-кодами.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.contractBox}>
        <div className={styles.contractHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileCode size={14} />
            <span>Рекомендуемый контракт для бэкенд-разработчика (Suggested Contract)</span>
          </div>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--color-primary)',
              fontSize: '12px',
              fontWeight: 500,
            }}
            onClick={() => setShowContract(!showContract)}
            aria-expanded={showContract}
          >
            <span>{showContract ? 'Свернуть' : 'Развернуть'}</span>
            {showContract ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showContract && (
          <pre className={styles.contractPre}>
{`// GET /api/admin/stats
// Header: X-Admin-Password: <ADMIN_PASSWORD>
// Response 200 OK:
{
  "events": {
    "total": 142,
    "official": 118,
    "user_created": 24
  },
  "users": {
    "total": 1250
  }
}`}
          </pre>
        )}
      </div>
    </section>
  )
}
