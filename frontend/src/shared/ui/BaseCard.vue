<!--
  🃏 БАЗОВАЯ КАРТОЧКА
  
  Универсальная карточка с glass-эффектом и гибкой структурой
-->

<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- Заголовок карточки -->
    <header v-if="hasHeader" class="card-header">
      <div class="card-header-content">
        <!-- Иконка заголовка -->
        <DynamicIcon 
          v-if="headerIcon" 
          :name="headerIcon" 
          class="header-icon" 
        />
        
        <!-- Заголовок -->
        <div class="header-text">
          <h3 v-if="title" class="card-title">{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
        
        <!-- Слот для дополнительного содержимого заголовка -->
        <div v-if="$slots.headerExtra" class="header-extra">
          <slot name="headerExtra" />
        </div>
      </div>
      
      <!-- Действия в заголовке -->
      <div v-if="$slots.headerActions" class="header-actions">
        <slot name="headerActions" />
      </div>
    </header>

    <!-- Основное содержимое -->
    <main class="card-body">
      <slot />
    </main>

    <!-- Подвал карточки -->
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
    
    <!-- Индикатор загрузки -->
    <div v-if="loading" class="card-loading">
      <LoadingSpinner size="medium" />
    </div>
    
    <!-- Hover overlay для интерактивных карточек -->
    <div v-if="interactive" class="card-hover-overlay"></div>
  </div>
</template>

<script>
import DynamicIcon from '../../components/DynamicIcon.vue'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'BaseCard',
  components: {
    DynamicIcon,
    LoadingSpinner
  },
  
  props: {
    /**
     * Заголовок карточки
     */
    title: {
      type: String,
      default: null
    },
    
    /**
     * Подзаголовок
     */
    subtitle: {
      type: String,
      default: null
    },
    
    /**
     * Иконка в заголовке
     */
    headerIcon: {
      type: String,
      default: null
    },
    
    /**
     * Вариант карточки
     */
    variant: {
      type: String,
      default: 'default',
      validator: (value) => [
        'default', 'glass', 'solid', 'outlined', 'elevated'
      ].includes(value)
    },
    
    /**
     * Размер карточки
     */
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    
    /**
     * Интерактивная карточка (с hover эффектами)
     */
    interactive: {
      type: Boolean,
      default: false
    },
    
    /**
     * Состояние загрузки
     */
    loading: {
      type: Boolean,
      default: false
    },
    
    /**
     * Отключить карточку
     */
    disabled: {
      type: Boolean,
      default: false
    },
    
    /**
     * Скругление углов
     */
    rounded: {
      type: String,
      default: 'medium',
      validator: (value) => ['none', 'small', 'medium', 'large', 'full'].includes(value)
    },
    
    /**
     * Тень
     */
    shadow: {
      type: String,
      default: 'medium',
      validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
    }
  },
  
  emits: ['click'],
  
  computed: {
    cardClasses() {
      return [
        'base-card',
        `base-card--${this.variant}`,
        `base-card--${this.size}`,
        `base-card--rounded-${this.rounded}`,
        `base-card--shadow-${this.shadow}`,
        {
          'base-card--interactive': this.interactive,
          'base-card--loading': this.loading,
          'base-card--disabled': this.disabled
        }
      ]
    },
    
    hasHeader() {
      return this.title || this.subtitle || this.headerIcon || 
             this.$slots.headerExtra || this.$slots.headerActions
    }
  },
  
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading && this.interactive) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.base-card {
  /* Базовые стили */
  position: relative;
  display: flex;
  flex-direction: column;
  
  /* Переходы */
  transition: all 0.3s ease;
  
  /* Базовый glass эффект */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  /* Граница */
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Предотвращаем переполнение */
  overflow: hidden;
}

/* 📏 РАЗМЕРЫ */
.base-card--small {
  min-height: 8rem;
}

.base-card--medium {
  min-height: 12rem;
}

