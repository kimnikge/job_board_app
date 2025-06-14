<template>
  <div class="company-setup">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Настройка профиля компании</h1>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Основная информация -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Основная информация</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Название компании *
                </label>
                <input 
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Отрасль *
                </label>
                <select 
                  v-model="form.industry"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Выберите отрасль</option>
                  <option 
                    v-for="industry in industries" 
                    :key="industry"
                    :value="industry"
                  >
                    {{ industry }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Описание компании *
                </label>
                <textarea 
                  v-model="form.description"
                  rows="4"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Количество сотрудников *
                </label>
                <select 
                  v-model="form.employeesCount"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Выберите количество</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Контактная информация -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Контактная информация</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Город *
                </label>
                <input 
                  v-model="form.location"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Веб-сайт
                </label>
                <input 
                  v-model="form.website"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Email *
                </label>
                <input 
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Телефон
                </label>
                <input 
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
            </div>
          </div>

          <!-- Логотип компании -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Логотип компании</h2>

            <div class="space-y-4">
              <div class="flex items-center space-x-4">
                <img 
                  :src="logoPreview || form.logo || '/default-company.png'" 
                  alt="Логотип компании"
                  class="w-24 h-24 rounded-full object-cover"
                >
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Загрузить новый логотип
                  </label>
                  <input 
                    type="file"
                    accept="image/*"
                    @change="handleLogoChange"
                    class="w-full"
                  >
                  <p class="text-sm text-gray-500 mt-1">
                    Рекомендуемый размер: 200x200 пикселей
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Социальные сети -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Социальные сети</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  LinkedIn
                </label>
                <input 
                  v-model="form.social.linkedin"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Facebook
                </label>
                <input 
                  v-model="form.social.facebook"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Twitter
                </label>
                <input 
                  v-model="form.social.twitter"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Instagram
                </label>
                <input 
                  v-model="form.social.instagram"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <button 
              type="button"
              @click="router.back()"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button 
              type="submit"
              class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              :disabled="loading"
            >
              {{ loading ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCompaniesStore } from '../store/companies'
import { useAuthStore } from '@/modules/auth/store/auth'

const router = useRouter()
const companiesStore = useCompaniesStore()
const authStore = useAuthStore()

const loading = ref(false)
const logoPreview = ref(null)

const industries = [
  'IT и разработка',
  'Маркетинг',
  'Продажи',
  'Финансы',
  'HR',
  'Дизайн',
  'Медиа',
  'Образование',
  'Медицина',
  'Производство',
  'Строительство',
  'Торговля',
  'Транспорт',
  'Другое'
]

const form = ref({
  name: '',
  industry: '',
  description: '',
  employeesCount: '',
  location: '',
  website: '',
  email: '',
  phone: '',
  logo: '',
  social: {
    linkedin: '',
    facebook: '',
    twitter: '',
    instagram: ''
  }
})

onMounted(async () => {
  try {
    const company = await companiesStore.fetchCompanyProfile()
    if (company) {
      form.value = {
        ...company,
        social: company.social || {
          linkedin: '',
          facebook: '',
          twitter: '',
          instagram: ''
        }
      }
    }
  } catch (err) {
    console.error('Ошибка при загрузке профиля компании:', err)
  }
})

function handleLogoChange(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

async function handleSubmit() {
  try {
    loading.value = true
    await companiesStore.updateCompanyProfile(form.value)
    router.push(`/companies/${authStore.userId}`)
  } catch (err) {
    console.error('Ошибка при сохранении профиля компании:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.company-setup {
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
textarea:focus {
  outline: none;
  border-color: #4CAF50;
}

input.error,
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