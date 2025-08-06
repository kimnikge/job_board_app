<template>
  <header class="app-header glass-dark">
    <div class="header-content">
      <router-link to="/" class="logo">
        <img src="@/assets/logo.svg" alt="Job Board" class="logo-image" />
        <span class="logo-text">Job Board</span>
      </router-link>

      <nav class="nav-menu">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: isCurrentRoute(item.path) }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="header-actions">
        <button 
          v-if="!isAuthenticated" 
          class="auth-button"
          @click="$router.push('/auth/login')"
        >
          <UserIcon class="w-5 h-5 mr-2" />
          Войти
        </button>

        <template v-else>
          <div class="notifications-menu" v-click-outside="closeNotifications">
            <button class="icon-button" @click="toggleNotifications">
              <BellIcon class="w-5 h-5" />
              <span v-if="unreadNotifications" class="notification-badge">
                {{ unreadNotifications }}
              </span>
            </button>

            <!-- Дропдаун уведомлений -->
            <div 
              v-if="isNotificationsOpen"
              class="notifications-dropdown glass"
            >
              <div class="notifications-header">
                <h3>Уведомления</h3>
                <button 
                  v-if="notifications.length" 
                  @click="markAllAsRead"
                  class="mark-all-read"
                >
                  Прочитать все
                </button>
              </div>

              <div class="notifications-list">
                <div 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  :class="['notification-item', { 'unread': !notification.read }]"
                  @click="openNotification(notification)"
                >
                  <div class="notification-icon">
                    <span v-if="notification.type === 'urgent'">🚨</span>
                    <span v-else-if="notification.type === 'response'">✨</span>
                    <span v-else>📨</span>
                  </div>
                  <div class="notification-content">
                    <p class="notification-message">{{ notification.message }}</p>
                    <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
                  </div>
                </div>

                <div v-if="!notifications.length" class="notifications-empty">
                  <BellIcon class="w-8 h-8 text-gray-400 mb-2" />
                  <p>Новых уведомлений нет</p>
                </div>
              </div>

              <div v-if="notifications.length" class="notifications-footer">
                <router-link to="/notifications" class="view-all">
                  Показать все
                </router-link>
              </div>
            </div>
          </div>

          <div class="profile-menu" v-click-outside="closeProfileMenu">
            <button class="profile-button" @click="toggleProfileMenu">
              <img 
                :src="userAvatar || '/images/default-avatar.png'" 
                :alt="userName"
                class="avatar"
              />
              <span class="user-name">{{ userName }}</span>
              <ChevronDownIcon 
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': isProfileMenuOpen }"
              />
            </button>

            <div 
              v-if="isProfileMenuOpen"
              class="profile-dropdown glass"
            >
              <router-link 
                v-for="item in profileMenuItems" 
                :key="item.path"
                :to="item.path"
                class="dropdown-item"
              >
                <component :is="item.icon" class="w-4 h-4 mr-2" />
                {{ item.label }}
              </router-link>

              <button class="dropdown-item text-red-400" @click="handleLogout">
                <LogOutIcon class="w-4 h-4 mr-2" />
                Выйти
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  UserIcon, BellIcon, ChevronDownIcon, LogOutIcon,
  UserCircleIcon, SettingsIcon, BriefcaseIcon
} from 'lucide-vue-next'
import { useAuthStore } from '@/modules/auth/store/auth'
import { notificationService } from '@/services/notificationService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.full_name || 'Пользователь')
const userAvatar = computed(() => authStore.user?.avatar)

// Уведомления
const isNotificationsOpen = ref(false)
const notifications = ref([])
const unreadNotifications = computed(() => 
  notifications.value.filter(n => !n.read).length
)

// Профиль
const isProfileMenuOpen = ref(false)

const menuItems = [
  { path: '/jobs', label: 'Вакансии' },
  { path: '/resumes', label: 'Резюме' },
  { path: '/companies', label: 'Компании' },
  { path: '/urgent', label: 'Срочные' }
]

const profileMenuItems = [
  { path: '/profile', label: 'Профиль', icon: UserCircleIcon },
  { path: '/profile/applications', label: 'Мои отклики', icon: BriefcaseIcon },
  { path: '/profile/settings', label: 'Настройки', icon: SettingsIcon }
]

const isCurrentRoute = (path) => {
  return route.path === path
}

// Методы для профиля
const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
  if (isNotificationsOpen.value) isNotificationsOpen.value = false
}

const closeProfileMenu = () => {
  isProfileMenuOpen.value = false
}

// Методы для уведомлений
const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
  if (isProfileMenuOpen.value) isProfileMenuOpen.value = false
}

const closeNotifications = () => {
  isNotificationsOpen.value = false
}

const openNotification = (notification) => {
  if (notification.type === 'urgent' || notification.type === 'response') {
    router.push(`/jobs/${notification.job_id}`)
  }
  markAsRead(notification.id)
  closeNotifications()
}

const markAsRead = (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
    notificationService.markAsRead(id)
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  notificationService.markAllAsRead()
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
  return date.toLocaleDateString()
}

// Загрузка уведомлений при монтировании
onMounted(() => {
  if (isAuthenticated.value) {
    notifications.value = notificationService.getNotifications()
  }
})

const handleLogout = async () => {
  await authStore.logout()
  closeProfileMenu()
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 70px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
}

.logo-image {
  height: 32px;
  width: auto;
  margin-right: 12px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;
}

.nav-link:hover {
  color: white;
}

.nav-link.active {
  color: white;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #fff, transparent);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.auth-button {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.auth-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.icon-button {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  transition: all 0.3s;
}

.icon-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff4b4b;
  color: white;
  font-size: 0.75rem;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #1a1a1a;
}

.profile-menu {
  position: relative;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  transition: all 0.3s;
}

.profile-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 200px;
  border-radius: 16px;
  padding: 8px;
  animation: scaleIn 0.2s ease-out;
  transform-origin: top right;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Стили для уведомлений */
.notifications-menu {
  position: relative;
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 320px;
  max-height: 400px;
  border-radius: 16px;
  padding: 0;
  animation: scaleIn 0.2s ease-out;
  transform-origin: top right;
  overflow: hidden;
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notifications-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.mark-all-read {
  font-size: 0.9rem;
  color: #64b5f6;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.mark-all-read:hover {
  background: rgba(100, 181, 246, 0.1);
}

.notifications-list {
  max-height: 280px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.notification-item.unread {
  background: rgba(100, 181, 246, 0.1);
  border-left-color: #64b5f6;
}

.notification-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
}

.notification-message {
  color: white;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 4px 0;
}

.notification-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.notifications-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.notifications-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.view-all {
  display: block;
  text-align: center;
  color: #64b5f6;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.view-all:hover {
  background: rgba(100, 181, 246, 0.1);
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .logo-text {
    display: none;
  }
  
  .notifications-dropdown {
    width: 280px;
  }
}
</style>