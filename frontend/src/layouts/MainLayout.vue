<template>
  <div class="app-layout">
    <!-- Фиксированный header -->
    <AppHeader @toggle-mobile-menu="toggleMobileMenu" />
    
    <!-- Основной контент -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-transition" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Мобильная навигация -->
    <nav class="mobile-nav" :class="{ active: showMobileMenu }">
      <div class="mobile-nav-header">
        <h3>Меню</h3>
        <button class="close-mobile-menu" @click="closeMobileMenu">
          ✕
        </button>
      </div>
      <div class="mobile-nav-content">
        <RouterLink to="/urgent" class="mobile-nav-item urgent-item" @click="closeMobileMenu">
          <AlertCircleIcon class="nav-icon" />
          <span>Срочные вакансии</span>
        </RouterLink>
        <RouterLink to="/companies" class="mobile-nav-item" @click="closeMobileMenu">
          <BuildingIcon class="nav-icon" />
          <span>Заведения</span>
        </RouterLink>
        <RouterLink to="/profile" class="mobile-nav-item" @click="closeMobileMenu">
          <UserIcon class="nav-icon" />
          <span>Профиль</span>
        </RouterLink>
      </div>
    </nav>

    <!-- Оверлей для мобильного меню -->
    <div 
      v-if="showMobileMenu" 
      class="mobile-nav-overlay" 
      @click="closeMobileMenu"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { AlertCircleIcon, BuildingIcon, UserIcon } from 'lucide-vue-next'

// Состояние мобильного меню
const showMobileMenu = ref(false)

// Функции управления мобильным меню
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// Закрытие меню при клике вне его
function handleClickOutside(event) {
  const mobileNav = document.querySelector('.mobile-nav')
  if (mobileNav && !mobileNav.contains(event.target) && showMobileMenu.value) {
    closeMobileMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ===== БАЗОВЫЙ LAYOUT ===== */
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  position: relative;
  padding-top: 80px; /* Высота фиксированного header */
  min-height: calc(100vh - 80px);
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .main-content {
    padding-top: 70px; /* Меньше на мобильных */
  }
}

/* ===== МОБИЛЬНАЯ НАВИГАЦИЯ ===== */
.mobile-nav {
  position: fixed;
  top: 0;
  right: -320px;
  width: 320px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  transition: right 0.3s ease;
  overflow-y: auto;
}

.mobile-nav.active {
  right: 0;
}

.mobile-nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.mobile-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-nav-header h3 {
  color: var(--color-text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.close-mobile-menu {
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-mobile-menu:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mobile-nav-content {
  padding: 20px 0;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.mobile-nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: var(--color-primary);
}

.mobile-nav-item.urgent-item {
  background: linear-gradient(90deg, rgba(245, 87, 108, 0.1), transparent);
  border-left-color: var(--color-danger);
}

.mobile-nav-item.urgent-item:hover {
  background: linear-gradient(90deg, rgba(245, 87, 108, 0.2), transparent);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.mobile-nav-item span {
  font-weight: 500;
}

/* ===== АНИМАЦИИ ПЕРЕХОДОВ ===== */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s ease;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 480px) {
  .mobile-nav {
    width: 280px;
    right: -280px;
  }
  
  .mobile-nav.active {
    right: 0;
  }
  
  .mobile-nav-header {
    padding: 16px;
  }
  
  .mobile-nav-item {
    padding: 14px 16px;
  }
}

@media (max-width: 320px) {
  .mobile-nav {
    width: 100vw;
    right: -100vw;
  }
  
  .mobile-nav.active {
    right: 0;
  }
}
</style>
