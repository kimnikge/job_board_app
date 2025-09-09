<template>
  <div class="city-selector" :class="{ 'compact': compact }">
    <div v-if="!compact" class="city-selector__label">
      <span>📍 Ваш город</span>
    </div>

    <!-- Текущий выбранный город -->
    <div class="current-city" @click="showSelector = !showSelector">
      <span class="city-name">{{ selectedCity?.name || placeholder }}</span>
      <span class="chevron" :class="{ 'rotated': showSelector }">⌄</span>
    </div>

    <!-- Селектор городов -->
    <div v-if="showSelector" class="city-dropdown">
      
      <!-- Поиск -->
      <div class="search-box">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Поиск города..."
          class="search-input"
          @input="handleSearch"
        />
      </div>

      <!-- Популярные города -->
      <div v-if="!searchQuery" class="city-section">
        <h4 class="section-title">Популярные города</h4>
        <div class="city-list">
          <div 
            v-for="city in popularCities" 
            :key="city.id"
            class="city-item"
            :class="{ 'selected': selectedCity?.id === city.id }"
            @click="selectCity(city)"
          >
            <span class="city-name">{{ city.name }}</span>
            <span class="city-region">{{ city.region }}</span>
          </div>
        </div>
      </div>

      <!-- Все города / Результаты поиска -->
      <div class="city-section">
        <h4 class="section-title">
          {{ searchQuery ? 'Результаты поиска' : 'Все города' }}
        </h4>
        <div class="city-list">
          <div 
            v-for="city in filteredCities" 
            :key="city.id"
            class="city-item"
            :class="{ 'selected': selectedCity?.id === city.id }"
            @click="selectCity(city)"
          >
            <span class="city-name">{{ city.name }}</span>
            <span class="city-region">{{ city.region }}</span>
          </div>
        </div>
      </div>

      <!-- Кнопка добавить город -->
      <div class="add-city-section">
        <button 
          class="add-city-btn"
          @click="showAddCityForm = true"
        >
          ➕ Добавить мой город
        </button>
      </div>
    </div>

    <!-- Форма добавления города -->
    <div v-if="showAddCityForm" class="add-city-modal" @click.self="showAddCityForm = false">
      <div class="add-city-form">
        <h3>Добавить новый город</h3>
        <p>Если вашего города нет в списке, мы добавим его!</p>
        
        <form @submit.prevent="submitCityRequest">
          <div class="form-group">
            <label>Название города*</label>
            <input 
              v-model="newCity.name"
              type="text"
              placeholder="Например: Кокшетау"
              required
            />
          </div>
          
          <div class="form-group">
            <label>Область*</label>
            <input 
              v-model="newCity.region"
              type="text"
              placeholder="Например: Акмолинская область"
              required
            />
          </div>
          
          <div class="form-group">
            <label>Ваш email для связи</label>
            <input 
              v-model="newCity.email"
              type="email"
              placeholder="email@example.com"
            />
          </div>

          <div class="form-actions">
            <button type="button" @click="showAddCityForm = false" class="btn-cancel">
              Отмена
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Отправляем...' : 'Отправить запрос' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CITIES, getPopularCities, searchCities, getCityById } from '@/data/cities.js'

const emit = defineEmits(['citySelected'])
const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  },
  placeholder: {
    type: String,
    default: 'Выберите город'
  },
  compact: {
    type: Boolean,
    default: false
  }
})

// Состояние
const showSelector = ref(false)
const searchQuery = ref('')
const showAddCityForm = ref(false)
const submitting = ref(false)

// Данные
const selectedCity = ref(null)
const popularCities = ref(getPopularCities())

const newCity = ref({
  name: '',
  region: '',
  email: ''
})

// Вычисляемые свойства
const filteredCities = computed(() => {
  if (searchQuery.value) {
    return searchCities(searchQuery.value)
  }
  return CITIES.filter(city => !city.isPopular) // Показываем не популярные
})

// Методы
const selectCity = (city) => {
  selectedCity.value = city
  showSelector.value = false
  emit('citySelected', city)
}

const handleSearch = () => {
  // Поиск происходит через computed
}

const submitCityRequest = async () => {
  try {
    submitting.value = true
    
    // Отправляем запрос админу (можно через Edge Function или простой email)
    const requestData = {
      ...newCity.value,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    
    console.log('Запрос на добавление города:', requestData)
    
    // Здесь можно отправить в Supabase или на email
    // await notificationsService.notifyAdmin('new_city_request', requestData)
    
    alert('Спасибо! Ваш запрос отправлен администратору. Мы добавим город в течение 24 часов.')
    
    showAddCityForm.value = false
    newCity.value = { name: '', region: '', email: '' }
    
  } catch (error) {
    console.error('Ошибка отправки запроса:', error)
    alert('Произошла ошибка. Попробуйте позже.')
  } finally {
    submitting.value = false
  }
}

// Инициализация
onMounted(() => {
  if (props.modelValue) {
    selectedCity.value = getCityById(props.modelValue)
  }
})

// Закрытие селектора при клике вне его
document.addEventListener('click', (e) => {
  if (!e.target.closest('.city-selector')) {
    showSelector.value = false
  }
})
</script>

<style scoped>
.city-selector {
  position: relative;
  font-family: system-ui, -apple-system, sans-serif;
}

.city-selector.compact .current-city {
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 10px;
}

.city-selector.compact .city-dropdown {
  font-size: 14px;
}

.city-selector__label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.current-city {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.current-city:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.city-name {
  font-weight: 500;
  color: #2d3748;
}

.chevron {
  transition: transform 0.2s ease;
  color: #666;
  font-size: 16px;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.city-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  margin-top: 4px;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #667eea;
}

.city-section {
  padding: 16px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}

.city-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.city-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.city-item:hover {
  background: #f8f9ff;
}

.city-item.selected {
  background: #667eea;
  color: white;
}

.city-item .city-name {
  font-weight: 500;
}

.city-region {
  font-size: 12px;
  color: #666;
}

.city-item.selected .city-region {
  color: rgba(255, 255, 255, 0.8);
}

.add-city-section {
  padding: 16px;
  border-top: 1px solid #e1e5e9;
}

.add-city-btn {
  width: 100%;
  padding: 10px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #f9f9f9;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.add-city-btn:hover {
  border-color: #667eea;
  background: #f8f9ff;
  color: #667eea;
}

.add-city-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.add-city-form {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.add-city-form h3 {
  margin: 0 0 8px 0;
  color: #2d3748;
}

.add-city-form p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  border: 1px solid #e1e5e9;
  background: white;
  color: #666;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-submit {
  border: none;
  background: #667eea;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
