// Справочник городов Казахстана для ShiftworkKZ
// Нумерация согласно принципу: областной центр = код региона, другие города = код.1, код.2 и т.д.
export const CITIES = [
  // Города республиканского значения
  { id: 1, name: 'Астана', region: 'город Астана', regionCode: '01', isPopular: true },
  { id: 2, name: 'Алматы', region: 'город Алматы', regionCode: '02', isPopular: true },
  { id: 17, name: 'Шымкент', region: 'город Шымкент', regionCode: '17', isPopular: true },
  
  // Акмолинская область (03)
  { id: 3, name: 'Кокшетау', region: 'Акмолинская область', regionCode: '03', isPopular: true },
  { id: 3.1, name: 'Степногорск', region: 'Акмолинская область', regionCode: '03', isPopular: false },
  
  // Актюбинская область (04)
  { id: 4, name: 'Актобе', region: 'Актюбинская область', regionCode: '04', isPopular: true },
  
  // Алматинская область (05)
  { id: 5, name: 'Талдыкорган', region: 'Алматинская область', regionCode: '05', isPopular: true },
  { id: 5.1, name: 'Капчагай', region: 'Алматинская область', regionCode: '05', isPopular: false },
  
  // Атырауская область (06)
  { id: 6, name: 'Атырау', region: 'Атырауская область', regionCode: '06', isPopular: true },
  
  // Западно-Казахстанская область (07)
  { id: 7, name: 'Уральск', region: 'Западно-Казахстанская область', regionCode: '07', isPopular: true },
  
  // Жамбылская область (08)
  { id: 8, name: 'Тараз', region: 'Жамбылская область', regionCode: '08', isPopular: true },
  
  // Карагандинская область (09)
  { id: 9, name: 'Караганда', region: 'Карагандинская область', regionCode: '09', isPopular: true },
  { id: 9.1, name: 'Темиртау', region: 'Карагандинская область', regionCode: '09', isPopular: false },
  { id: 9.2, name: 'Жезказган', region: 'Карагандинская область', regionCode: '09', isPopular: false },
  { id: 9.3, name: 'Балхаш', region: 'Карагандинская область', regionCode: '09', isPopular: false },
  { id: 9.4, name: 'Сарань', region: 'Карагандинская область', regionCode: '09', isPopular: false },
  
  // Костанайская область (10)
  { id: 10, name: 'Костанай', region: 'Костанайская область', regionCode: '10', isPopular: true },
  { id: 10.1, name: 'Рудный', region: 'Костанайская область', regionCode: '10', isPopular: false },
  { id: 10.2, name: 'Лисаковск', region: 'Костанайская область', regionCode: '10', isPopular: false },
  
  // Кызылординская область (11)
  { id: 11, name: 'Кызылорда', region: 'Кызылординская область', regionCode: '11', isPopular: true },
  
  // Мангистауская область (12)
  { id: 12, name: 'Актау', region: 'Мангистауская область', regionCode: '12', isPopular: true },
  { id: 12.1, name: 'Жанаозен', region: 'Мангистауская область', regionCode: '12', isPopular: false },
  
  // Туркестанская область (13)
  { id: 13, name: 'Туркестан', region: 'Туркестанская область', regionCode: '13', isPopular: true },
  { id: 13.1, name: 'Кентау', region: 'Туркестанская область', regionCode: '13', isPopular: false },
  { id: 13.2, name: 'Арысь', region: 'Туркестанская область', regionCode: '13', isPopular: false },
  
  // Павлодарская область (14)
  { id: 14, name: 'Павлодар', region: 'Павлодарская область', regionCode: '14', isPopular: true },
  { id: 14.1, name: 'Экибастуз', region: 'Павлодарская область', regionCode: '14', isPopular: false },
  
  // Северо-Казахстанская область (15)
  { id: 15, name: 'Петропавловск', region: 'Северо-Казахстанская область', regionCode: '15', isPopular: true },
  
  // Восточно-Казахстанская область (16)
  { id: 16, name: 'Усть-Каменогорск', region: 'Восточно-Казахстанская область', regionCode: '16', isPopular: true },
  { id: 16.1, name: 'Риддер', region: 'Восточно-Казахстанская область', regionCode: '16', isPopular: false },
  
  // Абайская область (18) - новая область с 2022 года
  { id: 18, name: 'Семей', region: 'Абайская область', regionCode: '18', isPopular: true },
  
  // Жетысуская область (19) - новая область с 2022 года  
  { id: 19, name: 'Талдыкорган', region: 'Жетысуская область', regionCode: '19', isPopular: true },
  
  // Улытауская область (20) - новая область с 2022 года
  { id: 20, name: 'Жезказган', region: 'Улытауская область', regionCode: '20', isPopular: true }
]

// Функции для работы с городами
export const getCityById = (id) => {
  return CITIES.find(city => city.id === id)
}

export const getCityByName = (name) => {
  return CITIES.find(city => city.name.toLowerCase() === name.toLowerCase())
}

export const getCityByRegionCode = (code) => {
  return CITIES.filter(city => city.regionCode === code)
}

export const getPopularCities = () => {
  return CITIES.filter(city => city.isPopular)
}

export const getAllCities = () => {
  return CITIES
}

export const searchCities = (query) => {
  const lowercaseQuery = query.toLowerCase()
  return CITIES.filter(city => 
    city.name.toLowerCase().includes(lowercaseQuery) ||
    city.region.toLowerCase().includes(lowercaseQuery) ||
    city.regionCode.includes(lowercaseQuery)
  )
}

// Валидация города
export const isValidCity = (cityName) => {
  return CITIES.some(city => city.name === cityName)
}

// Группировка по регионам с учетом кодов
export const getCitiesByRegion = () => {
  const grouped = {}
  CITIES.forEach(city => {
    const regionKey = `${city.regionCode} — ${city.region}`
    if (!grouped[regionKey]) {
      grouped[regionKey] = []
    }
    grouped[regionKey].push(city)
  })
  return grouped
}

// Получить регионы в порядке официальной нумерации
export const getRegionsInOrder = () => {
  const regions = new Map()
  
  CITIES.forEach(city => {
    const regionKey = `${city.regionCode} — ${city.region}`
    if (!regions.has(regionKey)) {
      regions.set(regionKey, {
        code: city.regionCode,
        name: city.region,
        cities: []
      })
    }
    regions.get(regionKey).cities.push(city)
  })
  
  // Сортируем по коду региона
  return Array.from(regions.values()).sort((a, b) => 
    parseInt(a.code) - parseInt(b.code)
  )
}
