<template>
  <div class="empty-state">
    <div class="empty-icon">😕</div>
    <div class="empty-title">{{ title }}</div>
    <div class="empty-desc">{{ description }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: 'Нет данных' },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #aaa;
  background: #fff;
  border-radius: 14px;
  margin: 30px 0;
  box-shadow: 0 2px 8px rgba(0,136,204,0.04);
}
.empty-icon {
  font-size: 38px;
  margin-bottom: 10px;
}
.empty-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #0088cc;
}
.empty-desc {
  font-size: 14px;
  color: #888;
  text-align: center;
  max-width: 220px;
}
</style>
