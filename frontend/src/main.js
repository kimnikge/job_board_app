import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './assets/styles/common.css'

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

app.mount('#app')

// ✨ ПРОСТАЯ ИНИЦИАЛИЗАЦИЯ - БЕЗ СЛОЖНОЙ ЛОГИКИ
console.log('🍽️ Job Board App для общепита Астаны запущен!')
console.log('🎨 Применена новая темная тема с градиентами')

// Убираем сложную инициализацию stores до исправления ошибок
