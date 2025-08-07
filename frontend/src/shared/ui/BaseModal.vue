<!--
  🪟 БАЗОВОЕ МОДАЛЬНОЕ ОКНО
  
  Универсальное модальное окно с backdrop, анимациями и гибкой структурой
-->

<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="modelValue"
        class="modal-overlay"
        :class="overlayClasses"
        @click="handleOverlayClick"
      >
        <!-- Модальное окно -->
        <div
          ref="modalRef"
          :class="modalClasses"
          role="dialog"
          :aria-labelledby="titleId"
          :aria-describedby="bodyId"
          aria-modal="true"
          @click.stop
        >
          <!-- Заголовок модального окна -->
          <header v-if="hasHeader" class="modal-header">
            <div class="modal-header-content">
              <!-- Иконка заголовка -->
              <DynamicIcon 
                v-if="headerIcon" 
                :name="headerIcon" 
                class="header-icon" 
              />
              
              <!-- Заголовок -->
              <h2 v-if="title" :id="titleId" class="modal-title">
                {{ title }}
              </h2>
              
              <!-- Слот для дополнительного содержимого заголовка -->
              <div v-if="$slots.headerExtra" class="header-extra">
                <slot name="headerExtra" />
              </div>
            </div>
            
            <!-- Кнопка закрытия -->
            <BaseButton
              v-if="showCloseButton"
              variant="ghost"
              size="small"
              icon-left="x"
              rounded
              @click="close"
              class="close-button"
              aria-label="Закрыть модальное окно"
            />
          </header>

          <!-- Основное содержимое -->
          <main :id="bodyId" class="modal-body">
            <slot />
          </main>

          <!-- Подвал модального окна -->
          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </footer>
          
          <!-- Индикатор загрузки -->
          <div v-if="loading" class="modal-loading">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import DynamicIcon from '../../components/DynamicIcon.vue'
import BaseButton from './BaseButton.vue'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'BaseModal',
  components: {
    DynamicIcon,
    BaseButton,
    LoadingSpinner
  },
  
  props: {
    /**
     * Видимость модального окна
     */
    modelValue: {
      type: Boolean,
      required: true
    },
    
    /**
     * Заголовок модального окна
     */
    title: {
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
     * Размер модального окна
     */
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'fullscreen'].includes(value)
    },
    
    /**
     * Закрытие по клику на backdrop
     */
    closeOnBackdrop: {
      type: Boolean,
      default: true
    },
    
    /**
     * Закрытие по Escape
     */
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    
    /**
     * Показать кнопку закрытия
     */
    showCloseButton: {
      type: Boolean,
      default: true
    },
    
    /**
     * Состояние загрузки
     */
    loading: {
      type: Boolean,
      default: false
    },
    
    /**
     * Блокировать прокрутку body
     */
    lockScroll: {
      type: Boolean,
      default: true
    },
    
    /**
     * Z-index модального окна
     */
    zIndex: {
      type: Number,
      default: 1000
    },
    
    /**
     * Анимация появления
     */
    animation: {
      type: String,
      default: 'scale',
      validator: (value) => ['scale', 'slide', 'fade'].includes(value)
    }
  },
  
  emits: ['update:modelValue', 'close', 'open', 'opened', 'closed'],
  
  setup(props, { emit }) {
    const modalRef = ref(null)
    const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)
    const bodyId = computed(() => `modal-body-${Math.random().toString(36).substr(2, 9)}`)
    
    const overlayClasses = computed(() => [
      'modal-overlay',
      `modal-overlay--${props.animation}`
    ])
    
    const modalClasses = computed(() => [
      'modal',
      `modal--${props.size}`,
      `modal--${props.animation}`,
      {
        'modal--loading': props.loading
      }
    ])
    
    const hasHeader = computed(() => 
      props.title || props.headerIcon || 
      props.$slots?.headerExtra || props.showCloseButton
    )
    
    // Управление прокруткой body
    let originalBodyOverflow = ''
    
    const lockBodyScroll = () => {
      if (!props.lockScroll) return
      originalBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    
    const unlockBodyScroll = () => {
      if (!props.lockScroll) return
      document.body.style.overflow = originalBodyOverflow
    }
    
    // Обработчики событий
    const close = () => {
      emit('update:modelValue', false)
      emit('close')
    }
    
    const handleOverlayClick = () => {
      if (props.closeOnBackdrop && !props.loading) {
        close()
      }
    }
    
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && props.closeOnEscape && !props.loading) {
        close()
      }
    }
    
    // Анимационные хуки
    const onEnter = () => {
      emit('open')
      lockBodyScroll()
      document.addEventListener('keydown', handleEscapeKey)
    }
    
    const onAfterEnter = () => {
      emit('opened')
      // Фокус на модальном окне для accessibility
      nextTick(() => {
        if (modalRef.value) {
          modalRef.value.focus()
        }
      })
    }
    
    const onLeave = () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
    
    const onAfterLeave = () => {
      unlockBodyScroll()
      emit('closed')
    }
    
    // Очистка при размонтировании
    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscapeKey)
      unlockBodyScroll()
    })
    
    return {
      modalRef,
      titleId,
      bodyId,
      overlayClasses,
      modalClasses,
      hasHeader,
      close,
      handleOverlayClick,
      onEnter,
      onAfterEnter,
      onLeave,
      onAfterLeave
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  /* Позиционирование */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: v-bind(zIndex);
  
  /* Центрирование */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  
  /* Backdrop */
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  
  /* Плавность */
  transition: all 0.3s ease;
}

