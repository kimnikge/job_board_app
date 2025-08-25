<template>
  <div 
    class="base-card" 
    :class="[
      cardClass,
      { 'clickable': clickable, 'elevated': elevated }
    ]"
    @click="handleClick"
  >
    <!-- Заголовок карточки -->
    <header v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </slot>
    </header>

    <!-- Основной контент -->
    <div class="card-content" :class="contentClass">
      <slot />
    </div>

    <!-- Футер карточки -->
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>

    <!-- Бейдж/статус -->
    <div v-if="badge" class="card-badge" :class="`badge-${badge.type}`">
      {{ badge.text }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  },
  elevated: {
    type: Boolean,
    default: false
  },
  cardClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  },
  badge: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  margin-bottom: 20px;
}

.base-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.base-card:hover::before {
  opacity: 1;
}

.base-card.clickable {
  cursor: pointer;
}

.base-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-hover);
}

.base-card.elevated {
  box-shadow: var(--shadow-md);
}

.base-card.elevated:hover {
  box-shadow: var(--shadow-xl);
}

.card-header {
  margin-bottom: 16px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.card-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
}

.card-content {
  flex: 1;
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-urgent {
  background: var(--gradient-urgent);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 87, 108, 0.3);
}

.badge-success {
  background: var(--gradient-ready);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.badge-warning {
  background: linear-gradient(45deg, var(--color-warning), #ffb74d);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.badge-info {
  background: linear-gradient(45deg, var(--color-info), #42a5f5);
  color: white;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

@media (max-width: 768px) {
  .base-card {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 16px;
  }
  
  .card-header {
    margin-bottom: 12px;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .card-subtitle {
    font-size: 0.85rem;
  }
  
  .card-footer {
    margin-top: 12px;
    padding-top: 12px;
  }
  
  .card-badge {
    top: 8px;
    right: 8px;
    padding: 3px 8px;
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .base-card {
    padding: 12px;
    border-radius: 8px;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-subtitle {
    font-size: 0.8rem;
  }
  
  .card-badge {
    position: static;
    align-self: flex-start;
    margin-bottom: 8px;
  }
}
</style>
