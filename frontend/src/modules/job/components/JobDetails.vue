<template>
  <div v-if="job" class="job-details">
    <h2 class="title">{{ job.title }}</h2>
    <div class="meta">
      <span>Компания: {{ job.company || '—' }}</span>
      <span>Город: {{ job.location || '—' }}</span>
      <span>Тип занятости: {{ job.employment_type || '—' }}</span>
      <span>Зарплата: {{ job.salary_range || '—' }}</span>
    </div>
    <div class="desc">{{ job.description }}</div>
    <div v-if="job.categories && job.categories.length" class="categories">
      <span v-for="cat in job.categories" :key="cat" class="category">#{{ cat }}</span>
    </div>
    <div class="status" v-if="!job.is_approved">На модерации</div>
  </div>
  <div v-else class="empty">Вакансия не найдена</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjgxOTksImV4cCI6MjA2NDU0NDE5OX0.b9_7QdZDvt36ohzVOl4OGGEt344c7x1AMOQzFTNOT8k'
const supabase = createClient(supabaseUrl, supabaseKey)

const route = useRoute()
const job = ref(null)

onMounted(async () => {
  const { data, error } = await supabase.from('job_postings').select('*').eq('id', route.params.id).single()
  if (!error) job.value = data
})
</script>

<style scoped>
.job-details {
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 32px 24px;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 18px;
}
.meta {
  color: #555;
  font-size: 1rem;
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}
.desc {
  margin-bottom: 18px;
  font-size: 1.1rem;
}
.categories {
  margin-bottom: 18px;
}
.category {
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 12px;
  padding: 4px 12px;
  margin-right: 8px;
  font-size: 0.95em;
}
.status {
  color: #eab308;
  font-weight: bold;
}
.empty {
  text-align: center;
  color: #aaa;
  margin: 40px 0 20px 0;
  font-size: 1.1rem;
}
</style>
