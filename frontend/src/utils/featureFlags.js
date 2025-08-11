/**
 * Feature Flags для R2 - Interactive Profile UI
 * Управление включением/выключением новых функций
 */

export const FEATURE_FLAGS = {
  // Видео профиль - включен в dev для тестирования
  videoProfile: import.meta.env.DEV || false,
  
  // Интерактивные компоненты профиля
  skillBars: true,
  badgeCarousel: true, 
  experienceTimeline: true,
  // R5: Employer dashboard
  employerDashboard: true,
  
  // Ленивая загрузка секций профиля
  lazyProfileSections: true,
  
  // TypeScript поддержка (постепенное внедрение)
  typescript: false,
  
  // Демо режим (использовать mock данные)
  useMockData: true,
  
  // Отладочная информация
  debugMode: import.meta.env.DEV || false
}

/**
 * Проверка активности фичи
 */
export function isFeatureEnabled(featureName) {
  return FEATURE_FLAGS[featureName] === true
}

/**
 * Условный рендеринг компонентов по фича-флагу
 */
export function withFeatureFlag(featureName, component, fallback = null) {
  return isFeatureEnabled(featureName) ? component : fallback
}

/**
 * Логирование для отладки фич
 */
export function debugLog(featureName, message, data = null) {
  if (isFeatureEnabled('debugMode')) {
    console.log(`[${featureName}] ${message}`, data)
  }
}
