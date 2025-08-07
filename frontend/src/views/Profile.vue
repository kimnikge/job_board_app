<template>
  <div class="profile-page">
    <!-- Используем существующую ProfilePage -->
    <ProfilePage />
  </div>
</template>

<script setup>
// ✨ ВРЕМЕННО: используем ProfilePage из старого модуля
// В ЭТАПЕ 3 перенесем всю логику сюда напрямую
import ProfilePage from '../modules/profile/components/ProfilePage.vue'
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
}
</style>
