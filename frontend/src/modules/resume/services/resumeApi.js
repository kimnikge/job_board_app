import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
  }
})

export default {
  // Получить все резюме
  async getResumes() {
    return api.get('/resumes')
  },

  // Получить резюме текущего пользователя
  async getUserResumes() {
    return api.get('/users/me/resumes')
  },

  // Создать новое резюме
  async createResume(data) {
    return api.post('/resumes', data)
  },

  // Переключить статус доступности резюме
  async toggleResumeStatus(id, isAvailable) {
    return api.put(`/resumes/${id}/status`, { is_available: isAvailable })
  },

  // Удалить резюме
  async deleteResume(id) {
    return api.delete(`/resumes/${id}`)
  }
} 