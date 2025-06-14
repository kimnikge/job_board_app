<script setup>
import { ref } from 'vue'
import api from '../services/api'
import AvatarUpload from '@/modules/user/components/AvatarUpload.vue'

const tags = ref([])

const form = ref({
  user_id: 1,
  full_name: '',
  city: '',
  phone: '',
  avatar: '', // base64 или url
  languages: [''],
  hard_skills: [{ name: '', level: 1 }],
  education: [{ name: '', year: '', organization: '' }],
  avatar_url: '',
  work_experience: [{ place: '', position: '', period: '', description: '' }],
  social_links: {
    instagram: '',
    telegram: '',
    linkedin: '',
    portfolio: ''
  },
  tags: []
})

const addLanguage = () => form.value.languages.push('')
const removeLanguage = (i) => form.value.languages.splice(i, 1)

const addSkill = () => form.value.hard_skills.push({ name: '', level: 1 })
const removeSkill = (i) => form.value.hard_skills.splice(i, 1)

const addEducation = () => form.value.education.push({ name: '', year: '', organization: '' })
const removeEducation = (i) => form.value.education.splice(i, 1)

const addWorkExperience = () => form.value.work_experience.push({ place: '', position: '', period: '', description: '' })
const removeWorkExperience = (index) => form.value.work_experience.splice(index, 1)

const handleAvatar = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    form.value.avatar = ev.target.result
  }
  reader.readAsDataURL(file)
}

