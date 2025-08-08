<template>
  <ErrorBoundary>
    <div id="app">
      <AnimatedBackground />
      <router-view />
    </div>
  </ErrorBoundary>
</template>

<script setup>
import { onMounted } from 'vue'
import AnimatedBackground from './components/AnimatedBackground.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'

onMounted(() => {
  console.log('🍽️ Job Board App для общепита Астаны запущен!')
  console.log('🎨 Применена новая темная тема с градиентами')
})
</script>

<style>
#app {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}
</style>