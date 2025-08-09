<template>
  <div class="job-detail-page">
    <div class="page-container">
      <!-- Кнопка назад -->
      <button class="back-button" @click="goBack">
        ← Назад к вакансиям
      </button>
      
      <!-- Загрузка -->
      <div class="loading" v-if="isLoading">
        Загружаю информацию о вакансии...
      </div>
      
      <!-- Ошибка -->
      <div class="error" v-else-if="error">
        <h2>❌ Ошибка загрузки</h2>
        <p>{{ error }}</p>
        <button @click="loadJob" class="retry-button">Попробовать снова</button>
      </div>
      
      <!-- Детали вакансии -->
      <div class="job-detail" v-else-if="job">
        <header class="job-header">
          <div class="job-badges">
            <span v-if="job.is_urgent" class="urgent-badge">🚨 СРОЧНО</span>
            <span class="type-badge">{{ getEmploymentTypeText(job.employment_type) }}</span>
          </div>
          
          <h1 class="job-title">{{ job.title }}</h1>
          
          <div class="company-info">
            <img 
              :src="job.company_logo || '/images/default-company.png'" 
              :alt="job.company_name"
              class="company-logo"
            />
            <div>
              <h2 class="company-name">{{ job.company_name }}</h2>
              <p class="location">📍 {{ job.location }}</p>
            </div>
          </div>
        </header>

        <div class="job-content">
          <div class="main-info">
            <!-- Описание -->
            <section class="description-section">
              <h3>📋 Описание вакансии</h3>
              <p class="description">{{ job.description || 'Описание не указано' }}</p>
            </section>

            <!-- Требования -->
            <section v-if="job.requirements && job.requirements.length" class="requirements-section">
              <h3>✅ Требования</h3>
              <ul class="requirements-list">
                <li v-for="requirement in job.requirements" :key="requirement">
                  {{ requirement }}
                </li>
              </ul>
            </section>

            <!-- Обязанности -->
            <section v-if="job.responsibilities && job.responsibilities.length" class="responsibilities-section">
              <h3>🎯 Обязанности</h3>
              <ul class="responsibilities-list">
                <li v-for="responsibility in job.responsibilities" :key="responsibility">
                  {{ responsibility }}
                </li>
              </ul>
            </section>

            <!-- Условия для срочных вакансий -->
            <section v-if="job.is_urgent" class="urgent-conditions">
              <h3>⚡ Условия срочной работы</h3>
              <div class="urgent-details">
                <div v-if="job.needed_date" class="detail-item">
                  <span class="icon">📅</span>
                  <span>Дата: {{ formatDate(job.needed_date) }}</span>
                </div>
                <div v-if="job.needed_time" class="detail-item">
                  <span class="icon">⏰</span>
                  <span>Время: {{ job.needed_time }}</span>
                </div>
                <div v-if="job.shift_duration" class="detail-item">
                  <span class="icon">⏱️</span>
                  <span>Длительность: {{ job.shift_duration }}</span>
                </div>
              </div>
            </section>
          </div>

          <aside class="sidebar">
            <!-- Зарплата -->
            <div class="salary-card">
              <h3>💰 Оплата</h3>
              <div class="salary-amount">
                {{ formatSalary() }}
              </div>
              <div class="currency">{{ job.currency || 'KZT' }}</div>
            </div>

            <!-- Контакты -->
            <div class="contact-card" v-if="showContacts">
              <h3>📞 Контакты</h3>
              <div v-if="job.contact_phone" class="contact-item">
                <span class="icon">📱</span>
                <a :href="`tel:${job.contact_phone}`">{{ job.contact_phone }}</a>
              </div>
              <div v-if="job.contact_telegram" class="contact-item">
                <span class="icon">💬</span>
                <a :href="`https://t.me/${job.contact_telegram}`">@{{ job.contact_telegram }}</a>
              </div>
              <div v-if="job.contact_person" class="contact-item">
                <span class="icon">👤</span>
                <span>{{ job.contact_person }}</span>
              </div>
            </div>

            <!-- Действия -->
            <div class="actions-card">
              <button class="apply-button" @click="applyToJob" :disabled="isApplying">
                <span v-if="isApplying">⏳ Подаём заявку...</span>
                <span v-else-if="job.is_urgent">🙋‍♂️ ГОТОВ ВЫЙТИ!</span>
                <span v-else>� Откликнуться</span>
              </button>
              
              <button class="share-button" @click="shareJob">
                📤 Поделиться
              </button>
              
              <button class="favorite-button" @click="toggleFavorite">
                {{ isFavorite ? '❤️ В избранном' : '🤍 В избранное' }}
              </button>
            </div>
          </aside>
        </div>
      </div>
      
      <!-- Если вакансия не найдена -->
      <div class="not-found" v-else>
        <h2>🔍 Вакансия не найдена</h2>
        <p>Возможно, она была удалена или ссылка неверная</p>
        <button @click="goBack" class="back-button">← Вернуться к списку</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { getJobById } from '@/data'

