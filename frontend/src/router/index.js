import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../modules/auth/store/auth'

import MainLayout from '../layouts/MainLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

// Основные страницы
const HomePage = () => import('../modules/home/pages/HomePage.vue')
const JobsPage = () => import('../modules/jobs/components/JobsPage.vue')
const ResumesPage = () => import('../modules/resume/components/ResumesPage.vue')
const UrgentPage = () => import('../modules/urgent/components/UrgentPage.vue')

// Компоненты профиля
const ProfilePage = () => import('../modules/profile/components/ProfilePage.vue')
const ProfileSetup = () => import('../modules/profile/components/ProfileSetup.vue')
const ProfileSubscriptions = () => import('../modules/profile/components/ProfileSubscriptions.vue')
const ProfileApplications = () => import('../modules/profile/components/ProfileApplications.vue')
const SettingsPage = () => import('@/modules/profile/components/SettingsPage.vue')

// Компоненты компаний
const CompaniesPage = () => import('../modules/companies/components/CompaniesPage.vue')
const CompanyDetails = () => import('../modules/companies/components/CompanyDetails.vue')
const CompanySetup = () => import('../modules/companies/components/CompanySetup.vue')
const CompanyDashboard = () => import('../modules/companies/components/CompanyDashboard.vue')

// Дополнительные компоненты
const JobDetails = () => import('../modules/jobs/components/JobDetails.vue')
const ResumeDetails = () => import('../modules/resume/components/ResumeDetails.vue')
import LoginForm from '../modules/auth/components/LoginForm.vue'
const RegisterForm = () => import('../modules/auth/components/RegisterForm.vue')
const ResetPassword = () => import('../modules/auth/components/ResetPassword.vue')

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { 
        path: '', 
        name: 'home',
        component: HomePage,
        meta: { title: 'Главная' }
      },
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
