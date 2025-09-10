<template>
  <nav class="bottom-nav">
    <RouterLink to="/" class="nav-item" :class="{ active: currentRoute === '/' }">
      <div class="nav-icon">🏠</div>
      <span class="nav-label">Главная</span>
    </RouterLink>
    <RouterLink to="/jobs" class="nav-item" :class="{ active: currentRoute === '/jobs' }">
      <div class="nav-icon">💼</div>
      <span class="nav-label">Вакансии</span>
    </RouterLink>
    <RouterLink to="/urgent" class="nav-item" :class="{ active: currentRoute === '/urgent' }">
      <div class="nav-icon">⚡</div>
      <span class="nav-label">Срочные</span>
    </RouterLink>
    <RouterLink to="/companies" class="nav-item" :class="{ active: currentRoute === '/companies' }">
      <div class="nav-icon">🏢</div>
      <span class="nav-label">Места</span>
    </RouterLink>
    <RouterLink to="/profile" class="nav-item" :class="{ active: currentRoute === '/profile' }">
      <div class="nav-icon">👤</div>
      <span class="nav-label">Профиль</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRoute = computed(() => route.path)
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  z-index: 1000;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #718096;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 12px;
  min-width: 60px;
}

.nav-item:hover,
.nav-item.active {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
}
</style>
