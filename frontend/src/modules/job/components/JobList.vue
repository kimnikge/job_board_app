<script setup>
import { ref, onMounted, computed } from 'vue'
import ApplicationForm from '../../otclik/components/ApplicationForm.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'
import jobApi from '../services/jobApi'

const jobs = ref([])
const loading = ref(true)
const error = ref('')

// Пагинация
const page = ref(1)
const pageSize = 5
const total = ref(0)

const pagedJobs = computed(() => {
  const start = (page.value - 1) * pageSize
  return jobs.value.slice(start, start + pageSize)
})

function nextPage() {
  if (page.value < Math.ceil(jobs.value.length / pageSize)) page.value++
}
function prevPage() {
  if (page.value > 1) page.value--
}

onMounted(async () => {
  try {
    const response = await jobApi.getJobs()
    jobs.value = response.data
    total.value = response.data.length
  } catch (e) {
    error.value = 'Ошибка загрузки вакансий'
  } finally {
    loading.value = false
  }
})

// Для примера, резюме пользователя (в реальном проекте — подтягивать из профиля)
const myResumeId = 1
</script>
<template>
  <div class="job-list">
    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="!jobs.length" message="Нет вакансий" />
    <div v-else>
      <div v-for="job in pagedJobs" :key="job.id" class="job-card">
        <div class="job-header">
          <div class="job-title">{{ job.title }}</div>
          <div class="job-company">{{ job.company }}</div>
        </div>
        <div class="job-meta">
          <span>{{ job.location }}</span> · <span>{{ job.salary }}</span>
        </div>
        <ApplicationForm :jobPostingId="job.id" :resumeId="myResumeId" />
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="page === 1">Назад</button>
        <span>Страница {{ page }} из {{ Math.ceil(jobs.length / pageSize) }}</span>
        <button @click="nextPage" :disabled="page === Math.ceil(jobs.length / pageSize)">Вперёд</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.job-list {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 0;
}
.job-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,136,204,0.07);
  margin-bottom: 18px;
  padding: 18px;
}
.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.job-title {
  font-weight: 700;
  color: #0088cc;
  font-size: 1.1rem;
}
.job-company {
  color: #00bfae;
  font-weight: 500;
}
.job-meta {
  color: #888;
  font-size: 14px;
  margin-bottom: 10px;
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
