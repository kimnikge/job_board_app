<template>
  <div class="skill-bar">
    <div class="skill-header">
      <span class="skill-name">{{ skill.name }}</span>
      <span class="skill-level">{{ skill.calculated_level }}/100</span>
    </div>
    
    <div class="skill-progress">
      <div 
        class="skill-fill"
        :class="getSkillLevelClass(skill.calculated_level)"
        :style="{ width: skill.calculated_level + '%' }"
      >
        <div class="skill-shine"></div>
      </div>
    </div>
    
    <div class="skill-meta">
      <span class="skill-category">{{ getCategoryIcon(skill.category) }} {{ getCategoryName(skill.category) }}</span>
      <span v-if="skill.calculated_level !== skill.base_level" class="skill-boost">
        +{{ skill.calculated_level - skill.base_level }} от бейджей
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  skill: {
    type: Object,
    required: true
  }
})

// Цветовые уровни согласно плану: 0-30 / 31-70 / 71-100
function getSkillLevelClass(level) {
  if (level <= 30) return 'skill-beginner'
  if (level <= 70) return 'skill-intermediate' 
  return 'skill-expert'
}

function getCategoryIcon(category) {
  const icons = {
    kitchen: '👨‍🍳',
    service: '🍽️', 
    management: '📊',
    other: '⚙️'
  }
  return icons[category] || icons.other
}

function getCategoryName(category) {
  const names = {
    kitchen: 'Кухня',
    service: 'Обслуживание',
    management: 'Управление', 
    other: 'Другое'
  }
  return names[category] || names.other
}
</script>

<style scoped>
.skill-bar {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.skill-bar:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.skill-name {
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

.skill-level {
  font-weight: 700;
  font-size: 0.9rem;
  color: #4ecdc4;
}

.skill-progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  position: relative;
}

.skill-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease-in-out;
  position: relative;
  overflow: hidden;
}

/* Цветовые градации уровней */
.skill-beginner {
  background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
}

.skill-intermediate {
  background: linear-gradient(90deg, #ffd93d, #ffed4e);
}

.skill-expert {
  background: linear-gradient(90deg, #4ecdc4, #44a08d);
}

.skill-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.skill-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.skill-category {
  color: rgba(255, 255, 255, 0.7);
}

.skill-boost {
  color: #4ecdc4;
  font-weight: 600;
  font-size: 0.8rem;
}

/* Мобильная адаптивность */
@media (max-width: 480px) {
  .skill-bar {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .skill-name {
    font-size: 0.9rem;
  }
  
  .skill-level {
    font-size: 0.8rem;
  }
  
  .skill-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
