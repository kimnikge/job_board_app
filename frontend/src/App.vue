<template>
  <div id="app">
    <!-- Header для всех страниц -->
    <AppHeader />
    
    <!-- Основной контент -->
    <main class="page-content">
      <router-view />
    </main>
    
    <!-- Нижняя навигация для всех страниц -->
    <BottomNavigation />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    BottomNavigation
  }
}
</script>

<style>
/* === Глобальные стили приложения === */
#app {
  position: relative;
  background-color: var(--bg-page);
  min-height: 100vh;
}

/* === Отступы под навигацию === */
.page-content {
  margin-top: var(--header-height);
  margin-bottom: var(--nav-height);
  min-height: calc(100vh - var(--header-height) - var(--nav-height));
}
</style>