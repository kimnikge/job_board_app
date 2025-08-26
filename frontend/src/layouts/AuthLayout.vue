<template>
  <div class="auth-layout">
    <AppHeader />
    <main class="auth-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
// Можно добавить provide/inject для глобальных сервисов
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  padding-top: 60px; /* Отступ для фиксированного заголовка */
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  padding-bottom: 80px; /* Отступ для нижней навигации */
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .auth-main {
    padding: 16px;
    align-items: flex-start;
    padding-top: 40px;
  }
}
</style>
