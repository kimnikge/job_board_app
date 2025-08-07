<template>
  <div class="dashboard-page">
    <!-- Используем существующую CompanyDashboard -->
    <CompanyDashboard />
  </div>
</template>

<script setup>
// ✨ ВРЕМЕННО: используем CompanyDashboard из старого модуля
// В ЭТАПЕ 3 перенесем всю логику сюда напрямую
import CompanyDashboard from '../modules/companies/components/CompanyDashboard.vue'
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
}
</style>
