<template>
  <div class="subscription-settings">
    <div class="current-plan">
      <h3>Текущий тариф</h3>
      <div class="plan-card" :class="currentPlan?.name">
        <div class="plan-header">
          <h4>{{ planDisplayName }}</h4>
          <div class="plan-price">
            {{ currentPlan?.price_monthly || 0 }} ₸/месяц
          </div>
        </div>
        <div class="plan-features">
          <div class="feature">
            ✅ Вакансии: {{ currentPlan?.max_job_postings === 999999 ? '∞' : currentPlan?.max_job_postings }}
          </div>
          <div class="feature">
            ⚡ Срочные: {{ currentPlan?.max_urgent_postings === 999999 ? '∞' : currentPlan?.max_urgent_postings }}
          </div>
          <div class="feature">
            {{ currentPlan?.custom_badges ? '✅' : '❌' }} Кастомные бейджи
          </div>
          <div class="feature">
            {{ currentPlan?.analytics_access ? '✅' : '❌' }} Аналитика
          </div>
        </div>
      </div>
    </div>

    <div class="usage-stats" v-if="usageStats">
      <h3>Использование</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ usageStats.jobs_posted || 0 }}</div>
          <div class="stat-label">Вакансий создано</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ usageStats.urgent_posts || 0 }}</div>
          <div class="stat-label">Срочных постов</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ usageStats.badges_created || 0 }}</div>
          <div class="stat-label">Бейджей создано</div>
        </div>
      </div>
    </div>

    <div class="upgrade-section">
      <h3>Обновить тариф</h3>
      <p class="upgrade-note">
        🎉 <strong>Все функции бесплатны на старте!</strong> 
        Платные тарифы появятся позже, когда у нас будет много пользователей.
      </p>
      <button class="upgrade-btn" disabled>
        💳 Скоро будет доступно
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSubscription } from '@/composables/useSubscription.js'

const { currentSubscription, currentPlan, getUsageStats } = useSubscription()

// Состояние
const usageStats = ref(null)

// Вычисляемые свойства
const planDisplayName = computed(() => {
  const names = {
    'free': '🆓 Бесплатный',
    'basic': '⭐ Базовый',
    'premium': '💎 Премиум'
  }
  return names[currentPlan.value?.name] || 'Неизвестный план'
})

// Загрузка статистики
onMounted(async () => {
  try {
    usageStats.value = await getUsageStats()
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error)
  }
})
</script>

<style scoped>
.subscription-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.current-plan h3,
.usage-stats h3,
.upgrade-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.plan-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.plan-card.free {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.plan-header h4 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.plan-price {
  font-size: 24px;
  font-weight: 700;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature {
  display: flex;
  align-items: center;
  font-size: 14px;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 28px;
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

.upgrade-section {
  text-align: center;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 16px;
  border: 2px dashed #e9ecef;
}

.upgrade-note {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.upgrade-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #ccc;
  color: #666;
  font-weight: 500;
  cursor: not-allowed;
  font-size: 14px;
}

@media (max-width: 768px) {
  .plan-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .stat-number {
    font-size: 24px;
  }
}
</style>
