import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../modules/auth/store/auth'

import MainLayout from '../layouts/MainLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

// Основные страницы - каждая страница в отдельном chunk
const HomePage = () => import(/* webpackChunkName: "page-home" */ '../modules/home/pages/HomePage.vue')

// Jobs модуль
const JobsPage = () => import(/* webpackChunkName: "page-jobs" */ '../modules/jobs/components/JobsPage.vue')
const JobDetails = () => import(/* webpackChunkName: "page-job-details" */ '../modules/jobs/components/JobDetails.vue')

// Resume модуль
const ResumesPage = () => import(/* webpackChunkName: "page-resumes" */ '../modules/resume/components/ResumesPage.vue')
const ResumeDetails = () => import(/* webpackChunkName: "page-resume-details" */ '../modules/resume/components/ResumeDetails.vue')

// Urgent модуль
const UrgentPage = () => import(/* webpackChunkName: "page-urgent" */ '../modules/urgent/components/UrgentPage.vue')

// Profile модуль
const ProfilePage = () => import(/* webpackChunkName: "page-profile" */ '../modules/profile/components/ProfilePage.vue')
const ProfileSetup = () => import(/* webpackChunkName: "page-profile-setup" */ '../modules/profile/components/ProfileSetup.vue')
const ProfileSubscriptions = () => import(/* webpackChunkName: "page-profile-subscriptions" */ '../modules/profile/components/ProfileSubscriptions.vue')
const ProfileApplications = () => import(/* webpackChunkName: "page-profile-applications" */ '../modules/profile/components/ProfileApplications.vue')
const SettingsPage = () => import(/* webpackChunkName: "page-settings" */ '@/modules/profile/components/SettingsPage.vue')

// Companies модуль
const CompaniesPage = () => import(/* webpackChunkName: "page-companies" */ '../modules/companies/components/CompaniesPage.vue')
const CompanyDetails = () => import(/* webpackChunkName: "page-company-details" */ '../modules/companies/components/CompanyDetails.vue')
const CompanySetup = () => import(/* webpackChunkName: "page-company-setup" */ '../modules/companies/components/CompanySetup.vue')
const CompanyDashboard = () => import(/* webpackChunkName: "page-company-dashboard" */ '../modules/companies/components/CompanyDashboard.vue')

// Auth модуль
const LoginForm = () => import(/* webpackChunkName: "page-login" */ '../modules/auth/components/LoginForm.vue')
const RegisterForm = () => import(/* webpackChunkName: "page-register" */ '../modules/auth/components/RegisterForm.vue')
const ResetPassword = () => import(/* webpackChunkName: "page-reset-password" */ '../modules/auth/components/ResetPassword.vue')

const routes = [
  // Главная страница без layout (у неё свой header)
  { 
    path: '/', 
    name: 'home',
    component: HomePage,
    meta: { title: 'Главная' }
  },
  
  // Остальные страницы с MainLayout
  {
    path: '/app',
    component: MainLayout,
    children: [
      { 
        path: 'jobs', 
        name: 'jobs',
        component: JobsPage,
        meta: { title: 'Объявления' }
      },
      { 
        path: 'jobs/:id', 
        name: 'job-details',
        component: JobDetails,
        meta: { title: 'Детали вакансии' }
      },
      { 
        path: 'resumes', 
        name: 'resumes',
        component: ResumesPage,
        meta: { title: 'Резюме' }
      },
      { 
        path: 'resumes/:id', 
        name: 'resume-details',
        component: ResumeDetails,
        meta: { title: 'Детали резюме' }
      },
      { 
        path: 'urgent', 
        name: 'urgent',
        component: UrgentPage,
        meta: { title: 'Срочные вакансии' }
      },
      // Маршруты профиля специалиста
      { 
        path: 'profile', 
        name: 'profile',
        component: ProfilePage,
        meta: { 
          title: 'Профиль',
          requiresAuth: true,
          userType: 'specialist'
        }
      },
      { 
        path: 'profile/setup', 
        name: 'profile-setup',
        component: ProfileSetup,
        meta: { 
          title: 'Настройка профиля',
          requiresAuth: true,
          userType: 'specialist'
        }
      },
      { 
        path: 'profile/subscriptions', 
        name: 'profile-subscriptions',
        component: ProfileSubscriptions,
        meta: { 
          title: 'Мои подписки',
          requiresAuth: true,
          userType: 'specialist'
        }
      },
      { 
        path: 'profile/applications', 
        name: 'profile-applications',
        component: ProfileApplications,
        meta: { 
          title: 'Мои отклики',
          requiresAuth: true,
          userType: 'specialist'
        }
      },
      { 
        path: 'profile/settings', 
        name: 'profile-settings',
        component: SettingsPage,
        meta: { 
          title: 'Настройки',
          requiresAuth: true,
          userType: 'specialist'
        }
      },
      // Маршруты компаний
      { 
        path: 'companies', 
        name: 'companies',
        component: CompaniesPage,
        meta: { title: 'Компании' }
      },
      { 
        path: 'companies/:id', 
        name: 'company-details',
        component: CompanyDetails,
        meta: { title: 'О компании' }
      },
      { 
        path: 'company/setup', 
        name: 'company-setup',
        component: CompanySetup,
        meta: { 
          title: 'Настройка профиля компании',
          requiresAuth: true,
          userType: 'company'
        }
      },
      { 
        path: 'company/dashboard', 
        name: 'company-dashboard',
        component: CompanyDashboard,
        meta: { 
          title: 'Панель управления',
          requiresAuth: true,
          userType: 'company'
        }
      }
    ]
  },
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

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | Job App` : 'Job App'

  const authStore = useAuthStore()
  await authStore.fetchUser()
  const isAuthenticated = !!authStore.user
  const userType = authStore.user?.user_metadata?.user_type

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.guest && isAuthenticated) {
    return next({ name: 'home' })
  }

  if (to.meta.userType && to.meta.userType !== userType) {
    return next({ name: 'home' })
  }

  next()
})

export default router
