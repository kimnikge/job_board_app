// ТЕСТОВЫЕ ДАННЫЕ ДЛЯ ОБЩЕПИТА АСТАНЫ
// Автоматически сгенерировано для локального тестирования

import urgentJobsData from './urgentJobs.json'
import userProfilesData from './userProfiles.json'

export {
  urgentJobsData,
  userProfilesData
}

export default {
  urgentJobs: urgentJobsData,
  userProfiles: userProfilesData
}

// Функции для работы с данными
export const getUrgentJobs = () => urgentJobsData.filter(job => job.status === 'open')
export const getJobById = (id) => urgentJobsData.find(job => job.id === id) || getDemoJobById(id)
export const getUrgentJobById = (id) => urgentJobsData.find(job => job.id === id)

// Функции для работы с профилями
export const getUserProfile = (userId) => userProfilesData.find(user => user.user_id === userId)
export const getCurrentUserProfile = () => userProfilesData.find(user => user.user_id === 'user-1') // Демо пользователь
export const getUsersByType = (type) => userProfilesData.filter(user => user.user_type === type)
export const getEmployerProfile = (userId) => userProfilesData.find(user => user.user_type === 'employer' && user.user_id === userId)

// Fallback демо данные для ID из роутера
const getDemoJobById = (id) => {
  const demoJobs = {
    '1': urgentJobsData[0],
    '2': urgentJobsData[1], 
    '3': urgentJobsData[2]
  }
  return demoJobs[id] || urgentJobsData[0]
}

console.log('📊 Загружены тестовые данные:', {
  urgentJobs: urgentJobsData.length,
  userProfiles: userProfilesData.length,
  candidates: userProfilesData.filter(u => u.user_type === 'candidate').length,
  employers: userProfilesData.filter(u => u.user_type === 'employer').length
})
