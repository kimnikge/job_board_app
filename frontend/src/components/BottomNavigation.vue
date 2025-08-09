<template>
  <nav class="bottom-navigation" v-if="isMobile">
    <router-link 
      v-for="item in navigationItems" 
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isCurrentRoute(item.path) }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
      <span 
        v-if="item.badge" 
        class="nav-badge"
      >
        {{ item.badge }}
      </span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Реактивное определение мобильного устройства
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

const updateWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})

const isMobile = computed(() => windowWidth.value <= 768)

const navigationItems = [
  { path: '/', label: 'Главная', icon: '🏠' },
  { path: '/urgent', label: 'Срочно', icon: '🚨', badge: 3 },
  { path: '/companies', label: 'Заведения', icon: '🏪' },
  { path: '/profile', label: 'Профиль', icon: '👤' }
]

const isCurrentRoute = (path) => {
  if (path === '/') {
    return route.path === '/' || route.path === '/jobs'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
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
  padding: 8px 12px 20px;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
}

/* iOS Safari bottom padding */
.bottom-navigation {
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  position: relative;
  min-width: 60px;
  min-height: 48px; /* Touch target */
}

.nav-item:hover,
.nav-item.active {
  color: var(--color-text-primary);
  background: var(--glass-bg-hover);
  transform: translateY(-2px);
}

.nav-item.active {
  background: var(--glass-bg-hover);
  border: 1px solid var(--color-primary);
}

.nav-icon {
  font-size: 1.2rem;
  margin-bottom: 4px;
  display: block;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.nav-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  background: var(--color-danger);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Анимация для активного состояния */
.nav-item.active .nav-icon {
  animation: bounce 0.3s ease;
}

@keyframes bounce {
  0%, 20%, 60%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  80% {
    transform: translateY(-2px);
  }
}

/* Скрыть на desktop */
@media (min-width: 769px) {
  .bottom-navigation {
    display: none;
  }
}

/* Адаптивность для очень маленьких экранов */
@media (max-width: 480px) {
  .bottom-navigation {
    padding: 6px 8px 18px;
  }
  
  .nav-item {
    padding: 6px 8px;
    min-width: 50px;
  }
  
  .nav-icon {
    font-size: 1.1rem;
  }
  
  .nav-label {
    font-size: 0.7rem;
  }
}

/* Для landscape ориентации на мобильных */
@media (max-height: 500px) and (orientation: landscape) {
  .bottom-navigation {
    padding: 4px 12px 8px;
  }
  
  .nav-label {
    display: none;
  }
  
  .nav-item {
    padding: 8px;
  }
}
</style>
