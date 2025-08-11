// 🎮 useGamification.js — R4 Composable для геймификации
import { ref } from 'vue'
import { gamificationService } from '../services/gamification.service.js'
import { badgesService } from '../services/badges.service.js'
import { employerService } from '../services/employer.service.js'
import { debugLog } from '../utils/featureFlags.js'

export function useGamification() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Пересчитать навыки пользователя с учетом бейджей
   */
  const recalcSkills = async (userId) => {
    try {
      loading.value = true
      error.value = null
      debugLog('gamification', 'Пересчитываем навыки для пользователя', userId)
      
      const { data, error: err } = await gamificationService.recalcSkills(userId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      debugLog('gamification', 'Навыки пересчитаны', data)
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка пересчета навыков:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  /**
   * Получить прогресс геймификации пользователя
   */
  const getProgress = async (userId) => {
    try {
      loading.value = true
      error.value = null
      debugLog('gamification', 'Загружаем прогресс геймификации', userId)
      
      const { data, error: err } = await gamificationService.getProgress(userId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка загрузки прогресса:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  /**
   * Получить статистику достижений пользователя
   */
  const getStatistics = async (userId) => {
    try {
      loading.value = true
      error.value = null
      debugLog('gamification', 'Загружаем статистику пользователя', userId)
      
      const { data, error: err } = await gamificationService.getStatistics(userId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  /**
   * Выдать бейдж пользователю
   */
  const awardBadge = async (badgeId, userId, reason, awarderId = null) => {
    try {
      loading.value = true
      error.value = null
      debugLog('gamification', 'Выдаем бейдж пользователю', { badgeId, userId, reason })
      
      const { data, error: err } = await badgesService.awardBadge(badgeId, userId, reason, awarderId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      debugLog('gamification', 'Бейдж выдан', data)
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка выдачи бейджа:', err)
      error.value = err
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  /**
   * Получить каталог доступных бейджей
   */
  const getBadgeCatalog = async (companyId = null) => {
    try {
      loading.value = true
      error.value = null
      debugLog('gamification', 'Загружаем каталог бейджей', companyId)
      
      const { data, error: err } = await badgesService.getCatalog(companyId)
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
   * Получить доступные для получения бейджи
   */
  const getAvailableBadges = async (userId, companyId = null) => {
    try {
      loading.value = true
      error.value = null
      debugLog('gamification', 'Загружаем доступные бейджи', { userId, companyId })
      
      const { data, error: err } = await gamificationService.getAvailableBadges(userId, companyId)
      if (err) {
        error.value = err
        return { data: null, error: err }
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Ошибка загрузки доступных бейджей:', err)
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
    recalcSkills,
    getProgress,
    getStatistics,
    awardBadge,
    getBadgeCatalog,
    getAvailableBadges
  }
}

console.log('✅ useGamification composable loaded')
