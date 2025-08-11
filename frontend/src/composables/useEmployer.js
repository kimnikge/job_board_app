// 🏢 useEmployer.js — R4 Composable для работодателей
import { ref } from 'vue'
import { employerService } from '../services/employer.service.js'
import { badgesService } from '../services/badges.service.js'
import { debugLog } from '../utils/featureFlags.js'

export function useEmployer() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Создать корпоративный бейдж
   */
  const createCompanyBadge = async (companyId, badgeData) => {
    try {
      loading.value = true
      error.value = null
      debugLog('employer', 'Создаем корпоративный бейдж', { companyId, badgeData })
      
      const { data, error: err } = await employerService.createCompanyBadge(companyId, badgeData)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      debugLog('employer', 'Корпоративный бейдж создан', data)
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка создания корпоративного бейджа:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  /**
   * Получить список бейджей компании
   */
  const getCompanyBadges = async (companyId) => {
    try {
      loading.value = true
      error.value = null
      debugLog('employer', 'Загружаем бейджи компании', companyId)
      
      const { data, error: err } = await employerService.getCompanyBadges(companyId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка загрузки бейджей компании:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  /**
   * Получить список сотрудников компании
   */
  const getEmployees = async (companyId) => {
    try {
      loading.value = true
      error.value = null
      debugLog('employer', 'Загружаем сотрудников компании', companyId)
      
      const { data, error: err } = await employerService.getEmployees(companyId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка загрузки сотрудников:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  /**
   * Выдать бейдж сотруднику вручную
   */
  const awardBadgeToEmployee = async (badgeId, userId, reason, awarderId) => {
    try {
      loading.value = true
      error.value = null
      debugLog('employer', 'Выдаем бейдж сотруднику', { badgeId, userId, reason })
      
      const { data, error: err } = await employerService.awardBadgeToEmployee(badgeId, userId, reason, awarderId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      debugLog('employer', 'Бейдж выдан сотруднику', data)
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка выдачи бейджа сотруднику:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  /**
   * Получить каталог бейджей для работодателя
   */
  const getBadgeCatalog = async (companyId) => {
    try {
      loading.value = true
      error.value = null
      debugLog('employer', 'Загружаем каталог бейджей для работодателя', companyId)
      
      const { data, error: err } = await employerService.getBadgeCatalog(companyId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка загрузки каталога бейджей:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  /**
   * Получить статистику компании по бейджам
   */
  const getCompanyStatistics = async (companyId) => {
    try {
      loading.value = true
      error.value = null
      debugLog('employer', 'Загружаем статистику компании', companyId)
      
      const { data, error: err } = await employerService.getCompanyStatistics(companyId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка загрузки статистики компании:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  /**
   * Удалить корпоративный бейдж
   */
  const deleteCompanyBadge = async (badgeId, companyId) => {
    try {
      loading.value = true
      error.value = null
      debugLog('employer', 'Удаляем корпоративный бейдж', { badgeId, companyId })
      
      const { data, error: err } = await badgesService.deleteCompanyBadge(badgeId, companyId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      debugLog('employer', 'Корпоративный бейдж удален', data)
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка удаления корпоративного бейджа:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  return {
    // Состояние
    loading,
    error,
    
    // Методы
    createCompanyBadge,
    getCompanyBadges,
    getEmployees,
    awardBadgeToEmployee,
    getBadgeCatalog,
    getCompanyStatistics,
    deleteCompanyBadge
  }
}

console.log('✅ useEmployer composable loaded')
