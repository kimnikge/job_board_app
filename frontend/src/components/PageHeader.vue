<template>
  <div class="page-header">
    <h2 class="page-title">{{ title }}</h2>
    <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.page-header {
  padding: 16px 20px 20px;
  margin-top: 56px; /* Отступ под фиксированный header */
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 0;
}

/* === АДАПТИВНОСТЬ === */
@media (max-width: 350px) {
  .page-header {
    padding: 12px 16px 16px;
  }
  
  .page-title {
    font-size: 1.6rem;
  }
  
  .page-subtitle {
    font-size: 0.85rem;
  }
}
</style>
