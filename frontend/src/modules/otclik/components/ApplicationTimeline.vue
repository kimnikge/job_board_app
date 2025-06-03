<template>
  <div class="timeline">
    <div v-for="item in history" :key="item.id" class="timeline-item">
      <div class="timeline-status" :class="item.status"></div>
      <div class="timeline-content">
        <div class="timeline-status-label">{{ statusLabel(item.status) }}</div>
        <div class="timeline-meta">
          <span>{{ formatDate(item.created_at) }}</span>
          <span v-if="item.comment">— {{ item.comment }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  history: {
    type: Array,
    default: () => []
  }
})
function statusLabel(status) {
  switch (status) {
    case 'pending': return 'Отклик отправлен'
    case 'viewed': return 'Просмотрено'
    case 'invited': return 'Приглашение'
    case 'rejected': return 'Отказ'
    default: return status
  }
}
function formatDate(date) {
  return new Date(date).toLocaleString('ru-RU')
}
</script>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 18px 0;
}
.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.timeline-status {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-top: 4px;
  background: #eaf6fb;
  border: 2px solid #0088cc;
}
.timeline-status.pending { background: #ffe082; border-color: #ffb300; }
.timeline-status.viewed { background: #b3e5fc; border-color: #039be5; }
.timeline-status.invited { background: #c8e6c9; border-color: #43a047; }
.timeline-status.rejected { background: #ffcdd2; border-color: #e53935; }
.timeline-content {
  background: #fff;
  border-radius: 8px;
  padding: 10px 16px;
  box-shadow: 0 2px 8px rgba(0,136,204,0.04);
  min-width: 180px;
}
.timeline-status-label {
  font-weight: 600;
  color: #0088cc;
  margin-bottom: 4px;
}
.timeline-meta {
  color: #888;
  font-size: 13px;
}
</style>
