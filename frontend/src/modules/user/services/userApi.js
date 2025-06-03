import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
  }
})

export default {
  async getJobSeekerProfile() {
    return api.get('/job-seeker/profile')
  },
  async getEmployerProfile() {
    return api.get('/employer/profile')
  },
  // ...добавить другие методы по мере необходимости
}
