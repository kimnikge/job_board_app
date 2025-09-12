<template>
  <div class="telegram-job-card">
    <!-- Placeholder for Telegram-optimized job card -->
    <div class="placeholder">
      <h3>Telegram Job Card (Placeholder)</h3>
      <p>Component for displaying jobs in Telegram Web App format.</p>
    </div>
  </div>
</template>

<script setup>
// Props will be defined when implementing the actual component
const props = defineProps({
  job: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped>
.telegram-job-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
}

.placeholder {
  text-align: center;
  color: #666;
}
</style>