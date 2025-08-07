<!--
  🎚️ ПЕРЕКЛЮЧАТЕЛЬ ФИЛЬТРА
  
  Переключатель для булевых фильтров
-->

<template>
  <label :class="toggleClasses">
    <input
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      @change="$emit('change', $event.target.checked)"
      class="toggle-input"
    />
    
    <div class="toggle-switch">
      <div class="toggle-thumb">
        <DynamicIcon v-if="checked" :name="icon" class="toggle-icon" />
      </div>
    </div>
    
    <div class="toggle-content">
      <div class="toggle-label">
        <DynamicIcon v-if="icon" :name="icon" class="label-icon" />
        <span class="label-text">{{ label }}</span>
      </div>
      
      <div v-if="description" class="toggle-description">
        {{ description }}
      </div>
    </div>
  </label>
</template>

<script>
import { computed } from 'vue'
import DynamicIcon from '../../../components/DynamicIcon.vue'

export default {
  name: 'FilterToggle',
  components: {
    DynamicIcon
  },
  
  props: {
    label: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    checked: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
    }
  },
  
  emits: ['change'],
  
  setup(props) {
    const toggleClasses = computed(() => [
      'filter-toggle',
      `filter-toggle--${props.variant}`,
      {
        'filter-toggle--checked': props.checked,
        'filter-toggle--disabled': props.disabled
      }
    ])
    
    return {
      toggleClasses
    }
  }
}
</script>

<style scoped>
.filter-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.filter-toggle:hover:not(.filter-toggle--disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.filter-toggle--checked {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.2);
}

.filter-toggle--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 📦 СКРЫТЫЙ INPUT */
.toggle-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* 🎚️ ПЕРЕКЛЮЧАТЕЛЬ */
.toggle-switch {
  position: relative;
  width: 2.5rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.filter-toggle--checked .toggle-switch {
  background: var(--color-primary);
}

/* Варианты цветов */
.filter-toggle--success.filter-toggle--checked .toggle-switch {
  background: #10b981;
}

.filter-toggle--warning.filter-toggle--checked .toggle-switch {
  background: #f6ad55;
}

.filter-toggle--danger.filter-toggle--checked .toggle-switch {
  background: #f5576c;
}

.toggle-thumb {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.filter-toggle--checked .toggle-thumb {
  transform: translateX(1rem);
}

.toggle-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--color-primary);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.filter-toggle--checked .toggle-icon {
  opacity: 1;
  transform: scale(1);
}

.filter-toggle--success.filter-toggle--checked .toggle-icon {
  color: #10b981;
}

.filter-toggle--warning.filter-toggle--checked .toggle-icon {
  color: #f6ad55;
}

.filter-toggle--danger.filter-toggle--checked .toggle-icon {
  color: #f5576c;
}

/* 📝 СОДЕРЖИМОЕ */
.toggle-content {
  flex: 1;
  min-width: 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.125rem;
}

.label-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.filter-toggle--checked .label-icon {
  color: var(--color-primary);
}

.filter-toggle--success.filter-toggle--checked .label-icon {
  color: #10b981;
}

.filter-toggle--warning.filter-toggle--checked .label-icon {
  color: #f6ad55;
}

.filter-toggle--danger.filter-toggle--checked .label-icon {
  color: #f5576c;
}

.label-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.filter-toggle--checked .label-text {
  color: var(--color-primary);
}

.toggle-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 🎭 АНИМАЦИИ */
.toggle-switch::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: transparent;
  transition: all 0.3s ease;
}

.filter-toggle--checked .toggle-switch::before {
  background: radial-gradient(circle at center, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
}

/* 📱 АДАПТИВНОСТЬ */
@media (max-width: 480px) {
  .filter-toggle {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .toggle-switch {
    width: 2.25rem;
    height: 1.375rem;
  }
  
  .toggle-thumb {
    width: 1.125rem;
    height: 1.125rem;
  }
  
  .filter-toggle--checked .toggle-thumb {
    transform: translateX(0.875rem);
  }
  
  .toggle-icon {
    width: 0.625rem;
    height: 0.625rem;
  }
  
  .label-text {
    font-size: 0.8125rem;
  }
  
  .toggle-description {
    font-size: 0.6875rem;
  }
}
</style>
