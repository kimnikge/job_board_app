<template>
  <nav class="bottom-nav">
    <router-link v-for="item in items" :key="item.route" :to="item.to" class="nav-item" :class="{active: isActive(item)}">
      <i :class="item.icon"></i>
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const items = [
  { label: 'Главная', icon: 'fas fa-home', to: '/', route: 'home' },
  { label: 'Объявления', icon: 'fas fa-briefcase', to: '/jobs', route: 'jobs' },
  { label: 'Резюме', icon: 'fas fa-user-friends', to: '/resumes', route: 'resumes' },
  { label: 'Срочно', icon: 'fas fa-bolt', to: '/urgent', route: 'urgent' },
  { label: 'Профиль', icon: 'fas fa-user', to: '/profile', route: 'profile' }
]
function isActive(item) {
  return route.name === item.route
}
</script>

<style scoped>
.bottom-nav {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  background: var(--color-card);
  box-shadow: 0 -2px 16px rgba(102, 126, 234, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  width: 100%;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #888;
  font-size: 12px;
  text-decoration: none;
  padding: 6px 0 0 0;
  min-width: 60px;
  transition: color 0.2s;
}
.nav-item i {
  font-size: 20px;
  margin-bottom: 2px;
}
.nav-item.active {
  color: var(--color-primary);
  font-weight: 700;
}
</style> 