<template>
  <GlobalErrorBoundary>
    <router-view />
    <NotificationSystem />
  </GlobalErrorBoundary>
</template>

<script setup>
import GlobalErrorBoundary from '@/shared/ui/GlobalErrorBoundary.vue'
import NotificationSystem from '@/shared/ui/NotificationSystem.vue'
</script>