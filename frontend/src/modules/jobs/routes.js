import JobsPage from './components/JobsPage.vue'
import JobDetails from './components/JobDetails.vue'

export default [
  {
    path: '/jobs',
    name: 'jobs',
    component: JobsPage,
    meta: {
      title: 'Вакансии'
    }
  },
  {
    path: '/jobs/:id',
    name: 'job-details',
    component: JobDetails,
    meta: {
      title: 'Детали вакансии'
    }
  }
] 