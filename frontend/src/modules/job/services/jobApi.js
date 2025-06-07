import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
  }
})

export default {
  // Получить все объявления
  async getJobs() {
    return api.get('/jobs')
  },

  // Получить объявления текущего работодателя
  async getUserJobs() {
    return api.get('/users/me/jobs')
  },

  // Создать новое объявление
  async createJob(data) {
    return api.post('/jobs', data)
  },

  // Переключить статус активности объявления
  async toggleJobStatus(id, isActive) {
    return api.put(`/jobs/${id}/status`, { is_active: isActive })
  },

  // Удалить объявление
  async deleteJob(id) {
    return api.delete(`/jobs/${id}`)
  }
}
