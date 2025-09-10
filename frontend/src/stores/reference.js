import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase.js'

export const useReferenceStore = defineStore('reference', () => {
  const cities = ref([])
  const specializations = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Демо данные для разработки
  const demoCities = [
    { id: 1, name: 'Астана', region: 'Акмолинская область' },
    { id: 2, name: 'Алматы', region: 'Алматинская область' },
    { id: 3, name: 'Шымкент', region: 'Туркестанская область' },
    { id: 4, name: 'Караганда', region: 'Карагандинская область' },
    { id: 5, name: 'Актобе', region: 'Актюбинская область' },
    { id: 6, name: 'Тараз', region: 'Жамбылская область' },
    { id: 7, name: 'Павлодар', region: 'Павлодарская область' },
    { id: 8, name: 'Усть-Каменогорск', region: 'Восточно-Казахстанская область' },
    { id: 9, name: 'Семей', region: 'Восточно-Казахстанская область' },
    { id: 10, name: 'Атырау', region: 'Атырауская область' },
    { id: 11, name: 'Костанай', region: 'Костанайская область' },
    { id: 12, name: 'Кызылорда', region: 'Кызылординская область' },
    { id: 13, name: 'Актау', region: 'Мангистауская область' },
    { id: 14, name: 'Петропавловск', region: 'Северо-Казахстанская область' },
    { id: 15, name: 'Орал', region: 'Западно-Казахстанская область' }
  ]

  const demoSpecializations = [
    { id: 1, name: 'Повар', category: 'Кухня' },
    { id: 2, name: 'Су-шеф', category: 'Кухня' },
    { id: 3, name: 'Шеф-повар', category: 'Кухня' },
    { id: 4, name: 'Пекарь', category: 'Кухня' },
    { id: 5, name: 'Кондитер', category: 'Кухня' },
    { id: 6, name: 'Официант', category: 'Зал' },
    { id: 7, name: 'Бармен', category: 'Зал' },
    { id: 8, name: 'Администратор зала', category: 'Зал' },
    { id: 9, name: 'Хостес', category: 'Зал' },
    { id: 10, name: 'Сомелье', category: 'Зал' },
    { id: 11, name: 'Управляющий', category: 'Управление' },
    { id: 12, name: 'Менеджер', category: 'Управление' },
    { id: 13, name: 'Директор ресторана', category: 'Управление' },
    { id: 14, name: 'Посудомойщик', category: 'Подсобные' },
    { id: 15, name: 'Уборщик', category: 'Подсобные' },
    { id: 16, name: 'Курьер', category: 'Доставка' },
    { id: 17, name: 'Водитель доставки', category: 'Доставка' }
  ]

  // Загрузка городов (сначала из БД, потом демо данные)
  const loadCities = async () => {
    if (cities.value.length > 0) return // Уже загружены

    loading.value = true
    error.value = null

    try {
      // Пытаемся загрузить из БД
      const { data, error: fetchError } = await supabase
        .from('cities')
        .select('*')
        .order('is_popular', { ascending: false })
        .order('name')
      
      if (fetchError) {
        console.warn('БД недоступна, используем демо данные:', fetchError.message)
        throw fetchError
      }
      
      // Преобразуем DECIMAL ID в строки для совместимости
      cities.value = (data || []).map(city => ({
        ...city,
        id: city.id?.toString() || city.id,
        string_id: city.id?.toString() || city.id
      }))
      
      console.log('🏙️ Loaded cities from DB:', cities.value.length)
      
      // Если БД пустая, используем демо данные
      if (cities.value.length === 0) {
        cities.value = demoCities
        console.log('🏙️ Using demo cities:', cities.value.length)
      }
    } catch (err) {
      error.value = err.message
      console.error('Ошибка загрузки городов из БД, используем демо данные:', err)
      // Фолбэк на демо данные
      cities.value = demoCities
    } finally {
      loading.value = false
    }
  }

  // Загрузка специализаций (сначала из БД, потом демо данные)
  const loadSpecializations = async () => {
    if (specializations.value.length > 0) return // Уже загружены

    loading.value = true
    error.value = null

    try {
      // Пытаемся загрузить из БД
      const { data, error: fetchError } = await supabase
        .from('specializations')
        .select('*')
        .order('is_popular', { ascending: false })
        .order('name')
      
      if (fetchError) {
        console.warn('Таблица specializations не найдена, используем демо данные:', fetchError.message)
        throw fetchError
      }
      
      specializations.value = data || []
      console.log('🎯 Loaded specializations from DB:', specializations.value.length)
      
      // Если БД пустая, используем демо данные
      if (specializations.value.length === 0) {
        specializations.value = demoSpecializations
        console.log('🎯 Using demo specializations:', specializations.value.length)
      }
    } catch (err) {
      error.value = err.message
      console.error('Ошибка загрузки специализаций из БД, используем демо данные:', err)
      // Фолбэк на демо данные
      specializations.value = demoSpecializations
    } finally {
      loading.value = false
    }
  }

  // Загрузка всех справочников
  const loadAll = async () => {
    await Promise.all([
      loadCities(),
      loadSpecializations()
    ])
  }

  // Поиск города по ID
  const getCityById = (id) => {
    return cities.value.find(city => city.id === id)
  }

  // Поиск специализации по ID
  const getSpecializationById = (id) => {
    return specializations.value.find(spec => spec.id === id)
  }

  // Фильтрация городов по тексту
  const searchCities = (query) => {
    if (!query) return cities.value
    const lowerQuery = query.toLowerCase()
    return cities.value.filter(city => 
      city.name.toLowerCase().includes(lowerQuery) ||
      city.region.toLowerCase().includes(lowerQuery)
    )
  }

  // Фильтрация специализаций по тексту
  const searchSpecializations = (query) => {
    if (!query) return specializations.value
    const lowerQuery = query.toLowerCase()
    return specializations.value.filter(spec => 
      spec.name.toLowerCase().includes(lowerQuery) ||
      spec.category.toLowerCase().includes(lowerQuery)
    )
  }

  // Группировка специализаций по категориям
  const getSpecializationsByCategory = () => {
    const categories = {}
    specializations.value.forEach(spec => {
      if (!categories[spec.category]) {
        categories[spec.category] = []
      }
      categories[spec.category].push(spec)
    })
    return categories
  }

  // Computed геттеры для популярных элементов
  const popularCities = computed(() => 
    cities.value.filter(city => city.is_popular === true)
  )

  const popularSpecializations = computed(() => 
    specializations.value.filter(spec => spec.is_popular === true)
  )

  return {
    // State
    cities,
    specializations,
    loading,
    error,

    // Actions
    loadCities,
    loadSpecializations,
    loadAll,

    // Getters
    getCityById,
    getSpecializationById,
    searchCities,
    searchSpecializations,
    getSpecializationsByCategory,

    // Computed
    popularCities,
    popularSpecializations
  }
})
