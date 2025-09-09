import { ref, computed } from 'vue'
import { citiesService } from '@/services/cities.service.js'

const allCities = ref([])
const popularCities = ref([])
const selectedCity = ref(null)
const isLoading = ref(false)

export function useCities() {
  
  // Загрузить все города
  const loadCities = async () => {
    if (allCities.value.length > 0) return // Уже загружены
    
    try {
      isLoading.value = true
      const { data, error } = await citiesService.getAllCities()
      
      if (error) throw error
      
      allCities.value = data || []
      popularCities.value = data?.filter(city => city.is_popular) || []
      
    } catch (error) {
      console.error('Error loading cities:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Поиск городов
  const searchCities = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      return allCities.value
    }
    
    try {
      const { data, error } = await citiesService.searchCities(searchTerm)
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching cities:', error)
      return []
    }
  }

  // Получить город по ID
  const getCityById = (id) => {
    return allCities.value.find(city => city.id === id)
  }

  // Получить город по названию
  const getCityByName = (name) => {
    return allCities.value.find(city => 
      city.name.toLowerCase() === name.toLowerCase()
    )
  }

  // Установить выбранный город
  const setSelectedCity = (city) => {
    selectedCity.value = city
    
    // Сохраняем в localStorage для persist
    if (city) {
      localStorage.setItem('selectedCity', JSON.stringify(city))
    } else {
      localStorage.removeItem('selectedCity')
    }
  }

  // Загрузить выбранный город из localStorage
  const loadSelectedCity = () => {
    try {
      const saved = localStorage.getItem('selectedCity')
      if (saved) {
        selectedCity.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading selected city from localStorage:', error)
    }
  }

  // Создать запрос на добавление города
  const requestNewCity = async (cityName, region, email = null) => {
    try {
      const { data, error } = await citiesService.createCityRequest(
        cityName, 
        region, 
        email
      )
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error requesting new city:', error)
      return { success: false, error: error.message }
    }
  }

  // Вычисляемые свойства
  const citiesGroupedByRegion = computed(() => {
    const grouped = {}
    allCities.value.forEach(city => {
      if (!grouped[city.region]) {
        grouped[city.region] = []
      }
      grouped[city.region].push(city)
    })
    return grouped
  })

  const hasSelectedCity = computed(() => {
    return selectedCity.value !== null
  })

  const selectedCityName = computed(() => {
    return selectedCity.value?.name || null
  })

  // Фильтрация вакансий по выбранному городу
  const filterJobsByCity = (jobs) => {
    if (!selectedCity.value) return jobs
    
    return jobs.filter(job => 
      job.city_id === selectedCity.value.id
    )
  }

  // Инициализация
  const initialize = async () => {
    loadSelectedCity()
    await loadCities()
  }

  return {
    // Состояние
    allCities,
    popularCities,
    selectedCity,
    isLoading,
    
    // Вычисляемые
    citiesGroupedByRegion,
    hasSelectedCity,
    selectedCityName,
    
    // Методы
    loadCities,
    searchCities,
    getCityById,
    getCityByName,
    setSelectedCity,
    loadSelectedCity,
    requestNewCity,
    filterJobsByCity,
    initialize
  }
}

// Композабл для админских функций
export function useCitiesAdmin() {
  const cityRequests = ref([])
  const citiesStats = ref([])
  const isLoading = ref(false)

  // Загрузить запросы на добавление городов
  const loadCityRequests = async () => {
    try {
      isLoading.value = true
      const { data, error } = await citiesService.getAllCityRequests()
      
      if (error) throw error
      cityRequests.value = data || []
    } catch (error) {
      console.error('Error loading city requests:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Загрузить статистику по городам
  const loadCitiesStats = async () => {
    try {
      const { data, error } = await citiesService.getCitiesStats()
      if (error) throw error
      citiesStats.value = data || []
    } catch (error) {
      console.error('Error loading cities stats:', error)
    }
  }

  // Добавить новый город
  const addCity = async (cityData) => {
    try {
      const { data, error } = await citiesService.addCity(cityData)
      if (error) throw error
      
      // Перезагрузим список городов
      allCities.value.push(data)
      
      return { success: true, data }
    } catch (error) {
      console.error('Error adding city:', error)
      return { success: false, error: error.message }
    }
  }

  // Обновить статус запроса
  const updateRequestStatus = async (requestId, status, comment = null) => {
    try {
      const { data, error } = await citiesService.updateCityRequestStatus(
        requestId, 
        status, 
        comment
      )
      
      if (error) throw error
      
      // Обновляем локальный список
      const index = cityRequests.value.findIndex(req => req.id === requestId)
      if (index !== -1) {
        cityRequests.value[index] = data
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Error updating request status:', error)
      return { success: false, error: error.message }
    }
  }

  // Переключить популярность города
  const toggleCityPopular = async (cityId, isPopular) => {
    try {
      const { data, error } = await citiesService.toggleCityPopular(cityId, isPopular)
      if (error) throw error
      
      // Обновляем локальный список
      const city = allCities.value.find(c => c.id === cityId)
      if (city) {
        city.is_popular = isPopular
      }
      
      // Перестраиваем список популярных
      popularCities.value = allCities.value.filter(city => city.is_popular)
      
      return { success: true, data }
    } catch (error) {
      console.error('Error toggling city popular status:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    // Состояние
    cityRequests,
    citiesStats,
    isLoading,
    
    // Методы
    loadCityRequests,
    loadCitiesStats,
    addCity,
    updateRequestStatus,
    toggleCityPopular
  }
}
