<!-- R4TestPage.vue - Тестирование геймификации -->
<template>
  <div class="r4-test-page">
    <h1>🎮 R4 Gamification Test</h1>
    
    <!-- Выбор пользователя для тестирования -->
    <div class="user-selector">
      <label>Тестировать для пользователя:</label>
      <input 
        v-model="testUserId" 
        placeholder="UUID пользователя" 
        class="user-input"
      />
      <button @click="loadTestUser" :disabled="!testUserId">Загрузить</button>
    </div>

    <!-- Основной функционал -->
    <div v-if="testUserId" class="test-sections">
      
      <!-- Секция прогресса -->
      <section class="progress-section">
        <h2>📊 Прогресс геймификации</h2>
        <button @click="loadProgress" :disabled="loading">
          {{ loading ? 'Загрузка...' : 'Загрузить прогресс' }}
        </button>
        
        <div v-if="progress" class="progress-display">
          <p><strong>Всего бейджей:</strong> {{ progress.total_badges }}</p>
          
          <div class="categories">
            <h3>По категориям:</h3>
            <div v-for="(cat, name) in progress.categories" :key="name" class="category-item">
              {{ name }}: {{ cat.earned }}/{{ cat.total }}
            </div>
          </div>
          
          <div class="levels">
            <h3>По уровням:</h3>
            <div v-for="(count, level) in progress.levels" :key="level" class="level-item">
              {{ level }}: {{ count }}
            </div>
          </div>
        </div>
      </section>

      <!-- Секция навыков -->
      <section class="skills-section">
        <h2>🔧 Пересчет навыков</h2>
        <button @click="recalculateSkills" :disabled="loading">
          {{ loading ? 'Пересчитываем...' : 'Пересчитать навыки' }}
        </button>
        
        <div v-if="skills.length" class="skills-display">
          <div v-for="skill in skills" :key="skill.id" class="skill-item">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-levels">
              Base: {{ skill.base_level }} → Calculated: {{ skill.calculated_level }}
              <span v-if="skill.calculated_level > skill.base_level" class="bonus">
                (+{{ skill.calculated_level - skill.base_level }})
              </span>
            </span>
          </div>
        </div>
      </section>

      <!-- Секция выдачи бейджей -->
      <section class="badge-award-section">
        <h2>🏆 Выдача бейджей</h2>
        
        <div class="award-form">
          <select v-model="selectedBadgeId" class="badge-select">
            <option value="">Выберите бейдж...</option>
            <option v-for="badge in availableBadges" :key="badge.id" :value="badge.id">
              {{ badge.name }} ({{ badge.level }})
            </option>
          </select>
          
          <input 
            v-model="awardReason" 
            placeholder="Причина выдачи" 
            class="reason-input"
          />
          
          <button 
            @click="awardTestBadge" 
            :disabled="!selectedBadgeId || !awardReason || loading"
          >
            {{ loading ? 'Выдаем...' : 'Выдать бейдж' }}
          </button>
        </div>
      </section>

      <!-- Секция каталога -->
      <section class="catalog-section">
        <h2>📚 Каталог бейджей</h2>
        <button @click="loadCatalog" :disabled="loading">
          {{ loading ? 'Загрузка...' : 'Загрузить каталог' }}
        </button>
        
        <div v-if="catalog.length" class="catalog-display">
          <div v-for="badge in catalog" :key="badge.id" class="catalog-item">
            <div class="badge-info">
              <h4>{{ badge.name }}</h4>
              <p>{{ badge.description }}</p>
              <span class="badge-meta">{{ badge.category }} | {{ badge.level }}</span>
              <span v-if="badge.is_company_generated" class="company-badge">Корпоративный</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Результаты и ошибки -->
    <div v-if="result" class="result-display">
      <h3>Результат:</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>

    <div v-if="error" class="error-display">
      <h3>Ошибка:</h3>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useProfileStore } from '../stores/profile.js'
import { gamificationService } from '../services/gamification.service.js'
import { badgesService } from '../services/badges.service.js'

const profileStore = useProfileStore()

// Состояние компонента
const testUserId = ref('')
const loading = ref(false)
const error = ref(null)
const result = ref(null)

// Данные для тестирования
const progress = ref(null)
const skills = ref([])
const availableBadges = ref([])
const catalog = ref([])

// Форма выдачи бейджей
const selectedBadgeId = ref('')
const awardReason = ref('')

/**
 * Загрузить тестового пользователя
 */
async function loadTestUser() {
  try {
    loading.value = true
    error.value = null
    
    // Загружаем базовые данные пользователя
    await profileStore.loadUserData(testUserId.value)
    skills.value = profileStore.skills
    
    result.value = { message: 'Пользователь загружен', userId: testUserId.value }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

/**
 * Загрузить прогресс геймификации
 */
async function loadProgress() {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: err } = await profileStore.getGameProgress(testUserId.value)
    if (err) throw err
    
    progress.value = data
    result.value = { message: 'Прогресс загружен', data }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

/**
 * Пересчитать навыки пользователя
 */
async function recalculateSkills() {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: err } = await profileStore.recalcSkills(testUserId.value)
    if (err) throw err
    
    skills.value = profileStore.skills
    result.value = { message: 'Навыки пересчитаны', data }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

/**
 * Выдать тестовый бейдж
 */
async function awardTestBadge() {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: err } = await profileStore.awardBadge(
      selectedBadgeId.value,
      testUserId.value,
      awardReason.value
    )
    if (err) throw err
    
    // Очищаем форму
    selectedBadgeId.value = ''
    awardReason.value = ''
    
    result.value = { message: 'Бейдж выдан', data }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

/**
 * Загрузить каталог бейджей
 */
async function loadCatalog() {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: err } = await badgesService.getCatalog()
    if (err) throw err
    
    catalog.value = data
    availableBadges.value = data
    result.value = { message: 'Каталог загружен', count: data.length }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.r4-test-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.user-selector {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.user-input {
  width: 300px;
  padding: 8px 12px;
  margin: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.test-sections {
  display: grid;
  gap: 30px;
}

.test-sections section {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.test-sections h2 {
  margin-top: 0;
  color: #333;
}

button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #4338ca;
}

.progress-display, .skills-display, .catalog-display {
  margin-top: 15px;
}

.categories, .levels {
  margin: 15px 0;
}

.category-item, .level-item {
  background: #f9fafb;
  padding: 8px 12px;
  margin: 5px 0;
  border-radius: 4px;
  border-left: 3px solid #4f46e5;
}

.skill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.skill-name {
  font-weight: 600;
}

.skill-levels {
  font-family: monospace;
}

.bonus {
  color: #10b981;
  font-weight: bold;
}

.award-form {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.badge-select, .reason-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.badge-select {
  min-width: 200px;
}

.reason-input {
  min-width: 250px;
}

.catalog-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
}

.badge-info h4 {
  margin: 0 0 8px 0;
  color: #374151;
}

.badge-info p {
  margin: 0 0 8px 0;
  color: #6b7280;
}

.badge-meta {
  background: #f3f4f6;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: #4b5563;
}

.company-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  margin-left: 8px;
}

.result-display, .error-display {
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
}

.result-display {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.error-display {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}
</style>
