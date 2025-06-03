<script setup>
import { ref, onMounted, computed } from 'vue'
import ApplicationForm from '../../otclik/components/ApplicationForm.vue'

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
    // Здесь должен быть реальный API-запрос к backend, например через jobApi
    // Пока что демо-данные:
    jobs.value = [
      { id: 1, title: 'Повар', company: 'Ресторан', location: 'Алматы', salary: '100 000₸', is_active: true, is_approved: true },
      { id: 2, title: 'Бариста', company: 'Кофейня', location: 'Астана', salary: '80 000₸', is_active: true, is_approved: true },
      { id: 3, title: 'Официант', company: 'Кафе', location: 'Шымкент', salary: '70 000₸', is_active: true, is_approved: true },
      { id: 4, title: 'Менеджер', company: 'Отель', location: 'Алматы', salary: '150 000₸', is_active: true, is_approved: true },
      { id: 5, title: 'Уборщица', company: 'Офис', location: 'Астана', salary: '60 000₸', is_active: true, is_approved: true },
      { id: 6, title: 'Повар', company: 'Столовая', location: 'Алматы', salary: '90 000₸', is_active: true, is_approved: true }
    ]
    total.value = jobs.value.length
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
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="jobs.length === 0">Вакансий нет</div>
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
