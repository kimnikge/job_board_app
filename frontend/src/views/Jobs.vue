<template>
  <div class="jobs-page">
    <!-- Используем существующую HomePage как основу для списка всех вакансий -->
    <HomePage />
  </div>
</template>

<script setup>
// ✨ ВРЕМЕННО: используем HomePage как основу
// В ЭТАПЕ 3 перенесем всю логику сюда напрямую
import HomePage from '../modules/home/pages/HomePage.vue'
</script>

<style scoped>
.jobs-page {
  min-height: 100vh;
}
</style>
