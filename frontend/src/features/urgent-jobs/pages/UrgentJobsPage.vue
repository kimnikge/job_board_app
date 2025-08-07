<!--
  🚨 ГЛАВНАЯ СТРАНИЦА СРОЧНЫХ ВАКАНСИЙ
  
  Страница "НУЖНЫ СЕГОДНЯ/ЗАВТРА" для общепита Астаны
-->

<template>
  <div class="urgent-jobs-page">
    <!-- Заголовок и статус готовности -->
    <header class="urgent-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            🚨 НУЖНЫ СЕГОДНЯ/ЗАВТРА
          </h1>
          <p class="page-subtitle">
            Срочные вакансии в общепите Астаны
          </p>
        </div>
        
        <!-- Переключатель готовности -->
        <div class="ready-section">
          <BaseButton
            :variant="isReady ? 'success' : 'outline'"
            :icon-left="isReady ? 'check-circle' : 'clock'"
            size="large"
            rounded
            @click="toggleReady"
            :class="['ready-toggle', { 'ready-active': isReady }]"
          >
            {{ readyText }}
          </BaseButton>
          
          <span class="ready-hint">
            {{ isReady ? 'Вы получите уведомления о новых срочных вакансиях' : 'Включите, чтобы получать уведомления' }}
          </span>
        </div>
      </div>
      
      <!-- Статистика -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ stats.active }}</span>
          <span class="stat-label">Активные</span>
        </div>
        <div class="stat-item critical">
          <span class="stat-value">{{ stats.critical }}</span>
          <span class="stat-label">Критичные</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.today }}</span>
          <span class="stat-label">На сегодня</span>
        </div>
      </div>
    </header>

    <!-- Фильтры -->
    <section class="filters-section">
      <UrgentJobFilters
        @filter-change="handleFilterChange"
        :active-count="filteredCount"
      />
    </section>

    <!-- Список срочных вакансий -->
    <main class="jobs-section">
      <!-- Состояние загрузки -->
      <div v-if="loading" class="loading-state">
        <LoadingSpinner 
          size="large" 
          variant="pulse" 
          color="danger"
          text="Загружаем срочные вакансии..."
        />
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error" class="error-state">
        <BaseCard variant="outlined" size="medium">
          <div class="error-content">
            <DynamicIcon name="alert-triangle" class="error-icon" />
            <h3>Ошибка загрузки</h3>
            <p>{{ error }}</p>
            <BaseButton 
              variant="primary" 
              icon-left="refresh-cw"
              @click="retry"
            >
              Попробовать снова
            </BaseButton>
          </div>
        </BaseCard>
      </div>
      
      <!-- Пустое состояние -->
      <div v-else-if="!jobs.length" class="empty-state">
        <BaseCard variant="glass" size="large">
          <div class="empty-content">
            <DynamicIcon name="briefcase" class="empty-icon" />
            <h3>Пока нет срочных вакансий</h3>
            <p v-if="hasActiveFilters">
              Попробуйте изменить фильтры или 
              <button @click="clearFilters" class="link-button">сбросить все фильтры</button>
            </p>
            <p v-else>
              Новые срочные вакансии появятся здесь автоматически
            </p>
            
            <!-- Кнопка создания для работодателей -->
            <BaseButton 
              v-if="canCreateJobs"
              variant="primary"
              icon-left="plus"
              size="large"
              @click="createUrgentJob"
            >
              Создать срочную вакансию
            </BaseButton>
          </div>
        </BaseCard>
      </div>
      
      <!-- Список вакансий -->
      <div v-else class="jobs-list">
        <TransitionGroup name="job-list" tag="div" class="jobs-grid">
          <UrgentJobCard
            v-for="job in jobs"
            :key="job.id"
            :job="job"
            @apply="handleApply"
            @view="handleView"
            class="job-item"
          />
        </TransitionGroup>
        
        <!-- Кнопка "Загрузить еще" если есть пагинация -->
        <div v-if="hasMore" class="load-more">
          <BaseButton
            variant="ghost"
            size="large"
            icon-left="chevron-down"
            :loading="loadingMore"
            @click="loadMore"
            full-width
          >
            Загрузить еще
          </BaseButton>
        </div>
      </div>
    </main>

    <!-- Floating Action Button для создания -->
    <BaseButton
      v-if="canCreateJobs && jobs.length > 0"
      variant="danger"
      size="large"
      icon-left="plus"
      rounded
      class="fab"
      @click="createUrgentJob"
      aria-label="Создать срочную вакансию"
    />
  </div>
</template>

<script>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgentJobs, useUrgentJobNotifications, useUrgentJobFilters, useUrgentJobStats } from '../composables/useUrgentJobs.js'
import { useAuth } from '../../../shared/composables/useAuth.js'

import BaseButton from '../../../shared/ui/BaseButton.vue'
import BaseCard from '../../../shared/ui/BaseCard.vue'
import LoadingSpinner from '../../../shared/ui/LoadingSpinner.vue'
import DynamicIcon from '../../../components/DynamicIcon.vue'
import UrgentJobCard from '../components/UrgentJobCard.vue'
import UrgentJobFilters from '../components/UrgentJobFilters.vue'

