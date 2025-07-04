<!-- filepath: /Users/hubmarket/Desktop/job_board_app/frontend/src/modules/profile/components/ProfileStats.vue -->
<template>
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-number">{{ stats.applications }}</span>
      <span class="stat-label">Откликов</span>
    </div>
    <div class="stat-card">
      <span class="stat-number">{{ stats.views }}</span>
      <span class="stat-label">Просмотров</span>
    </div>
    <div class="stat-card">
      <span class="stat-number">{{ stats.saved }}</span>
      <span class="stat-label">Сохранено</span>
    </div>
    <div class="stat-card">
      <span class="stat-number">{{ stats.interviews }}</span>
      <span class="stat-label">Интервью</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      applications: 0,
      views: 0,
      saved: 0,
      interviews: 0
    })
  }
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  display: block;
  margin-bottom: 8px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
  .stat-number {
    font-size: 2rem;
  }
  
  .stat-label {
    font-size: 0.9rem;
  }
}
</style>
