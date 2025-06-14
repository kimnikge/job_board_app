<script setup>
import { ref, onMounted, computed } from 'vue'
import otclikApi from '../services/otclikApi.js'

const applications = ref([])
const loading = ref(true)
const error = ref('')

const page = ref(1)
const pageSize = 5
const total = ref(0)

const pagedApplications = computed(() => {
  const start = (page.value - 1) * pageSize
  return applications.value.slice(start, start + pageSize)
})

function nextPage() {
  if (page.value < Math.ceil(applications.value.length / pageSize)) page.value++
}
function prevPage() {
  if (page.value > 1) page.value--
}

onMounted(async () => {
  try {
    const res = await otclikApi.getMyApplications()
    applications.value = res.data
    total.value = res.data.length
  } catch (e) {
    error.value = 'Ошибка загрузки откликов'
  } finally {
    loading.value = false
  }
})
</script>
<template>
  <div class="my-applications">
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="applications.length === 0">У вас нет откликов</div>
    <div v-else>
      <div v-for="app in pagedApplications" :key="app.id" class="application-card">
        <div class="app-header">
          <div class="job-title">{{ app.job_posting_title }}</div>
          <div class="status" :class="app.status">{{ app.status }}</div>
        </div>
        <div class="app-message">{{ app.message }}</div>
        <div class="app-date">{{ new Date(app.created_at).toLocaleString() }}</div>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="page === 1">Назад</button>
        <span>Страница {{ page }} из {{ Math.ceil(applications.length / pageSize) }}</span>
        <button @click="nextPage" :disabled="page === Math.ceil(applications.length / pageSize)">Вперёд</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.my-applications {
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
</style>