const route = useRoute()
const router = useRouter()
const jobsStore = useJobsStore()

const job = ref(null)
const isLoading = ref(true)
const error = ref(null)
const isApplying = ref(false)
const showContacts = ref(false)
const isFavorite = ref(false)

const jobId = computed(() => route.params.id)

const loadJob = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Загружаем из локальных данных
    job.value = getJobById(jobId.value)
    
    if (!job.value) {
      // Fallback на демо данные  
      job.value = getDemoJob(jobId.value)
    }
    
    if (!job.value) {
      throw new Error('Вакансия не найдена')
    }
    
    console.log('✅ Загружена вакансия:', job.value.title)
    
  } catch (err) {
    console.error('❌ Ошибка загрузки вакансии:', err)
    error.value = err.message || 'Не удалось загрузить вакансию'
    
  } finally {
    isLoading.value = false
  }
}

const getDemoJob = (id) => {
  // Демо данные на основе ID
  const demoJobs = {
    '1': {
      id: 1,
      title: 'СРОЧНО! Повар в банкетный зал',
      description: 'Требуется опытный повар для работы в банкетном зале на корпоратив. Знание казахской и европейской кухни обязательно. Высокая оплата за срочность! Работа с мясными блюдами, национальными блюдами, супами и горячими закусками.',
      company_name: 'Golden Palace',
      company_logo: '/images/default-company.png',
      location: 'ул. Кунаева, 12/1, Есильский район',
      employment_type: 'temporary',
      is_urgent: true,
      salary_min: 15000,
      salary_max: 25000,
      pay_per_shift: 20000,
      currency: 'KZT',
      needed_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      needed_time: '18:00',
      shift_duration: '6 часов',
      contact_phone: '+77172505678',
      contact_telegram: 'aigul_chef',
      contact_person: 'Айгуль Сулейманова',
      requirements: [
        'Опыт работы поваром от 2 лет',
        'Знание казахской кухни',
        'Знание европейской кухни', 
        'Умение работать в стрессовых ситуациях',
        'Санитарная книжка'
      ],
      responsibilities: [
        'Приготовление блюд казахской кухни',
        'Приготовление европейских блюд',
        'Работа на банкете на 100 человек',
        'Соблюдение технологий приготовления',
        'Поддержание чистоты рабочего места'
      ]
    },
    '2': {
      id: 2,
      title: 'Официант на вечернюю смену СЕГОДНЯ',
      description: 'Заболел официант, срочно нужна замена на вечернюю смену. Опыт работы в ресторанах обязателен. Знание английского языка приветствуется. Премиальный ресторан, VIP-клиенты.',
      company_name: 'Ресторан "Астана"',
      company_logo: '/images/default-company.png',
      location: 'пр. Республики, 15, Алматинский район',
      employment_type: 'temporary',
      is_urgent: true,
      salary_min: 8000,
      salary_max: 12000,
      pay_per_shift: 10000,
      currency: 'KZT',
      needed_date: new Date().toISOString(),
      needed_time: '17:00',
      shift_duration: '8 часов',
      contact_phone: '+77011234567',
      contact_telegram: 'arman_astana',
      contact_person: 'Арман Назарбаев',
      requirements: [
        'Опыт работы официантом от 6 месяцев',
        'Знание ресторанного этикета',
        'Презентабельный внешний вид',
        'Стрессоустойчивость',
        'Желательно знание английского языка'
      ],
      responsibilities: [
        'Обслуживание гостей ресторана',
        'Прием и оформление заказов',
        'Подача блюд и напитков',
        'Консультирование по меню',
        'Работа с кассовой системой'
      ]
    },
    '3': {
      id: 3,
      title: 'Кассир-администратор на выходные',
      description: 'Нужен кассир на выходные дни в пиццерию. Работа с кассовым аппаратом, прием заказов, работа с клиентами. Дружный коллектив! Возможность подработки для студентов.',
      company_name: 'Pizza Master',
      company_logo: '/images/default-company.png',
      location: 'ул. Абая, 25, Алматинский район',
      employment_type: 'part_time',
      is_urgent: true,
      salary_min: 6000,
      salary_max: 10000,
      pay_per_shift: 8000,
      currency: 'KZT',
      needed_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      needed_time: '10:00',
      shift_duration: '12 часов',
      contact_phone: '+77015678901',
      contact_telegram: 'aibek_pizza',
      contact_person: 'Айбек Жакенов',
      requirements: [
        'Опыт работы кассиром желателен',
        'Навыки работы с компьютером',
        'Дружелюбность и вежливость',
        'Готовность работать в выходные',
        'Честность и ответственность'
      ],
      responsibilities: [
        'Работа на кассе',
        'Прием заказов по телефону',
        'Консультирование клиентов',
        'Ведение документооборота',
        'Поддержание порядка в зале'
      ]
    }
  }
  
  return demoJobs[id] || null
}

