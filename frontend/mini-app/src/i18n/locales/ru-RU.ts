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
    myRequests: string
    myRequestsSubtitle: string
    requestsUnderReviewCount_one: string
    requestsUnderReviewCount_few: string
    requestsUnderReviewCount_many: string
    requestsUnderReviewCount_other: string
  }
  chat: {
    title: string
    assistant: string
    placeholder: string
    sendAriaLabel: string
    welcomeText: string
    errorText: string
    onMap: string
    eventChat: string
    eventChatToast: string
    detailsAriaLabel: string
    quickPromptsAriaLabel: string
    tapToOpenMap: string
    suggestions: {
      evening: string
      free: string
      kids: string
      volunteer: string
      sports: string
      nearby: string
      culture: string
    }
  }
  plans: {
    title: string
    sectionsAriaLabel: string
    tabs: {
      going: string
      past: string
    }
    empty: {
      goingTitle: string
      goingDescription: string
      pastTitle: string
      pastDescription: string
      openMap: string
      askAssistant: string
    }
    manageAttendanceAriaLabel: string
    manageAttendanceTitle: string
    visitedOn: string
    leaveReview: string
    reviewSubmitted: string
    pastCardAriaLabel: string
    removedToast: string
    updateErrorToast: string
    reviewThanksToast: string
    removeModal: {
      title: string
      description: string
      confirm: string
    }
  }
  reviews: {
    title: string
    modalTitle: string
    ratingLabel: string
    commentLabel: string
    commentPlaceholder: string
    submit: string
    leaveReview: string
    yourReview: string
    you: string
    noReviewsYet: string
    starsAriaLabel_one: string
    starsAriaLabel_few: string
    starsAriaLabel_many: string
    starsAriaLabel_other: string
    count_one: string
    count_few: string
    count_many: string
    count_other: string
  }
  eventDetails: {
    title: string
    back: string
    notFoundTitle: string
    notFoundDescription: string
    backToMap: string
    description: string
    location: string
    showOnMap: string
    openInPreferredMap: string
    yandexMaps: string
    gisMaps: string
    systemMaps: string
    addedToPlansToast: string
  }
  createEvent: {
    pageTitle: string
    stepOf: string
    steps: {
      basics: {
        title: string
        helper: string
      }
      datetime: {
        title: string
        helper: string
      }
      location: {
        title: string
        helper: string
      }
      review: {
        title: string
        helper: string
      }
    }
    fields: {
      titleLabel: string
      titlePlaceholder: string
      descriptionLabel: string
      descriptionPlaceholder: string
      categoryLabel: string
      categoryPlaceholder: string
      startGroupTitle: string
      endGroupTitle: string
      dateLabel: string
      startDateLabel: string
      startTimeLabel: string
      endDateLabel: string
      endTimeLabel: string
      endTimePlaceholder: string
      addressLabel: string
      addressPlaceholder: string
    }
    categories: {
      events: string
      places: string
      parks: string
      sports: string
      volunteer: string
    }
    errors: {
      titleRequired: string
      descriptionRequired: string
      categoryRequired: string
      dateRequired: string
      startDateRequired: string
      startTimeRequired: string
      endDateRequired: string
      endTimeRequired: string
      endTimeAfterStart: string
      endDateTimeAfterStart: string
      datePast: string
      addressRequired: string
      submitFailed: string
    }
    review: {
      titleLabel: string
      descriptionLabel: string
      categoryLabel: string
      datetimeLabel: string
      locationLabel: string
      editLabel: string
      freeNotice: string
      moderationNotice: string
    }
    actions: {
      next: string
      back: string
      submit: string
      submitting: string
    }
    success: {
      title: string
      description: string
      statusLabel: string
      statusUnderReview: string
      doneBtn: string
      createAnotherBtn: string
    }
    exitConfirm: {
      title: string
      description: string
      stay: string
      leave: string
    }
  }
  userRequests: {
    title: string
    emptyTitle: string
    emptyDescription: string
    submittedAt: string
    status: {
      pending: string
      approved: string
      rejected: string
    }
  }
  requestDetail: {
    title: string
    back: string
    notFoundTitle: string
    notFoundDescription: string
    backToRequests: string
    statusTitle: string
    statusPendingDesc: string
    statusApprovedDesc: string
    statusRejectedDesc: string
    detailsTitle: string
    titleLabel: string
    categoryLabel: string
    datetimeLabel: string
    locationLabel: string
    descriptionLabel: string
    submittedLabel: string
    freeNotice: string
    reviewResultTitle: string
    reviewResultPending: string
    chatTitle: string
    chatText: string
    chatComingSoon: string
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
    myRequests: 'Мои заявки',
    myRequestsSubtitle: 'Статус созданных мероприятий',
    requestsUnderReviewCount_one: '{{count}} на проверке',
    requestsUnderReviewCount_few: '{{count}} на проверке',
    requestsUnderReviewCount_many: '{{count}} на проверке',
    requestsUnderReviewCount_other: '{{count}} на проверке',
  },
  chat: {
    title: 'Чат',
    assistant: 'Ассистент',
    placeholder: 'Спросить, куда сходить...',
    sendAriaLabel: 'Отправить сообщение',
    welcomeText: 'Привет! Помогу найти, куда сходить в Казани. Спроси меня о местах, событиях или активностях рядом.',
    errorText: 'Не получилось подобрать варианты. Попробуйте задать вопрос иначе или повторить чуть позже.',
    onMap: 'На карте',
    eventChat: 'Чат события',
    eventChatToast: 'Чат мероприятия появится в следующем обновлении',
    detailsAriaLabel: 'Подробнее о событии: {{title}}',
    quickPromptsAriaLabel: 'Быстрые подсказки',
    tapToOpenMap: 'Нажмите, чтобы открыть карту',
    suggestions: {
      evening: 'Куда пойти вечером?',
      free: 'Что есть бесплатного рядом?',
      kids: 'Куда сходить с детьми?',
      volunteer: 'Есть волонтёрство?',
      sports: 'Спортивные активности',
      nearby: 'Что интересного рядом?',
      culture: 'Культура и выставки',
    },
  },
  plans: {
    title: 'Планы',
    sectionsAriaLabel: 'Разделы планов',
    tabs: {
      going: 'Иду',
      past: 'Были',
    },
    empty: {
      goingTitle: 'Пока ничего не запланировано',
      goingDescription: 'Найдите интересные события на карте Казани или попросите персональные рекомендации у ассистента.',
      pastTitle: 'История посещений пока пустая',
      pastDescription: 'Здесь будут сохраняться мероприятия, которые вы уже посетили в Казани.',
      openMap: 'Открыть карту',
      askAssistant: 'Спросить ассистента',
    },
    manageAttendanceAriaLabel: 'Управление участием в событии',
    manageAttendanceTitle: 'Нажмите, чтобы изменить участие',
    visitedOn: 'Посещено {{date}}',
    leaveReview: 'Оставить отзыв',
    reviewSubmitted: 'Отзыв оставлен',
    pastCardAriaLabel: '{{title}}, посещено {{date}}',
    removedToast: 'Удалено из ваших планов',
    updateErrorToast: 'Не удалось обновить планы',
    reviewThanksToast: 'Спасибо за ваш отзыв!',
    removeModal: {
      title: 'Убрать из планов?',
      description: 'Мероприятие «{{title}}» будет удалено из ваших запланированных событий.',
      confirm: 'Убрать',
    },
  },
  reviews: {
    title: 'Отзывы',
    modalTitle: 'Оставить отзыв',
    ratingLabel: 'Ваша оценка:',
    commentLabel: 'Комментарий (необязательно)',
    commentPlaceholder: 'Поделитесь впечатлениями о мероприятии...',
    submit: 'Отправить отзыв',
    leaveReview: 'Оставить отзыв',
    yourReview: 'Ваш отзыв',
    you: 'Вы',
    noReviewsYet: 'Пока нет отзывов. Станьте первым!',
    starsAriaLabel_one: '{{count}} звезда',
    starsAriaLabel_few: '{{count}} звезды',
    starsAriaLabel_many: '{{count}} звёзд',
    starsAriaLabel_other: '{{count}} звёзд',
    count_one: '{{count}} отзыв',
    count_few: '{{count}} отзыва',
    count_many: '{{count}} отзывов',
    count_other: '{{count}} отзывов',
  },
  eventDetails: {
    title: 'Событие',
    back: 'Назад',
    notFoundTitle: 'Событие не найдено',
    notFoundDescription: 'Возможно, мероприятие было перенесено, удалено или ссылка содержит опечатку.',
    backToMap: 'На карту',
    description: 'Описание',
    location: 'Место',
    showOnMap: 'Показать на карте приложения',
    openInPreferredMap: 'Открыть в {{provider}} ↗',
    yandexMaps: 'Яндекс Карты ↗',
    gisMaps: '2ГИС ↗',
    systemMaps: 'Системные карты ↗',
    addedToPlansToast: 'Добавлено в ваши планы!',
  },
  createEvent: {
    pageTitle: 'Создать мероприятие',
    stepOf: 'Шаг {{current}} из {{total}}',
    steps: {
      basics: {
        title: 'Основное',
        helper: 'Расскажите, что вы хотите организовать',
      },
      datetime: {
        title: 'Дата и время',
        helper: 'Выберите, когда пройдёт мероприятие',
      },
      location: {
        title: 'Место',
        helper: 'Укажите место проведения',
      },
      review: {
        title: 'Проверка',
        helper: 'Проверьте информацию перед отправкой',
      },
    },
    fields: {
      titleLabel: 'Название мероприятия',
      titlePlaceholder: 'Например: Вечер настольных игр',
      descriptionLabel: 'Описание',
      descriptionPlaceholder: 'Расскажите, что будет происходить и кому подойдёт мероприятие',
      categoryLabel: 'Категория',
      categoryPlaceholder: 'Выберите категорию',
      startGroupTitle: 'Начало',
      endGroupTitle: 'Окончание',
      dateLabel: 'Дата',
      startDateLabel: 'Дата начала',
      startTimeLabel: 'Время начала',
      endDateLabel: 'Дата окончания',
      endTimeLabel: 'Время окончания',
      endTimePlaceholder: '16:00',
      addressLabel: 'Адрес или место',
      addressPlaceholder: 'Например: Кремлёвская набережная',
    },
    categories: {
      events: 'Мероприятия',
      places: 'Места',
      parks: 'Парки',
      sports: 'Спорт',
      volunteer: 'Волонтёрство',
    },
    errors: {
      titleRequired: 'Введите название',
      descriptionRequired: 'Добавьте описание',
      categoryRequired: 'Выберите категорию',
      dateRequired: 'Выберите дату',
      startDateRequired: 'Выберите дату начала',
      startTimeRequired: 'Укажите время начала',
      endDateRequired: 'Выберите дату окончания',
      endTimeRequired: 'Укажите время окончания',
      endTimeAfterStart: 'Время окончания должно быть позже начала',
      endDateTimeAfterStart: 'Окончание должно быть позже начала',
      datePast: 'Дата не может быть в прошлом',
      addressRequired: 'Укажите место',
      submitFailed: 'Не удалось отправить заявку. Попробуйте ещё раз.',
    },
    review: {
      titleLabel: 'Название',
      descriptionLabel: 'Описание',
      categoryLabel: 'Категория',
      datetimeLabel: 'Дата и время',
      locationLabel: 'Место',
      editLabel: 'Изменить',
      freeNotice: 'Пользовательские мероприятия всегда бесплатные',
      moderationNotice: 'После отправки заявка попадёт на проверку',
    },
    actions: {
      next: 'Далее',
      back: 'Назад',
      submit: 'Отправить заявку',
      submitting: 'Отправляем...',
    },
    success: {
      title: 'Заявка отправлена',
      description: 'Мы отправили мероприятие на проверку. После модерации оно появится в сервисе.',
      statusLabel: 'Статус',
      statusUnderReview: 'На проверке',
      doneBtn: 'Готово',
      createAnotherBtn: 'Создать ещё одно',
    },
    exitConfirm: {
      title: 'Выйти без сохранения?',
      description: 'Данные заявки будут потеряны.',
      stay: 'Остаться',
      leave: 'Выйти',
    },
  },
  userRequests: {
    title: 'Мои заявки',
    emptyTitle: 'Заявок пока нет',
    emptyDescription: 'Здесь появятся мероприятия, которые вы отправите на проверку.',
    submittedAt: 'Отправлена {{date}}',
    status: {
      pending: 'На проверке',
      approved: 'Одобрено',
      rejected: 'Отклонено',
    },
  },
  requestDetail: {
    title: 'Заявка',
    back: 'Назад',
    notFoundTitle: 'Заявка не найдена',
    notFoundDescription: 'Возможно, заявка была удалена или ссылка содержит опечатку.',
    backToRequests: 'Вернуться к заявкам',
    statusTitle: 'Статус',
    statusPendingDesc: 'Мы проверим заявку и сообщим результат здесь.',
    statusApprovedDesc: 'Мероприятие проверено и одобрено.',
    statusRejectedDesc: 'Заявка была отклонена модератором.',
    detailsTitle: 'Детали мероприятия',
    titleLabel: 'Название',
    categoryLabel: 'Категория',
    datetimeLabel: 'Дата и время',
    locationLabel: 'Место',
    descriptionLabel: 'Описание',
    submittedLabel: 'Дата отправки',
    freeNotice: 'Пользовательские мероприятия всегда бесплатные',
    reviewResultTitle: 'Результат проверки',
    reviewResultPending: 'Пока заявка на проверке.',
    chatTitle: 'Чат по заявке',
    chatText: 'Если у модератора появятся вопросы, переписка будет здесь.',
    chatComingSoon: 'Скоро',
  },
}
