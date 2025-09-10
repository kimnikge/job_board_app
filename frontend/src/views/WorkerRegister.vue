<template>
  <div class="worker-register">
    <div class="register-header">
      <h1>👤 Дополнительная регистрация</h1>
      <p>Расскажите больше о себе для лучшего подбора вакансий</p>
    </div>

    <form @submit.prevent="registerWorker" class="register-form">
      <!-- Личная информация -->
      <div class="form-section">
        <h2>📋 Личная информация</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Имя*</label>
            <input 
              id="firstName"
              v-model="form.firstName" 
              type="text" 
              placeholder="Имя"
              class="form-input"
              required
            />
            <div v-if="errors.firstName" class="error-message">{{ errors.firstName }}</div>
          </div>

          <div class="form-group">
            <label for="lastName">Фамилия*</label>
            <input 
              id="lastName"
              v-model="form.lastName" 
              type="text" 
              placeholder="Фамилия"
              class="form-input"
              required
            />
            <div v-if="errors.lastName" class="error-message">{{ errors.lastName }}</div>
          </div>
        </div>

        <div class="form-group">
          <label for="phone">Телефон*</label>
          <input 
            id="phone"
            v-model="form.phone" 
            type="tel" 
            placeholder="+7 777 123 45 67"
            class="form-input"
            required
          />
          <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            v-model="form.email" 
            type="email" 
            placeholder="example@mail.com"
            class="form-input"
          />
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>

        <div class="form-group">
          <label for="birthDate">Дата рождения</label>
          <input 
            id="birthDate"
            v-model="form.birthDate" 
            type="date" 
            class="form-input"
          />
        </div>
      </div>

      <!-- Профессиональная информация -->
      <div class="form-section">
        <h2>💼 Профессиональная информация</h2>
        
        <div class="form-group">
          <label for="specialization">Специализация*</label>
          <select 
            id="specialization"
            v-model="form.specializationId" 
            class="form-select"
            required
          >
            <option value="">Выберите специализацию</option>
            <option 
              v-for="spec in specializations" 
              :key="spec.id" 
              :value="spec.id"
            >
              {{ spec.name }}
            </option>
          </select>
          <div v-if="errors.specializationId" class="error-message">{{ errors.specializationId }}</div>
        </div>

        <div class="form-group">
          <label for="experience">Опыт работы</label>
          <select v-model="form.experienceYears" class="form-select">
            <option value="">Укажите опыт</option>
            <option value="0">Без опыта</option>
            <option value="1">1 год</option>
            <option value="2">2 года</option>
            <option value="3">3 года</option>
            <option value="5">5+ лет</option>
            <option value="10">10+ лет</option>
          </select>
        </div>

        <div class="form-group">
          <label for="skills">Ключевые навыки</label>
          <textarea 
            id="skills"
            v-model="form.skills" 
            placeholder="Опишите ваши основные навыки и умения"
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="expectedSalary">Желаемая зарплата (тенге)</label>
          <input 
            id="expectedSalary"
            v-model.number="form.expectedSalary" 
            type="number" 
            placeholder="250000"
            class="form-input"
            step="10000"
            min="50000"
          />
        </div>
      </div>

      <!-- Местоположение и предпочтения -->
      <div class="form-section">
        <h2>📍 Местоположение и предпочтения</h2>
        
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
          <label for="workType">Тип занятости</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input 
                type="checkbox" 
                v-model="form.workTypes" 
                value="full_time"
              />
              <span>Полная занятость</span>
            </label>
            <label class="checkbox-item">
              <input 
                type="checkbox" 
                v-model="form.workTypes" 
                value="part_time"
              />
              <span>Частичная занятость</span>
            </label>
            <label class="checkbox-item">
              <input 
                type="checkbox" 
                v-model="form.workTypes" 
                value="remote"
              />
              <span>Удаленная работа</span>
            </label>
            <label class="checkbox-item">
              <input 
                type="checkbox" 
                v-model="form.workTypes" 
                value="freelance"
              />
              <span>Фриланс</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-item">
            <input 
              type="checkbox" 
              v-model="form.readyToRelocate"
            />
            <span>Готов к переезду в другой город</span>
          </label>
        </div>
      </div>

      <!-- О себе -->
      <div class="form-section">
        <h2>📝 О себе</h2>
        
        <div class="form-group">
          <label for="bio">Расскажите о себе</label>
          <textarea 
            id="bio"
            v-model="form.bio" 
            placeholder="Расскажите о своих достижениях, интересах и целях"
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="form-actions">
        <button type="button" @click="goBack" class="btn-secondary">
          Назад
        </button>
        <button type="submit" :disabled="isSubmitting" class="btn-primary">
          <span v-if="isSubmitting">⏳ Сохранение...</span>
          <span v-else">✅ Завершить регистрацию</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useReferenceStore } from '@/stores/reference'
