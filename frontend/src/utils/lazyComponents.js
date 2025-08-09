/**
 * Ленивая загрузка компонентов профиля (R2)
 * Снижаем initial bundle size через dynamic imports
 */

import { defineAsyncComponent } from 'vue'

// Skeleton компонент для загрузки
const SkeletonLoader = {
  template: `
    <div class="skeleton-loader">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `,
  styles: `
    .skeleton-loader {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      animation: pulse 1.5s ease-in-out infinite alternate;
    }
    
    .skeleton-header {
      height: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      margin-bottom: 12px;
      width: 200px;
    }
    
    .skeleton-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .skeleton-line {
      height: 12px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
    }
    
    .skeleton-line.short {
      width: 60%;
    }
    
    @keyframes pulse {
      0% { opacity: 0.6; }
      100% { opacity: 1; }
    }
  `
}

// Ленивые компоненты с задержкой для демонстрации
export const LazySkillBar = defineAsyncComponent({
  loader: () => import('@/components/profile/SkillBar.vue'),
  loadingComponent: SkeletonLoader,
  delay: 100, // Показать skeleton через 100ms
  timeout: 10000 // Timeout после 10s
})

export const LazyBadgeCarousel = defineAsyncComponent({
  loader: () => import('@/components/profile/BadgeCarousel.vue'),
  loadingComponent: SkeletonLoader,
  delay: 150,
  timeout: 10000
})

export const LazyExperienceTimeline = defineAsyncComponent({
  loader: () => import('@/components/profile/ExperienceTimeline.vue'),
  loadingComponent: SkeletonLoader,
  delay: 200,
  timeout: 10000
})

export const LazyVideoProfile = defineAsyncComponent({
  loader: () => import('@/components/profile/VideoProfile.vue'),
  loadingComponent: SkeletonLoader,
  delay: 100,
  timeout: 10000
})

// Утилита для проверки ленивой загрузки
export function shouldUseLazyLoading() {
  // В production всегда используем ленивую загрузку
  // В dev можно отключить через флаг
  return import.meta.env.PROD || import.meta.env.VITE_LAZY_PROFILE === 'true'
}
