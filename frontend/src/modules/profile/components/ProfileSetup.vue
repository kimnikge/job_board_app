<template>
  <div class="profile-setup">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <form v-else @submit.prevent="handleSubmit" class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">
          {{ profile ? 'Редактировать профиль' : 'Создать профиль' }}
        </h1>

        <!-- Фото профиля -->
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Фото профиля
          </label>
          <div class="flex items-center space-x-4">
            <img 
              :src="formData.photo || profile?.photo || '/default-avatar.png'" 
              class="w-24 h-24 rounded-full object-cover"
            >
            <input 
              type="file" 
              accept="image/*"
              @change="handlePhotoChange"
              class="hidden"
              ref="photoInput"
            >
            <button 
              type="button"
              @click="$refs.photoInput.click()"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Изменить фото
            </button>
          </div>
        </div>

        <!-- Основная информация -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              ФИО
            </label>
            <input 
              v-model="formData.fullName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Должность
            </label>
            <input 
              v-model="formData.position"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Город
            </label>
            <input 
              v-model="formData.location"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Телефон
            </label>
            <input 
              v-model="formData.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
          </div>
        </div>

        <!-- О себе -->
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            О себе
          </label>
          <textarea 
            v-model="formData.about"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          ></textarea>
        </div>

        <!-- Навыки -->
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Навыки
          </label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span 
              v-for="(skill, index) in formData.skills" 
              :key="index"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
            >
              {{ skill }}
              <button 
                type="button"
                @click="removeSkill(index)"
                class="ml-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          </div>
          <div class="flex">
            <input 
              v-model="newSkill"
              type="text"
              placeholder="Добавить навык"
              class="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              @keydown.enter.prevent="addSkill"
            >
            <button 
              type="button"
              @click="addSkill"
              class="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark"
            >
              Добавить
            </button>
          </div>
        </div>

        <!-- Опыт работы -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Опыт работы</h2>
            <button 
              type="button"
              @click="addExperience"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Добавить опыт
            </button>
          </div>

          <div class="space-y-4">
            <div 
              v-for="(exp, index) in formData.experience" 
              :key="index"
              class="border border-gray-200 rounded-md p-4"
            >
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Место работы {{ index + 1 }}</h3>
                <button 
                  type="button"
                  @click="removeExperience(index)"
                  class="text-red-500 hover:text-red-700"
                >
                  Удалить
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Должность
                  </label>
                  <input 
                    v-model="exp.position"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Компания
                  </label>
                  <input 
                    v-model="exp.company"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Дата начала
                  </label>
                  <input 
                    v-model="exp.startDate"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Дата окончания
                  </label>
                  <input 
                    v-model="exp.endDate"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                </div>

                <div class="md:col-span-2">
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Описание
                  </label>
                  <textarea 
                    v-model="exp.description"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Образование -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Образование</h2>
            <button 
              type="button"
              @click="addEducation"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Добавить образование
            </button>
          </div>

          <div class="space-y-4">
            <div 
              v-for="(edu, index) in formData.education" 
              :key="index"
              class="border border-gray-200 rounded-md p-4"
            >
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Образование {{ index + 1 }}</h3>
                <button 
                  type="button"
                  @click="removeEducation(index)"
                  class="text-red-500 hover:text-red-700"
                >
                  Удалить
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Учебное заведение
                  </label>
                  <input 
                    v-model="edu.institution"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Степень
                  </label>
                  <input 
                    v-model="edu.degree"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Дата начала
                  </label>
                  <input 
                    v-model="edu.startDate"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Дата окончания
                  </label>
                  <input 
                    v-model="edu.endDate"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Сертификаты -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Сертификаты</h2>
            <button 
              type="button"
              @click="addCertificate"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Добавить сертификат
            </button>
          </div>

          <div class="space-y-4">
            <div 
              v-for="(cert, index) in formData.certificates" 
              :key="index"
              class="border border-gray-200 rounded-md p-4"
            >
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Сертификат {{ index + 1 }}</h3>
                <button 
                  type="button"
                  @click="removeCertificate(index)"
                  class="text-red-500 hover:text-red-700"
                >
                  Удалить
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Название
                  </label>
                  <input 
                    v-model="cert.name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Организация
                  </label>
                  <input 
                    v-model="cert.issuer"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Дата получения
                  </label>
                  <input 
                    v-model="cert.date"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="flex justify-end space-x-4">
          <router-link 
            to="/profile"
            class="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </router-link>
          <button 
            type="submit"
            class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            :disabled="loading"
          >
            {{ profile ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '../store/profile'

const router = useRouter()
const profileStore = useProfileStore()
const { profile, loading, error } = profileStore

const photoInput = ref(null)
const newSkill = ref('')

const formData = ref({
  photo: null,
  fullName: '',
  position: '',
  location: '',
  phone: '',
  about: '',
  skills: [],
  experience: [],
  education: [],
  certificates: []
})

// Загрузка данных профиля при монтировании
onMounted(async () => {
  await profileStore.fetchProfile()
  if (profile.value) {
    formData.value = { ...profile.value }
  }
})

// Обработка изменения фото
function handlePhotoChange(event) {
  const file = event.target.files[0]
  if (file) {
    formData.value.photo = file
  }
}

// Управление навыками
function addSkill() {
  if (newSkill.value.trim()) {
    formData.value.skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

function removeSkill(index) {
  formData.value.skills.splice(index, 1)
}

// Управление опытом работы
function addExperience() {
  formData.value.experience.push({
    position: '',
    company: '',
    startDate: '',
    endDate: '',
    description: ''
  })
}

function removeExperience(index) {
  formData.value.experience.splice(index, 1)
}

// Управление образованием
function addEducation() {
  formData.value.education.push({
    institution: '',
    degree: '',
    startDate: '',
    endDate: ''
  })
}

function removeEducation(index) {
  formData.value.education.splice(index, 1)
}

// Управление сертификатами
function addCertificate() {
  formData.value.certificates.push({
    name: '',
    issuer: '',
    date: ''
  })
}

function removeCertificate(index) {
  formData.value.certificates.splice(index, 1)
}

// Отправка формы
async function handleSubmit() {
  try {
    if (profile.value) {
      await profileStore.updateProfile(formData.value)
    } else {
      await profileStore.createProfile(formData.value)
    }
    router.push('/profile')
  } catch (err) {
    console.error('Ошибка при сохранении профиля:', err)
  }
}
</script>

<style scoped>
.profile-setup {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #333;
}

input[type="text"],
input[type="tel"],
select,
textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type="file"] {
  padding: 0.5rem;
  border: 1px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4CAF50;
}

input.error,
select.error,
textarea.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 0.875rem;
}

.form-actions {
  margin-top: 1rem;
}

button {
  width: 100%;
  padding: 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #45a049;
}

.alert.error {
  margin-top: 1rem;
  padding: 1rem;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #f44336;
  text-align: center;
}
</style> 