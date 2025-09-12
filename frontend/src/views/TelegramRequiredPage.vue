<template>
  <div class="telegram-required-page">
    <div class="container">
      <div class="logo-section">
        <h1 class="logo">
          <span class="logo-text">Shiftwork</span>
          <span class="logo-badge">BETA</span>
        </h1>
      </div>

      <div class="content-section">
        <div class="icon">📱</div>
        <h2>Приложение доступно только в Telegram</h2>
        <p class="description">
          Shiftwork - это Telegram Web App для поиска работы в сфере HoReCa в Казахстане.
        </p>

        <div class="instructions">
          <h3>Как использовать приложение:</h3>
          <ol>
            <li>Откройте Telegram на вашем устройстве</li>
            <li>Найдите бот <strong>@HoReCa_KZ_bot</strong></li>
            <li>Нажмите <strong>/start</strong> или кнопку "Открыть приложение"</li>
            <li>Наслаждайтесь поиском работы!</li>
          </ol>
        </div>

        <div class="features">
          <h3>Что вас ждет:</h3>
          <ul>
            <li>🚀 Мгновенные уведомления о новых вакансиях</li>
            <li>⚡ Срочные подмены - от уведомления до работы 30 минут</li>
            <li>🎯 Персональные рекомендации по вакансиям</li>
            <li>💼 Простое управление резюме и профилем</li>
            <li>🏆 Система достижений и навыков</li>
          </ul>
        </div>

        <a href="https://t.me/HoReCa_KZ_bot" class="telegram-link" target="_blank">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.184 1.923-.896 6.728-.896 6.728-.379 1.86-.793 2.048-1.302 2.048-.555 0-.793-.415-.793-.793 0-.793.572-5.556.572-5.556l.89-5.556c.087-.555.432-.829.793-.829.555 0 .88.432.736 1.958z"/>
          </svg>
          Открыть в Telegram
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TelegramRequiredPage',
  mounted() {
    // Устанавливаем заголовок страницы
    document.title = 'Shiftwork - Telegram Web App'
  }
}
</script>

<style scoped>
.telegram-required-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.container {
  max-width: 600px;
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.logo-section {
  margin-bottom: 2rem;
}

.logo {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.logo-text {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-badge {
  background: #ff6b35;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.content-section {
  text-align: left;
}

.icon {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.75rem;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
}

.description {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.6;
}

.instructions, .features {
  margin-bottom: 2rem;
}

.instructions h3, .features h3 {
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.instructions ol {
  padding-left: 1.5rem;
}

.instructions li {
  margin-bottom: 0.75rem;
  color: #475569;
  line-height: 1.6;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 0.75rem 0;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  line-height: 1.6;
}

.features li:last-child {
  border-bottom: none;
}

.telegram-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: #0088cc;
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  margin: 2rem auto 0;
}

.telegram-link:hover {
  background: #006699;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 136, 204, 0.3);
}

@media (max-width: 768px) {
  .container {
    padding: 2rem 1.5rem;
  }
  
  .logo-text {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  .description {
    font-size: 1rem;
  }
}
</style>
