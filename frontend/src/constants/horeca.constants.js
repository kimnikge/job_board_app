// 🏨 КОНСТАНТЫ ДЛЯ HoReCa ПЛАТФОРМЫ
// Все справочники и перечисления для ресторанной индустрии Казахстана

export const HORECA_CONSTANTS = {
  
  // Категории вакансий в HoReCa
  CATEGORIES: {
    service: { 
      name: 'Обслуживание', 
      icon: '🤵',
      description: 'Официанты, хостесы, администраторы'
    },
    kitchen: { 
      name: 'Кухня', 
      icon: '👨‍🍳',
      description: 'Повара, помощники поваров, кондитеры'
    },
    management: { 
      name: 'Управление', 
      icon: '👔',
      description: 'Менеджеры, шефы, администрация'
    },
    cleaning: { 
      name: 'Уборка', 
      icon: '🧹',
      description: 'Уборщики, мойщики посуды'
    },
    other: { 
      name: 'Другое', 
      icon: '🔧',
      description: 'Прочие позиции'
    }
  },

  // Типы позиций
  POSITION_TYPES: {
    waiter: { 
      name: 'Официант', 
      icon: '🤵', 
      category: 'service',
      description: 'Обслуживание столов, прием заказов'
    },
    bartender: { 
      name: 'Бармен', 
      icon: '🍸', 
      category: 'service',
      description: 'Приготовление напитков, работа с кофе-машиной'
    },
    cook: { 
      name: 'Повар', 
      icon: '👨‍🍳', 
      category: 'kitchen',
      description: 'Приготовление горячих блюд'
    },
    chef: { 
      name: 'Шеф-повар', 
      icon: '👨‍🍳', 
      category: 'kitchen',
      description: 'Руководство кухней, создание меню'
    },
    cashier: { 
      name: 'Кассир', 
      icon: '💰', 
      category: 'service',
      description: 'Работа с кассой, расчет клиентов'
    },
    cleaner: { 
      name: 'Уборщик', 
      icon: '🧹', 
      category: 'cleaning',
      description: 'Поддержание чистоты в заведении'
    },
    manager: { 
      name: 'Менеджер', 
      icon: '👔', 
      category: 'management',
      description: 'Управление персоналом, координация работы'
    },
    host: { 
      name: 'Хостес', 
      icon: '💁‍♀️', 
      category: 'service',
      description: 'Встреча гостей, размещение за столами'
    },
    other: { 
      name: 'Другое', 
      icon: '👷', 
      category: 'other',
      description: 'Другие позиции в ресторанной сфере'
    }
  },

  // Типы заведений
  COMPANY_TYPES: {
    restaurant: { 
      name: 'Ресторан', 
      icon: '🍽️',
      description: 'Полноценный ресторан с полным меню'
    },
    cafe: { 
      name: 'Кафе', 
      icon: '☕',
      description: 'Кафе, кофейня'
    },
    bar: { 
      name: 'Бар', 
      icon: '🍺',
      description: 'Бар, паб, лаунж'
    },
    hotel: { 
      name: 'Отель', 
      icon: '🏨',
      description: 'Гостиница, отельный ресторан'
    },
    catering: { 
      name: 'Кейтеринг', 
      icon: '🚚',
      description: 'Выездное обслуживание'
    },
    other: { 
      name: 'Другое', 
      icon: '🏢',
      description: 'Другие типы заведений'
    }
  },

  // Типы занятости
  EMPLOYMENT_TYPES: {
    full_time: { 
      name: 'Полная занятость', 
      icon: '🕘',
      description: '40 часов в неделю'
    },
    part_time: { 
      name: 'Частичная занятость', 
      icon: '🕐',
      description: 'До 20 часов в неделю'
    },
    temporary: { 
      name: 'Временная работа', 
      icon: '📅',
      description: 'Краткосрочный контракт'
    },
    internship: { 
      name: 'Стажировка', 
      icon: '🎓',
      description: 'Обучение с последующим трудоустройством'
    }
  },

  // Типы графика
  SCHEDULE_TYPES: {
    fixed: { 
      name: 'Фиксированный', 
      icon: '📋',
      description: 'Постоянный график работы'
    },
    flexible: { 
      name: 'Гибкий', 
      icon: '🔄',
      description: 'Возможность выбора смен'
    },
    shift: { 
      name: 'Сменный', 
      icon: '🔄',
      description: 'Работа в смены (2/2, 3/3)'
    },
    night: { 
      name: 'Ночной', 
      icon: '🌙',
      description: 'Преимущественно ночные смены'
    },
    weekend: { 
      name: 'Выходные', 
      icon: '📅',
      description: 'Работа только в выходные'
    }
  },

  // Типы зарплаты
  SALARY_TYPES: {
    hourly: { 
      name: 'Почасовая', 
      icon: '⏰',
      suffix: 'тенге/час'
    },
    daily: { 
      name: 'Посменная', 
      icon: '📅',
      suffix: 'тенге/смена'
    },
    monthly: { 
      name: 'Месячная', 
      icon: '📋',
      suffix: 'тенге/месяц'
    }
  },

  // Требуемый опыт
  EXPERIENCE_LEVELS: {
    none: { 
      name: 'Без опыта', 
      icon: '🌱',
      description: 'Готовы обучить с нуля'
    },
    any: { 
      name: 'Любой опыт', 
      icon: '📈',
      description: 'Приветствуется любой опыт'
    },
    '1year+': { 
      name: 'От 1 года', 
      icon: '⭐',
      description: 'Минимум 1 год опыта'
    },
    '3years+': { 
      name: 'От 3 лет', 
      icon: '⭐⭐',
      description: 'Минимум 3 года опыта'
    },
    '5years+': { 
      name: 'От 5 лет', 
      icon: '⭐⭐⭐',
      description: 'Минимум 5 лет опыта'
    }
  },

  // Образование
  EDUCATION_LEVELS: {
    none: { 
      name: 'Не требуется', 
      icon: '📚'
    },
    secondary: { 
      name: 'Среднее', 
      icon: '🎓'
    },
    vocational: { 
      name: 'Профессиональное', 
      icon: '🏫'
    },
    higher: { 
      name: 'Высшее', 
      icon: '🎓'
    }
  },

  // Способы связи
  CONTACT_METHODS: {
    application: { 
      name: 'Через платформу', 
      icon: '📱',
      description: 'Подача заявки через сайт'
    },
    phone: { 
      name: 'По телефону', 
      icon: '📞',
      description: 'Прямой звонок работодателю'
    },
    telegram: { 
      name: 'Telegram', 
      icon: '📲',
      description: 'Связь через Telegram'
    },
    email: { 
      name: 'Email', 
      icon: '📧',
      description: 'Отправка резюме по почте'
    },
    both: { 
      name: 'Телефон + Telegram', 
      icon: '📞📲',
      description: 'Любой из способов'
    }
  },

  // Статусы вакансий
  JOB_STATUSES: {
    draft: { 
      name: 'Черновик', 
      icon: '📝',
      color: 'gray'
    },
    active: { 
      name: 'Активная', 
      icon: '✅',
      color: 'green'
    },
    paused: { 
      name: 'Приостановлена', 
      icon: '⏸️',
      color: 'yellow'
    },
    filled: { 
      name: 'Закрыта (найден сотрудник)', 
      icon: '👥',
      color: 'blue'
    },
    expired: { 
      name: 'Просрочена', 
      icon: '⏰',
      color: 'red'
    }
  },

  // Статусы срочных вакансий
  URGENT_STATUSES: {
    active: { 
      name: 'Активна', 
      icon: '🔥',
      color: 'red'
    },
    filled: { 
      name: 'Заполнена', 
      icon: '✅',
      color: 'green'
    },
    expired: { 
      name: 'Просрочена', 
      icon: '⏰',
      color: 'gray'
    },
    cancelled: { 
      name: 'Отменена', 
      icon: '❌',
      color: 'red'
    }
  },

  // Приоритеты срочных вакансий
  PRIORITIES: {
    low: { 
      name: 'Низкий', 
      icon: '🟢',
      color: 'green'
    },
    normal: { 
      name: 'Обычный', 
      icon: '🟡',
      color: 'yellow'
    },
    high: { 
      name: 'Высокий', 
      icon: '🟠',
      color: 'orange'
    },
    critical: { 
      name: 'Критический', 
      icon: '🔴',
      color: 'red'
    }
  },

  // Популярные навыки в HoReCa
  POPULAR_SKILLS: [
    'обслуживание клиентов',
    'работа с POS-системой',
    'знание английского языка',
    'знание казахского языка', 
    'работа с кофе-машиной',
    'приготовление коктейлей',
    'знание вин',
    'приготовление пиццы',
    'навыки продаж',
    'работа в команде',
    'стрессоустойчивость',
    'внимание к деталям',
    'многозадачность',
    'знание меню',
    'работа с детьми'
  ],

  // Популярные льготы
  POPULAR_BENEFITS: [
    'питание',
    'униформа',
    'обучение',
    'карьерный рост',
    'скидки для сотрудников',
    'чаевые',
    'гибкий график',
    'оплачиваемый отпуск',
    'медицинская страховка',
    'премии',
    'корпоративные мероприятия',
    'транспортные расходы',
    'парковка'
  ],

  // Районы Алматы
  ALMATY_DISTRICTS: [
    'Алатауский район',
    'Алмалинский район', 
    'Ауэзовский район',
    'Бостандыкский район',
    'Жетысуский район',
    'Медеуский район',
    'Наурызбайский район',
    'Турксибский район'
  ],

  // Районы Астаны
  ASTANA_DISTRICTS: [
    'Есильский район',
    'Сарыаркинский район',
    'Алматинский район',
    'Байконурский район'
  ]
}

