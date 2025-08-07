/**
 * 🎨 БАЗОВЫЕ UI КОМПОНЕНТЫ
 * 
 * Экспорт всех базовых компонентов пользовательского интерфейса
 */

// Базовые компоненты
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseCard } from './BaseCard.vue'
export { default as BaseModal } from './BaseModal.vue'
export { default as LoadingSpinner } from './LoadingSpinner.vue'

// Экспорт как группа для удобства импорта
export default {
  BaseButton: () => import('./BaseButton.vue'),
  BaseCard: () => import('./BaseCard.vue'),
  BaseModal: () => import('./BaseModal.vue'),
  LoadingSpinner: () => import('./LoadingSpinner.vue')
}

console.log('🎨 Base UI components exported!')
