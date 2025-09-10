<template>
  <div class="city-selector">
    <select 
      :value="modelValue" 
      @change="$emit('update:modelValue', $event.target.value)"
      :class="['city-select', { 'has-value': modelValue }]"
      :required="required"
    >
      <option value="">{{ placeholder }}</option>
      <option 
        v-for="city in cities" 
        :key="city.id" 
        :value="city.id"
      >
        {{ city.name }}
        <span v-if="city.region"> ({{ city.region }})</span>
      </option>
    </select>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useReferenceStore } from '@/stores/reference'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Выберите город'
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const referenceStore = useReferenceStore()

// Загружаем города при монтировании
onMounted(async () => {
  if (!referenceStore.cities.length) {
    await referenceStore.loadCities()
  }
})

// Вычисляемые свойства
const cities = computed(() => referenceStore.cities || [])
</script>

<style scoped>
.city-selector {
  width: 100%;
}

.city-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  color: #374151;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 40px;
}

.city-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.city-select.has-value {
  color: #111827;
  font-weight: 500;
}

.city-select option {
  padding: 8px;
  color: #374151;
}

.city-select option:first-child {
  color: #9ca3af;
  font-style: italic;
}

@media (max-width: 768px) {
  .city-select {
    font-size: 16px; /* Предотвращает зум на iOS */
  }
}
</style>