export default {
  name: 'UrgentJobsPage',
  components: {
    BaseButton,
    BaseCard,
    LoadingSpinner,
    DynamicIcon,
    UrgentJobCard,
    UrgentJobFilters
  },
  
  setup() {
    const router = useRouter()
    const auth = useAuth()
    
    // Композаблы
    const { jobs, loading, error, loadJobs, clearError } = useUrgentJobs()
    const { isReady, toggleReady } = useUrgentJobNotifications()
    const { filteredCount, hasActiveFilters, clearAll } = useUrgentJobFilters()
    const { stats } = useUrgentJobStats()
    
    // Computed
    const readyText = computed(() => 
      isReady.value ? '✅ ГОТОВ ВЫЙТИ' : '⏰ НЕ ГОТОВ'
    )
    
    const canCreateJobs = computed(() => 
      auth.isAuthenticated.value && (auth.isCompany.value || auth.isAdmin.value)
    )
    
    // Пагинация (пока заглушка)
    const hasMore = computed(() => false)
    const loadingMore = computed(() => false)
    
    // Методы
    async function handleApply(job) {
      if (!auth.isAuthenticated.value) {
        router.push('/auth')
        return
      }
      
      // Открываем модальное окно отклика
      // TODO: Реализовать модальное окно
      console.log('Apply to job:', job.id)
    }
    
    function handleView(job) {
      router.push(`/urgent/${job.id}`)
    }
    
    function handleFilterChange(filters) {
      console.log('Filters changed:', filters)
    }
    
    function createUrgentJob() {
      router.push('/urgent/create')
    }
    
    async function retry() {
      clearError()
      await loadJobs()
    }
    
    function clearFilters() {
      clearAll()
    }
    
    function loadMore() {
      // TODO: Реализовать пагинацию
      console.log('Load more jobs')
    }
    
    // Автозагрузка при монтировании
    onMounted(() => {
      loadJobs()
    })
    
    // Автообновление каждые 30 секунд
    let refreshInterval
    onMounted(() => {
      refreshInterval = setInterval(() => {
        if (!loading.value) {
          loadJobs()
        }
      }, 30000)
    })
    
    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })
    
    return {
      // Data
      jobs,
      loading,
      error,
      stats,
      filteredCount,
      hasActiveFilters,
      isReady,
      readyText,
      canCreateJobs,
      hasMore,
      loadingMore,
      
      // Methods
      handleApply,
      handleView,
      handleFilterChange,
      toggleReady,
      createUrgentJob,
      retry,
      clearFilters,
      loadMore
    }
  }
}
</script>

<style scoped>
.urgent-jobs-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 1rem;
}

/* 📌 ЗАГОЛОВОК */
.urgent-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.title-section h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f5576c, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.title-section p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
}

.ready-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.ready-toggle.ready-active {
  animation: pulse-success 2s infinite;
}

@keyframes pulse-success {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% { 
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
}

.ready-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: right;
  max-width: 200px;
}

/* 📊 СТАТИСТИКА */
.stats-bar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.stat-item.critical {
  background: rgba(245, 87, 108, 0.1);
  border: 1px solid rgba(245, 87, 108, 0.2);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-item.critical .stat-value {
  color: #f5576c;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 🔍 ФИЛЬТРЫ */
.filters-section {
  margin-bottom: 1.5rem;
}

/* 📋 СПИСОК ВАКАНСИЙ */
.jobs-section {
  flex: 1;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-content,
.empty-content {
  text-align: center;
  padding: 2rem;
}

.error-icon,
.empty-icon {
  width: 4rem;
  height: 4rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.error-content h3,
.empty-content h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.error-content p,
.empty-content p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.link-button {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}

.link-button:hover {
  color: var(--color-secondary);
}

/* 📱 СЕТКА ВАКАНСИЙ */
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* 🎬 АНИМАЦИИ СПИСКА */
.job-list-enter-active {
  transition: all 0.5s ease;
}

.job-list-leave-active {
  transition: all 0.3s ease;
}

.job-list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.job-list-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}

.job-list-move {
  transition: transform 0.3s ease;
}

/* 🚀 FLOATING ACTION BUTTON */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
  width: 4rem;
  height: 4rem;
  box-shadow: 0 8px 32px rgba(245, 87, 108, 0.4);
}

.fab:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 40px rgba(245, 87, 108, 0.6);
}

/* 📱 АДАПТИВНОСТЬ */
@media (max-width: 768px) {
  .urgent-jobs-page {
    padding: 0.5rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .ready-section {
    align-items: center;
  }
  
  .ready-hint {
    text-align: center;
    max-width: none;
  }
  
  .title-section h1 {
    font-size: 2rem;
    text-align: center;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .jobs-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .fab {
    bottom: 1rem;
    right: 1rem;
    width: 3.5rem;
    height: 3.5rem;
  }
}
</style>
