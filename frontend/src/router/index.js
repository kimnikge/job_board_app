import { createRouter, createWebHistory } from 'vue-router'
import { ROLES } from '@/constants/roles.js'
// Удаляем импорт store из верхнего уровня - будем импортировать в navigation guards

// ✨ ПРОСТОЙ РОУТЕР - СОГЛАСНО ПЛАНУ УПРОЩЕНИЯ
// Все страницы в views/ - один файл = одна страница

// Главная страница (из modules/home перенесена в views/)
const HomeView = () => import('@/views/HomeView.vue') // Главная PWA страница
const JobsMainPage = () => import('@/views/JobsMainPage.vue') // Список вакансий

// Страницы вакансий  
const UrgentJobs = () => import('@/views/UrgentJobs.vue')
const JobCreate = () => import('@/views/JobCreate.vue')
const JobDetail = () => import('@/views/JobDetail.vue')

// Страницы профиля
const Profile = () => import('@/views/Profile.vue')
const PublicProfile = () => import('@/views/PublicProfile.vue')
const Resume = () => import('@/views/Resume.vue')

// Тестовая страница
const DataTest = () => import('@/views/DataTest.vue')
// R4: Тестовая страница геймификации
const R4TestPage = () => import('@/views/R4TestPage.vue')
// Демо страница уведомлений
const NotificationsDemo = () => import('@/views/NotificationsDemo.vue')
// Тестирование интеграций
const IntegrationTest = () => import('@/views/IntegrationTest.vue')
// Тестирование фильтров
const FiltersTest = () => import('@/views/FiltersTest.vue')
// Демо Telegram URL авторизации
const TelegramURLAuthDemo = () => import('@/views/TelegramURLAuthDemo.vue')
// Обработка Telegram callback
const TelegramCallback = () => import('@/views/TelegramCallback.vue')

// Страницы компаний
const Companies = () => import('@/views/Companies.vue')
const CompanyDetail = () => import('@/views/CompanyDetail.vue')
const DashboardPage = () => import('@/views/DashboardPage.vue')
// R5 Employer Dashboard pages
const EmployerBadges = () => import('@/views/EmployerBadges.vue')
const EmployerEmployees = () => import('@/views/EmployerEmployees.vue')
const BadgeCatalog = () => import('@/views/BadgeCatalog.vue')

// Admin pages
const AdminMonetization = () => import('@/views/AdminMonetization.vue')

// Layouts
const MainLayout = () => import('@/layouts/MainLayout.vue')

// Auth страница (Telegram Login только)
const AuthPage = () => import('@/views/AuthPage.vue')
const AuthCallback = () => import('@/views/AuthCallback.vue')

// Страница ошибок
const ErrorPage = () => import('@/views/ErrorPage.vue')

// ✨ КРИТИЧЕСКИЕ СТРАНИЦЫ - РАЗДЕЛЫ 7/8/9
const Onboarding = () => import('@/views/Onboarding.vue')
const CompanyRegister = () => import('@/views/CompanyRegister.vue')
const WorkerRegister = () => import('@/views/WorkerRegister.vue')
const Search = () => import('@/views/Search.vue')
const SearchResults = () => import('@/views/SearchResults.vue')
const Settings = () => import('@/views/Settings.vue')
const NotificationSettings = () => import('@/views/NotificationSettings.vue')
const PrivacySettings = () => import('@/views/PrivacySettings.vue')
const TelegramRequiredPage = () => import('@/views/TelegramRequiredPage.vue')

