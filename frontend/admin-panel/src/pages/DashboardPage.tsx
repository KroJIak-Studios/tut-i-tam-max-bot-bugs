import React from 'react'
import { SectionPlaceholder } from '../components/Placeholder/SectionPlaceholder'

export const DashboardPage: React.FC = () => {
  return (
    <SectionPlaceholder
      title="Дашборд и статистика"
      description="Сводные метрики платформы: количество заявок, мероприятий, пользователей и городов."
      apiStatus="pending_backend"
      endpoints={['GET /api/admin/stats']}
      notes="Эндпоинт агрегированной статистики пока отсутствует на бэкенде (API Gap). Разработчик раздела Dashboard может подготовить layout карточек метрик и виджетов активности."
    />
  )
}
