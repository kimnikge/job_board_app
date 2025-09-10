<template>
  <div class="auth-page">
    <div class="auth-page__container">
      <div class="auth-page__logo">
        <h1 class="auth-page__title">
          <span class="logo-text">Shiftwork</span>
          <span class="beta-badge">BETA</span>
        </h1>
        <p class="auth-page__subtitle">Первая в Казахстане платформа мгновенных смен</p>
      </div>

      <div class="auth-page__description">
        <p class="auth-page__main-text">
          🚀 <strong>Найди работу в своем городе за 5 минут</strong>
        </p>
        <ul class="auth-page__benefits">
          <li>📱 Мгновенные уведомления о работе рядом с домом</li>
          <li>💰 Быстрая оплата сразу после смены</li>
          <li>⚡ От уведомления до начала работы — 30 минут</li>
        </ul>
      </div>

      <div class="auth-page__instructions">
        <div class="instruction-card">
          <h3>💡 Как войти в приложение</h3>
          <p>Для авторизации нажмите кнопку <strong>"Войти через Telegram"</strong> в верхней части экрана</p>
          <div class="arrow-up">
            ↗️ Кнопка находится в правом верхнем углу
          </div>
        </div>
      </div>

      <div class="auth-page__info">
        <h3>Что произойдет после авторизации:</h3>
        <ul>
          <li>✅ Автоматическое создание профиля (если вход первый)</li>
          <li>✅ Подтягивание данных из Telegram (имя, фото, username)</li>
          <li>✅ Доступ к вакансиям и функционалу платформы</li>
          <li>✅ Получение уведомлений о новых вакансиях</li>
        </ul>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="loading" class="auth-page__loading">
        <div class="loading-spinner"></div>
        <p>Авторизация через Telegram...</p>
      </div>

      <!-- Ошибка -->
      <div v-if="error" class="auth-page__error">
        <p>{{ error }}</p>
        <button @click="clearError" class="retry-btn">Попробовать снова</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Состояние компонента
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

const clearError = () => {
  authStore.clearError()
}

// Проверяем, не авторизован ли уже пользователь
if (authStore.isAuthenticated) {
  router.push('/')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-page__container {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.auth-page__logo {
  margin-bottom: 2rem;
}

.auth-page__title {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  position: relative;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.logo-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.beta-badge {
  position: absolute;
  top: -8px;
  right: -20px;
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  background: #ef4444;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.auth-page__subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.auth-page__description {
  margin-bottom: 2rem;
}

.auth-page__main-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.auth-page__benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.auth-page__benefits li {
  padding: 0.5rem 0;
  color: #475569;
  font-size: 0.9rem;
}

.auth-page__instructions {
  margin: 2rem 0;
}

.instruction-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px dashed #0088cc;
  text-align: center;
}

.instruction-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.instruction-card p {
  margin: 0 0 1rem 0;
  color: #475569;
  font-size: 0.95rem;
}

.arrow-up {
  font-size: 1.2rem;
  color: #0088cc;
  font-weight: bold;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

.auth-page__info {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: left;
  margin-top: 2rem;
}

.auth-page__info h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #1e293b;
}

.auth-page__info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.auth-page__info li {
  padding: 0.25rem 0;
  font-size: 0.9rem;
  color: #475569;
}

.auth-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-page__error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.retry-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.retry-btn:hover {
  background: #b91c1c;
}

/* Мобильная адаптация */
@media (max-width: 480px) {
  .auth-page {
    padding: 0.5rem;
  }
  
  .auth-page__container {
    padding: 1.5rem;
  }
  
  .auth-page__title {
    font-size: 2rem;
  }
  
  .beta-badge {
    font-size: 0.5rem;
    padding: 1px 4px;
    right: -15px;
    top: -6px;
  }
}
</style>
