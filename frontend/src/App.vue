<template>
  <GlobalErrorBoundary>
    <div id="debug">
      <!-- Отладочная информация -->
    </div>
    <router-view />
    <NotificationSystem />
  </GlobalErrorBoundary>
</template>

<script setup>
import { onMounted } from 'vue'
import GlobalErrorBoundary from '@/shared/ui/GlobalErrorBoundary.vue'
import NotificationSystem from '@/shared/ui/NotificationSystem.vue'

onMounted(() => {
  console.log('App mounted')
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.log('Window Error: ', msg, url, lineNo, columnNo, error)
    return false
  }
})
</script>