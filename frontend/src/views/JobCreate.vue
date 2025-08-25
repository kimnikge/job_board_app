<template>
  <div class="job-create-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-white mb-8">Создать вакансию</h1>
        
        <div class="form-section glass-effect rounded-xl p-6 mb-6">
          <form @submit.prevent="handleSubmit" class="job-form">
            
            <!-- Основная информация -->
            <div class="form-group">
              <label for="title" class="form-label">Название вакансии*</label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                class="form-input"
                placeholder="Например: Повар итальянской кухни"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="company_name" class="form-label">Название заведения*</label>
                <input
                  id="company_name"
                  v-model="form.company_name"
                  type="text"
                  class="form-input"
                  placeholder="Ristorante Bella Vista"
                  required
                />
              </div>

              <div class="form-group">
                <label for="location" class="form-label">Район*</label>
                <select id="location" v-model="form.location" class="form-select" required>
                  <option value="">Выберите район</option>
                  <option value="Есильский район">Есильский район</option>
                  <option value="Алматинский район">Алматинский район</option>
                  <option value="Сарыаркинский район">Сарыаркинский район</option>
                  <option value="Байконурский район">Байконурский район</option>
                </select>
              </div>
            </div>

            <!-- Зарплата -->
            <div class="form-row">
              <div class="form-group">
                <label for="salary_from" class="form-label">Зарплата от (₸)</label>
                <input
                  id="salary_from"
                  v-model="form.salary_from"
                  type="number"
                  class="form-input"
                  placeholder="300000"
                  min="0"
                />
              </div>

              <div class="form-group">
                <label for="salary_to" class="form-label">Зарплата до (₸)</label>
                <input
                  id="salary_to"
                  v-model="form.salary_to"
                  type="number"
                  class="form-input"
                  placeholder="500000"
                  min="0"
                />
              </div>
            </div>

            <!-- Описание -->
            <div class="form-group">
              <label for="description" class="form-label">Описание работы*</label>
              <textarea
                id="description"
                v-model="form.description"
                class="form-textarea"
                rows="4"
                placeholder="Опишите требования, обязанности, условия работы..."
                required
              ></textarea>
            </div>

            <!-- Срочность -->
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="form.is_urgent"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span class="checkbox-text">🚨 Срочная вакансия</span>
                <small class="checkbox-hint">Отправит особое уведомление</small>
              </label>
            </div>

            <!-- Дата начала работы (для срочных) -->
            <div v-if="form.is_urgent" class="form-group">
              <label for="needed_date" class="form-label">Дата начала работы</label>
              <input
                id="needed_date"
                v-model="form.needed_date"
                type="date"
                class="form-input"
                :min="today"
              />
            </div>

            <!-- Контакты -->
            <div class="form-row">
              <div class="form-group">
                <label for="phone" class="form-label">Телефон</label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="form-input"
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>

              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="hr@restaurant.kz"
                />
              </div>
            </div>

            <!-- Кнопки -->
            <div class="form-actions">
              <button
                type="submit"
                :disabled="isSubmitting || !isFormValid"
                class="submit-btn"
              >
                {{ isSubmitting ? 'Создание...' : 'Создать вакансию' }}
              </button>

              <button
                type="button"
                @click="resetForm"
                class="reset-btn"
                :disabled="isSubmitting"
              >
                Очистить
              </button>
            </div>

            <!-- Статус -->
            <div v-if="submitStatus" :class="['submit-status', submitStatus.type]">
              {{ submitStatus.message }}
            </div>
          </form>
        </div>

        <!-- Панель уведомлений -->
        <div class="notification-section">
          <NotificationPanel />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { jobsService } from '@/services/jobs.service.js'
import { useNotifications } from '@/composables/useNotifications.js'
import NotificationPanel from '@/components/NotificationPanel.vue'

const router = useRouter()
const { notifyNewJob, notifyUser } = useNotifications()

// Форма
const form = ref({
  title: '',
  company_name: '',
  location: '',
  description: '',
  salary_from: null,
  salary_to: null,
  is_urgent: false,
  needed_date: '',
  phone: '',
  email: ''
})

// Состояние
const isSubmitting = ref(false)
const submitStatus = ref(null)

// Вычисляемые свойства
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return form.value.title.trim() && 
         form.value.company_name.trim() && 
         form.value.location && 
         form.value.description.trim()
})

// Методы
const handleSubmit = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  submitStatus.value = null

  try {
    // Подготовка данных
    const jobData = {
      ...form.value,
      salary_from: form.value.salary_from ? parseInt(form.value.salary_from) : null,
      salary_to: form.value.salary_to ? parseInt(form.value.salary_to) : null,
      created_at: new Date().toISOString(),
      status: 'active'
    }

    // Создание вакансии через сервис (который автоматически отправит уведомление)
    const { data, error } = await jobsService.createJob(jobData)

    if (error) {
      throw new Error(error.message || 'Ошибка при создании вакансии')
    }

    // Успех
    submitStatus.value = {
      type: 'success',
      message: `✅ Вакансия "${form.value.title}" успешно создана! Уведомления отправлены.`
    }

    // Дополнительное уведомление создателю
    setTimeout(async () => {
      await notifyUser('demo-user', `Ваша вакансия "${form.value.title}" была опубликована и доступна соискателям!`, 'success')
    }, 2000)

    // Очистка формы через 3 секунды
    setTimeout(() => {
      resetForm()
    }, 3000)

  } catch (error) {
    console.error('Job creation error:', error)
    submitStatus.value = {
      type: 'error',
      message: `❌ Ошибка: ${error.message}`
    }
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    company_name: '',
    location: '',
    description: '',
    salary_from: null,
    salary_to: null,
    is_urgent: false,
    needed_date: '',
    phone: '',
    email: ''
  }
  submitStatus.value = null
}

// Демо данные при загрузке
onMounted(() => {
  // Заполнение демо данными для быстрого тестирования
  form.value = {
    title: 'Повар итальянской кухни',
    company_name: 'Ristorante Bella Vista',
    location: 'Есильский район',
    description: 'Требуется опытный повар итальянской кухни. Знание классических рецептов, работа с пастой, пиццей. Дружный коллектив, стабильная зарплата.',
    salary_from: 350000,
    salary_to: 500000,
    is_urgent: false,
    needed_date: '',
    phone: '+7 (777) 123-45-67',
    email: 'hr@bellavista.kz'
  }
})
</script>

<style scoped>
.job-create-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-section {
  margin-bottom: 2rem;
}

.job-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.form-select option {
  background: #4a5568;
  color: white;
}

.checkbox-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
  color: white;
}

.form-checkbox {
  width: auto;
  margin-right: 0.5rem;
}

.checkbox-text {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.checkbox-hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-left: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-btn,
.reset-btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.submit-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  flex: 1;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.submit-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  transform: none;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.reset-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.submit-status {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-weight: 500;
}

.submit-status.success {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.4);
  color: #4CAF50;
}

.submit-status.error {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  color: #f44336;
}

.notification-section {
  margin-top: 2rem;
}

/* Анимации */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-section {
  animation: slideIn 0.6s ease-out;
}

.notification-section {
  animation: slideIn 0.8s ease-out;
}
</style>
