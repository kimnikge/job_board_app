<template>
  <div class="spinner"></div>
</template>

<script setup>
// Нет логики, только UI
</script>

<style scoped>
.spinner {
  border: 4px solid #eaf6fb;
  border-top: 4px solid #0088cc;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
