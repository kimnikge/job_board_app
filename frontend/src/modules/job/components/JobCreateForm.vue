<script setup>
import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjgxOTksImV4cCI6MjA2NDU0NDE5OX0.b9_7QdZDvt36ohzVOl4OGGEt344c7x1AMOQzFTNOT8k'
const supabase = createClient(supabaseUrl, supabaseKey)

const title = ref('')
const description = ref('')
const salary = ref('')

const submitJob = async () => {
  const { error } = await supabase.from('job_postings').insert([
    {
      title: title.value,
      description: description.value,
      salary_range: salary.value
    }
  ])
  if (error) {
    alert('Ошибка при создании вакансии: ' + error.message)
  } else {
    alert('Вакансия успешно создана!')
    title.value = ''
    description.value = ''
    salary.value = ''
  }
}
</script>

<template>
  <form @submit.prevent="submitJob" class="space-y-4">
    <div>
      <label class="block text-sm font-medium">Название вакансии</label>
      <input v-model="title" type="text" class="input" required />
    </div>

    <div>
      <label class="block text-sm font-medium">Описание</label>
      <textarea v-model="description" class="textarea" required></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium">Зарплата</label>
      <input v-model="salary" type="text" class="input" />
    </div>

    <button type="submit" class="btn-primary">Создать вакансию</button>
  </form>
</template>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px 12px;
  box-sizing: border-box;
}
.textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 100px;
  box-sizing: border-box;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #1d4ed8;
}
</style>