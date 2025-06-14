<template>
  <div class="companies-page">
    <div class="companies-page__header">
      <h1 class="companies-page__title">Компании</h1>
      <div class="companies-page__filters">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск компаний..."
          class="companies-page__search"
        >
        <select v-model="selectedIndustry" class="companies-page__select">
          <option value="">Все отрасли</option>
          <option v-for="industry in industries" :key="industry.id" :value="industry.id">
            {{ industry.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="companies-page__loading">
      Загрузка...
    </div>

    <div v-else-if="error" class="companies-page__error">
      {{ error }}
    </div>

    <template v-else>
      <div class="companies-page__grid">
        <div
          v-for="company in filteredCompanies"
          :key="company.id"
          class="companies-page__card"
        >
          <div class="companies-page__logo">
            <img :src="company.logo || '/default-company.png'" alt="Логотип компании" class="companies-page__logo-image">
          </div>
          <h3 class="companies-page__name">{{ company.name }}</h3>
          <div class="companies-page__industry">{{ company.industry }}</div>
          <div class="companies-page__location">{{ company.location }}</div>
          <div class="companies-page__description">{{ company.description }}</div>
          <div class="companies-page__stats">
            <div class="companies-page__stat">
              <span class="companies-page__stat-value">{{ company.openPositions }}</span>
              <span class="companies-page__stat-label">Открытых вакансий</span>
            </div>
            <div class="companies-page__stat">
              <span class="companies-page__stat-value">{{ company.employees }}</span>
              <span class="companies-page__stat-label">Сотрудников</span>
            </div>
          </div>
          <button @click="handleViewCompany(company)" class="companies-page__view">
            Подробнее
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const error = ref(null)
const companies = ref([])
const searchQuery = ref('')
const selectedIndustry = ref('')

const industries = ref([
  { id: 1, name: 'IT' },
  { id: 2, name: 'Финансы' },
  { id: 3, name: 'Медицина' },
  { id: 4, name: 'Образование' }
])

const loadCompanies = async () => {
  try {
    loading.value = true
    error.value = null
    // В реальном приложении здесь будет API запрос
    companies.value = [
      {
        id: 1,
        name: 'Tech Solutions',
        industry: 'IT',
        location: 'Москва',
        description: 'Инновационная IT-компания, специализирующаяся на разработке программного обеспечения.',
        logo: null,
        openPositions: 5,
        employees: 100
      },
      {
        id: 2,
        name: 'Finance Pro',
        industry: 'Финансы',
        location: 'Санкт-Петербург',
        description: 'Ведущая финансовая компания, предоставляющая широкий спектр услуг.',
        logo: null,
        openPositions: 3,
        employees: 50
      }
    ]
  } catch (e) {
    error.value = 'Ошибка загрузки компаний'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const filteredCompanies = computed(() => {
  return companies.value.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesIndustry = !selectedIndustry.value || company.industry === selectedIndustry.value
    return matchesSearch && matchesIndustry
  })
})

const handleViewCompany = (company) => {
  // В реальном приложении здесь будет переход на страницу компании
  console.log('Просмотр компании:', company)
}

onMounted(() => {
  loadCompanies()
})
</script>

<style scoped>
.companies-page {
  padding: 2rem;
  background: var(--color-bg);
}

.companies-page__header {
  margin-bottom: 2rem;
}

.companies-page__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.companies-page__filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.companies-page__search,
.companies-page__select {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: var(--color-card);
  color: var(--color-text);
  transition: border-color 0.2s;
}

.companies-page__search {
  flex: 1;
}

.companies-page__search:focus,
.companies-page__select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.companies-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.companies-page__card {
  background: var(--color-card);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: var(--color-shadow);
  transition: transform 0.2s;
}

.companies-page__card:hover {
  transform: translateY(-2px);
}

.companies-page__logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--color-accent);
}

.companies-page__logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.companies-page__name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
  color: var(--color-text);
}

.companies-page__industry {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.companies-page__location {
  color: var(--color-secondary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.companies-page__description {
  color: var(--color-text);
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.5;
}

.companies-page__stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.companies-page__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.companies-page__stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.companies-page__stat-label {
  font-size: 0.875rem;
  color: var(--color-secondary);
}

.companies-page__view {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.companies-page__view:hover {
  background: var(--color-secondary);
}

.companies-page__loading,
.companies-page__error {
  text-align: center;
  padding: 2rem;
  font-size: 1.25rem;
  color: var(--color-text);
}

.companies-page__error {
  color: #e53e3e;
}
</style> 