import CitySelector from '@/components/forms/CitySelector.vue'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const referenceStore = useReferenceStore()

// Реактивные данные
const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  birthDate: '',
  specializationId: '',
  experienceYears: '',
  skills: '',
  expectedSalary: null,
  cityId: '',
  workTypes: [],
  readyToRelocate: false,
  bio: ''
})

const errors = ref({})
const isSubmitting = ref(false)
const specializations = ref([])

// Загрузка справочных данных
onMounted(async () => {
  try {
    await referenceStore.loadSpecializations()
    specializations.value = referenceStore.specializations
    
    // Если пользователь уже частично заполнил профиль в онбординге
    if (authStore.user?.user_metadata) {
      const metadata = authStore.user.user_metadata
      form.value.firstName = metadata.first_name || ''
      form.value.lastName = metadata.last_name || ''
      form.value.cityId = metadata.city_id || ''
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
})

// Валидация формы
const validateForm = () => {
  errors.value = {}
  
  if (!form.value.firstName.trim()) {
    errors.value.firstName = 'Имя обязательно'
  }
  
  if (!form.value.lastName.trim()) {
    errors.value.lastName = 'Фамилия обязательна'
  }
  
  if (!form.value.phone.trim()) {
    errors.value.phone = 'Телефон обязателен'
  } else if (!/^\+7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(form.value.phone)) {
    errors.value.phone = 'Неверный формат телефона'
  }
  
  if (form.value.email && !/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Неверный формат email'
  }
  
  if (!form.value.specializationId) {
    errors.value.specializationId = 'Специализация обязательна'
  }
  
  if (!form.value.cityId) {
    errors.value.cityId = 'Город обязателен'
  }
  
  return Object.keys(errors.value).length === 0
}

// Регистрация соискателя
const registerWorker = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Обновляем расширенный профиль
    await profileStore.updateExtendedProfile({
      user_id: authStore.user.id,
      first_name: form.value.firstName,
      last_name: form.value.lastName,
      phone: form.value.phone,
      email: form.value.email,
      birth_date: form.value.birthDate || null,
      specialization_id: form.value.specializationId,
      experience_years: form.value.experienceYears ? parseInt(form.value.experienceYears) : null,
      skills: form.value.skills,
      expected_salary: form.value.expectedSalary,
      city_id: form.value.cityId,
      work_types: form.value.workTypes,
      ready_to_relocate: form.value.readyToRelocate,
      bio: form.value.bio,
      registration_completed: true
    })
    
    // Обновляем метаданные пользователя
    await authStore.updateUserMetadata({
      first_name: form.value.firstName,
      last_name: form.value.lastName,
      city_id: form.value.cityId,
      registration_completed: true
    })
    
    // Успешное завершение
    router.push({ path: '/', query: { welcome: 'true' } })
    
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    // Здесь можно показать уведомление об ошибке
  } finally {
    isSubmitting.value = false
  }
}

// Навигация назад
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.worker-register {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.register-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.form-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e3e8ee;
  border-radius: 8px;
  background: #f8fafc;
}

.form-section h2 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-item input[type="checkbox"] {
  width: auto;
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 40px;
}

.btn-secondary,
.btn-primary {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 150px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.city-selector {
  width: 100%;
}

@media (max-width: 768px) {
  .worker-register {
    margin: 10px;
    padding: 15px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
