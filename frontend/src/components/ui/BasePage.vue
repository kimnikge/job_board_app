<template>
  <div class="page-container" :class="pageClass">
    <!-- Заголовок страницы -->
    <header v-if="showHeader" class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button 
            v-if="showBack" 
            @click="$router.go(-1)" 
            class="back-btn"
          >
            <ArrowLeftIcon class="w-5 h-5" />
            Назад
          </button>
          <h1 v-if="title" class="page-title">{{ title }}</h1>
        </div>
        <div v-if="$slots.actions" class="header-actions">
          <slot name="actions" />
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="page-content" :class="contentClass">
      <slot />
    </main>

    <!-- Футер если нужен -->
    <footer v-if="$slots.footer" class="page-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup>
import { ArrowLeftIcon } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    default: ''
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showBack: {
    type: Boolean,
    default: false
  },
  pageClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* ===== БАЗОВЫЙ КОНТЕЙНЕР СТРАНИЦЫ ===== */
.page-container {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

/* ===== ЗАГОЛОВОК СТРАНИЦЫ ===== */
.page-header {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--glass-border);
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 16px;
  margin: 0 20px 20px 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--color-text-primary);
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-2px);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* ===== ОСНОВНОЙ КОНТЕНТ ===== */
.page-content {
  flex: 1;
  padding: 0 20px 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* ===== ФУТЕР ===== */
.page-footer {
  padding: 20px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-top: 1px solid var(--glass-border);
  margin-top: auto;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 1024px) {
  .page-content {
    padding: 0 16px 32px 16px;
  }
  
  .page-header {
    margin: 0 16px 16px 16px;
    padding: 16px;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 0 12px 24px 12px;
  }
  
  .page-header {
    margin: 0 12px 12px 12px;
    padding: 12px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 0 8px 20px 8px;
  }
  
  .page-header {
    margin: 0 8px 8px 8px;
    padding: 8px;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .back-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
