import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
  }
})

export default {
  // Создать отклик
  async createApplication(data) {
    return api.post('/applications', data)
  },
  // Получить свои отклики (соискатель)
  async getMyApplications() {
    return api.get('/applications/me')
  },
  // Получить отклики на мои вакансии (работодатель)
  async getEmployerApplications() {
    return api.get('/employer/applications')
  },
  // Изменить статус отклика (работодатель)
  async updateApplicationStatus(id, status, comment) {
    return api.put(`/employer/applications/${id}`, { status, comment })
  },
  // Получить историю статусов отклика
  async getApplicationHistory(id) {
    return api.get(`/applications/${id}/history`)
  }
}
