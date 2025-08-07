<!--
  🔘 РАДИО ФИЛЬТРА
  
  Кастомная радио-кнопка для эксклюзивных фильтров
-->

<template>
  <label :class="radioClasses">
    <input
      type="radio"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      @change="$emit('change', value)"
      class="radio-input"
    />
    
    <div class="radio-custom">
      <div class="radio-dot"></div>
    </div>
    
    <div class="radio-content">
      <div class="radio-label">
        <span v-if="icon" class="label-icon">{{ icon }}</span>
        <span class="label-text">{{ label }}</span>
      </div>
      
      <span v-if="count !== undefined" class="radio-count">{{ count }}</span>
    </div>
  </label>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'FilterRadio',
  
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number, Boolean],
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
    const radioClasses = computed(() => [
      'filter-radio',
      {
        'filter-radio--checked': props.checked,
        'filter-radio--disabled': props.disabled
      }
    ])
    
    return {
      radioClasses
    }
  }
}
</script>

<style scoped>
.filter-radio {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.filter-radio:hover:not(.filter-radio--disabled) {
  background: rgba(255, 255, 255, 0.05);
}

.filter-radio--checked {
  background: rgba(102, 126, 234, 0.1);
}

.filter-radio--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 📦 СКРЫТЫЙ INPUT */
.radio-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* 🔘 КАСТОМНАЯ РАДИО-КНОПКА */
.radio-custom {
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-radio:hover .radio-custom {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.filter-radio--checked .radio-custom {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.radio-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: white;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s ease;
}

.filter-radio--checked .radio-dot {
  opacity: 1;
  transform: scale(1);
}

/* 📝 СОДЕРЖИМОЕ */
.radio-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.radio-label {
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

.filter-radio--checked .label-text {
  color: var(--color-primary);
  font-weight: 600;
}

.radio-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.filter-radio--checked .radio-count {
  background: rgba(102, 126, 234, 0.2);
  color: var(--color-primary);
}

/* 🎭 АНИМАЦИИ */
.radio-custom::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.2s ease;
}

.filter-radio--checked .radio-custom::before {
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
}

/* 📱 АДАПТИВНОСТЬ */
@media (max-width: 480px) {
  .filter-radio {
    padding: 0.375rem;
    gap: 0.5rem;
  }
  
  .radio-custom {
    width: 1.125rem;
    height: 1.125rem;
  }
  
  .radio-dot {
    width: 0.4375rem;
    height: 0.4375rem;
  }
  
  .label-text {
    font-size: 0.8125rem;
  }
  
  .radio-count {
    font-size: 0.6875rem;
    padding: 0.0625rem 0.25rem;
  }
}
</style>
