<template>
  <div class="companies-page">
    <!-- Используем существующую CompaniesPage -->
    <CompaniesPage />
  </div>
</template>

<script setup>
// ✨ ВРЕМЕННО: используем CompaniesPage из старого модуля
// В ЭТАПЕ 3 перенесем всю логику сюда напрямую
import CompaniesPage from '../modules/companies/components/CompaniesPage.vue'
</script>

<style scoped>
.companies-page {
  min-height: 100vh;
}
</style>