.base-card--large {
  min-height: 16rem;
}

/* 🎨 ВАРИАНТЫ КАРТОЧЕК */

/* Default - стандартная */
.base-card--default {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Glass - стеклянная */
.base-card--glass {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Solid - сплошная */
.base-card--solid {
  background: var(--surface-primary, rgba(30, 30, 30, 0.9));
  border-color: rgba(255, 255, 255, 0.1);
}

/* Outlined - контурная */
.base-card--outlined {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.3);
  border-width: 2px;
}

/* Elevated - приподнятая */
.base-card--elevated {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

/* 🔄 СКРУГЛЕНИЕ УГЛОВ */
.base-card--rounded-none {
  border-radius: 0;
}

.base-card--rounded-small {
  border-radius: 4px;
}

.base-card--rounded-medium {
  border-radius: 8px;
}

.base-card--rounded-large {
  border-radius: 16px;
}

.base-card--rounded-full {
  border-radius: 24px;
}

/* 🌟 ТЕНИ */
.base-card--shadow-none {
  box-shadow: none;
}

.base-card--shadow-small {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.base-card--shadow-medium {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.base-card--shadow-large {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* 🎯 ИНТЕРАКТИВНОСТЬ */
.base-card--interactive {
  cursor: pointer;
  user-select: none;
}

.base-card--interactive:hover:not(.base-card--disabled):not(.base-card--loading) {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.base-card--interactive:hover .card-hover-overlay {
  opacity: 1;
}

/* 🚫 СОСТОЯНИЯ */
.base-card--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-card--loading {
  pointer-events: none;
}

/* 📝 СТРУКТУРА КАРТОЧКИ */

/* Заголовок */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}

.base-card--small .card-header {
  padding: 1rem 1rem 0 1rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
}

.base-card--large .card-header {
  padding: 2rem 2rem 0 2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
}

.card-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.header-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-secondary);
}

.header-text {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.base-card--small .card-title {
  font-size: 1.125rem;
}

.base-card--large .card-title {
  font-size: 1.5rem;
}

.card-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.header-extra {
  margin-left: auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Основное содержимое */
.card-body {
  flex: 1;
  padding: 0 1.5rem 1.5rem 1.5rem;
  color: var(--text-primary);
  line-height: 1.6;
}

.base-card--small .card-body {
  padding: 0 1rem 1rem 1rem;
}

.base-card--large .card-body {
  padding: 0 2rem 2rem 2rem;
}

/* Карточка без заголовка */
.base-card:not(:has(.card-header)) .card-body {
  padding-top: 1.5rem;
}

.base-card--small:not(:has(.card-header)) .card-body {
  padding-top: 1rem;
}

.base-card--large:not(:has(.card-header)) .card-body {
  padding-top: 2rem;
}

/* Подвал */
.card-footer {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.base-card--small .card-footer {
  padding: 0.75rem 1rem 1rem 1rem;
}

.base-card--large .card-footer {
  padding: 1.5rem 2rem 2rem 2rem;
}

/* 🔄 LOADING */
.card-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10;
}

/* 🎨 HOVER OVERLAY */
.card-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

/* 📱 АДАПТИВНОСТЬ */
@media (max-width: 768px) {
  .card-header {
    padding: 1rem 1rem 0 1rem;
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .card-body {
    padding: 0 1rem 1rem 1rem;
  }
  
  .card-footer {
    padding: 0.75rem 1rem 1rem 1rem;
  }
  
  .base-card:not(:has(.card-header)) .card-body {
    padding-top: 1rem;
  }
  
  .card-title {
    font-size: 1.125rem;
  }
  
  .header-actions {
    gap: 0.25rem;
  }
}

/* 🎯 FOCUS STYLES */
.base-card--interactive:focus-visible {
  outline: 2px solid var(--accent-color, #667eea);
  outline-offset: 2px;
}
</style>
