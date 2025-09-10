<template>
  <div class="onboarding">
    <!-- Прогресс-бар -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
    </div>

    <!-- Заголовок -->
    <div class="welcome-header">
      <h1>🎉 Добро пожаловать в Shiftwork BETA!</h1>
      <p>Давайте настроим ваш профиль за {{ totalSteps }} простых шага</p>
    </div>
    
    <div class="onboarding-container">
      <!-- Шаг 1: Выбор типа пользователя -->
      <div v-if="currentStep === 1" class="step">
        <h2>Кто вы?</h2>
        <p class="step-description">Выберите, как вы планируете использовать платформу</p>
        
        <div class="user-type-selector">
          <button 
            @click="selectUserType('candidate')" 
            :class="['type-btn', { selected: profile.userType === 'candidate' }]"
          >
            <span class="type-icon">👤</span>
            <span class="type-title">Ищу работу</span>
            <span class="type-description">Соискатель вакансий</span>
          </button>
          
          <button 
            @click="selectUserType('employer')" 
            :class="['type-btn', { selected: profile.userType === 'employer' }]"
          >
            <span class="type-icon">🏢</span>
            <span class="type-title">Ищу сотрудников</span>
            <span class="type-description">Работодатель</span>
          </button>
        </div>
      </div>
      
      <!-- Шаг 2: Выбор города -->
      <div v-if="currentStep === 2" class="step">
        <h2>📍 Ваш город</h2>
        <p class="step-description">Укажите город, где вы планируете работать или искать сотрудников</p>
        
        <div class="city-selection">
          <CitySelector 
            v-model="profile.cityId" 
            placeholder="Выберите ваш город"
            class="city-selector"
          />
          
          <div v-if="profile.cityId" class="city-confirmation">
            ✅ Выбран город: {{ getCityName(profile.cityId) }}
          </div>
        </div>
      </div>
      
      <!-- Шаг 3: Специализация для соискателей -->
      <div v-if="currentStep === 3 && profile.userType === 'candidate'" class="step">
        <h2>🎯 Ваша специализация</h2>
        <p class="step-description">Выберите область, в которой вы хотите работать</p>
        
        <div class="specialization-grid">
          <button 
            v-for="spec in specializations" 
            :key="spec.id"
            @click="selectSpecialization(spec.id)"
            :class="['spec-btn', { selected: profile.specializationId === spec.id }]"
          >
            <span class="spec-icon">{{ spec.icon }}</span>
            <span class="spec-name">{{ spec.name }}</span>
          </button>
        </div>
      </div>

      <!-- Шаг 3: Информация о компании для работодателей -->
      <div v-if="currentStep === 3 && profile.userType === 'employer'" class="step">
        <h2>🏢 О вашей компании</h2>
        <p class="step-description">Расскажите базовую информацию о компании</p>
        
        <div class="company-form">
          <div class="form-group">
            <label>Название компании*</label>
            <input 
              v-model="profile.companyName" 
              type="text" 
              placeholder="ООО 'Моя компания'"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label>Сфера деятельности*</label>
            <select v-model="profile.companyIndustry" class="form-select" required>
              <option value="">Выберите сферу</option>
              <option value="restaurant">Ресторанный бизнес</option>
              <option value="cafe">Кафе и быстрое питание</option>
              <option value="hotel">Гостиничный бизнес</option>
              <option value="catering">Кейтеринг</option>
              <option value="delivery">Доставка еды</option>
              <option value="other">Другое</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Краткое описание</label>
            <textarea 
              v-model="profile.companyDescription" 
              placeholder="Расскажите о вашей компании в нескольких словах..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Шаг 4: Завершение -->
      <div v-if="currentStep === 4" class="step completion-step">
        <div class="completion-icon">🎉</div>
        <h2>Отлично! Всё готово</h2>
        <p class="step-description">Ваш профиль настроен. Теперь вы можете:</p>
        
        <div class="next-steps">
          <div v-if="profile.userType === 'candidate'" class="next-step-item">
            <span class="step-icon">🔍</span>
            <span>Искать подходящие вакансии</span>
          </div>
          <div v-if="profile.userType === 'candidate'" class="next-step-item">
            <span class="step-icon">📄</span>
            <span>Заполнить резюме</span>
          </div>
          <div v-if="profile.userType === 'employer'" class="next-step-item">
            <span class="step-icon">📝</span>
            <span>Создать первую вакансию</span>
          </div>
          <div v-if="profile.userType === 'employer'" class="next-step-item">
            <span class="step-icon">👥</span>
            <span>Найти сотрудников</span>
          </div>
          <div class="next-step-item">
            <span class="step-icon">🏅</span>
            <span>Получать бейджи за активность</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Навигация -->
    <div class="navigation">
      <button 
        v-if="currentStep > 1" 
        @click="prevStep" 
        class="nav-btn nav-btn--secondary"
        :disabled="isLoading"
      >
        ← Назад
      </button>
      
      <button 
        v-if="currentStep < totalSteps" 
        @click="nextStep" 
        class="nav-btn nav-btn--primary"
        :disabled="!canProceed || isLoading"
      >
        {{ currentStep === totalSteps - 1 ? 'Завершить' : 'Далее' }} →
      </button>
      
      <button 
        v-if="currentStep === totalSteps" 
        @click="completeOnboarding" 
        class="nav-btn nav-btn--success"
        :disabled="isLoading"
      >
        <span v-if="isLoading">⏳ Сохранение...</span>
        <span v-else>🚀 Начать пользоваться</span>
      </button>
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

