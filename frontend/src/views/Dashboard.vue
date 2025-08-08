<template>
  <div class="dashboard-page">
    <!-- Используем DashboardPage из views -->
    <DashboardPage />
  </div>
</template>

<script setup>
// ✨ ИСПРАВЛЕНО: используем DashboardPage из views
import DashboardPage from './DashboardPage.vue'
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
}
</style>
