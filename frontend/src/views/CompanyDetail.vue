<template>
  <div class="company-detail-page">
    <!-- Используем существующую CompanyDetails -->
    <CompanyDetails />
  </div>
</template>

<script setup>
// ✨ ВРЕМЕННО: используем CompanyDetails из старого модуля
// В ЭТАПЕ 3 перенесем всю логику сюда напрямую  
import CompanyDetails from '../modules/companies/components/CompanyDetails.vue'
</script>

<style scoped>
.company-detail-page {
  min-height: 100vh;
}
</style>
