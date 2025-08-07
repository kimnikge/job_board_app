<template>
  <div class="jobs-page">
    <!-- ✨ ОБНОВЛЕНО ДЛЯ ЭТАПА 3 - ИСПОЛЬЗУЕТ НОВЫЕ STORES -->
    <JobsMainPage />
  </div>
</template>

<script setup>
// Используем новую главную страницу с объединенными stores
import JobsMainPage from './JobsMainPage.vue'
</script>

<style scoped>
.jobs-page {
  min-height: 100vh;
}
</style>
