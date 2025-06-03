<script setup>
import { ref, onMounted } from 'vue'

// Пример данных — позже будет загружаться из Supabase
const jobs = ref([])

onMounted(() => {
  // TODO: Заменить мок на реальный fetch из Supabase
  jobs.value = [
    { id: 1, title: 'Бармен', is_active: true },
    { id: 2, title: 'Официант', is_active: false }
  ]
})

function toggleStatus(job) {
  job.is_active = !job.is_active
  console.log(`Изменён статус вакансии "${job.title}":`, job.is_active)
}
</script>

<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Модерация вакансий</h2>
    <div v-if="jobs.length === 0" class="text-gray-500">Нет вакансий для модерации</div>
    <ul v-else class="space-y-2">
      <li
        v-for="job in jobs"
        :key="job.id"
        class="p-4 border rounded flex justify-between items-center"
      >
        <div>
          <div class="font-semibold">{{ job.title }}</div>
          <div class="text-sm text-gray-600">Статус: {{ job.is_active ? 'Активна' : 'Отключена' }}</div>
        </div>
        <button @click="toggleStatus(job)" class="btn-primary">
          {{ job.is_active ? 'Деактивировать' : 'Активировать' }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700;
}
</style>
