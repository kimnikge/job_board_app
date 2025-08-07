<template>
  <div class="auth-layout">
    <AppHeader />
    <header class="auth-header">
      <slot name="header">
        <h1 class="logo">Job Board — Вход</h1>
      </slot>
    </header>
    <main class="auth-main">
      <router-view />
    </main>
    <footer class="auth-footer">
      <slot name="footer">
        <div>© {{ new Date().getFullYear() }} Job Board</div>
      </slot>
    </footer>
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
  background: #f3f4f6;
}
.auth-header {
  background: #2563eb;
  color: #fff;
  padding: 18px 32px;
}
.logo {
  font-size: 1.3rem;
  font-weight: bold;
}
.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}
.auth-footer {
  background: #1e293b;
  color: #fff;
  text-align: center;
  padding: 16px 0;
}
</style>
