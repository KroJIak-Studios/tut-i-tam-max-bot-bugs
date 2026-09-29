import React from 'react'
import { SectionPlaceholder } from '../components/Placeholder/SectionPlaceholder'

export const CitiesPage: React.FC = () => {
  return (
    <SectionPlaceholder
      title="Города"
      description="Справочник доступных городов с мультиязычными названиями и географическими координатами центра."
      apiStatus="pending_backend"
      endpoints={[
        'GET /api/admin/cities',
        'POST /api/admin/cities',
        'PATCH /api/admin/cities/{city_id}',
      ]}
      notes="В ответе GET /api/admin/cities сейчас отсутствуют поля latitude и longitude, а также нет DELETE эндпоинта. Разработчик раздела Cities может изолированно подготовить UI таблицы, форму локализованных названий и выбор координат на карте."
    />
  )
}
