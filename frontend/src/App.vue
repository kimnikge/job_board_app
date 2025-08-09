<template>
  <ErrorBoundary>
    <div id="app">
      <AnimatedBackground />
      <AppLayout>
        <router-view />
      </AppLayout>
    </div>
  </ErrorBoundary>
</template>

<script setup>
import { onMounted } from 'vue'
import AnimatedBackground from './components/AnimatedBackground.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import AppLayout from './components/layout/AppLayout.vue'

onMounted(() => {
  console.log('🍽️ Job Board App для общепита Астаны запущен!')
  console.log('🎨 Применена новая темная тема с градиентами')
  console.log('📱 Добавлена адаптивная навигация согласно плану разработки')
})
</script>

<style>
#app {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}
</style>