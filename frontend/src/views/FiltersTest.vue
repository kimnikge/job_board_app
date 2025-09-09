<template>
  <div class="filters-test-page">
    <div class="container">
      <h1>🔍 Тестирование фильтров</h1>
      <p>Проверка системы фильтрации и поиска вакансий</p>

      <!-- Демо данные -->
      <section class="demo-section">
        <h2>📊 Демо данные для тестирования</h2>
        <button @click="generateDemoJobs" class="demo-btn">
          🎲 Сгенерировать тестовые вакансии
        </button>
        <div v-if="demoJobs.length > 0" class="demo-stats">
          <div class="stat">
            <strong>{{ demoJobs.length }}</strong> вакансий создано
          </div>
          <div class="stat">
            <strong>{{ urgentCount }}</strong> срочных
          </div>
          <div class="stat">
            <strong>{{ highSalaryCount }}</strong> с высокой зарплатой
          </div>
        </div>
      </section>

      <!-- Тестирование API -->
      <section class="api-section">
        <h2>🛠️ Тестирование API фильтров</h2>
        <div class="api-tests">
          <div class="test-group">
            <h3>Поиск по тексту</h3>
            <input v-model="testQuery" placeholder="Введите запрос..." class="test-input">
            <button @click="testTextSearch" class="test-btn">Поиск</button>
            <div v-if="testResults.text" class="result">
              Найдено: {{ testResults.text.length }} результатов
            </div>
          </div>

          <div class="test-group">
            <h3>Фильтр по специализации</h3>
            <select v-model="testSpecialization" class="test-select">
              <option value="">Выберите</option>
              <option value="cook">Повар</option>
              <option value="waiter">Официант</option>
              <option value="bartender">Бармен</option>
            </select>
            <button @click="testSpecializationFilter" class="test-btn">Фильтр</button>
            <div v-if="testResults.specialization" class="result">
              Найдено: {{ testResults.specialization.length }} результатов
            </div>
          </div>

          <div class="test-group">
            <h3>Фильтр по зарплате</h3>
            <select v-model="testSalaryRange" class="test-select">
              <option value="">Выберите</option>
              <option value="0-100000">До 100k</option>
              <option value="100000-200000">100k-200k</option>
              <option value="300000+">300k+</option>
            </select>
            <button @click="testSalaryFilter" class="test-btn">Фильтр</button>
            <div v-if="testResults.salary" class="result">
              Найдено: {{ testResults.salary.length }} результатов
            </div>
          </div>
        </div>
      </section>

      <!-- Результаты тестов -->
      <section v-if="testResults.all" class="results-section">
        <h2>📋 Результаты тестирования</h2>
        <div class="test-results">
          <div v-for="job in testResults.all.slice(0, 5)" :key="job.id" class="job-preview">
            <h4>{{ job.title }}</h4>
            <p><strong>Компания:</strong> {{ job.company_name }}</p>
            <p><strong>Зарплата:</strong> {{ formatSalary(job.salary_from) }}</p>
            <p><strong>Локация:</strong> {{ job.location }}</p>
            <div v-if="job.is_urgent" class="urgent-badge">🚨 СРОЧНО</div>
          </div>
        </div>
      </section>

      <!-- Статистика производительности -->
      <section class="performance-section">
        <h2>⚡ Производительность</h2>
        <div class="perf-stats">
          <div class="perf-stat">
            <div class="perf-label">Время последнего поиска</div>
            <div class="perf-value">{{ lastSearchTime }}мс</div>
          </div>
          <div class="perf-stat">
            <div class="perf-label">Обработано записей</div>
            <div class="perf-value">{{ demoJobs.length }}</div>
          </div>
          <div class="perf-stat">
            <div class="perf-label">Результатов найдено</div>
            <div class="perf-value">{{ lastResultCount }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Состояние
const demoJobs = ref([])
const testQuery = ref('')
const testSpecialization = ref('')
const testSalaryRange = ref('')
const testResults = ref({})
const lastSearchTime = ref(0)
const lastResultCount = ref(0)

// Статистика
const urgentCount = computed(() => demoJobs.value.filter(j => j.is_urgent).length)
const highSalaryCount = computed(() => demoJobs.value.filter(j => j.salary_from >= 300000).length)

// Генерация тестовых данных
const generateDemoJobs = () => {
  const titles = [
    'Повар итальянской кухни', 'Официант в ресторан', 'Бармен-бариста', 
    'Су-шеф', 'Менеджер зала', 'Кондитер', 'Пиццайоло',
    'Официант-кассир', 'Повар горячего цеха', 'Администратор ресторана'
  ]
  
  const companies = [
    'Ristorante Bella Vista', 'Cafe Central', 'Burger House', 
    'Sushi Master', 'Pizza Place', 'Coffee Shop', 'Fine Dining'
  ]
  
  const locations = [
    'Астана, Есильский район', 'Алматы, Алмалинский район',
    'Шымкент, Енбекшинский район', 'Караганда, Казыбек би район'
  ]

  const jobs = []
  for (let i = 1; i <= 50; i++) {
    jobs.push({
      id: i,
      title: titles[Math.floor(Math.random() * titles.length)],
      company_name: companies[Math.floor(Math.random() * companies.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      salary_from: Math.floor(Math.random() * 500000) + 80000,
      is_urgent: Math.random() > 0.7,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: `Требуется ${titles[Math.floor(Math.random() * titles.length)].toLowerCase()}. Опыт работы приветствуется.`,
      applications_count: Math.floor(Math.random() * 20)
    })
  }
  
  demoJobs.value = jobs
}

// Тестирование фильтров
const testTextSearch = () => {
  const startTime = performance.now()
  
  const query = testQuery.value.toLowerCase()
  const results = demoJobs.value.filter(job => 
    job.title?.toLowerCase().includes(query) ||
    job.company_name?.toLowerCase().includes(query) ||
    job.description?.toLowerCase().includes(query)
  )
  
  const endTime = performance.now()
  lastSearchTime.value = Math.round(endTime - startTime)
  lastResultCount.value = results.length
  testResults.value.text = results
  testResults.value.all = results
}

const testSpecializationFilter = () => {
  const startTime = performance.now()
  
  const results = demoJobs.value.filter(job => {
    const spec = testSpecialization.value
    const title = job.title?.toLowerCase() || ''
    switch(spec) {
      case 'cook':
        return title.includes('повар') || title.includes('кук') || title.includes('шеф')
      case 'waiter':
        return title.includes('официант')
      case 'bartender':
        return title.includes('бармен') || title.includes('бариста')
      default:
        return true
    }
  })
  
  const endTime = performance.now()
  lastSearchTime.value = Math.round(endTime - startTime)
  lastResultCount.value = results.length
  testResults.value.specialization = results
  testResults.value.all = results
}

const testSalaryFilter = () => {
  const startTime = performance.now()
  
  const results = demoJobs.value.filter(job => {
    const salary = job.salary_from || 0
    switch(testSalaryRange.value) {
      case '0-100000':
        return salary <= 100000
      case '100000-200000':
        return salary >= 100000 && salary <= 200000
      case '300000+':
        return salary >= 300000
      default:
        return true
    }
  })
  
  const endTime = performance.now()
  lastSearchTime.value = Math.round(endTime - startTime)
  lastResultCount.value = results.length
  testResults.value.salary = results
  testResults.value.all = results
}

// Форматирование
const formatSalary = (amount) => {
  if (!amount) return 'Не указана'
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0
  }).format(amount)
}
</script>

<style scoped>
.filters-test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  text-align: center;
  color: white;
  font-size: 2.5rem;
  margin-bottom: 8px;
}

h1 + p {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
}

section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
}

.demo-btn, .test-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.demo-btn:hover, .test-btn:hover {
  background: #5a6fd8;
}

.demo-stats {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.stat {
  padding: 8px 16px;
  background: #f8f9ff;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.api-tests {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.test-group {
  padding: 16px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
}

.test-group h3 {
  margin: 0 0 12px 0;
  color: #666;
}

.test-input, .test-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
}

.result {
  margin-top: 8px;
  padding: 8px;
  background: #e8f5e8;
  border-radius: 6px;
  color: #2d5a2d;
  font-size: 14px;
}

.test-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.job-preview {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  position: relative;
}

.job-preview h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.job-preview p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.urgent-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4444;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.perf-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.perf-stat {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.perf-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.perf-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}
</style>
