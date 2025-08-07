<!--
  🔘 БАЗОВАЯ КНОПКА
  
  Универсальная кнопка с поддержкой различных вариантов и состояний
-->

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Иконка загрузки -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    
    <!-- Иконка слева -->
    <DynamicIcon 
      v-if="iconLeft && !loading" 
      :name="iconLeft" 
      class="icon-left" 
    />
    
    <!-- Основной контент -->
    <span class="button-content">
      <slot />
    </span>
    
    <!-- Иконка справа -->
    <DynamicIcon 
      v-if="iconRight && !loading" 
      :name="iconRight" 
      class="icon-right" 
    />
  </button>
</template>

<script>
import DynamicIcon from '../DynamicIcon.vue'

export default {
  name: 'BaseButton',
  components: {
    DynamicIcon
  },
  
  props: {
    /**
     * Вариант кнопки
     */
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => [
        'primary', 'secondary', 'success', 'warning', 'danger', 
        'ghost', 'outline', 'glass'
      ].includes(value)
    },
    
    /**
     * Размер кнопки
     */
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    
    /**
     * Тип кнопки
     */
    type: {
      type: String,
      default: 'button',
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    },
    
    /**
     * Состояние загрузки
     */
    loading: {
      type: Boolean,
      default: false
    },
    
    /**
     * Отключить кнопку
     */
    disabled: {
      type: Boolean,
      default: false
    },
    
    /**
     * Иконка слева
     */
    iconLeft: {
      type: String,
      default: null
    },
    
    /**
     * Иконка справа
     */
    iconRight: {
      type: String,
      default: null
    },
    
    /**
     * Полная ширина
     */
    fullWidth: {
      type: Boolean,
      default: false
    },
    
    /**
     * Круглая кнопка
     */
    rounded: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['click'],
  
  computed: {
    buttonClasses() {
      return [
        'base-button',
        `base-button--${this.variant}`,
        `base-button--${this.size}`,
        {
          'base-button--loading': this.loading,
          'base-button--disabled': this.disabled,
          'base-button--full-width': this.fullWidth,
          'base-button--rounded': this.rounded,
          'base-button--icon-only': this.isIconOnly
        }
      ]
    },
    
    isIconOnly() {
      return (this.iconLeft || this.iconRight) && !this.$slots.default
    }
  },
  
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.base-button {
  /* Базовые стили */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  /* Типографика */
  font-family: var(--font-family);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  
  /* Интерактивность */
  cursor: pointer;
  user-select: none;
  
  /* Переходы */
  transition: all 0.3s ease;
  
  /* Borders */
  border: 1px solid transparent;
  border-radius: 8px;
  
  /* Эффект focus */
  outline: none;
  
  /* Glass эффект базовый */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 📏 РАЗМЕРЫ */
.base-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-height: 2rem;
}

.base-button--medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  min-height: 2.5rem;
}

.base-button--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  min-height: 3rem;
}

/* 🎨 ВАРИАНТЫ КНОПОК */

/* Primary - основная кнопка */
.base-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

.base-button--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

/* Secondary - вторичная кнопка */
.base-button--secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
}

.base-button--secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
}

/* Success - успех */
.base-button--success {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  border-color: rgba(34, 197, 94, 0.3);
}

.base-button--success:hover:not(:disabled) {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
}

/* Warning - предупреждение */
.base-button--warning {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border-color: rgba(245, 158, 11, 0.3);
}

.base-button--warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
}

/* Danger - опасность */
.base-button--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-color: rgba(220, 38, 38, 0.3);
}

.base-button--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3);
}

/* Ghost - прозрачная */
.base-button--ghost {
  background: transparent;
  color: var(--text-primary);
  border-color: transparent;
}

.base-button--ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* Outline - контурная */
.base-button--outline {
  background: transparent;
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.3);
}

.base-button--outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Glass - стеклянная */
.base-button--glass {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.base-button--glass:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
}

/* 🎯 МОДИФИКАТОРЫ */

/* Полная ширина */
.base-button--full-width {
  width: 100%;
}

/* Круглая кнопка */
.base-button--rounded {
  border-radius: 50px;
}

/* Только иконка */
.base-button--icon-only {
  aspect-ratio: 1;
  padding: 0.75rem;
}

.base-button--icon-only.base-button--small {
  padding: 0.5rem;
}

.base-button--icon-only.base-button--large {
  padding: 1rem;
}

/* 🚫 СОСТОЯНИЯ */

/* Отключена */
.base-button--disabled,
.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Загрузка */
.base-button--loading {
  cursor: wait;
}

.base-button--loading .button-content {
  opacity: 0.7;
}

/* 🔄 LOADING SPINNER */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 🎨 ИКОНКИ */
.icon-left,
.icon-right {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

.base-button--small .icon-left,
.base-button--small .icon-right {
  width: 0.875rem;
  height: 0.875rem;
}

.base-button--large .icon-left,
.base-button--large .icon-right {
  width: 1.25rem;
  height: 1.25rem;
}

/* 📱 АДАПТИВНОСТЬ */
@media (max-width: 768px) {
  .base-button {
    min-height: 3rem;
    font-size: 1rem;
  }
  
  .base-button--small {
    min-height: 2.5rem;
    font-size: 0.875rem;
  }
}

/* 🎯 FOCUS STYLES */
.base-button:focus-visible {
  outline: 2px solid var(--accent-color, #667eea);
  outline-offset: 2px;
}
</style>
