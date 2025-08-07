/**
 * 🛣️ РОУТЕР
 */

import { createRouter, createWebHistory } from 'vue-router'

const HomePage = () => import('../../modules/home/pages/HomePage.vue')
const JobsPage = () => import('../../pages/JobsPage.vue')  
const UrgentJobsPage = () => import('../../features/urgent-jobs/pages/UrgentJobsPage.vue')
const CreateUrgentJob = () => import('../../features/urgent-jobs/pages/CreateUrgentJob.vue')
const UrgentJobDetails = () => import('../../features/urgent-jobs/pages/UrgentJobDetails.vue')
const NotFoundPage = () => import('../../pages/NotFoundPage.vue')

const routes = [
  { 
    path: '/', 
    name: 'home',
    component: HomePage,
    meta: { 
      title: 'Главная - Job Board Астана',
      requiresAuth: false
    }
  },
  {
    path: '/jobs',
    name: 'jobs',
    component: JobsPage,
    meta: { 
      title: 'Все вакансии',
      requiresAuth: false 
    }
  },
  {
    path: '/urgent',
    name: 'urgent-jobs',
    component: UrgentJobsPage,
    meta: { 
      title: 'Срочные вакансии',
      requiresAuth: false
    }
  },
  {
    path: '/urgent/create',
    name: 'create-urgent-job',
    component: CreateUrgentJob,
    meta: { 
      title: 'Разместить срочную вакансию',
      requiresAuth: true
    }
  },
  {
    path: '/urgent/:id',
    name: 'urgent-job-details',
    component: UrgentJobDetails,
    meta: { 
      title: 'Срочная вакансия',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
    meta: { title: 'Страница не найдена' }
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    console.log('🔒 Auth check for:', to.path)
  }
  
  next()
})

router.afterEach((to) => {
  const title = to.meta?.title
  if (title) {
    document.title = title
  }
})

export default router

console.log('��️ Router initialized')