// ✨ ПРОСТЫЕ МАРШРУТЫ - СОГЛАСНО ТЗ: ВСЕ СТРАНИЦЫ ТРЕБУЮТ АВТОРИЗАЦИИ
const routes = [
  // Страница для показа в обычном браузере
  { 
    path: '/telegram-required', 
    component: TelegramRequiredPage,
    meta: { 
      title: 'Требуется Telegram',
      guest: true
    }
  },
  // Страница авторизации (единственная НЕ защищенная)
  { 
    path: '/auth', 
    component: AuthPage,
    meta: { 
      title: 'Вход через Telegram',
      guest: true // Только для неавторизованных
    }
  },
  
  // Callback страница для Telegram авторизации
  { 
    path: '/auth/callback', 
    component: AuthCallback,
    meta: { 
      title: 'Завершение авторизации',
      guest: true // Доступна без авторизации для завершения входа
    }
  },

  // Специальный Telegram callback
  { 
    path: '/auth/telegram/callback', 
    component: TelegramCallback,
    meta: { 
      title: 'Telegram авторизация',
      guest: true
    }
  },
  
  // Главная страница (PWA интерфейс) - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/', 
    component: HomeView,
    meta: { 
      title: 'Shiftwork BETA - Работа мечты',
      requiresAuth: true
    }
  },
  
  // Список всех вакансий - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/jobs', 
    component: JobsMainPage,
    meta: { 
      title: 'Все вакансии',
      requiresAuth: true
    }
  },
  
  // Резюме (пока перенаправляем на профиль) - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/resumes', 
    redirect: '/profile',
    meta: { 
      title: 'Резюме',
      requiresAuth: true
    }
  },
  
  // Срочные вакансии - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/urgent', 
    component: UrgentJobs,
    meta: { 
      title: 'Срочные вакансии',
      requiresAuth: true
    }
  },
  
  // Создание вакансии - ТРЕБУЕТ АВТОРИЗАЦИИ + РОЛЬ РАБОТОДАТЕЛЯ
  { 
    path: '/jobs/create', 
    component: JobCreate,
    meta: { 
      title: 'Создать вакансию',
      requiresAuth: true,
      userType: ROLES.EMPLOYER
    }
  },
  
  // Детали вакансии - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/jobs/:id', 
    name: 'job-details',
    component: JobDetail,
    meta: { 
      title: 'Детали вакансии',
      requiresAuth: true
    }
  },
  
  // Профиль пользователя - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/profile', 
    component: Profile,
    meta: { 
      title: 'Профиль',
      requiresAuth: true
    }
  },
  
  // Публичный профиль - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/profiles/:id', 
    component: PublicProfile,
    meta: { 
      title: 'Профиль пользователя',
      requiresAuth: true
    }
  },
  
  // Резюме - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/resume', 
    component: Resume,
    meta: { 
      title: 'Моё резюме',
      requiresAuth: true
    }
  },
  
  // Компании - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/companies', 
    component: Companies,
    meta: { 
      title: 'Компании',
      requiresAuth: true
    }
  },
  
  // Детали компании - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/companies/:id', 
    component: CompanyDetail,
    meta: { 
      title: 'О компании',
      requiresAuth: true
    }
  },
  
  // Dashboard работодателя - ТРЕБУЕТ АВТОРИЗАЦИИ + РОЛЬ РАБОТОДАТЕЛЯ
  { 
    path: '/dashboard', 
    component: DashboardPage,
    meta: { 
      title: 'Панель управления',
      requiresAuth: true,
      userType: ROLES.EMPLOYER
    }
  },
  
  // Бейджи работодателя - ТРЕБУЕТ АВТОРИЗАЦИИ + РОЛЬ РАБОТОДАТЕЛЯ
  { 
    path: '/employer/badges', 
    component: EmployerBadges,
    meta: { 
      title: 'Бейджи',
      requiresAuth: true,
      userType: ROLES.EMPLOYER
    }
  },
  
  // Сотрудники работодателя - ТРЕБУЕТ АВТОРИЗАЦИИ + РОЛЬ РАБОТОДАТЕЛЯ
  { 
    path: '/employer/employees', 
    component: EmployerEmployees,
    meta: { 
      title: 'Сотрудники',
      requiresAuth: true,
      userType: ROLES.EMPLOYER
    }
  },
  
  // Каталог бейджей - ТРЕБУЕТ АВТОРИЗАЦИИ
  { 
    path: '/badges', 
    component: BadgeCatalog,
    meta: { 
      title: 'Каталог бейджей',
      requiresAuth: true
    }
  },

  

  // ✨ КРИТИЧЕСКИЕ СТРАНИЦЫ - РАЗДЕЛЫ 7/8/9

  // === РАЗДЕЛ 7: РЕГИСТРАЦИЯ И ОНБОРДИНГ ===
  // Первичная настройка профиля после Telegram входа
  { 
    path: '/onboarding', 
    component: Onboarding,
    meta: { 
      title: 'Добро пожаловать',
      requiresAuth: true
    }
  },
  
  // Регистрация компании (работодателя)
  { 
    path: '/company/register', 
    component: CompanyRegister,
    meta: { 
      title: 'Регистрация компании',
      requiresAuth: true,
      userType: ROLES.EMPLOYER
    }
  },
  
  // Дополнительная регистрация соискателя
  { 
    path: '/worker/register', 
    component: WorkerRegister,
    meta: { 
      title: 'Дополнительная регистрация',
      requiresAuth: true,
      userType: ROLES.CANDIDATE
    }
  },

  // === РАЗДЕЛ 8: ПОИСК И ФИЛЬТРАЦИЯ ===
  // Глобальная страница поиска вакансий
  { 
    path: '/search', 
    component: Search,
    meta: { 
      title: 'Поиск вакансий',
      requiresAuth: true
    }
  },
  
  // Результаты поиска с фильтрами
  { 
    path: '/search/results', 
    component: SearchResults,
    meta: { 
      title: 'Результаты поиска',
      requiresAuth: true
    }
  },

  // === РАЗДЕЛ 9: НАСТРОЙКИ ===
  // Общие настройки приложения
  { 
    path: '/settings', 
    component: Settings,
    meta: { 
      title: 'Настройки',
      requiresAuth: true
    }
  },
  
  // Настройки уведомлений
  { 
    path: '/settings/notifications', 
    component: NotificationSettings,
    meta: { 
      title: 'Настройки уведомлений',
      requiresAuth: true
    }
  },
  
  // Настройки приватности
  { 
    path: '/settings/privacy', 
    component: PrivacySettings,
    meta: { 
      title: 'Настройки приватности',
      requiresAuth: true
    }
  },

  // Админка монетизации - ТРЕБУЕТ АВТОРИЗАЦИИ + РОЛЬ АДМИНА
  { 
    path: '/admin/monetization', 
    component: AdminMonetization,
    meta: { 
      title: 'Управление монетизацией',
      requiresAuth: true,
      userType: ROLES.ADMIN
    }
  },

  // ТЕСТОВЫЕ СТРАНИЦЫ - ВРЕМЕННО ДОСТУПНЫ БЕЗ АВТОРИЗАЦИИ ДЛЯ РАЗРАБОТКИ
  { 
    path: '/test/data', 
    component: DataTest,
    meta: { title: 'Тест данных' }
  },
  { 
    path: '/test/r4', 
    component: R4TestPage,
    meta: { title: 'Тест R4' }
  },
  { 
    path: '/test/notifications', 
    component: NotificationsDemo,
    meta: { title: 'Тест уведомлений' }
  },
  { 
    path: '/test/integration', 
    component: IntegrationTest,
    meta: { title: 'Тест интеграций' }
  },
  { 
    path: '/test/filters', 
    component: FiltersTest,
    meta: { title: 'Тест фильтров' }
  },
  { 
    path: '/test/telegram-url-auth', 
    component: TelegramURLAuthDemo,
    meta: { title: 'Telegram URL Authorization Demo' }
  },

  // Страница ошибок
  { 
    path: '/error', 
    component: ErrorPage,
    meta: { title: 'Произошла ошибка' }
  },

  // Редирект неизвестных маршрутов на главную
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✨ ROUTER GUARD ДЛЯ UNIFIED AUTH: РАБОТАЕТ С APP.VUE И AUTH STORE
router.beforeEach(async (to, from, next) => {
  // Установка заголовка страницы
  document.title = to.meta.title ? `${to.meta.title} | Shiftwork BETA` : 'Shiftwork BETA'

  // Проверяем demo режим
  const isDemoMode = localStorage.getItem('force-demo-mode') === 'true' ||
                    import.meta.env.VITE_USE_DEMO_MODE === 'true'
  
  // Проверяем, открыто ли приложение в Telegram Web App
  const isTelegramWebApp = window.Telegram && 
                          window.Telegram.WebApp && 
                          (window.Telegram.WebApp.initDataUnsafe?.user || window.Telegram.WebApp.initData)

  console.log('🔍 Router Guard:', {
    path: to.path,
    isDemoMode,
    isTelegramWebApp,
    requiresAuth: to.meta.requiresAuth,
    guest: to.meta.guest
  })

  // Специальная логика для страницы /telegram-required
  if (to.path === '/telegram-required') {
    // Если мы в Telegram Web App или demo режиме, перенаправляем на главную
    if (isTelegramWebApp || isDemoMode) {
      console.log('🔄 В Telegram Web App или demo mode, перенаправляем на главную')
      return next('/')
    }
    // Иначе показываем страницу /telegram-required
    return next()
  }

  // Если не в Telegram Web App и не в demo режиме, перенаправляем на /telegram-required
  if (!isTelegramWebApp && !isDemoMode && to.path !== '/telegram-required') {
    console.log('🔄 Не в Telegram Web App, перенаправляем на /telegram-required')
    return next('/telegram-required')
  }

  // Проверка авторизации для защищенных маршрутов
  if (to.meta.requiresAuth || to.meta.guest || to.meta.userType) {
    try {
      // Динамически импортируем store только когда нужно
      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()
      
      // Загружаем пользователя если еще не загружен
      if (!authStore.user) {
        await authStore.fetchUser()
      }
      
      const isAuthenticated = !!authStore.user
      const userType = authStore.user?.user_metadata?.user_type

      console.log('🔍 Auth check:', {
        isAuthenticated,
        userType,
        requiresAuth: to.meta.requiresAuth,
        guest: to.meta.guest
      })

      // ГЛАВНАЯ ПРОВЕРКА: Защищенные маршруты требуют авторизации
      if (to.meta.requiresAuth && !isAuthenticated) {
        console.log('❌ Требуется авторизация, перенаправляем на /auth')
        return next({ path: '/auth', query: { redirect: to.fullPath } })
      }

      // Гостевые маршруты (страница авторизации) недоступны авторизованным
      if (to.meta.guest && isAuthenticated) {
        console.log('✅ Пользователь уже авторизован, перенаправляем на главную')
        return next({ path: '/' })
      }

      // Проверка типа пользователя (роли)
      if (to.meta.userType && to.meta.userType !== userType) {
        console.log(`❌ Нет прав доступа. Требуется: ${to.meta.userType}, у пользователя: ${userType}`)
        return next({ path: '/' })
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      // В случае критической ошибки авторизации перенаправляем на страницу ошибки
      if (to.path !== '/error' && to.meta.requiresAuth) {
        return next({ path: '/error', query: { error: 'auth_failed' } })
      }
    }
  }

  next()
})

// Глобальная обработка ошибок роутера
router.onError((error) => {
  console.error('🚨 Router error:', error)
  
  // В продакшене перенаправляем на страницу ошибки
  if (import.meta.env.PROD) {
    router.push({ path: '/error', query: { error: 'router_error' } })
  }
})

export default router
