export interface TranslationSchema {
  common: {
    back: string
    cancel: string
    done: string
    close: string
    save: string
    edit: string
  }
  nav: {
    mainNav: string
    home: string
    chat: string
    map: string
    plans: string
    profile: string
  }
  cities: {
    kazan: string
  }
  interests: {
    walks: string
    museums: string
    sport: string
    volunteering: string
    concerts: string
    theatres: string
    parks: string
    lectures: string
    cinema: string
    food: string
    festivals: string
    boardgames: string
  }
  profile: {
    title: string
    heroAriaLabel: string
    city: string
    cityNotice: string
    interests: string
    interestsSubtitle: string
    editInterests: string
    chooseInterestsSubtitle: string
    settings: string
    language: string
    appLanguage: string
    languageModalSubtitle: string
    defaultMaps: string
    defaultMapsSubtitle: string
    notifications: string
    notificationsSubtitle: string
    notificationsModalSubtitle: string
    notificationInterestEvents: string
    notificationReminders: string
    notificationAiRecommendations: string
    notificationScheduleChanges: string
    yandexMaps: string
    gisMaps: string
    systemMaps: string
    editProfile: string
    name: string
  }
}

export const ruRU: TranslationSchema = {
  common: {
    back: 'Назад',
    cancel: 'Отмена',
    done: 'Готово',
    close: 'Закрыть',
    save: 'Сохранить',
    edit: 'Изменить',
  },
  nav: {
    mainNav: 'Основная навигация',
    home: 'Главная',
    chat: 'Чат',
    map: 'Карта',
    plans: 'Планы',
    profile: 'Профиль',
  },
  cities: {
    kazan: 'Казань',
  },
  interests: {
    walks: 'прогулки',
    museums: 'музеи',
    sport: 'спорт',
    volunteering: 'волонтёрство',
    concerts: 'концерты',
    theatres: 'театры',
    parks: 'парки',
    lectures: 'лекции',
    cinema: 'кино',
    food: 'гастрономия',
    festivals: 'фестивали',
    boardgames: 'настолки',
  },
  profile: {
    title: 'Профиль',
    heroAriaLabel: 'Карточка профиля',
    city: 'Город',
    cityNotice: 'Пока сервис работает только в Казани',
    interests: 'Интересы',
    interestsSubtitle: 'Для персональных рекомендаций',
    editInterests: 'Изменить интересы',
    chooseInterestsSubtitle: 'Выберите темы для персональных рекомендаций:',
    settings: 'Настройки',
    language: 'Язык',
    appLanguage: 'Язык приложения',
    languageModalSubtitle: 'Выберите язык интерфейса приложения:',
    defaultMaps: 'Карты по умолчанию',
    defaultMapsSubtitle: 'Выберите приложение для построения маршрутов и навигации:',
    notifications: 'Уведомления',
    notificationsSubtitle: 'События и рекомендации',
    notificationsModalSubtitle: 'Настройте важные для вас оповещения и напоминания:',
    notificationInterestEvents: 'Новые события по интересам',
    notificationReminders: 'Напоминания о запланированном',
    notificationAiRecommendations: 'Персональные рекомендации AI',
    notificationScheduleChanges: 'Изменения в расписании',
    yandexMaps: 'Яндекс Карты',
    gisMaps: '2ГИС',
    systemMaps: 'Системные карты',
    editProfile: 'Изменить профиль',
    name: 'Имя',
  },
}
