<template>
  <nav class="bottom-navigation" v-if="isMobile">
    <router-link 
      v-for="item in navItems" 
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isCurrentRoute(item.path) }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
      <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Простое определение мобильного устройства
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

// Статические данные для badge (пока без store)
const urgentCount = ref(3)

const navItems = computed(() => [
  { 
    path: '/', 
    label: 'Главная', 
    icon: '🏠' 
  },
  { 
    path: '/urgent', 
    label: 'Срочно', 
    icon: '🚨',
    badge: urgentCount.value > 0 ? urgentCount.value : null
  },
  { 
    path: '/companies', 
    label: 'Заведения', 
    icon: '🏪' 
  },
  { 
    path: '/profile', 
    label: 'Профиль', 
    icon: '👤' 
  }
])

const isCurrentRoute = (path) => {
  if (path === '/') {
    return route.path === '/' || route.path === '/jobs'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
/* PWA-стиль нижней навигации согласно плану разработки */
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-top: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 12px 20px; /* Учитываем safe area для iPhone */
  z-index: 1000;
  box-shadow: var(--shadow-lg);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--color-text-secondary);
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
  min-width: 60px;
}

.nav-item:hover {
  color: var(--color-text-primary);
  background: var(--glass-bg-hover);
}

.nav-item.active {
  color: var(--color-primary);
  background: rgba(102, 126, 234, 0.1);
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
  transition: transform 0.3s ease;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  line-height: 1;
}

.nav-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  background: var(--color-danger);
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

/* Адаптация для safe areas (iPhone) */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-navigation {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
}

/* Анимация badge */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Скрываем на desktop */
@media (min-width: 769px) {
  .bottom-navigation {
    display: none;
  }
}
</style>
