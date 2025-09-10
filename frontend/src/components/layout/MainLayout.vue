<template>
  <div class="app-container">
    <header class="header">
      <div class="logo">ShiftworkKZ</div>
      <div class="header-actions">
        <button class="header-btn" @click="toggleTheme">
          <SunIcon v-if="theme === 'dark'" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
        </button>
        <button class="header-btn">
          <BellIcon class="w-5 h-5" />
        </button>
        <BurgerMenu />
        <RouterLink to="/urgent" class="menu-item" @click="closeMenu">
          <ZapIcon class="w-5 h-5" />
          <span>Срочно</span>
        </RouterLink>
        <RouterLink to="/jobs" class="menu-item" @click="closeMenu">
          <BriefcaseIcon class="w-5 h-5" />
          <span>Вакансии</span>
        </RouterLink>
        <RouterLink to="/resumes" class="menu-item" @click="closeMenu">
          <FileTextIcon class="w-5 h-5" />
          <span>Резюме</span>
        </RouterLink>
        <RouterLink to="/profile" class="menu-item" @click="closeMenu">
          <UserIcon class="w-5 h-5" />
          <span>Профиль</span>
        </RouterLink>
        <div class="menu-divider"></div>
        <button v-if="isAuthenticated" class="menu-item logout" @click="handleLogout">
          <LogOutIcon class="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </div>
    </header>
    <main class="main-content">
      <div>
        <router-view v-slot="{ Component }">
          <transition name="page-transition" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { 
  BellIcon, 
  SunIcon, 
  MoonIcon, 
  MenuIcon,
  HomeIcon,
  ZapIcon,
  BriefcaseIcon,
  FileTextIcon,
  UserIcon,
  LogOutIcon
} from 'lucide-vue-next'
import BurgerMenu from '@/components/ui/BurgerMenu.vue'

const router = useRouter()
const authStore = useAuthStore()
const theme = ref('light')
const isMenuOpen = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

async function handleLogout() {
  await authStore.logout()
  closeMenu()
  router.push('/auth/login')
}

// Закрывать меню при клике вне его
function handleClickOutside(event) {
  const menu = document.querySelector('.menu-container')
  if (menu && !menu.contains(event.target)) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved) {
    theme.value = saved
    document.documentElement.setAttribute('data-theme', saved)
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg);
}

.header {
  background: var(--color-header);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(102, 126, 234, 0.3);
}

.logo {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.header-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.header-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.menu-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.router-link-active {
  background: #f0f0f0;
  color: #667eea;
}

.menu-divider {
  height: 1px;
  background: #eee;
  margin: 8px 0;
}

.menu-item.logout {
  color: #dc2626;
}

.menu-item.logout:hover {
  background: #fee2e2;
}

.menu-item.logout .lucide {
  color: #dc2626;
}

.main-content {
  flex: 1;
  padding: 32px 20px 60px 20px;
  background: var(--color-bg);
  min-height: calc(100vh - 60px);
}

.page-transition-enter-active, .page-transition-leave-active {
  transition: opacity 0.5s;
}
.page-transition-enter, .page-transition-leave-to /* .page-transition-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
