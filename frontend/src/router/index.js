import { createRouter, createWebHistory } from 'vue-router'
import { ROLES } from '@/constants/roles.js'
// Удаляем импорт store из верхнего уровня - будем импортировать в navigation guards

// ✨ ПРОСТОЙ РОУТЕР - СОГЛАСНО ПЛАНУ УПРОЩЕНИЯ
// Все страницы в views/ - один файл = одна страница

// Главная страница (из modules/home перенесена в views/)
const Jobs = () => import('@/views/Jobs.vue') // Главная с вакансиями

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

// Страницы компаний
const Companies = () => import('@/views/Companies.vue')
const CompanyDetail = () => import('@/views/CompanyDetail.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
// R5 Employer Dashboard pages
const EmployerBadges = () => import('@/views/EmployerBadges.vue')
const EmployerEmployees = () => import('@/views/EmployerEmployees.vue')
const BadgeCatalog = () => import('@/views/BadgeCatalog.vue')

// Layouts
const MainLayout = () => import('@/layouts/MainLayout.vue')
const AuthLayout = () => import('@/layouts/AuthLayout.vue')

// Auth компоненты (перенесены в новую структуру)
const LoginForm = () => import('@/components/auth/LoginForm.vue')
const RegisterForm = () => import('@/components/auth/RegisterForm.vue')
const ResetPassword = () => import('@/components/auth/ResetPassword.vue')

// ✨ ПРОСТЫЕ МАРШРУТЫ - СОГЛАСНО ПЛАНУ
const routes = [
  // Главная страница (список всех вакансий)
  { 
    path: '/', 
    component: Jobs,
    meta: { title: 'Вакансии общепита - Астана' }
  },
  
  // Список всех вакансий (дублируем главную)
  { 
    path: '/jobs', 
    component: Jobs,
    meta: { title: 'Все вакансии' }
  },
  
  // Резюме (пока перенаправляем на профиль)
  { 
    path: '/resumes', 
    redirect: '/profile',
    meta: { title: 'Резюме' }
  },
  
  // Срочные вакансии
  { 
    path: '/urgent', 
    component: UrgentJobs,
    meta: { title: 'Срочные вакансии' }
  },
  
  // Создание вакансии
  { 
    path: '/jobs/create', 
    component: JobCreate,
    meta: { 
      title: 'Создать вакансию',
      requiresAuth: true,
      userType: ROLES.EMPLOYER
    }
  },
  
  // Детали вакансии
  { 
  path: '/jobs/:id', 
  name: 'job-details',
  component: JobDetail,
    meta: { title: 'Детали вакансии' }
  },
  
  // Профиль пользователя
  { 
    path: '/profile', 
    component: Profile,
    meta: { 
      title: 'Мой профиль',
      requiresAuth: true
    }
  },
  {
    path: '/u/:id',
    component: PublicProfile,
    meta: { title: 'Профиль пользователя' }
  },

  // Тестовая страница данных
  { 
    path: '/test-data', 
    component: DataTest,
    meta: { title: 'Тест данных' }
  },

  // R4: Тестовая страница геймификации
  { 
    path: '/test-r4', 
    component: R4TestPage,
    meta: { title: 'R4 Gamification Test' }
  },

  // Демо страница push-уведомлений
  { 
    path: '/notifications-demo', 
    component: NotificationsDemo,
    meta: { title: 'Push-уведомления Demo' }
  },
  
  // Резюме пользователя
  { 
    path: '/resume', 
    component: Resume,
    meta: { 
      title: 'Мое резюме',
      requiresAuth: true,
      userType: ROLES.CANDIDATE
    }
  },
  
  // Список заведений
  { 
    path: '/companies', 
    component: Companies,
    meta: { title: 'Заведения Астаны' }
  },
  
  // Детали заведения
  { 
    path: '/companies/:id', 
    component: CompanyDetail,
    meta: { title: 'О заведении' }
  },
  
  // Дашборд работодателя
  { 
    path: '/dashboard', 
    component: Dashboard,
    meta: { 
      title: 'Панель управления',
      requiresAuth: true,
      userType: ROLES.EMPLOYER
    }
  },
  // R5: Employer dashboard sub-pages
  {
    path: '/employer/badges',
    component: EmployerBadges,
    meta: {
      title: 'Корпоративные бейджи',
      requiresAuth: true,
      userType: ROLES.EMPLOYER
    }
  },
  {
    path: '/employer/employees',
    component: EmployerEmployees,
    meta: {
      title: 'Сотрудники',
      requiresAuth: true,
      userType: ROLES.EMPLOYER
    }
  },
  {
    path: '/badges/catalog',
    component: BadgeCatalog,
    meta: {
      title: 'Каталог бейджей'
    }
  },

  // Авторизация (с layout)
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { 
        path: 'login', 
        name: 'login',
        component: LoginForm,
        meta: { 
          title: 'Вход',
          guest: true
        }
      },
      { 
        path: 'register', 
        name: 'register',
        component: RegisterForm,
        meta: { 
          title: 'Регистрация',
          guest: true
        }
      },
      { 
        path: 'reset-password', 
        name: 'reset-password',
        component: ResetPassword,
        meta: { 
          title: 'Сброс пароля',
          guest: true
        }
      }
    ]
  },
  {
    path: '/employer/statistics',
    component: () => import('@/views/CompanyStatistics.vue'),
    meta: {
      title: 'Статистика компании',
      requiresAuth: true,
      userType: ROLES.EMPLOYER
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✨ ПРОСТОЙ ROUTER GUARD
router.beforeEach(async (to, from, next) => {
  // Установка заголовка страницы
  document.title = to.meta.title ? `${to.meta.title} | Job Board Астана` : 'Job Board Астана'

  // Проверка авторизации (упрощенная) - только если нужна
  if (to.meta.requiresAuth || to.meta.guest || to.meta.userType) {
    try {
      // Динамически импортируем store только когда нужно
      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()
      await authStore.fetchUser()
      const isAuthenticated = !!authStore.user
      const userType = authStore.user?.user_metadata?.user_type

      // Защищенные маршруты
      if (to.meta.requiresAuth && !isAuthenticated) {
        return next({ path: '/auth/login', query: { redirect: to.fullPath } })
      }

      // Гостевые маршруты
      if (to.meta.guest && isAuthenticated) {
        return next({ path: '/' })
      }

      // Проверка типа пользователя
      if (to.meta.userType && to.meta.userType !== userType) {
        return next({ path: '/' })
      }
    } catch (error) {
      console.warn('Auth check failed:', error)
      // В случае ошибки просто пропускаем
    }
  }

  next()
})

export default router
