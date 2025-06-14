<script setup>
import { ref } from 'vue'

const title = ref('')
const description = ref('')
const salary_range = ref('')
const location = ref('')
const employment_type = ref('')
const jobType = ref('regular') // 'regular' или 'urgent'

// Новые поля для срочных объявлений
const deadline = ref('')
const companyLogo = ref('')
const tags = ref('')
const benefits = ref('')

const submitJob = async () => {
  // Определяем, является ли объявление срочным
  const is_urgent = jobType.value === 'urgent'

  // Формируем объект данных для отправки на бэкенд
  const jobData = {
    title: title.value,
    description: description.value,
    salary_range: salary_range.value,
    location: location.value,
    employment_type: employment_type.value,
    is_active: true,  // По умолчанию активно
    is_approved: false, // По умолчанию не одобрено
    is_urgent: is_urgent,
  }

  // Добавляем специфичные поля для срочных объявлений, если это срочное объявление
  if (is_urgent) {
    jobData.deadline = deadline.value
    // Преобразуем строки тегов и преимуществ в массивы, разделяя по запятой
    jobData.tags = tags.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    jobData.benefits = benefits.value.split(',').map(benefit => benefit.trim()).filter(benefit => benefit.length > 0)
    // companyLogo пока не отправляем, так как в Go модели его нет. Если он нужен, его нужно добавить в модель Go.
    // jobData.company_logo = companyLogo.value // Это поле было удалено из миграции БД.
  }

  try {
    const token = localStorage.getItem('token') // Предполагаем, что токен хранится в localStorage
    if (!token) {
      alert('Вы не авторизованы. Пожалуйста, войдите в систему.')
      return
    }

    const response = await fetch('http://localhost:3000/jobs', { // URL вашего бэкенда
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jobData)
    })

    const result = await response.json()

    if (response.ok) {
      alert('Вакансия успешно создана!')
      // Очистка формы
      title.value = ''
      description.value = ''
      salary_range.value = ''
      location.value = ''
      employment_type.value = ''
      jobType.value = 'regular'
      deadline.value = ''
      companyLogo.value = ''
      tags.value = ''
      benefits.value = ''
    } else {
      alert('Ошибка при создании вакансии: ' + (result.error || response.statusText))
    }
  } catch (error) {
    alert('Произошла ошибка сети: ' + error.message)
  }
}
</script>

<template>
  <form @submit.prevent="submitJob" class="space-y-4">
    <div class="flex items-center space-x-4 mb-4">
      <label class="inline-flex items-center">
        <input 
          type="radio" 
          v-model="jobType" 
          value="regular" 
          class="form-radio text-primary"
        />
        <span class="ml-2 text-gray-700">Обычное объявление</span>
      </label>
      <label class="inline-flex items-center">
        <input 
          type="radio" 
          v-model="jobType" 
          value="urgent" 
          class="form-radio text-primary"
        />
        <span class="ml-2 text-gray-700">Срочное объявление</span>
      </label>
    </div>

    <div>
      <label class="block text-sm font-medium">Название вакансии</label>
      <input v-model="title" type="text" class="input" required />
    </div>

    <div>
      <label class="block text-sm font-medium">Описание</label>
      <textarea v-model="description" class="textarea" required></textarea>
    </div>

    <div v-if="jobType === 'regular'">
      <div>
        <label class="block text-sm font-medium">Зарплата</label>
        <input v-model="salary_range" type="text" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium">Местоположение</label>
        <input v-model="location" type="text" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium">Тип занятости</label>
        <input v-model="employment_type" type="text" class="input" />
      </div>
    </div>

    <div v-else-if="jobType === 'urgent'">
      <div>
        <label class="block text-sm font-medium">Зарплата за смену</label>
        <input v-model="salary_range" type="number" class="input" placeholder="Например, 12000" />
      </div>
      <div>
        <label class="block text-sm font-medium">Крайний срок (например, Сегодня/Завтра)</label>
        <input v-model="deadline" type="text" class="input" placeholder="Например, Сегодня или Завтра" />
      </div>
      <div>
        <label class="block text-sm font-medium">Логотип компании (эмодзи)</label>
        <input v-model="companyLogo" type="text" class="input" placeholder="Например, 🏪" />
      </div>
      <div>
        <label class="block text-sm font-medium">Теги (через запятую)</label>
        <input v-model="tags" type="text" class="input" placeholder="Например, Повар, Алматы" />
      </div>
      <div>
        <label class="block text-sm font-medium">Преимущества (через запятую)</label>
        <input v-model="benefits" type="text" class="input" placeholder="Например, Питание, Развозка" />
      </div>
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