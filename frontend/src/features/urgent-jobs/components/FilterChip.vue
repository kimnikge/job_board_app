<!--
  🏷️ ЧИП ФИЛЬТРА
  
  Компактная кнопка-чип для быстрого переключения фильтров
-->

<template>
  <button
    :class="chipClasses"
    @click="$emit('click')"
    :disabled="disabled"
  >
    <DynamicIcon v-if="icon" :name="icon" class="chip-icon" />
    <span class="chip-label">{{ label }}</span>
    <span v-if="count !== undefined" class="chip-count">{{ count }}</span>
    <DynamicIcon v-if="removable && active" name="x" class="chip-remove" />
  </button>
</template>

<script>
import { computed } from 'vue'
import DynamicIcon from '../../../components/DynamicIcon.vue'

export default {
  name: 'FilterChip',
  components: {
    DynamicIcon
  },
  
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: false
    },
    count: {
      type: Number,
      default: undefined
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'danger', 'success'].includes(value)
    },
    removable: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['click'],
  
  setup(props) {
    const chipClasses = computed(() => [
      'filter-chip',
      `filter-chip--${props.size}`,
      `filter-chip--${props.variant}`,
      {
        'filter-chip--active': props.active,
        'filter-chip--removable': props.removable,
        'filter-chip--disabled': props.disabled
      }
    ])
    
    return {
      chipClasses
    }
  }
}
</script>

<style scoped>
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  user-select: none;
}

.filter-chip:hover:not(.filter-chip--disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  transform: translateY(-1px);
}

/* 📏 РАЗМЕРЫ */
.filter-chip--small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 16px;
}

.filter-chip--medium {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.filter-chip--large {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 24px;
}

/* 🎨 ВАРИАНТЫ */
.filter-chip--primary {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
  color: var(--color-primary);
}

.filter-chip--primary:hover:not(.filter-chip--disabled) {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.filter-chip--danger {
  background: rgba(245, 87, 108, 0.1);
  border-color: rgba(245, 87, 108, 0.2);
  color: #f5576c;
}

.filter-chip--danger:hover:not(.filter-chip--disabled) {
  background: rgba(245, 87, 108, 0.2);
  border-color: rgba(245, 87, 108, 0.3);
}

.filter-chip--success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.filter-chip--success:hover:not(.filter-chip--disabled) {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
}

/* ✅ АКТИВНОЕ СОСТОЯНИЕ */
.filter-chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.filter-chip--active:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

.filter-chip--active.filter-chip--danger {
  background: #f5576c;
  border-color: #f5576c;
}

.filter-chip--active.filter-chip--success {
  background: #10b981;
  border-color: #10b981;
}

/* 🚫 ОТКЛЮЧЕННОЕ СОСТОЯНИЕ */
.filter-chip--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 🏷️ ЭЛЕМЕНТЫ */
.chip-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.filter-chip--small .chip-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.filter-chip--large .chip-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.chip-label {
  flex-shrink: 0;
}

.chip-count {
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
}

.filter-chip--small .chip-count {
  padding: 0.0625rem 0.25rem;
  border-radius: 10px;
  font-size: 0.625rem;
}

.filter-chip--active .chip-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.chip-remove {
  width: 0.875rem;
  height: 0.875rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.chip-remove:hover {
  opacity: 1;
}

/* 📱 АДАПТИВНОСТЬ */
@media (max-width: 480px) {
  .filter-chip--medium {
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
  }
  
  .chip-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>