// Состояние
const currentStep = ref(1)
const totalSteps = ref(4)
const isLoading = ref(false)

const profile = ref({
  userType: null,
  cityId: null,
  specializationId: null,
  companyName: '',
  companyIndustry: '',
  companyDescription: ''
})

// Специализации для соискателей
const specializations = ref([
  { id: 1, name: 'Повар', icon: '👨‍🍳' },
  { id: 2, name: 'Официант', icon: '👨‍💼' },
  { id: 3, name: 'Бармен', icon: '🍹' },
  { id: 4, name: 'Курьер', icon: '🚴‍♂️' },
  { id: 5, name: 'Хостес', icon: '👋' },
  { id: 6, name: 'Кассир', icon: '💳' },
  { id: 7, name: 'Уборщик', icon: '🧹' },
  { id: 8, name: 'Администратор', icon: '📋' },
  { id: 9, name: 'Универсал', icon: '⭐' }
])

// Вычисляемые свойства
const progressPercent = computed(() => (currentStep.value / totalSteps.value) * 100)

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return profile.value.userType !== null
    case 2:
      return profile.value.cityId !== null
    case 3:
      if (profile.value.userType === 'candidate') {
        return profile.value.specializationId !== null
      } else if (profile.value.userType === 'employer') {
        return profile.value.companyName.trim() !== '' && profile.value.companyIndustry !== ''
      }
      return true
    default:
      return true
  }
})

// Методы
const selectUserType = (type) => {
  profile.value.userType = type
  // Для работодателей общий totalSteps = 4, для соискателей = 4
  totalSteps.value = 4
}

const selectSpecialization = (id) => {
  profile.value.specializationId = id
}

const getCityName = (cityId) => {
  // TODO: Получить название города по ID из cities service
  return `Город ${cityId}`
}

const nextStep = () => {
  if (canProceed.value && currentStep.value < totalSteps.value) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeOnboarding = async () => {
  isLoading.value = true
  
  try {
    const user = authStore.user
    if (!user) throw new Error('Пользователь не авторизован')

    // Обновляем профиль пользователя
    const profileData = {
      user_type: profile.value.userType,
      city_id: profile.value.cityId,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    }

    // Для соискателей добавляем специализацию
    if (profile.value.userType === 'candidate' && profile.value.specializationId) {
      profileData.specialization_id = profile.value.specializationId
    }

    // Для работодателей создаем запись компании
    if (profile.value.userType === 'employer') {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: profile.value.companyName,
          industry: profile.value.companyIndustry,
          description: profile.value.companyDescription,
          owner_id: user.id,
          city_id: profile.value.cityId,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (companyError) throw companyError
      
      profileData.company_id = company.id
    }

    // Обновляем профиль
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', user.id)

    if (profileError) throw profileError

    // Обновляем локальный store
    await authStore.fetchUser()

    // Перенаправляем на главную
    router.push('/')
    
  } catch (error) {
    console.error('Ошибка завершения онбординга:', error)
    alert('Произошла ошибка при сохранении. Попробуйте еще раз.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Если пользователь уже прошел онбординг, перенаправляем на главную
  if (authStore.user?.user_metadata?.onboarding_completed) {
    router.push('/')
  }
})
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin-bottom: 30px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.welcome-header {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.welcome-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.onboarding-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.step h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.step-description {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 30px;
}

.user-type-selector {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

.type-btn {
  padding: 25px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.type-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.type-btn.selected {
  background: rgba(255, 255, 255, 0.2);
  border-color: #4CAF50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

.type-icon {
  font-size: 2.5rem;
}

.type-title {
  font-size: 1.3rem;
  font-weight: 600;
}

.type-description {
  font-size: 0.9rem;
  opacity: 0.8;
}

.city-selection {
  max-width: 400px;
  margin: 0 auto;
}

.city-selector {
  width: 100%;
  margin-bottom: 20px;
}

.city-confirmation {
  padding: 12px;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.4);
  border-radius: 8px;
  font-weight: 500;
}

.specialization-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.spec-btn {
  padding: 20px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.spec-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.spec-btn.selected {
  background: rgba(255, 255, 255, 0.2);
  border-color: #4CAF50;
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.3);
}

.spec-icon {
  font-size: 2rem;
}

.spec-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.company-form {
  max-width: 400px;
  margin: 0 auto;
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.completion-step {
  text-align: center;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.next-steps {
  margin-top: 30px;
  display: grid;
  gap: 15px;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.next-step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-weight: 500;
}

.step-icon {
  font-size: 1.5rem;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  gap: 15px;
}

.nav-btn {
  flex: 1;
  padding: 15px 25px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 50px;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn--secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.nav-btn--primary {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.nav-btn--success {
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
}

.nav-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .onboarding {
    padding: 15px;
  }
  
  .welcome-header h1 {
    font-size: 1.5rem;
  }
  
  .step h2 {
    font-size: 1.5rem;
  }
  
  .specialization-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .navigation {
    flex-direction: column;
  }
  
  .nav-btn {
    width: 100%;
  }
}
</style>
