<template>
  <div class="experience-timeline">
    <div class="timeline-header">
      <h3 class="timeline-title">📊 Опыт работы</h3>
      <div class="timeline-stats">
        <span class="stat-item">
          {{ totalShifts }} смен
        </span>
        <span class="stat-item">  
          {{ totalHours }} часов
        </span>
      </div>
    </div>
    
    <div class="timeline-content">
      <div 
        v-for="(log, index) in sortedWorkLogs" 
        :key="log.id"
        class="timeline-item"
        :class="{ 'active': isCurrentJob(log) }"
      >
        <!-- Линия времени -->
        <div class="timeline-line" v-if="index < sortedWorkLogs.length - 1"></div>
        
        <!-- Точка на линии -->
        <div class="timeline-dot" :class="{ 'current': isCurrentJob(log) }"></div>
        
        <!-- Карточка периода -->
        <div class="timeline-card">
          <div class="card-header">
            <img 
              :src="log.employer_logo || '/images/default-company.png'" 
              :alt="log.employer_name"
              class="employer-logo"
            />
            <div class="employer-info">
              <h4 class="employer-name">{{ log.employer_name }}</h4>
              <span class="position">{{ log.position }}</span>
            </div>
            <div class="period-badge" :class="{ 'current': isCurrentJob(log) }">
              {{ isCurrentJob(log) ? 'Текущая' : 'Завершена' }}
            </div>
          </div>
          
          <div class="card-content">
            <div class="period-dates">
              <span class="date-from">{{ formatDate(log.period_from) }}</span>
              <span class="date-separator">—</span>
              <span class="date-to">{{ formatDate(log.period_to) }}</span>
            </div>
            
            <div class="period-stats">
              <div class="stat">
                <span class="stat-icon">📅</span>
                <span class="stat-value">{{ log.shifts_count }} смен</span>
              </div>
              <div class="stat">
                <span class="stat-icon">⏱️</span>
                <span class="stat-value">{{ log.total_hours }} часов</span>
              </div>
              <div class="stat">
                <span class="stat-icon">⏱️</span>
                <span class="stat-value">{{ Math.round(log.total_hours / log.shifts_count) }} ч/смена</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  workLogs: {
    type: Array,
    default: () => []
  }
})

// Сортировка по убыванию даты (самые новые сверху)
const sortedWorkLogs = computed(() => {
  return [...props.workLogs].sort((a, b) => 
    new Date(b.period_from) - new Date(a.period_from)
  )
})

const totalShifts = computed(() => 
  props.workLogs.reduce((sum, log) => sum + log.shifts_count, 0)
)

const totalHours = computed(() =>
  props.workLogs.reduce((sum, log) => sum + log.total_hours, 0)
)

function isCurrentJob(log) {
  const today = new Date()
  const endDate = new Date(log.period_to)
  return endDate >= today
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { 
    month: 'short', 
    year: 'numeric' 
  })
}
</script>

<style scoped>
.experience-timeline {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-title {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.timeline-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  background: rgba(78, 205, 196, 0.2);
  color: #4ecdc4;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.timeline-content {
  position: relative;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
  padding-left: 40px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-line {
  position: absolute;
  left: 15px;
  top: 24px;
  bottom: -24px;
  width: 2px;
  background: rgba(255, 255, 255, 0.2);
}

.timeline-dot {
  position: absolute;
  left: 8px;
  top: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
  z-index: 2;
}

.timeline-dot.current {
  background: #4ecdc4;
  border-color: #4ecdc4;
  box-shadow: 0 0 12px rgba(78, 205, 196, 0.5);
}

.timeline-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.timeline-item.active .timeline-card {
  background: rgba(78, 205, 196, 0.1);
  border-color: rgba(78, 205, 196, 0.3);
}

.timeline-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.employer-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.employer-info {
  flex: 1;
}

.employer-name {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.position {
  color: #4ecdc4;
  font-size: 0.85rem;
  font-weight: 500;
}

.period-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.period-badge.current {
  background: rgba(78, 205, 196, 0.2);
  color: #4ecdc4;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.period-dates {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.date-separator {
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.5);
}

.period-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.stat-icon {
  font-size: 0.8rem;
}

.stat-value {
  font-weight: 600;
}

/* Мобильная адаптивность */
@media (max-width: 768px) {
  .experience-timeline {
    padding: 16px;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .timeline-stats {
    gap: 12px;
  }
  
  .card-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .period-stats {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .timeline-item {
    padding-left: 30px;
  }
  
  .timeline-dot {
    left: 6px;
    width: 12px;
    height: 12px;
  }
  
  .timeline-line {
    left: 11px;
  }
  
  .employer-logo {
    width: 32px;
    height: 32px;
  }
  
  .employer-name {
    font-size: 0.9rem;
  }
  
  .period-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
