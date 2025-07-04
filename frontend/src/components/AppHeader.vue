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
          <button class="icon-button" @click="toggleNotifications">
            <BellIcon class="w-5 h-5" />
            <span v-if="unreadNotifications" class="notification-badge">
              {{ unreadNotifications }}
            </span>
          </button>

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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  UserIcon, BellIcon, ChevronDownIcon, LogOutIcon,
  UserCircleIcon, SettingsIcon, BriefcaseIcon
} from 'lucide-vue-next'
import { useAuthStore } from '@/modules/auth/store/auth'

const route = useRoute()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.full_name || 'Пользователь')
const userAvatar = computed(() => authStore.user?.avatar)
const unreadNotifications = ref(3)
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

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

const closeProfileMenu = () => {
  isProfileMenuOpen.value = false
}

const toggleNotifications = () => {
  // Здесь будет логика уведомлений
}

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

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .logo-text {
    display: none;
  }
}
</style>