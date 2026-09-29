import React from 'react'
import { SectionPlaceholder } from '../components/Placeholder/SectionPlaceholder'

export const EventsPage: React.FC = () => {
  return (
    <SectionPlaceholder
      title="Мероприятия"
      description="Административное управление мероприятиями сервиса, расписанием и привязкой к чатам MAX."
      apiStatus="pending_backend"
      endpoints={[
        'GET /api/admin/events',
        'POST /api/admin/events',
        'PATCH /api/admin/events/{event_id}',
        'DELETE /api/admin/events/{event_id}',
      ]}
      notes="Админский CRUD для мероприятий и статусная модель модерации пользовательских заявок пока отсутствуют на бэкенде (API Gap). Разработчик раздела Events может изолированно проработать UI таблицы мероприятий и фильтры."
    />
  )
}
