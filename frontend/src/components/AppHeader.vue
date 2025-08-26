<template>
  <!-- Верхний заголовок -->
  <header class="header">
    <router-link to="/" class="logo">Job Board</router-link>
    
    <div class="search-container">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Поиск вакансий..." 
        class="search-input"
        @focus="onSearchFocus"
      />
      <button 
        v-if="searchQuery" 
        @click="clearSearch" 
        class="search-clear"
      >
        <XIcon class="w-4 h-4" />
      </button>
    </div>

    <div class="actions">
      <button 
        v-if="isAuthenticated"
        @click="openNotifications" 
        class="action-btn"
      >
        <BellIcon class="w-5 h-5" />
        <span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
      </button>
      
      <button 
        v-if="isAuthenticated"
        @click="openProfile" 
        class="action-btn"
      >
        <img 
          v-if="userAvatar" 
          :src="userAvatar" 
          :alt="userName"
          class="avatar"
        />
        <UserIcon v-else class="w-5 h-5" />
      </button>
      
      <router-link 
        v-else
        to="/auth/login" 
        class="action-btn"
      >
        <UserIcon class="w-5 h-5" />
      </router-link>
    </div>
  </header>

  <!-- Нижняя навигация -->
  <nav class="bottom-nav">
    <router-link 
      v-for="item in tabItems" 
      :key="item.path"
      :to="item.path" 
      class="tab-item"
      :class="{ active: $route.path === item.path }"
    >
      <component :is="item.icon" class="tab-icon w-6 h-6" />
      <span class="tab-label">{{ item.label }}</span>
      <span v-if="item.badge" class="tab-badge">{{ item.badge }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  BellIcon, 
  UserIcon, 
  SearchIcon, 
  XIcon,
  BriefcaseIcon,
  AlertCircleIcon,
  BuildingIcon,
  HeartIcon
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

// Состояние поиска
const searchQuery = ref('')

// Данные пользователя
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.full_name || 'Пользователь')
const userAvatar = computed(() => authStore.user?.avatar)
const unreadCount = computed(() => authStore.unreadNotifications || 0)

// Табы нижней навигации
const tabItems = ref([
  { 
    path: '/jobs', 
    label: 'Вакансии', 
    icon: BriefcaseIcon 
  },
  { 
    path: '/urgent', 
    label: 'Срочные', 
    icon: AlertCircleIcon,
    badge: 3 // Счетчик срочных вакансий
  },
  { 
    path: '/companies', 
    label: 'Места', 
    icon: BuildingIcon 
  },
  { 
    path: '/profile', 
    label: 'Профиль', 
    icon: UserIcon 
  }
])

// Методы
const onSearchFocus = () => {
  // При фокусе на поиск можно перейти на отдельную страницу поиска
  router.push('/search')
}

const clearSearch = () => {
  searchQuery.value = ''
}

const openNotifications = () => {
  router.push('/notifications')
}

const openProfile = () => {
  router.push('/profile')
}
</script>

<style scoped>
/* Основной контейнер заголовка */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid #e5e5e5;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Лого */
.logo {
  color: #1976d2;
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
  flex-shrink: 0;
}

/* Поиск */
.search-container {
  flex: 1;
  max-width: 250px;
  margin: 0 16px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 35px 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #f5f5f5;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  background: white;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Кнопки действий */
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  position: relative;
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.action-btn:hover {
  background: #f0f0f0;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ff4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  line-height: 1;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

/* Нижняя навигация */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-top: 1px solid #e5e5e5;
  display: flex;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  text-decoration: none;
  color: #666;
  font-size: 11px;
  font-weight: 500;
  position: relative;
  transition: color 0.2s;
}

.tab-item.active {
  color: #1976d2;
}

.tab-icon {
  margin-bottom: 4px;
}

.tab-label {
  font-size: 10px;
}

.tab-badge {
  position: absolute;
  top: 2px;
  right: 8px;
  background: #ff4444;
  color: white;
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 6px;
  min-width: 12px;
  text-align: center;
}

/* Адаптация для безопасных зон */
@supports (padding-top: env(safe-area-inset-top)) {
  .header {
    padding-top: env(safe-area-inset-top);
    height: calc(60px + env(safe-area-inset-top));
  }
}

/* Состояния для темной темы */
@media (prefers-color-scheme: dark) {
  .header {
    background: #1a1a1a;
    border-bottom-color: #333;
  }
  
  .logo {
    color: #64b5f6;
  }
  
  .search-input {
    background: #2a2a2a;
    border-color: #444;
    color: white;
  }
  
  .search-input:focus {
    background: #333;
    border-color: #64b5f6;
  }
  
  .action-btn {
    color: #ccc;
  }
  
  .action-btn:hover {
    background: #333;
  }
  
  .bottom-nav {
    background: #1a1a1a;
    border-top-color: #333;
  }
  
  .tab-item {
    color: #ccc;
  }
  
  .tab-item.active {
    color: #64b5f6;
  }
}

/* Анимации */
.tab-item {
  transition: all 0.2s ease;
}

.tab-item:active {
  transform: scale(0.95);
}
</style>