// Функции-помощники для работы с константами
export const HoRecaHelpers = {
  
  // Получить информацию о категории
  getCategoryInfo(categoryKey) {
    return HORECA_CONSTANTS.CATEGORIES[categoryKey] || HORECA_CONSTANTS.CATEGORIES.other
  },

  // Получить информацию о позиции
  getPositionInfo(positionKey) {
    return HORECA_CONSTANTS.POSITION_TYPES[positionKey] || HORECA_CONSTANTS.POSITION_TYPES.other
  },

  // Получить позиции по категории
  getPositionsByCategory(category) {
    return Object.entries(HORECA_CONSTANTS.POSITION_TYPES)
      .filter(([key, value]) => value.category === category)
      .map(([key, value]) => ({ key, ...value }))
  },

  // Форматировать зарплату
  formatSalary(min, max, type = 'monthly', currency = 'KZT') {
    const typeInfo = HORECA_CONSTANTS.SALARY_TYPES[type] || HORECA_CONSTANTS.SALARY_TYPES.monthly
    
    if (min && max && min !== max) {
      return `от ${min.toLocaleString()} до ${max.toLocaleString()} ${typeInfo.suffix}`
    } else if (min) {
      return `от ${min.toLocaleString()} ${typeInfo.suffix}`
    } else if (max) {
      return `до ${max.toLocaleString()} ${typeInfo.suffix}`
    } else {
      return 'По договоренности'
    }
  },

  // Получить цвет статуса
  getStatusColor(status, isUrgent = false) {
    const statuses = isUrgent ? HORECA_CONSTANTS.URGENT_STATUSES : HORECA_CONSTANTS.JOB_STATUSES
    return statuses[status]?.color || 'gray'
  },

  // Получить иконку статуса
  getStatusIcon(status, isUrgent = false) {
    const statuses = isUrgent ? HORECA_CONSTANTS.URGENT_STATUSES : HORECA_CONSTANTS.JOB_STATUSES
    return statuses[status]?.icon || '❓'
  },

  // Проверить является ли позиция кухонной
  isKitchenPosition(positionType) {
    const position = HORECA_CONSTANTS.POSITION_TYPES[positionType]
    return position?.category === 'kitchen'
  },

  // Проверить является ли позиция сервисной
  isServicePosition(positionType) {
    const position = HORECA_CONSTANTS.POSITION_TYPES[positionType]
    return position?.category === 'service'
  },

  // Получить рекомендуемые навыки для позиции
  getRecommendedSkills(positionType) {
    const skillsMap = {
      waiter: ['обслуживание клиентов', 'знание меню', 'работа с POS-системой', 'многозадачность'],
      bartender: ['работа с кофе-машиной', 'приготовление коктейлей', 'знание напитков', 'обслуживание клиентов'],
      cook: ['приготовление блюд', 'знание технологий', 'работа в команде', 'соблюдение санитарных норм'],
      chef: ['управление командой', 'создание меню', 'контроль качества', 'знание трендов в кулинарии'],
      cashier: ['работа с кассой', 'навыки продаж', 'внимание к деталям', 'обслуживание клиентов'],
      host: ['встреча гостей', 'знание языков', 'коммуникабельность', 'презентабельность']
    }
    
    return skillsMap[positionType] || []
  }
}

console.log('✅ HoReCa constants loaded')