.modal {
  /* Позиционирование */
  position: relative;
  
  /* Структура */
  display: flex;
  flex-direction: column;
  
  /* Ограничения */
  max-height: 90vh;
  max-width: 90vw;
  width: 100%;
  
  /* Внешний вид */
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  /* Тень */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  /* Переходы */
  transition: all 0.3s ease;
  
  /* Focus outline */
  outline: none;
}

/* 📏 РАЗМЕРЫ МОДАЛЬНОГО ОКНА */
.modal--small {
  max-width: 400px;
}

.modal--medium {
  max-width: 600px;
}

.modal--large {
  max-width: 900px;
}

.modal--fullscreen {
  max-width: 95vw;
  max-height: 95vh;
  margin: 2.5vh 2.5vw;
}

/* 📝 СТРУКТУРА МОДАЛЬНОГО ОКНА */

/* Заголовок */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
}

.modal-header-content {
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

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.header-extra {
  margin-left: auto;
  margin-right: 1rem;
}

.close-button {
  flex-shrink: 0;
}

/* Основное содержимое */
.modal-body {
  flex: 1;
  padding: 0 1.5rem;
  color: var(--text-primary);
  line-height: 1.6;
  overflow-y: auto;
  
  /* Красивый скроллбар */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Модальное окно без заголовка */
.modal:not(:has(.modal-header)) .modal-body {
  padding-top: 1.5rem;
}

/* Подвал */
.modal-footer {
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  
  /* Flexbox для кнопок */
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  align-items: center;
}

/* 🔄 LOADING */
.modal-loading {
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
  border-radius: inherit;
  z-index: 10;
}

/* 🎬 АНИМАЦИИ */

/* Scale Animation */
.modal-enter-active.modal-overlay--scale,
.modal-leave-active.modal-overlay--scale {
  transition: all 0.3s ease;
}

.modal-enter-from.modal-overlay--scale,
.modal-leave-to.modal-overlay--scale {
  opacity: 0;
}

.modal-enter-from.modal-overlay--scale .modal--scale,
.modal-leave-to.modal-overlay--scale .modal--scale {
  transform: scale(0.9);
  opacity: 0;
}

/* Slide Animation */
.modal-enter-active.modal-overlay--slide,
.modal-leave-active.modal-overlay--slide {
  transition: all 0.3s ease;
}

.modal-enter-from.modal-overlay--slide,
.modal-leave-to.modal-overlay--slide {
  opacity: 0;
}

.modal-enter-from.modal-overlay--slide .modal--slide,
.modal-leave-to.modal-overlay--slide .modal--slide {
  transform: translateY(-50px);
  opacity: 0;
}

/* Fade Animation */
.modal-enter-active.modal-overlay--fade,
.modal-leave-active.modal-overlay--fade {
  transition: all 0.3s ease;
}

.modal-enter-from.modal-overlay--fade,
.modal-leave-to.modal-overlay--fade {
  opacity: 0;
}

.modal-enter-from.modal-overlay--fade .modal--fade,
.modal-leave-to.modal-overlay--fade .modal--fade {
  opacity: 0;
}

/* 📱 АДАПТИВНОСТЬ */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal {
    max-height: 95vh;
    border-radius: 12px;
  }
  
  .modal--fullscreen {
    max-width: 100vw;
    max-height: 100vh;
    margin: 0;
    border-radius: 0;
  }
  
  .modal-header {
    padding: 1rem 1rem 0 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }
  
  .modal-body {
    padding: 0 1rem;
  }
  
  .modal:not(:has(.modal-header)) .modal-body {
    padding-top: 1rem;
  }
  
  .modal-footer {
    padding: 1rem 1rem 1rem 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-footer :deep(.base-button) {
    width: 100%;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
}

/* 🎯 FOCUS STYLES */
.modal:focus-visible {
  outline: 2px solid var(--accent-color, #667eea);
  outline-offset: -2px;
}
</style>
