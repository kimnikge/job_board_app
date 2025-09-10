<template>
  <div class="animation-showcase">
    <div class="showcase-header glass-card">
      <h1 class="showcase-title">🍽️ Демонстрация анимаций для общепита Астаны</h1>
      <p class="showcase-subtitle">Темная тема с glass эффектами и анимациями</p>
    </div>

    <!-- Анимированный фон -->
    <AnimatedBackground />

    <div class="showcase-content">
      <!-- Блок 1: Основные анимации -->
      <section class="demo-section">
        <h2 class="section-title animate-slide-up">📱 Основные анимации</h2>
        
        <div class="animation-grid">
          <div class="demo-card glass-card-hover animate-slide-up">
            <h3>Slide Up</h3>
            <p>Плавное появление снизу</p>
            <code>.animate-slide-up</code>
          </div>

          <div class="demo-card glass-card-hover animate-urgent-pulse" style="animation-delay: 0.2s;">
            <h3>🚨 Urgent Pulse</h3>
            <p>Пульсация для срочных вакансий</p>
            <code>.animate-urgent-pulse</code>
          </div>

          <div class="demo-card glass-card-hover animate-ready-glow" style="animation-delay: 0.4s;">
            <h3>✨ Ready Glow</h3>
            <p>Свечение для кнопок действий</p>
            <code>.animate-ready-glow</code>
          </div>
        </div>
      </section>

      <!-- Блок 2: Градиенты и кнопки -->
      <section class="demo-section">
        <h2 class="section-title animate-slide-up">🎨 Градиенты и кнопки</h2>
        
        <div class="button-showcase">
          <button class="btn-gradient ready-btn animate-ready-glow">
            <span>🙋‍♂️</span>
            <span>ГОТОВ ВЫЙТИ!</span>
          </button>

          <button class="btn-gradient urgent-btn">
            <span>🚨</span>
            <span>СРОЧНАЯ ВАКАНСИЯ</span>
          </button>

          <button class="btn-gradient success-btn">
            <span>✅</span>
            <span>ОТКЛИК ОТПРАВЛЕН</span>
          </button>

          <button class="btn-gradient warning-btn">
            <span>⏰</span>
            <span>ОГРАНИЧЕННОЕ ВРЕМЯ</span>
          </button>
        </div>
      </section>

      <!-- Блок 3: Специализации -->
      <section class="demo-section">
        <h2 class="section-title animate-slide-up">👨‍🍳 Специализации общепита</h2>
        
        <div class="specialization-grid">
          <div class="spec-card glass-card-hover spec-kitchen animate-slide-up">
            <span class="spec-icon">👨‍🍳</span>
            <span class="spec-name">Кухня</span>
          </div>
          
          <div class="spec-card glass-card-hover spec-service animate-slide-up" style="animation-delay: 0.1s;">
            <span class="spec-icon">🙋‍♀️</span>
            <span class="spec-name">Сервис</span>
          </div>
          
          <div class="spec-card glass-card-hover spec-management animate-slide-up" style="animation-delay: 0.2s;">
            <span class="spec-icon">👔</span>
            <span class="spec-name">Управление</span>
          </div>
          
          <div class="spec-card glass-card-hover spec-support animate-slide-up" style="animation-delay: 0.3s;">
            <span class="spec-icon">🛠️</span>
            <span class="spec-name">Поддержка</span>
          </div>
        </div>
      </section>

      <!-- Блок 4: Компоненты интерфейса -->
      <section class="demo-section">
        <h2 class="section-title animate-slide-up">🏪 Компоненты интерфейса</h2>
        
        <!-- Пример срочной вакансии -->
        <div class="urgent-job-example">
          <UrgentJobCard :job="demoJob" />
        </div>

        <!-- Уведомления -->
        <div class="notifications-demo">
          <div class="notification urgent glass-card animate-slide-up">
            <span class="notification-icon">🚨</span>
            <div class="notification-content">
              <h4>Срочная вакансия!</h4>
              <p>Повар требуется в ресторан "Астана Plaza"</p>
            </div>
            <span class="notification-time">1 мин назад</span>
          </div>

          <div class="notification success glass-card animate-slide-up" style="animation-delay: 0.2s;">
            <span class="notification-icon">✅</span>
            <div class="notification-content">
              <h4>Отклик принят!</h4>
              <p>Вас рассматривают на позицию официанта</p>
            </div>
            <span class="notification-time">5 мин назад</span>
          </div>
        </div>
      </section>

      <!-- Блок 5: Эффекты стекла -->
      <section class="demo-section">
        <h2 class="section-title animate-slide-up">💎 Glass эффекты</h2>
        
        <div class="glass-demo-grid">
          <div class="glass-example glass-card">
            <h3>Базовое стекло</h3>
            <p>Основной glass эффект</p>
            <code>.glass-card</code>
          </div>

          <div class="glass-example glass-card-hover">
            <h3>Интерактивное стекло</h3>
            <p>С hover эффектами</p>
            <code>.glass-card-hover</code>
          </div>

          <div class="glass-example" style="background: var(--glass-bg-hover); backdrop-filter: var(--glass-blur-strong);">
            <h3>Усиленное размытие</h3>
            <p>Для модальных окон</p>
            <code>.glass-blur-strong</code>
          </div>
        </div>
      </section>

      <!-- Блок 6: Адаптивность -->
      <section class="demo-section">
        <h2 class="section-title animate-slide-up">📱 Мобильная адаптивность</h2>
        
        <div class="mobile-demo">
          <div class="mobile-mockup glass-card">
            <div class="mobile-header">
              <span class="mobile-title">🍽️ ShiftworkKZ Астана</span>
              <span class="mobile-status">🟢 Online</span>
            </div>
            
            <div class="mobile-content">
              <div class="mobile-card urgent">
                <div class="mobile-card-header">
                  <span class="mobile-card-icon">🚨</span>
                  <span class="mobile-card-title">Срочно нужен повар</span>
                </div>
                <div class="mobile-card-details">
                  <span class="mobile-detail">📍 Центр, Астана</span>
                  <span class="mobile-detail">💰 15,000₸ за смену</span>
                </div>
                <button class="mobile-action-btn">ГОТОВ!</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AnimatedBackground from './AnimatedBackground.vue'
