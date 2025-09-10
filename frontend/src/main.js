import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './assets/styles/common.css'

// Импортируем директиву click-outside
import { clickOutside } from './directives/clickOutside.js'

// Импортируем только необходимые иконки
import {
  Search,
  User,
  Menu,
  X,
  Home,
  Briefcase,
  FileText,
  MapPin,
  Phone,
  Mail,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Building,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  ArrowRight,
  Star,
  Heart,
  Calendar,
  Clock
} from 'lucide-vue-next'

const app = createApp(App)
const pinia = createPinia()

// Регистрируем иконки глобально
const icons = {
  Search,
  User,
  Menu,
  X,
  Home,
  Briefcase,
  FileText,
  MapPin,
  Phone,
  Mail,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Building,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  ArrowRight,
  Star,
  Heart,
  Calendar,
  Clock
}

Object.entries(icons).forEach(([name, component]) => {
  app.component(`${name}Icon`, component)
})

// Глобальная обработка ошибок для продакшена
app.config.errorHandler = (err, instance, info) => {
  console.error('🚨 Global error:', err)
  console.error('Component:', instance)
  console.error('Error info:', info)
  
  // В продакшене показываем пользователю дружелюбное сообщение
  if (import.meta.env.PROD) {
    // Можно показать уведомление пользователю
    alert('Произошла ошибка при загрузке приложения. Попробуйте перезагрузить страницу.')
  }
}

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason)
  
  if (import.meta.env.PROD) {
    // Предотвращаем показ технических ошибок пользователю
    event.preventDefault()
  }
})

// Регистрируем директиву click-outside
app.directive('click-outside', clickOutside)

app.use(router)
app.use(pinia)

// Инициализация auth store
async function initializeApp() {
  try {
    const { useAuthStore } = await import('./stores/auth')
    const authStore = useAuthStore()
    authStore.init()
  } catch (error) {
    console.warn('Auth store initialization failed:', error)
  }
}

app.mount('#app')

// Инициализируем auth после монтирования
initializeApp()

// ✨ ПРОСТАЯ ИНИЦИАЛИЗАЦИЯ - БЕЗ СЛОЖНОЙ ЛОГИКИ
console.log('🍽️ ShiftworkKZ App для общепита Астаны запущен!')
console.log('🎨 Применена новая темная тема с градиентами')

// Убираем сложную инициализацию stores до исправления ошибок
