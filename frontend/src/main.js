import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import ErrorHandler from './shared/ErrorHandler'

const app = createApp(App)

// Глобальный обработчик ошибок Vue
app.config.errorHandler = (err, vm, info) => {
  ErrorHandler.handle(err, vm, info)
  // Можно также отправить ошибку в систему мониторинга, например Sentry
  // console.error('Caught by global error handler:', err, vm, info);
};

// Обработчик для неперехваченных промисов (хотя Vue errorHandler должен ловить большинство)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', event => {
    console.warn('Unhandled promise rejection:', event.reason);
    ErrorHandler.handle(event.reason, null, 'Unhandled Promise Rejection');
  });
}


app.use(createPinia())
app.use(router)

app.mount('#app')
