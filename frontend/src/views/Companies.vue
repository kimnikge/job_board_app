<template>
  <div class="companies-page">
    <!-- Header -->
    <AppHeader />
    <PageHeader 
      title="Заведения общепита"
      subtitle="Каталог кафе, ресторанов и сервисов с открытыми сменами"
    />
    
    <!-- Действия и поиск -->
    <div class="toolbar">
      <div class="search-container">
        <input 
          v-model="search" 
          class="search-input" 
          type="text" 
          placeholder="Поиск заведения..." 
        />
        <span class="result-count" v-if="filteredCompanies.length">
          {{ filteredCompanies.length }} найдено
        </span>
      </div>
      
      <div class="action-buttons">
        <button class="btn-primary" @click="refresh()">
          🔄 Обновить
        </button>
        <button 
          class="btn-secondary" 
          :class="{ active: filterUrgent }"
          @click="filterUrgent = !filterUrgent"
        >
          {{ filterUrgent ? 'Показать все' : 'Только с вакансиями' }}
        </button>
      </div>
    </div>

    <!-- Список заведений -->
    <div class="companies-grid" v-if="filteredCompanies.length">
      <BaseCard
        v-for="company in filteredCompanies"
        :key="company.id"
        :title="company.name"
        :badge="company.jobs > 0 ? { text: `${company.jobs} вакансий`, type: 'info' } : null"
        clickable
        elevated
        class="company-card"
        @click="open(company)"
      >
        <div class="company-content">
          <div class="company-logo">
            {{ company.name.charAt(0) }}
          </div>
          
          <div class="company-info">
            <div class="company-type">{{ company.type }}</div>
            <div class="company-jobs" :class="{ 'no-jobs': !company.jobs }">
              {{ company.jobs ? `${company.jobs} открытых вакансий` : 'Нет открытых вакансий' }}
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>Ничего не найдено</h3>
      <p>Попробуйте изменить критерии поиска</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import AppHeader from '@/components/AppHeader.vue'
import PageHeader from '@/components/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const router = useRouter()
const notificationsStore = useNotificationsStore()

const companies = ref([
  { id: 1, name: 'Ресторан "Астана"', type: 'Ресторан', jobs: 5 },
  { id: 2, name: 'Кафе "Барбекю"', type: 'Кафе', jobs: 3 },
  { id: 3, name: 'Пиццерия "Италия"', type: 'Пиццерия', jobs: 7 },
  { id: 4, name: 'Фаст-фуд "Burger King"', type: 'Фаст-фуд', jobs: 12 },
  { id: 5, name: 'Coffee Lab', type: 'Кофейня', jobs: 0 },
  { id: 6, name: 'Green Vegan', type: 'Ресторан', jobs: 2 }
])

const search = ref('')
const filterUrgent = ref(false)

const filteredCompanies = computed(() => {
  let list = companies.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
  }
  if (filterUrgent.value) list = list.filter(c => c.jobs > 0)
  return list
})

function refresh(){ 
  notificationsStore.showInfo('Обновление списка заведений...')
  // TODO: загрузка с API
}

function open(company){ 
  router.push(`/companies/${company.id}`)
}
</script>

<style scoped>
/* === COMPANIES PAGE === */
.companies-page {
  min-height: 100vh;
  background: #1e1e2e;
  color: #ffffff;
  padding-bottom: 80px;
  max-width: 400px;
  margin: 0 auto;
}

/* ===== ТУЛБАР ===== */
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding: 0 20px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 12px 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-border-hover);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.result-count {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--gradient-ready);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover,
.btn-secondary.active {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
}

/* ===== СЕТКА ЗАВЕДЕНИЙ ===== */
.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.company-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.company-logo {
  width: 50px;
  height: 50px;
  background: var(--gradient-urgent);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
}

.company-info {
  flex: 1;
  min-width: 0;
}

.company-type {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.company-jobs {
  color: var(--color-accent);
  font-weight: 500;
  font-size: 0.9rem;
}

.company-jobs.no-jobs {
  color: var(--color-text-muted);
}

/* ===== ПУСТОЕ СОСТОЯНИЕ ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: var(--color-text-primary);
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .toolbar {
    gap: 12px;
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: unset;
  }
  
  .companies-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .company-content {
    gap: 12px;
  }
  
  .company-logo {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }
  
  .empty-state {
    padding: 40px 16px;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
}
</style>
