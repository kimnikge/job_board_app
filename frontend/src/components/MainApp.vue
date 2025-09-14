<template>
  <div class="main-app">
    <header class="app-header">
      <div class="header-content">
        <h1>🏨 ShiftWork KZ</h1>
        <div class="user-info">
          <span>Привет, {{ user?.username || user?.first_name || 'Пользователь' }}!</span>
          <button @click="logout" class="logout-btn">Выйти</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="welcome-section">
        <h2>🎉 Добро пожаловать в ShiftWork!</h2>
        <p>Платформа для поиска работы в сфере HoReCa в Казахстане</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <h3>🔍 Поиск вакансий</h3>
          <p>Найдите работу в ресторанах, кафе, отелях</p>
          <button class="feature-btn">Искать работу</button>
        </div>

        <div class="feature-card">
          <h3>⚡ Срочные вакансии</h3>
          <p>Получайте уведомления о срочных сменах</p>
          <button class="feature-btn">Включить уведомления</button>
        </div>

        <div class="feature-card">
          <h3>👤 Профиль</h3>
          <p>Настройте ваш профиль и навыки</p>
          <button class="feature-btn">Мой профиль</button>
        </div>

        <div class="feature-card">
          <h3>💼 Мои заявки</h3>
          <p>Отслеживайте статус ваших заявок</p>
          <button class="feature-btn">Посмотреть заявки</button>
        </div>
      </div>

      <!-- Информация о пользователе для отладки -->
      <div class="debug-section" v-if="showDebug">
        <h3>Информация о пользователе:</h3>
        <pre>{{ JSON.stringify(user, null, 2) }}</pre>
      </div>
      
      <button @click="showDebug = !showDebug" class="debug-toggle">
        {{ showDebug ? 'Скрыть информацию' : 'Показать информацию о пользователе' }}
      </button>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'

export default {
  name: 'MainApp',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  emits: ['logout'],
  setup(props, { emit }) {
    const showDebug = ref(false)
    const authStore = useAuthStore()

    const logout = async () => {
      try {
        console.log('🔄 Начинаем процесс выхода...')
        
        // Выходим через auth store (это очистит Supabase сессию)
        await authStore.logout()
        console.log('✅ Auth store logout завершен')
        
        // Очищаем localStorage
        localStorage.removeItem('shiftwork_user')
        console.log('✅ LocalStorage очищен')
        
        // Уведомляем родительский компонент
        emit('logout')
        console.log('✅ Событие logout отправлено в App.vue')
        
        console.log('👋 Пользователь вышел из системы')
      } catch (error) {
        console.error('❌ Ошибка при выходе:', error)
      }
    }

    return {
      showDebug,
      logout
    }
  }
}
</script>

<style scoped>
.main-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.app-header {
  background: white;
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
  padding: 20px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  color: #333;
  margin: 0;
  font-size: 1.8em;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info span {
  color: #666;
  font-weight: 500;
}

.logout-btn {
  background: #ff4757;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: #ff3742;
  transform: translateY(-2px);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 50px;
}

.welcome-section h2 {
  color: #333;
  font-size: 2.5em;
  margin-bottom: 15px;
}

.welcome-section p {
  color: #666;
  font-size: 1.2em;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.feature-card h3 {
  color: #333;
  font-size: 1.5em;
  margin-bottom: 15px;
}

.feature-card p {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
}

.feature-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
  width: 100%;
}

.feature-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.debug-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin: 30px 0;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.debug-section h3 {
  margin-top: 0;
  color: #333;
}

.debug-section pre {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
  color: #495057;
}

.debug-toggle {
  background: #e9ecef;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #6c757d;
  transition: all 0.3s;
}

.debug-toggle:hover {
  background: #dee2e6;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-section h2 {
    font-size: 2em;
  }
}
</style>
