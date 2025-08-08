<template>
  <div class="companies-page">
    <div class="page-container">
      <header class="page-header">
        <h1>🏢 Заведения общепита</h1>
        <p>Найдите лучшие рестораны и кафе Астаны</p>
      </header>
      
      <div class="companies-grid">
        <div v-for="company in demoCompanies" :key="company.id" class="company-card">
          <div class="company-info">
            <h3>{{ company.name }}</h3>
            <p>{{ company.type }}</p>
            <span class="company-jobs">{{ company.jobs }} вакансий</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ✨ ПРОСТАЯ РЕАЛИЗАЦИЯ - СОГЛАСНО ПЛАНУ УПРОЩЕНИЯ
import { ref } from 'vue'

const demoCompanies = ref([
  { id: 1, name: 'Ресторан "Астана"', type: 'Ресторан', jobs: 5 },
  { id: 2, name: 'Кафе "Барбекю"', type: 'Кафе', jobs: 3 },
  { id: 3, name: 'Пиццерия "Италия"', type: 'Пиццерия', jobs: 7 },
  { id: 4, name: 'Фаст-фуд "Burger King"', type: 'Фаст-фуд', jobs: 12 }
])
</script>

<style scoped>
.companies-page {
  min-height: 100vh;
}
</style>
