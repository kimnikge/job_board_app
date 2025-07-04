<template>
  <component 
    v-if="iconComponent" 
    :is="iconComponent" 
    v-bind="$attrs"
  />
  <div v-else-if="loading" class="icon-loading">
    <div class="loading-dot"></div>
  </div>
  <div v-else class="icon-fallback">
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v8"/>
      <path d="M8 12h8"/>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, defineAsyncComponent } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const iconComponent = ref(null)
const loading = ref(true)

// Простой fallback без inject
const loadIcon = async () => {
  try {
    const iconModule = await import('lucide-vue-next')
    iconComponent.value = iconModule[props.name] || null
  } catch (error) {
    console.warn('Icon loading error:', error)
    iconComponent.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadIcon)
</script>

<style scoped>
.icon-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
}

.loading-dot {
  width: 0.25em;
  height: 0.25em;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
  animation: pulse 1s infinite;
}

.icon-error {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  font-size: 0.75em;
  opacity: 0.5;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
