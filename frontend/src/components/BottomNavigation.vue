<template>
  <nav class="bottom-navigation">
    <router-link 
      v-for="item in navigationItems" 
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ 'nav-item-active': isCurrentRoute(item.path) }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-text">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script>
import { useRoute } from 'vue-router'

export default {
  name: 'BottomNavigation',
  setup() {
    const route = useRoute()
    
    const navigationItems = [
      { path: '/', icon: '🏠', label: 'Главная' },
      { path: '/urgent', icon: '🔥', label: 'Срочные' },
      { path: '/companies', icon: '🏪', label: 'Заведения' },
      { path: '/profile', icon: '👤', label: 'Кабинет' }
    ]
    
    const isCurrentRoute = (path) => {
      if (path === '/') {
        return route.path === '/'
      }
      return route.path.startsWith(path)
    }
    
    return {
      navigationItems,
      isCurrentRoute
    }
  }
}
</script>

<style scoped>
/* === BOTTOM NAVIGATION === */
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--max-width);
  height: var(--nav-height);
  padding: 12px 0;
  background: var(--bg-header);
  border-top: 1px solid var(--border-color);
  z-index: 1000;
  
  /* Флекс-контейнер */
  display: flex;
  justify-content: space-around;
  align-items: center;
}

/* === ЭЛЕМЕНТ НАВИГАЦИИ === */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--gap-small) var(--gap-medium);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: var(--radius-small);
  min-height: var(--touch-min);
  min-width: var(--touch-min);
  justify-content: center;
}

/* === ИКОНКИ И ТЕКСТ === */
.nav-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.nav-text {
  font-size: var(--font-nav);
  font-weight: var(--weight-normal);
  transition: color 0.3s ease;
}

/* === АКТИВНОЕ СОСТОЯНИЕ === */
.nav-item-active {
  color: var(--accent-primary);
  transform: scale(1.1);
}

.nav-item-active .nav-icon {
  transform: scale(1.1);
}

/* === HOVER ЭФФЕКТЫ === */
.nav-item:hover {
  color: var(--accent-primary);
  background: var(--bg-transparent);
}

/* === АНИМАЦИИ === */
@media (prefers-reduced-motion: no-preference) {
  .nav-item:active {
    transform: scale(0.95);
  }
  
  .nav-item-active:active {
    transform: scale(1.05);
  }
}

/* === АДАПТИВНОСТЬ === */
@media (max-width: 350px) {
  .nav-text {
    font-size: 0.6rem;
  }
  
  .nav-icon {
    font-size: 1.1rem;
  }
}
</style>