<template>
  <div class="urgent-jobs-page">
    <!-- Используем существующую страницу срочных вакансий -->
    <UrgentPage />
  </div>
</template>

<script setup>
// ✨ ВРЕМЕННО: используем UrgentPage из старого модуля
// В ЭТАПЕ 3 перенесем всю логику сюда напрямую
import UrgentPage from '../modules/urgent/components/UrgentPage.vue'
</script>

<style scoped>
.urgent-jobs-page {
  min-height: 100vh;
}
</style>
