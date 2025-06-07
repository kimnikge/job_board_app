<script setup>
import { ref, onMounted, computed } from 'vue'
import otclikApi from '../services/otclikApi.js'

const applications = ref([])
const loading = ref(true)
const error = ref('')

// Фильтры
const statusFilter = ref('')
const cityFilter = ref('')
const professionFilter = ref('')

const statuses = [
  { value: '', label: 'Все статусы' },
  { value: 'pending', label: 'Ожидание' },
  { value: 'viewed', label: 'Просмотрено' },
  { value: 'invited', label: 'Приглашён' },
  { value: 'rejected', label: 'Отклонён' }
]
const cities = computed(() => Array.from(new Set(applications.value.map(a => a.job_posting_location))).filter(Boolean))
const professions = computed(() => Array.from(new Set(applications.value.map(a => a.job_posting_profession))).filter(Boolean))

const filteredApplications = computed(() => {
  return applications.value.filter(app =>
    (!statusFilter.value || app.status === statusFilter.value) &&
    (!cityFilter.value || app.job_posting_location === cityFilter.value) &&
    (!professionFilter.value || app.job_posting_profession === professionFilter.value)
  )
})

// Пагинация
const page = ref(1)
const pageSize = 5
const total = ref(0)
const pagedApplications = computed(() => {
  const arr = filteredApplications.value
  const start = (page.value - 1) * pageSize
  return arr.slice(start, start + pageSize)
})
function nextPage() {
  if (page.value < Math.ceil(filteredApplications.value.length / pageSize)) page.value++
}
function prevPage() {
  if (page.value > 1) page.value--
}

onMounted(async () => {
  try {
    const res = await otclikApi.getEmployerApplications()
    applications.value = res.data
    total.value = res.data.length
  } catch (e) {
    error.value = 'Ошибка загрузки откликов'
  } finally {
    loading.value = false
  }
})

const updateStatus = async (id, status) => {
  try {
    await otclikApi.updateApplicationStatus(id, status)
    // Обновить статус локально
    const app = applications.value.find(a => a.id === id)
    if (app) app.status = status
  } catch (e) {
    alert('Ошибка изменения статуса')
  }
}
</script>
<template>
  <div class="employer-applications">
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="applications.length === 0">Нет откликов на ваши вакансии</div>
    <div v-else>
      <div class="filters">
        <select v-model="statusFilter">
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <select v-model="cityFilter">
          <option value="">Все города</option>
          <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="professionFilter">
          <option value="">Все профессии</option>
          <option v-for="p in professions" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div v-for="app in pagedApplications" :key="app.id" class="application-card">
        <div class="app-header">
          <div class="job-title">{{ app.job_posting_title }}</div>
          <div class="status" :class="app.status">{{ app.status }}</div>
        </div>
        <div class="app-message">{{ app.message }}</div>
        <div class="app-date">{{ new Date(app.created_at).toLocaleString() }}</div>
        <div class="app-meta">
          <span v-if="app.job_posting_location">Город: {{ app.job_posting_location }}</span>
          <span v-if="app.job_posting_profession"> · Профессия: {{ app.job_posting_profession }}</span>
        </div>
        <div class="actions">
          <button @click="updateStatus(app.id, 'viewed')" :disabled="app.status === 'viewed'">Просмотрено</button>
          <button @click="updateStatus(app.id, 'invited')" :disabled="app.status === 'invited'">Пригласить</button>
          <button @click="updateStatus(app.id, 'rejected')" :disabled="app.status === 'rejected'">Отклонить</button>
        </div>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="page === 1">Назад</button>
        <span>Страница {{ page }} из {{ Math.ceil(filteredApplications.length / pageSize) }}</span>
        <button @click="nextPage" :disabled="page === Math.ceil(filteredApplications.length / pageSize)">Вперёд</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.employer-applications {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px 0;
}
.application-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,136,204,0.07);
  margin-bottom: 16px;
  padding: 16px;
}
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.job-title {
  font-weight: 600;
  color: #0088cc;
}
.status {
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 8px;
  background: #eaf6fb;
  color: #0088cc;
  font-weight: 500;
}
.status.approved {
  background: #e0fbe0;
  color: #4CAF50;
}
.status.rejected {
  background: #ffe0e0;
  color: #f44336;
}
.status.invited {
  background: #e0f7fa;
  color: #00bfae;
}
.app-message {
  margin-bottom: 6px;
  color: #444;
}
.app-date {
  color: #888;
  font-size: 13px;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.actions button {
  background: #f5f5f5;
  border: none;
  border-radius: 7px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.actions button:hover {
  background: #e0f7fa;
}
.actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
}
.pagination button {
  background: #0088cc;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.pagination button:disabled {
  background: #eaf6fb;
  color: #aaa;
  cursor: not-allowed;
}
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.filters select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d0eaf6;
}
.app-meta {
  color: #888;
  font-size: 13px;
  margin-bottom: 6px;
}
</style>
