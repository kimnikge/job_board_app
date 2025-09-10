<template>
  <div class="home-view">
    <div class="hero-section">
      <h1 class="hero-title">ShiftworkKZ</h1>
      <p class="hero-subtitle">Первая в Казахстане платформа мгновенных смен</p>
      <p class="hero-tagline">🚀 <strong>Найди работу в своем городе за 5 минут</strong></p>
      
      <div class="features">
        <div class="feature">
          <span class="feature-icon">📱</span>
          <span>Мгновенные уведомления о работе рядом с домом</span>
        </div>
        <div class="feature">
          <span class="feature-icon">💰</span>
          <span>Быстрая оплата сразу после смены</span>
        </div>
        <div class="feature">
          <span class="feature-icon">⚡</span>
          <span>От уведомления до начала работы — 30 минут</span>
        </div>
      </div>
      
      <div class="quick-actions">
        <router-link to="/urgent" class="btn btn-primary">
          Срочные вакансии
        </router-link>
        <router-link to="/jobs" class="btn btn-secondary">
          Все вакансии
        </router-link>
      </div>
    </div>
    
    <div class="welcome-message" v-if="user">
      <p>Добро пожаловать, {{ userDisplayName }}! 👋</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userDisplayName = computed(() => {
  if (!user.value?.user_metadata) return 'Пользователь'
  const meta = user.value.user_metadata
  return meta.full_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || meta.telegram_username || 'Пользователь'
})
</script>

<style scoped>
.home-view {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.hero-tagline {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.feature:hover {
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.welcome-message {
  text-align: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  color: #1e293b;
  font-size: 1.1rem;
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .features {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
