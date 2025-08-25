<template>
  <div class="badge-carousel">
    <div class="carousel-header">
      <h3 class="carousel-title">🏆 Достижения ({{ badges.length }})</h3>
    </div>
    
    <div class="carousel-container" ref="carouselContainer">
      <div class="carousel-track">
        <div 
          v-for="badge in badges" 
          :key="badge.id"
          class="badge-item"
          @click="showBadgeDetails(badge)"
          :title="badge.description"
        >
          <div class="badge-icon">{{ badge.icon_url }}</div>
          <div class="badge-info">
            <div class="badge-name">
              <span v-if="badge.level" :class="['badge-level', badge.level.toLowerCase()]">
                {{ getLevelIcon(badge.level) }} {{ badge.level }}
              </span>
              <span v-if="badge.is_rare" class="badge-rare" title="Редкий бейдж">🌟</span>
              <span v-if="badge.is_temporary" class="badge-temp" title="Временный бейдж">⏳</span>
              {{ badge.name }}
              <span v-if="badge.is_temporary && badge.valid_until" class="badge-valid-until">до {{ formatDate(badge.valid_until) }}</span>
            </div>
            <div class="badge-employer">{{ badge.employer_name }}</div>
            <div class="badge-date">{{ formatDate(badge.awarded_at) }}</div>
            <div class="badge-source" :class="badge.source">
              {{ badge.source === 'auto' ? '🤖 Авто' : '👨‍💼 Ручная' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Навигационные кнопки -->
    <button 
      v-if="canScrollLeft" 
      class="carousel-nav nav-left"
      @click="scrollLeft"
      aria-label="Прокрутить влево"
    >
      ‹
    </button>
    <button 
      v-if="canScrollRight" 
      class="carousel-nav nav-right"
      @click="scrollRight" 
      aria-label="Прокрутить вправо"
    >
      ›
    </button>
  </div>
</template>

<script setup>
// Иконки и цвета для уровней бейджей
function getLevelIcon(level) {
  switch (level) {
    case 'Bronze': return '🥉'
    case 'Silver': return '🥈'
    case 'Gold': return '🥇'
    case 'Platinum': return '💎'
    default: return ''
  }
}
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  badges: {
    type: Array,
    default: () => []
  }
})

const carouselContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

onMounted(() => {
  nextTick(() => {
    updateScrollButtons()
  })
})

function updateScrollButtons() {
  if (!carouselContainer.value) return
  
  const container = carouselContainer.value
  canScrollLeft.value = container.scrollLeft > 0
  canScrollRight.value = container.scrollLeft < (container.scrollWidth - container.clientWidth)
}

function scrollLeft() {
  if (!carouselContainer.value) return
  carouselContainer.value.scrollBy({ left: -300, behavior: 'smooth' })
  setTimeout(updateScrollButtons, 300)
}

function scrollRight() {
  if (!carouselContainer.value) return
  carouselContainer.value.scrollBy({ left: 300, behavior: 'smooth' })
  setTimeout(updateScrollButtons, 300)
}

function showBadgeDetails(badge) {
  // TODO: Показать модальное окно с деталями бейджа
  console.log('Badge details:', badge)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short' 
  })
}
</script>

<style scoped>
.badge-rare {
  color: gold;
  margin-left: 0.2em;
  font-size: 1.1em;
}
.badge-temp {
  color: #00bfff;
  margin-left: 0.2em;
  font-size: 1.1em;
}
.badge-valid-until {
  display: block;
  color: #00bfff;
  font-size: 0.85em;
  margin-top: 0.2em;
}
.badge-level {
  font-weight: 700;
  margin-right: 0.3em;
}
.badge-level.bronze { color: #cd7f32; }
.badge-level.silver { color: #bfc1c2; }
.badge-level.gold { color: #ffd700; }
.badge-level.platinum { color: #00bfff; }
.badge-carousel {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.carousel-header {
  margin-bottom: 16px;
}

.carousel-title {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.carousel-container {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.carousel-container::-webkit-scrollbar {
  display: none;
}

.carousel-track {
  display: flex;
  gap: 16px;
  padding-bottom: 8px;
}

.badge-item {
  flex: 0 0 250px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.badge-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.badge-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  text-align: center;
}

.badge-info {
  text-align: center;
}

.badge-name {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 4px;
  line-height: 1.2;
}

.badge-employer {
  color: #4ecdc4;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.badge-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-bottom: 6px;
}

.badge-source {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 8px;
  display: inline-block;
}

.badge-source.auto {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.badge-source.manual {
  background: rgba(155, 89, 182, 0.2);
  color: #9b59b6;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.carousel-nav:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.nav-left {
  left: -20px;
}

.nav-right {
  right: -20px;
}

/* Мобильная адаптивность */
@media (max-width: 768px) {
  .badge-carousel {
    padding: 16px;
  }
  
  .badge-item {
    flex: 0 0 200px;
    padding: 12px;
  }
  
  .carousel-nav {
    display: none; /* На мобильных только свайп */
  }
  
  .badge-icon {
    font-size: 1.5rem;
  }
  
  .badge-name {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .badge-item {
    flex: 0 0 160px;
    padding: 10px;
  }
  
  .carousel-title {
    font-size: 1rem;
  }
}
</style>
