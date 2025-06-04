<template>
  <div class="app-container">
    <header class="header">
      <div class="logo">Job Board</div>
      <div class="header-actions">
        <button class="header-btn" @click="toggleTheme">
          <i :class="themeIcon"></i>
        </button>
        <button class="header-btn"><i class="fas fa-bell"></i></button>
        <button class="header-btn"><i class="fas fa-user"></i></button>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BottomNav from '../components/BottomNav.vue'
const theme = ref('light')
const themeIcon = computed(() => theme.value === 'dark' ? 'fas fa-sun' : 'fas fa-moon')
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved) {
    theme.value = saved
    document.documentElement.setAttribute('data-theme', saved)
  }
})
</script>

<style scoped>
.header {
  background: var(--color-header);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(102, 126, 234, 0.3);
}
.logo {
  color: white;
  font-size: 20px;
  font-weight: bold;
}
.header-actions {
  display: flex;
  gap: 15px;
}
.header-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}
.header-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}
.main-content {
  flex: 1;
  padding: 32px 16px 80px 16px;
  background: var(--color-bg);
}
</style>
