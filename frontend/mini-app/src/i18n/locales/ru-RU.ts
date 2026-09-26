export interface TranslationSchema {
  common: {
    back: string
    cancel: string
    done: string
    close: string
    save: string
    edit: string
    reset: string
    retry: string
    details: string
    free: string
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
  home: {
    greetings: {
      morning: string
      afternoon: string
      evening: string
    }
    heroTitle: string
    heroImageAlt: string
    heroCta: string
    actions: {
      catalog: {
        title: string
        subtitle: string
      }
      tonight: {
        title: string
        subtitle: string
      }
      pushkinskaya: {
        title: string
        subtitle: string
      }
      volunteers: {
        title: string
        subtitle: string
      }
    }
    recommendedToday: string
  }
  catalog: {
    title: string
    filterToolbar: string
    filters: string
    free: string
    onMap: string
    showOnMap: string
    foundEvents_one: string
    foundEvents_few: string
    foundEvents_many: string
    foundEvents_other: string
    sortLabel: string
    sortOptionsAriaLabel: string
    sortOptions: {
      distance: string
      date: string
      popular: string
      price: string
    }
    emptyTitle: string
    emptyDescription: string
    resetFilters: string
    showToday: string
    loadError: string
  }
  map: {
    title: string
    filtersToolbar: string
    filters: string
    free: string
    updating: string
    loadError: string
    noEventsOnDate: string
    noEventsForFilters: string
    showToday: string
    details: string
    eventAriaLabel: string
    eventDetailsAriaLabel: string
  }
  filters: {
    title: string
    categoriesTitle: string
    categories: {
      all: string
      events: string
      places: string
      parks: string
      sports: string
      volunteer: string
      user: string
    }
    sourceTitle: string
    sources: {
      all: string
      external: string
      user: string
    }
    featuresTitle: string
    freeOnly: string
    pushkinCardOnly: string
    volunteerOnly: string
    maxPriceTitle: string
    prices: {
      any: string
      upTo: string
    }
    apply: string
  }
  dates: {
    selectDate: string
    today: string
    tomorrow: string
    weekend: string
    prevMonth: string
    nextMonth: string
    quickSelectAriaLabel: string
    upcomingDaysAriaLabel: string
    calendarAriaLabel: string
  }
  events: {
    free: string
    pushkinCard: string
    pushkinCardShort: string
    volunteering: string
    userAdded: string
    youreGoing: string
    imGoing: string
    attendeesCount_one: string
    attendeesCount_few: string
    attendeesCount_many: string
    attendeesCount_other: string
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
    reset: 'Сбросить',
    retry: 'Повторить',
    details: 'Подробнее',
    free: 'Бесплатно',
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
  home: {
    greetings: {
      morning: 'Доброе утро',
      afternoon: 'Добрый день',
      evening: 'Добрый вечер',
    },
    heroTitle: 'Куда пойти рядом',
    heroImageAlt: 'Казанский Кремль и мечеть Кул-Шариф',
    heroCta: 'Найти рядом',
    actions: {
      catalog: {
        title: 'Каталог',
        subtitle: 'Места и активности',
      },
      tonight: {
        title: 'Сегодня вечером',
        subtitle: 'События в Казани',
      },
      pushkinskaya: {
        title: 'Пушкинская',
        subtitle: 'События по карте',
      },
      volunteers: {
        title: 'Волонтёры',
        subtitle: 'Делать добро рядом',
      },
    },
    recommendedToday: 'Рекомендуем сегодня',
  },
  catalog: {
    title: 'Каталог',
    filterToolbar: 'Фильтры каталога',
    filters: 'Фильтры',
    free: 'Бесплатно',
    onMap: 'На карте',
    showOnMap: 'Показать на карте: {{title}}',
    foundEvents_one: 'Найдено {{count}} событие',
    foundEvents_few: 'Найдено {{count}} события',
    foundEvents_many: 'Найдено {{count}} событий',
    foundEvents_other: 'Найдено {{count}} событий',
    sortLabel: 'Сортировка: {{option}}',
    sortOptionsAriaLabel: 'Варианты сортировки',
    sortOptions: {
      distance: 'Сначала рядом',
      date: 'Сначала раньше',
      popular: 'Сначала популярные',
      price: 'Сначала дешевле',
    },
    emptyTitle: 'Ничего не найдено',
    emptyDescription: 'Попробуйте изменить дату или сбросить активные фильтры',
    resetFilters: 'Сбросить фильтры',
    showToday: 'Показать сегодня',
    loadError: 'Не удалось загрузить события каталога',
  },
  map: {
    title: 'Карта',
    filtersToolbar: 'Фильтры карты',
    filters: 'Фильтры',
    free: 'Бесплатно',
    updating: 'Обновление карты...',
    loadError: 'Не удалось загрузить данные карты',
    noEventsOnDate: 'На {{date}} событий не найдено',
    noEventsForFilters: 'Нет событий по выбранным фильтрам',
    showToday: 'Показать сегодня',
    details: 'Подробнее',
    eventAriaLabel: 'Событие: {{title}}',
    eventDetailsAriaLabel: 'Подробнее о событии: {{title}}',
  },
  filters: {
    title: 'Фильтры',
    categoriesTitle: 'Категория',
    categories: {
      all: 'Все',
      events: 'Мероприятия',
      places: 'Места',
      parks: 'Парки',
      sports: 'Спорт',
      volunteer: 'Волонтёрство',
      user: 'Пользовательские',
    },
    sourceTitle: 'Источник',
    sources: {
      all: 'Все метки',
      external: 'Городские события',
      user: 'От жителей',
    },
    featuresTitle: 'Особенности',
    freeOnly: 'Только бесплатные',
    pushkinCardOnly: 'Пушкинская карта',
    volunteerOnly: 'Только волонтёрские',
    maxPriceTitle: 'Максимальная цена: {{price}}',
    prices: {
      any: 'Любая',
      upTo: 'до {{price}}',
    },
    apply: 'Показать',
  },
  dates: {
    selectDate: 'Выбор даты',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    weekend: 'Выходные',
    prevMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
    quickSelectAriaLabel: 'Быстрый выбор даты',
    upcomingDaysAriaLabel: 'Ближайшие дни',
    calendarAriaLabel: 'Календарь дней месяца',
  },
  events: {
    free: 'Бесплатно',
    pushkinCard: 'Пушкинская карта',
    pushkinCardShort: 'Пушкинская',
    volunteering: 'Волонтёрство',
    userAdded: 'Добавлено пользователем',
    youreGoing: 'Вы идёте',
    imGoing: 'Я приду',
    attendeesCount_one: '{{count}} идёт',
    attendeesCount_few: '{{count}} идут',
    attendeesCount_many: '{{count}} идут',
    attendeesCount_other: '{{count}} идут',
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