const formatSalary = () => {
  if (!job.value) return 'Не указано'
  
  if (job.value.pay_per_shift) {
    return `${job.value.pay_per_shift.toLocaleString()}₸ за смену`
  }
  
  if (job.value.salary_min && job.value.salary_max) {
    return `${job.value.salary_min.toLocaleString()} - ${job.value.salary_max.toLocaleString()}₸`
  }
  
  if (job.value.salary_min) {
    return `от ${job.value.salary_min.toLocaleString()}₸`
  }
  
  return 'По договоренности'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getEmploymentTypeText = (type) => {
  const types = {
    'full_time': 'Полная занятость',
    'part_time': 'Частичная занятость', 
    'temporary': 'Временная работа',
    'contract': 'Контракт',
    'internship': 'Стажировка'
  }
  return types[type] || type
}

const applyToJob = async () => {
  try {
    isApplying.value = true
    
    // Для срочных вакансий показываем контакты сразу
    if (job.value.is_urgent) {
      showContacts.value = true
      console.log('Отклик на срочную вакансию:', job.value.id)
    } else {
      // Для обычных вакансий отправляем заявку
      console.log('Заявка отправлена на вакансию:', job.value.id)
    }
    
  } catch (err) {
    console.error('Ошибка отклика:', err)
  } finally {
    isApplying.value = false
  }
}

const shareJob = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    console.log('Ссылка скопирована:', url)
  })
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  console.log('Избранное:', isFavorite.value ? 'добавлено' : 'удалено')
}

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  loadJob()
})
</script>

<style scoped>
.job-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  padding: 2rem;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.loading, .error, .not-found {
  text-align: center;
  padding: 3rem;
  color: white;
}

.error {
  color: #ff6b6b;
}

.retry-button {
  background: #4ecdc4;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

.job-detail {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.job-header {
  margin-bottom: 2rem;
}

.job-badges {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.urgent-badge {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

.type-badge {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.job-title {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.company-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.company-name {
  color: white;
  font-size: 1.5rem;
  margin: 0;
}

.location {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.5rem 0 0 0;
}

.job-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.main-info section {
  margin-bottom: 2rem;
}

.main-info h3 {
  color: white;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 1.1rem;
}

.requirements-list, .responsibilities-list {
  color: rgba(255, 255, 255, 0.8);
  padding-left: 1.5rem;
}

.requirements-list li, .responsibilities-list li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.urgent-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.detail-item .icon {
  font-size: 1.2rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.salary-card, .contact-card, .actions-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.salary-card h3, .contact-card h3 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.salary-amount {
  color: #4ecdc4;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.currency {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.contact-item a {
  color: #4ecdc4;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

.actions-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.apply-button, .share-button, .favorite-button {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.apply-button {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  font-size: 1.1rem;
}

.apply-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
}

.apply-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.share-button, .favorite-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.share-button:hover, .favorite-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Адаптивность */
@media (max-width: 480px) {
  .job-detail-page {
    padding: 0.5rem;
  }
  
  .page-container {
    padding: 1rem;
  }
  
  .back-button {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .job-title {
    font-size: 1.5rem;
    line-height: 1.2;
  }
  
  .company-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .company-logo {
    width: 60px;
    height: 60px;
  }
  
  .company-name {
    font-size: 1.2rem;
  }
  
  .job-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .info-card, .sidebar {
    padding: 1rem;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .apply-button, .share-button, .favorite-button {
    padding: 14px 20px;
    font-size: 1rem;
    min-height: 48px; /* Touch target */
  }
}

@media (max-width: 768px) {
  .job-detail-page {
    padding: 1rem;
  }
  
  .job-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .job-title {
    font-size: 2rem;
  }
  
  .company-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions-card {
    gap: 0.75rem;
  }
  
  .apply-button {
    width: 100%;
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 1024px) {
  .job-content {
    grid-template-columns: 1fr 300px;
  }
}
</style>
