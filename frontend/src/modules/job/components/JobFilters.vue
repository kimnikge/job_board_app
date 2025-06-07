<template>
  <div class="job-filters">
    <input v-model="search" placeholder="Поиск по названию" />
    <select v-model="status">
      <option value="">Все статусы</option>
      <option value="active">Активные</option>
      <option value="closed">Закрытые</option>
    </select>
    <select v-model="location">
      <option value="">Все города</option>
      <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
    </select>
    <button @click="applyFilters">Применить</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const search = ref('')
const status = ref('')
const location = ref('')
const cities = ['Алматы', 'Астана', 'Шымкент']

const emit = defineEmits(['filter'])
function applyFilters() {
  emit('filter', { search: search.value, status: status.value, location: location.value })
}
</script>

<style scoped>
.job-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
input, select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d0eaf6;
}
button {
  background: #0088cc;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-weight: 500;
  cursor: pointer;
}
</style>