const submit = async () => {
  try {
    // Удаляем пустые поля
    form.value.languages = form.value.languages.filter(l => l)
    form.value.hard_skills = form.value.hard_skills.filter(s => s.name)
    form.value.education = form.value.education.filter(e => e.name && e.year && e.organization)
    form.value.work_experience = form.value.work_experience.filter(exp => exp.place && exp.position && exp.period)
    const socialLinks = {}
    for (const [key, value] of Object.entries(form.value.social_links)) {
      if (value) socialLinks[key] = value
    }
    form.value.social_links = socialLinks

    const response = await api.createResume({
      ...form.value,
      tags: tags.value
    })
    if (response.data) {
      form.value = {
        user_id: 1,
        full_name: '',
        city: '',
        phone: '',
        avatar: '',
        languages: [''],
        hard_skills: [{ name: '', level: 1 }],
        education: [{ name: '', year: '', organization: '' }],
        avatar_url: '',
        work_experience: [{ place: '', position: '', period: '', description: '' }],
        social_links: { instagram: '', telegram: '', linkedin: '', portfolio: '' },
        tags: []
      }
      alert('Резюме успешно создано!')
    }
  } catch (error) {
    console.error(error)
    alert('Ошибка при сохранении резюме')
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="resume-form">
    <h2>Создание резюме</h2>
    <div class="form-section">
      <h3>Основная информация</h3>
      <div class="form-group">
        <label>ФИО</label>
        <input v-model="form.full_name" required class="form-input" placeholder="Например: Иванов Иван Иванович">
      </div>
      <div class="form-group">
        <label>Город</label>
        <input v-model="form.city" required class="form-input" placeholder="Например: Москва">
      </div>
      <div class="form-group">
        <label>Телефон</label>
        <input v-model="form.phone" required class="form-input" placeholder="+7 XXX XXX-XX-XX" pattern="\+7 \d{3} \d{3}-\d{2}-\d{2}">
      </div>
      <div class="form-group">
        <label>Фото (загрузить или url)</label>
        <AvatarUpload @update:avatar="form.avatar = $event" />
      </div>
    </div>
    <div class="form-section">
      <h3>Языки</h3>
      <div v-for="(lang, i) in form.languages" :key="i" class="form-group lang-row">
        <input v-model="form.languages[i]" class="form-input" placeholder="Например: русский, английский B1">
        <button type="button" @click="removeLanguage(i)" v-if="form.languages.length > 1" class="remove-btn">✕</button>
      </div>
      <button type="button" @click="addLanguage" class="add-button">Добавить язык</button>
    </div>
    <div class="form-section">
      <h3>Профессиональные навыки</h3>
      <div v-for="(skill, i) in form.hard_skills" :key="i" class="form-group skill-row">
        <input v-model="skill.name" class="form-input" placeholder="Название навыка">
        <button type="button" @click="removeSkill(i)" v-if="form.hard_skills.length > 1" class="remove-btn">✕</button>
      </div>
      <button type="button" @click="addSkill" class="add-button">Добавить навык</button>
    </div>
    <div class="form-section">
      <h3>Образование</h3>
      <div v-for="(edu, i) in form.education" :key="i" class="edu-block">
        <div class="form-group">
          <label>Название</label>
          <input v-model="edu.name" class="form-input" placeholder="Название">
        </div>
        <div class="form-group">
          <label>Организация</label>
          <input v-model="edu.organization" class="form-input" placeholder="Организация">
        </div>
        <div class="form-group">
          <label>Год</label>
          <input v-model="edu.year" class="form-input" placeholder="Год">
        </div>
        <button type="button" @click="removeEducation(i)" v-if="form.education.length > 1" class="remove-btn">Удалить</button>
      </div>
      <button type="button" @click="addEducation" class="add-button">Добавить образование</button>
    </div>
    <div class="form-section">
      <h3>Опыт работы</h3>
      <div v-for="(exp, index) in form.work_experience" :key="index" class="work-experience-item">
        <div class="form-group">
          <label>Место работы</label>
          <input v-model="exp.place" class="form-input" placeholder="Например: Ресторан 'Алматы'">
        </div>
        <div class="form-group">
          <label>Должность</label>
          <input v-model="exp.position" class="form-input" placeholder="Например: Повар холодного цеха">
        </div>
        <div class="form-group">
          <label>Период</label>
          <input v-model="exp.period" class="form-input" placeholder="Например: 2015-2018">
        </div>
        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="exp.description" class="form-input" placeholder="Опишите ваши обязанности"></textarea>
        </div>
        <button type="button" @click="removeWorkExperience(index)" class="remove-btn" v-if="form.work_experience.length > 1">Удалить место работы</button>
      </div>
      <button type="button" @click="addWorkExperience" class="add-button">Добавить место работы</button>
    </div>
    <div class="form-section">
      <h3>Социальные сети</h3>
      <div class="form-group">
        <label>Instagram</label>
        <input v-model="form.social_links.instagram" class="form-input" placeholder="https://instagram.com/username">
      </div>
      <div class="form-group">
        <label>Telegram</label>
        <input v-model="form.social_links.telegram" class="form-input" placeholder="@username">
      </div>
      <div class="form-group">
        <label>LinkedIn</label>
        <input v-model="form.social_links.linkedin" class="form-input" placeholder="https://linkedin.com/in/username">
      </div>
      <div class="form-group">
        <label>Портфолио</label>
        <input v-model="form.social_links.portfolio" class="form-input" placeholder="https://portfolio.com">
      </div>
    </div>
    <div class="form-group">
      <label>Теги/категории (через запятую)</label>
      <input v-model="form.tagsString" @input="form.tags = form.tagsString.split(',').map(t => t.trim()).filter(Boolean)" placeholder="Например: повар, веган, бариста" />
    </div>
    <button type="submit" class="submit-button">Сохранить резюме</button>
  </form>
</template>

<style scoped>
.resume-form {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #fff;
}
@media (max-width: 600px) {
  .resume-form {
    max-width: 100vw;
    padding: 10px;
    border-radius: 0;
    box-shadow: none;
  }
}
.form-section {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}
.form-section:last-child {
  border-bottom: none;
}
.form-section h3 {
  margin-bottom: 16px;
  color: #2c3e50;
  font-size: 1.1rem;
}
.form-group {
  margin-bottom: 12px;
}
.form-group label {
  display: block;
  margin-bottom: 4px;
  color: #666;
  font-size: 0.97em;
}
.form-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  background: #fafbfc;
  transition: border 0.2s;
}
.form-input:focus {
  border: 1.5px solid #4CAF50;
  outline: none;
}
textarea.form-input {
  min-height: 80px;
  resize: vertical;
}
.add-button, .remove-btn {
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 5px;
  padding: 6px 12px;
  margin-top: 4px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.add-button:hover {
  background: #e0e0e0;
}
.remove-btn {
  background: #f44336;
  color: #fff;
  margin-left: 8px;
}
.remove-btn:hover {
  background: #d32f2f;
}
.lang-row, .skill-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.edu-block {
  background: #f8f8f8;
  border-radius: 7px;
  padding: 10px 10px 2px 10px;
  margin-bottom: 12px;
}
.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 17px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: 500;
  transition: background 0.2s;
}
.submit-button:hover {
  background-color: #45a049;
}
</style>