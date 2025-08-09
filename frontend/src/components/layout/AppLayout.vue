<template>
  <div class="app-layout">
    <AppHeader />
    
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  position: relative;
  padding-top: 80px; /* Отступ под header */
  min-height: calc(100vh - 80px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    padding-top: 70px; /* Меньший отступ под header на мобильных */
  }
}

@media (max-width: 480px) {
  .main-content {
    padding-top: 60px; /* Еще меньший отступ */
  }
}
</style>
