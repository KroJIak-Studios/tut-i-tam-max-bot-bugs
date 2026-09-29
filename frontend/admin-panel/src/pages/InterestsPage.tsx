import React from 'react'
import { SectionPlaceholder } from '../components/Placeholder/SectionPlaceholder'

export const InterestsPage: React.FC = () => {
  return (
    <SectionPlaceholder
      title="Интересы"
      description="Справочник интересов пользователей с мультиязычными названиями и цветовым кодом плашки."
      apiStatus="pending_backend"
      endpoints={[
        'GET /api/admin/interests',
        'POST /api/admin/interests',
        'PATCH /api/admin/interests/{interest_id}',
      ]}
      notes="В схеме ответа GET /api/admin/interests сейчас отсутствует поле color, и создание не принимает цвет от клиента. Разработчик раздела Interests может изолированно подготовить UI таблицы, выбор цветовой палитры и перевод названий."
    />
  )
}
