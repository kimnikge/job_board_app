<template>
  <div class="telegram-required-page">
    <div class="container">
      <div class="telegram-required-card">
        <div class="icon">
          <div class="telegram-icon">📱</div>
        </div>
        
        <h1>📱 Откройте в Telegram</h1>
        
        <p class="description">
          Это приложение предназначено для использования в <strong>Telegram Web App</strong>. 
          Для полного доступа ко всем функциям откройте его через Telegram.
        </p>

        <div class="instructions">
          <h3>🚀 Как открыть в Telegram:</h3>
          <ol>
            <li>Откройте Telegram на телефоне или компьютере</li>
            <li>Найдите бота <code>@HoReCa_KZ_bot</code></li>
            <li>Нажмите <strong>"Старт"</strong> или отправьте <code>/start</code></li>
            <li>Нажмите кнопку <strong>"🚀 Открыть приложение"</strong></li>
          </ol>
        </div>

        <div class="features">
          <h3>✨ Что вас ждет:</h3>
          <ul>
            <li>🏃‍♂️ Поиск работы в сфере общепита</li>
            <li>⚡ Срочные вакансии с мгновенными уведомлениями</li>
            <li>💼 Создание резюме и портфолио</li>
            <li>🏆 Система достижений и навыков</li>
            <li>📱 Удобный мобильный интерфейс</li>
          </ul>
        </div>

        <div class="demo-section">
          <h3>🎭 Для разработчиков</h3>
          <p>
            Если вы разработчик и хотите протестировать приложение, 
            включите demo режим в настройках.
          </p>
          <button @click="enableDemoMode" class="demo-button">
            🔧 Включить Demo Mode
          </button>
        </div>

        <div class="contact-info">
          <p>
            <strong>Telegram бот:</strong> 
            <a href="https://t.me/HoReCa_KZ_bot" target="_blank">@HoReCa_KZ_bot</a>
          </p>
          <p>
            <strong>Поддержка:</strong> 
            <a href="https://t.me/kimnikge" target="_blank">@kimnikge</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const enableDemoMode = () => {
  // Устанавливаем demo mode в localStorage
  localStorage.setItem('force-demo-mode', 'true')
  
  // Перезагружаем страницу для применения изменений
  window.location.reload()
}
</script>

<style scoped>
.telegram-required-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.container {
  width: 100%;
  max-width: 600px;
}

.telegram-required-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.icon {
  margin-bottom: 20px;
}

.telegram-icon {
  font-size: 80px;
  line-height: 1;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
}

.description {
  color: #666;
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.instructions, .features, .demo-section {
  text-align: left;
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.instructions h3, .features h3, .demo-section h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 18px;
}

.instructions ol, .features ul {
  margin: 15px 0;
  padding-left: 20px;
}

.instructions li, .features li {
  margin-bottom: 10px;
  color: #555;
  line-height: 1.5;
}

code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  color: #d63384;
}

.demo-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.demo-button:hover {
  background: #218838;
  transform: translateY(-2px);
}

.contact-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.contact-info p {
  margin: 10px 0;
  color: #666;
}

.contact-info a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.contact-info a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .telegram-required-card {
    padding: 30px 20px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .description {
    font-size: 16px;
  }
}
</style>