import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './assets/styles/common.css'

// ✨ STORES ИНИЦИАЛИЗАЦИЯ - ЭТАП 3
import { useAuthStore } from './stores/auth'
import { useNotificationsStore } from './stores/notifications'

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

app.use(router)
app.use(pinia)

// ✨ ИНИЦИАЛИЗАЦИЯ STORES ПОСЛЕ СОЗДАНИЯ PINIA
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

// Инициализируем авторизацию
authStore.init()

// Загружаем настройки уведомлений
notificationsStore.loadSubscriptions()

// Демонстрационные уведомления для разработки
if (import.meta.env.DEV) {
  notificationsStore.initDemoNotifications()
}

app.mount('#app')