import UrgentJobCard from './UrgentJobCard.vue'

// Демо данные для срочной вакансии
const demoJob = ref({
  id: 'demo-1',
  title: 'Срочно требуется повар на мангал',
  company_name: 'Ресторан "Астана Palace"',
  venue_name: 'Астана Palace',
  company_logo: '/images/default-company.png',
  specialization_id: 5,
  specializations: { name: 'Повар на мангале' },
  venue_types: { name: 'Ресторан' },
  location: 'Центральный район',
  city_districts: { name: 'Алматинский район' },
  address: 'ул. Достык, 12',
  needed_date: new Date().toISOString(),
  needed_time: '18:00',
  shift_duration: '8 часов',
  pay_per_shift: 15000,
  salary_min: null,
  salary_max: null,
  description: 'Требуется опытный повар на мангал для работы в ресторане высокого класса. Знание кавказской кухни приветствуется.',
  tags: ['Мангал', 'Кавказская кухня', 'Опыт от 2 лет'],
  auto_close_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // через 20 часов
  notification_priority: 4,
  ready_responses_count: 3,
  contact_phone: '+7 (701) 234-56-78',
  contact_telegram: 'astana_palace',
  contact_person: 'Администратор Асхат',
  created_at: new Date().toISOString(),
  is_highlighted: true
})
</script>

<style scoped>
.animation-showcase {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
}

.showcase-header {
  text-align: center;
  padding: 40px 20px;
  margin-bottom: 40px;
  border-radius: 20px;
}

.showcase-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.showcase-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.showcase-content {
  position: relative;
  z-index: 2;
}

.demo-section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 30px;
  text-align: center;
}

/* Сетка анимаций */
.animation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.demo-card {
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid var(--glass-border);
}

.demo-card h3 {
  color: var(--color-text-primary);
  margin-bottom: 8px;
  font-size: 1.3rem;
}

.demo-card p {
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.demo-card code {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  color: var(--color-primary);
  font-size: 0.9rem;
}

/* Демо кнопок */
.button-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.ready-btn,
.urgent-btn,
.success-btn,
.warning-btn {
  padding: 16px 24px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ready-btn { background: var(--gradient-success); }
.urgent-btn { background: var(--gradient-urgent); }
.success-btn { background: var(--gradient-primary); }
.warning-btn { background: var(--gradient-warning); }

/* Специализации */
.specialization-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.spec-card {
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--glass-border);
}

.spec-icon {
  font-size: 2rem;
}

.spec-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Пример срочной вакансии */
.urgent-job-example {
  max-width: 600px;
  margin: 0 auto 40px;
}

/* Уведомления */
.notifications-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
  margin: 0 auto;
}

.notification {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.notification.urgent {
  border-color: var(--color-danger);
}

.notification.success {
  border-color: var(--color-success);
}

.notification-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 4px 0;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.notification-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.notification-time {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

/* Glass демо */
.glass-demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.glass-example {
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid var(--glass-border);
}

.glass-example h3 {
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.glass-example p {
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

/* Мобильная демонстрация */
.mobile-demo {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.mobile-mockup {
  width: 320px;
  height: 568px;
  border-radius: 30px;
  padding: 20px;
  border: 2px solid var(--glass-border);
  position: relative;
  overflow: hidden;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 20px;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 20px;
}

.mobile-title {
  font-weight: 700;
  color: var(--color-text-primary);
}

.mobile-status {
  font-size: 0.9rem;
  color: var(--color-success);
}

.mobile-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.mobile-card.urgent {
  border-color: var(--color-danger);
  background: rgba(245, 87, 108, 0.1);
}

.mobile-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mobile-card-icon {
  font-size: 1.2rem;
}

.mobile-card-title {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.95rem;
}

.mobile-card-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.mobile-detail {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.mobile-action-btn {
  width: 100%;
  padding: 12px;
  background: var(--gradient-success);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  text-transform: uppercase;
}

/* Адаптивность */
@media (max-width: 768px) {
  .showcase-title {
    font-size: 2rem;
  }
  
  .animation-grid,
  .button-showcase,
  .specialization-grid,
  .glass-demo-grid {
    grid-template-columns: 1fr;
  }
  
  .mobile-mockup {
    width: 100%;
    max-width: 320px;
    height: auto;
    min-height: 400px;
  }
  
  .notifications-demo {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .animation-showcase {
    padding: 10px;
  }
  
  .showcase-header {
    padding: 20px 10px;
  }
  
  .demo-section {
    margin-bottom: 40px;
  }
}
</style>
