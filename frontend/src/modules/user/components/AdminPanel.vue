<template>
  <div class="admin-panel">
    <h2 class="title">Админ-панель</h2>
    <div class="section">
      <h3>Пользователи</h3>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.email }} — {{ user.role }}
          <button v-if="user.is_active" class="btn-action" @click="banUser(user)">Забанить</button>
          <span v-else class="banned">(забанен)</span>
        </li>
      </ul>
    </div>
    <div class="section">
      <h3>Вакансии</h3>
      <ul>
        <li v-for="job in jobs" :key="job.id">
          {{ job.title }} <span v-if="!job.is_approved" class="pending">(на модерации)</span>
          <button v-if="!job.is_approved" class="btn-action" @click="approveJob(job)">Одобрить</button>
          <button class="btn-action btn-danger" @click="deleteJob(job)">Удалить</button>
        </li>
      </ul>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjgxOTksImV4cCI6MjA2NDU0NDE5OX0.b9_7QdZDvt36ohzVOl4OGGEt344c7x1AMOQzFTNOT8k'
const supabase = createClient(supabaseUrl, supabaseKey)

const users = ref([])
const jobs = ref([])
const error = ref('')

const fetchUsers = async () => {
  const { data, error: err } = await supabase.from('users').select('*')
  if (err) error.value = 'Ошибка загрузки пользователей: ' + err.message
  else users.value = data
}
const fetchJobs = async () => {
  const { data, error: err } = await supabase.from('job_postings').select('*')
  if (err) error.value = 'Ошибка загрузки вакансий: ' + err.message
  else jobs.value = data
}

const approveJob = async (job) => {
  const { error: err } = await supabase.from('job_postings').update({ is_approved: true }).eq('id', job.id)
  if (err) error.value = 'Ошибка одобрения: ' + err.message
  else fetchJobs()
}
const deleteJob = async (job) => {
  const { error: err } = await supabase.from('job_postings').delete().eq('id', job.id)
  if (err) error.value = 'Ошибка удаления: ' + err.message
  else fetchJobs()
}
const banUser = async (user) => {
  const { error: err } = await supabase.from('users').update({ is_active: false }).eq('id', user.id)
  if (err) error.value = 'Ошибка блокировки: ' + err.message
  else fetchUsers()
}

onMounted(() => {
  fetchUsers()
  fetchJobs()
})
</script>

<style scoped>
.admin-panel {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 16px;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 24px;
}
.section {
  margin-bottom: 32px;
}
.pending {
  color: #eab308;
  font-size: 0.95em;
  margin-left: 8px;
}
.banned {
  color: #dc2626;
  margin-left: 8px;
}
.btn-action {
  margin-left: 12px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 0.95em;
  transition: background 0.2s;
}
.btn-action:hover {
  background: #1d4ed8;
}
.btn-danger {
  background: #dc2626;
}
.btn-danger:hover {
  background: #991b1b;
}
.error {
  color: #dc2626;
  margin-top: 18px;
  text-align: center;
}
</style>
