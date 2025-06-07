import { createRouter, createWebHistory } from 'vue-router'
import { can } from '../shared/rbac'
import store from '../store'

import MainLayout from '../layouts/MainLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

// Основные страницы
const HomePage = () => import('../modules/home/pages/HomePage.vue')
const JobsPage = () => import('../modules/job/components/JobsPage.vue')
const ResumesPage = () => import('../modules/resume/components/ResumesPage.vue')
const UrgentPage = () => import('../modules/urgent/components/UrgentPage.vue')
const ProfilePage = () => import('../modules/profile/components/ProfilePage.vue')
const SettingsPage = () => import('../modules/profile/components/SettingsPage.vue')

// Дополнительные компоненты
const JobDetails = () => import('../modules/job/components/JobDetails.vue')
const ResumeDetails = () => import('../modules/resume/components/ResumeDetails.vue')
import LoginForm from '../modules/auth/components/LoginForm.vue'
const RegisterForm = () => import('../modules/auth/components/RegisterForm.vue')

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
      { 
        path: 'profile', 
        name: 'profile',
        component: ProfilePage,
        meta: { 
          title: 'Профиль',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsPage,
        meta: {
          title: 'Настройки',
          requiresAuth: true
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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  // Установка заголовка страницы
  document.title = to.meta.title ? `${to.meta.title} | Job App` : 'Job App'

  // Проверка авторизации
  const isAuthenticated = store.getters['auth/isAuthenticated']

  // Если маршрут требует авторизации
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ 
      name: 'login', 
      query: { redirect: to.fullPath }
    })
  }

  // Если маршрут только для гостей (неавторизованных)
  if (to.meta.guest && isAuthenticated) {
    return next({ name: 'home' })
  }

  next()
})

export default router
