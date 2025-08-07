<template>
  <div class="burger-menu">
    <button class="burger-button" @click="toggleMenu" aria-label="Меню">
      <Menu v-if="!isOpen" />
      <X v-else />
    </button>
    
    <transition name="menu">
      <div v-if="isOpen" class="menu-overlay" @click="closeMenu">
        <div class="menu-content" @click.stop>
          <router-link to="/" class="menu-item" @click="closeMenu">
            <Home class="menu-icon" />
            Главная
          </router-link>
          <router-link to="/urgent" class="menu-item" @click="closeMenu">
            <Zap class="menu-icon" />
            Срочно
          </router-link>
          <router-link to="/jobs" class="menu-item" @click="closeMenu">
            <Briefcase class="menu-icon" />
            Вакансии
          </router-link>
          <router-link to="/resumes" class="menu-item" @click="closeMenu">
            <FileText class="menu-icon" />
            Резюме
          </router-link>
          <router-link to="/profile" class="menu-item" @click="closeMenu">
            <User class="menu-icon" />
            Профиль
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Menu, X, Home, Zap, Briefcase, FileText, User } from 'lucide-vue-next'

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenu = () => {
  isOpen.value = false
  document.body.style.overflow = ''
}
</script>

<style scoped>
.burger-menu {
  position: relative;
  z-index: 1000;
}

.burger-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.menu-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: #fff;
  padding: 20px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-icon {
  margin-right: 12px;
  width: 20px;
  height: 20px;
}

.menu-enter-active,
.menu-leave-active {
  transition: transform 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  transform: translateX(100%);
}

.menu-enter-to,
.menu-leave-from {
  transform: translateX(0);
}
</style>
