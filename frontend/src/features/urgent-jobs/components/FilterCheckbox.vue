<!--
  ☑️ ЧЕКБОКС ФИЛЬТРА
  
  Кастомный чекбокс для фильтров с иконкой и счетчиком
-->

<template>
  <label :class="checkboxClasses">
    <input
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      @change="$emit('change', $event.target.checked)"
      class="checkbox-input"
    />
    
    <div class="checkbox-custom">
      <DynamicIcon name="check" class="checkbox-icon" />
    </div>
    
    <div class="checkbox-content">
      <div class="checkbox-label">
        <span v-if="icon" class="label-icon">{{ icon }}</span>
        <span class="label-text">{{ label }}</span>
      </div>
      
      <span v-if="count !== undefined" class="checkbox-count">{{ count }}</span>
    </div>
  </label>
</template>

<script>
import { computed } from 'vue'
import DynamicIcon from '../../../components/DynamicIcon.vue'

export default {
  name: 'FilterCheckbox',
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
    checked: {
      type: Boolean,
      default: false
    },
    count: {
      type: Number,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['change'],
  
  setup(props) {
    const checkboxClasses = computed(() => [
      'filter-checkbox',
      {
        'filter-checkbox--checked': props.checked,
        'filter-checkbox--disabled': props.disabled,
        'filter-checkbox--no-count': props.count === undefined
      }
    ])
    
    return {
      checkboxClasses
    }
  }
}
</script>

<style scoped>
.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.filter-checkbox:hover:not(.filter-checkbox--disabled) {
  background: rgba(255, 255, 255, 0.05);
}

.filter-checkbox--checked {
  background: rgba(102, 126, 234, 0.1);
}

.filter-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 📦 СКРЫТЫЙ INPUT */
.checkbox-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* ✅ КАСТОМНЫЙ ЧЕКБОКС */
.checkbox-custom {
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-checkbox:hover .checkbox-custom {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.filter-checkbox--checked .checkbox-custom {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: white;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.filter-checkbox--checked .checkbox-icon {
  opacity: 1;
  transform: scale(1);
}

/* 📝 СОДЕРЖИМОЕ */
.checkbox-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.label-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.label-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
  min-width: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.filter-checkbox--checked .label-text {
  color: var(--color-primary);
  font-weight: 600;
}

.checkbox-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.filter-checkbox--checked .checkbox-count {
  background: rgba(102, 126, 234, 0.2);
  color: var(--color-primary);
}

/* 🎭 АНИМАЦИИ */
.checkbox-custom::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 6px;
  background: transparent;
  transition: all 0.2s ease;
}

.filter-checkbox--checked .checkbox-custom::before {
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
}

/* 📱 АДАПТИВНОСТЬ */
@media (max-width: 480px) {
  .filter-checkbox {
    padding: 0.375rem;
    gap: 0.5rem;
  }
  
  .checkbox-custom {
    width: 1.125rem;
    height: 1.125rem;
  }
  
  .checkbox-icon {
    width: 0.625rem;
    height: 0.625rem;
  }
  
  .label-text {
    font-size: 0.8125rem;
  }
  
  .checkbox-count {
    font-size: 0.6875rem;
    padding: 0.0625rem 0.25rem;
  }
}
</style>
