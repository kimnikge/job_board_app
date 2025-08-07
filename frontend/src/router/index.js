import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
const Resume = () => import('@/views/Resume.vue')

// Страницы компаний
const Companies = () => import('@/views/Companies.vue')
const CompanyDetail = () => import('@/views/CompanyDetail.vue')
const Dashboard = () => import('@/views/Dashboard.vue')

// Layouts
const MainLayout = () => import('@/layouts/MainLayout.vue')
const AuthLayout = () => import('@/layouts/AuthLayout.vue')

// Auth (временно из старых модулей)
const LoginForm = () => import('../modules/auth/components/LoginForm.vue')
const RegisterForm = () => import('../modules/auth/components/RegisterForm.vue')
const ResetPassword = () => import('../modules/auth/components/ResetPassword.vue')

// ✨ ПРОСТЫЕ МАРШРУТЫ - СОГЛАСНО ПЛАНУ
const routes = [
  // Главная страница (список всех вакансий)
  { 
    path: '/', 
    component: Jobs,
    meta: { title: 'Вакансии общепита - Астана' }
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
      userType: 'employer'
    }
  },
  
  // Детали вакансии
  { 
    path: '/jobs/:id', 
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
  
  // Резюме пользователя
  { 
    path: '/resume', 
    component: Resume,
    meta: { 
      title: 'Мое резюме',
      requiresAuth: true,
      userType: 'candidate'
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
      userType: 'employer'
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

  // Проверка авторизации (упрощенная)
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

  next()
})

export default router
