import React from 'react'
import { SectionPlaceholder } from '../components/Placeholder/SectionPlaceholder'

export const CategoriesPage: React.FC = () => {
  return (
    <SectionPlaceholder
      title="Категории мероприятий"
      description="Справочник категорий событий с мультиязычными названиями."
      apiStatus="ready"
      endpoints={[
        'GET /api/admin/event-categories',
        'POST /api/admin/event-categories',
        'PATCH /api/admin/event-categories/{category_id}',
        'DELETE /api/admin/event-categories/{category_id}',
      ]}
      notes="Backend API для категорий полностью готов. Разработчик раздела Categories может реализовать CRUD таблицу, модальные окна создания/редактирования и подтверждение удаления непосредственно в этом модуле."
    />
  )
}
