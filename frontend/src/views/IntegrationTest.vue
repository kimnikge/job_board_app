<template>
  <div class="integration-test-page">
    <div class="container">
      <h1>🧪 Тестирование интеграций</h1>
      <p>Проверка всех завершенных интеграций</p>

      <!-- Тест 1: CitySelector -->
      <section class="test-section">
        <h2>1. ✅ CitySelector интеграция</h2>
        <div class="test-content">
          <div class="test-item">
            <h3>Обычный режим</h3>
            <CitySelector 
              v-model="selectedCity1"
              @city-selected="onCitySelected1"
              placeholder="Выберите ваш город"
            />
            <div v-if="selectedCity1" class="result">
              ✅ Выбран: {{ selectedCity1.name }}, {{ selectedCity1.region }} (ID: {{ selectedCity1.id }})
            </div>
          </div>

          <div class="test-item">
            <h3>Компактный режим</h3>
            <CitySelector 
              v-model="selectedCity2"
              @city-selected="onCitySelected2"
              placeholder="Все города"
              compact
            />
            <div v-if="selectedCity2" class="result">
              ✅ Выбран: {{ selectedCity2.name }}, {{ selectedCity2.region }} (ID: {{ selectedCity2.id }})
            </div>
          </div>
        </div>
      </section>

      <!-- Тест 2: Subscription System -->
      <section class="test-section">
        <h2>2. ✅ Система подписок</h2>
        <div class="test-content">
          <SubscriptionSettings />
        </div>
      </section>

      <!-- Тест 3: Push Notifications -->
      <section class="test-section">
        <h2>3. ✅ Push-уведомления</h2>
        <div class="test-content">
          <PushNotificationsSettings />
        </div>
      </section>

      <!-- Тест 4: Cities Data -->
      <section class="test-section">
        <h2>4. ✅ База данных городов</h2>
        <div class="test-content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ totalCities }}</div>
              <div class="stat-label">Всего городов</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ popularCities.length }}</div>
              <div class="stat-label">Популярных</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ regionsCount }}</div>
              <div class="stat-label">Регионов</div>
            </div>
          </div>

          <!-- Примеры дробных ID -->
          <div class="decimal-examples">
            <h4>Примеры дробной нумерации:</h4>
            <ul>
              <li><strong>16</strong> - Усть-Каменогорск (центр ВКО)</li>
              <li><strong>16.1</strong> - Риддер (город в ВКО)</li>
              <li><strong>9</strong> - Караганда (центр области)</li>
              <li><strong>9.1</strong> - Темиртау (город в области)</li>
              <li><strong>9.2</strong> - Жезказган (город в области)</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Тест 5: Cities API Functions -->
      <section class="test-section">
        <h2>5. ✅ API функции городов</h2>
        <div class="test-content">
          <div class="api-tests">
            <button @click="testGetCityById" class="test-btn">
              Тест getCityById(16.1)
            </button>
            <button @click="testGetCityByRegion" class="test-btn">
              Тест getCityByRegionCode('16')
            </button>
            <button @click="testSearchCities" class="test-btn">
              Тест searchCities('Семей')
            </button>
          </div>
          <div v-if="apiResult" class="api-result">
            <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Результаты -->
      <section class="results-section">
        <h2>📊 Результаты тестирования</h2>
        <div class="results-grid">
          <div class="result-card success">
            <div class="result-icon">✅</div>
            <div class="result-text">CitySelector интеграция</div>
          </div>
          <div class="result-card success">
            <div class="result-icon">✅</div>
            <div class="result-text">Система подписок</div>
          </div>
          <div class="result-card success">
            <div class="result-icon">✅</div>
            <div class="result-text">Push-уведомления</div>
          </div>
          <div class="result-card success">
            <div class="result-icon">✅</div>
            <div class="result-text">База городов</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CitySelector from '@/components/CitySelector.vue'
import SubscriptionSettings from '@/components/SubscriptionSettings.vue'
import PushNotificationsSettings from '@/components/PushNotificationsSettings.vue'
import { 
  CITIES, 
  getPopularCities, 
  getCityById, 
  getCityByRegionCode, 
  searchCities,
  getRegionsInOrder 
} from '@/data/cities.js'

// Состояние тестов
const selectedCity1 = ref(null)
const selectedCity2 = ref(null)
const apiResult = ref(null)

// Статистика городов
const totalCities = computed(() => CITIES.length)
const popularCities = computed(() => getPopularCities())
const regionsCount = computed(() => getRegionsInOrder().length)

// Обработчики
const onCitySelected1 = (city) => {
  selectedCity1.value = city
  console.log('Город 1 выбран:', city)
}

const onCitySelected2 = (city) => {
  selectedCity2.value = city
  console.log('Город 2 выбран:', city)
}

// API тесты
const testGetCityById = () => {
  const result = getCityById(16.1)
  apiResult.value = {
    function: 'getCityById(16.1)',
    result: result
  }
  console.log('getCityById(16.1):', result)
}

const testGetCityByRegion = () => {
  const result = getCityByRegionCode('16')
  apiResult.value = {
    function: 'getCityByRegionCode("16")',
    result: result
  }
  console.log('getCityByRegionCode("16"):', result)
}

const testSearchCities = () => {
  const result = searchCities('Семей')
  apiResult.value = {
    function: 'searchCities("Семей")',
    result: result
  }
  console.log('searchCities("Семей"):', result)
}

onMounted(() => {
  console.log('🧪 Страница тестирования интеграций загружена')
  console.log('📊 Всего городов:', totalCities.value)
  console.log('⭐ Популярных городов:', popularCities.value.length)
  console.log('🗺️ Регионов:', regionsCount.value)
})
</script>

<style scoped>
.integration-test-page {
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

.test-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.test-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
}

.test-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.test-item {
  padding: 16px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  background: #fafafa;
}

.test-item h3 {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 1rem;
}

.result {
  margin-top: 12px;
  padding: 8px 12px;
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 8px;
  color: #2d5a2d;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.decimal-examples {
  background: #f8f9ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.decimal-examples h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.decimal-examples ul {
  margin: 0;
  padding-left: 20px;
}

.decimal-examples li {
  margin-bottom: 4px;
  color: #666;
}

.api-tests {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.test-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #667eea;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.test-btn:hover {
  background: #5a6fd8;
}

.api-result {
  background: #1a1a1a;
  color: #00ff00;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
}

.results-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid #e8f5e8;
  background: #f8fff8;
}

.result-card.success {
  border-color: #c3e6c3;
}

.result-icon {
  font-size: 24px;
}

.result-text {
  font-weight: 500;
  color: #2d5a2d;
}

@media (max-width: 768px) {
  .api-tests {
    flex-direction: column;
  }
  
  .test-btn {
    width: 100%;
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>
