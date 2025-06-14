import routes from './routes'
import { useJobsStore } from './store/jobs'

export default {
  name: 'jobs',
  routes,
  store: {
    jobs: useJobsStore
  }
} 