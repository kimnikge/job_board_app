<template>
  <div class="company-register">
    <div class="register-header">
      <h1>🏢 Регистрация компании</h1>
      <p>Создайте профиль вашей компании для поиска сотрудников</p>
    </div>

    <form @submit.prevent="registerCompany" class="register-form">
      <!-- Основная информация -->
      <div class="form-section">
        <h2>📋 Основная информация</h2>
        
        <div class="form-group">
          <label for="companyName">Название компании*</label>
          <input 
            id="companyName"
            v-model="form.name" 
            type="text" 
            placeholder="ООО 'Моя компания'"
            class="form-input"
            required
          />
          <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
        </div>

        <div class="form-group">
          <label for="companyLegalName">Юридическое название</label>
          <input 
            id="companyLegalName"
            v-model="form.legalName" 
            type="text" 
            placeholder="Общество с ограниченной ответственностью 'Моя компания'"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="industry">Сфера деятельности*</label>
          <select 
            id="industry" 
            v-model="form.industry" 
            class="form-select" 
            required
          >
            <option value="">Выберите сферу деятельности</option>
            <option value="restaurant">Ресторанный бизнес</option>
            <option value="cafe">Кафе и быстрое питание</option>
            <option value="hotel">Гостиничный бизнес</option>
            <option value="catering">Кейтеринг и выездное обслуживание</option>
            <option value="delivery">Доставка еды</option>
            <option value="retail">Розничная торговля</option>
            <option value="event">Организация мероприятий</option>
            <option value="other">Другое</option>
          </select>
          <div v-if="errors.industry" class="error-message">{{ errors.industry }}</div>
        </div>

        <div class="form-group">
          <label for="description">Описание компании</label>
          <textarea 
            id="description"
            v-model="form.description" 
            placeholder="Расскажите о вашей компании, ценностях, особенностях работы..."
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>
      </div>

      <!-- Контактная информация -->
      <div class="form-section">
        <h2>📞 Контактная информация</h2>
        
        <div class="form-group">
          <label for="city">Город*</label>
          <CitySelector 
            v-model="form.cityId" 
            placeholder="Выберите город"
            class="city-selector"
            required
          />
          <div v-if="errors.cityId" class="error-message">{{ errors.cityId }}</div>
        </div>

        <div class="form-group">
          <label for="address">Адрес</label>
          <input 
            id="address"
            v-model="form.address" 
            type="text" 
            placeholder="ул. Примерная, 123"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="phone">Телефон</label>
          <input 
            id="phone"
            v-model="form.phone" 
            type="tel" 
            placeholder="+7 (777) 123-45-67"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">Email для связи</label>
          <input 
            id="email"
            v-model="form.email" 
            type="email" 
            placeholder="info@mycompany.kz"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="website">Веб-сайт</label>
          <input 
            id="website"
            v-model="form.website" 
            type="url" 
            placeholder="https://mycompany.kz"
            class="form-input"
          />
        </div>
      </div>

      <!-- Дополнительная информация -->
      <div class="form-section">
        <h2>📊 Дополнительная информация</h2>
        
        <div class="form-group">
          <label for="employeeCount">Количество сотрудников</label>
          <select id="employeeCount" v-model="form.employeeCount" class="form-select">
            <option value="">Не указано</option>
            <option value="1-10">1-10 сотрудников</option>
            <option value="11-50">11-50 сотрудников</option>
            <option value="51-100">51-100 сотрудников</option>
            <option value="101-500">101-500 сотрудников</option>
            <option value="500+">Более 500 сотрудников</option>
          </select>
        </div>

        <div class="form-group">
          <label for="foundedYear">Год основания</label>
          <input 
            id="foundedYear"
            v-model="form.foundedYear" 
            type="number" 
            min="1900" 
            :max="currentYear"
            placeholder="2020"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Особенности компании</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.features.flexible_schedule">
              <span>Гибкий график</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.features.remote_work">
              <span>Удаленная работа</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.features.career_growth">
              <span>Карьерный рост</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.features.training">
              <span>Обучение персонала</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="form.features.benefits">
              <span>Социальные льготы</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Согласие и кнопка -->
      <div class="form-section">
        <div class="form-group">
          <label class="checkbox-item">
            <input type="checkbox" v-model="form.agreeToTerms" required>
            <span>Я согласен с <a href="/terms" target="_blank">условиями использования</a> и <a href="/privacy" target="_blank">политикой конфиденциальности</a></span>
          </label>
          <div v-if="errors.agreeToTerms" class="error-message">{{ errors.agreeToTerms }}</div>
        </div>

        <button 
          type="submit" 
          class="submit-btn"
          :disabled="isLoading || !form.agreeToTerms"
        >
          <span v-if="isLoading">⏳ Создание компании...</span>
          <span v-else>🚀 Создать компанию</span>
        </button>
      </div>
    </form>

    <!-- Ошибка -->
    <div v-if="globalError" class="global-error">
      ❌ {{ globalError }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CitySelector from '@/components/CitySelector.vue'
import { supabase } from '@/services/supabase'

const router = useRouter()
const authStore = useAuthStore()

// Состояние формы
const form = ref({
  name: '',
  legalName: '',
  industry: '',
  description: '',
  cityId: null,
  address: '',
  phone: '',
  email: '',
  website: '',
  employeeCount: '',
  foundedYear: null,
  features: {
    flexible_schedule: false,
    remote_work: false,
    career_growth: false,
    training: false,
    benefits: false
  },
  agreeToTerms: false
})

const errors = ref({})
const isLoading = ref(false)
const globalError = ref('')

const currentYear = computed(() => new Date().getFullYear())

// Валидация
const validateForm = () => {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = 'Название компании обязательно'
  }
  
  if (!form.value.industry) {
    errors.value.industry = 'Выберите сферу деятельности'
  }
  
  if (!form.value.cityId) {
    errors.value.cityId = 'Выберите город'
  }
  
  if (form.value.email && !isValidEmail(form.value.email)) {
    errors.value.email = 'Некорректный email адрес'
  }
  
  if (form.value.website && !isValidUrl(form.value.website)) {
    errors.value.website = 'Некорректный URL сайта'
  }
  
  if (!form.value.agreeToTerms) {
    errors.value.agreeToTerms = 'Необходимо согласиться с условиями'
  }
  
  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Регистрация компании
const registerCompany = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  globalError.value = ''
  
  try {
    const user = authStore.user
    if (!user) throw new Error('Пользователь не авторизован')

    // Создаем компанию
    const companyData = {
      name: form.value.name.trim(),
      legal_name: form.value.legalName.trim() || null,
      industry: form.value.industry,
      description: form.value.description.trim() || null,
      city_id: form.value.cityId,
      address: form.value.address.trim() || null,
      phone: form.value.phone.trim() || null,
      email: form.value.email.trim() || null,
      website: form.value.website.trim() || null,
      employee_count: form.value.employeeCount || null,
      founded_year: form.value.foundedYear,
      features: form.value.features,
      owner_id: user.id,
      status: 'active',
      created_at: new Date().toISOString()
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single()

    if (companyError) throw companyError

    // Обновляем профиль пользователя
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        user_type: 'employer',
        company_id: company.id,
        city_id: form.value.cityId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (profileError) throw profileError

    // Обновляем локальный store
    await authStore.fetchUser()

    // Перенаправляем в dashboard работодателя
    router.push('/dashboard')
    
  } catch (error) {
    console.error('Ошибка регистрации компании:', error)
    globalError.value = error.message || 'Произошла ошибка при создании компании'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!authStore.user) {
    router.push('/auth')
  }
  
  // Если пользователь уже работодатель, перенаправляем в dashboard
  if (authStore.user?.user_metadata?.user_type === 'employer') {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.company-register {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
}

.register-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.register-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.register-form {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 40px;
}

.form-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.city-selector {
  width: 100%;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

.checkbox-item span {
  margin: 0;
}

.checkbox-item a {
  color: #667eea;
  text-decoration: none;
}

.checkbox-item a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 15px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 5px;
  font-weight: 500;
}

.global-error {
  margin-top: 20px;
  padding: 15px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .company-register {
    padding: 15px;
  }
  
  .register-header {
    padding: 20px 15px;
  }
  
  .register-header h1 {
    font-size: 1.8rem;
  }
  
  .register-form {
    padding: 20px;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
