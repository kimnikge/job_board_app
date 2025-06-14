<template>
  <div :class="[
    'urgent-card',
    { 'tomorrow-urgent': isTomorrowComputed && !isRegular },
    { 'regular-card': isRegular },
    { 'urgent-today': !isTomorrowComputed && !isRegular && isUrgent}
  ]">
    <div :class="[
      'urgent-badge',
      { 'tomorrow-badge': isTomorrowComputed && !isRegular },
      { 'regular-badge': isRegular },
      { 'urgent-today-badge': !isTomorrowComputed && !isRegular && isUrgent}
    ]">
      <span class="lightning" v-if="!isRegular">⚡</span>
      {{ badgeText }}
    </div>
    <div class="urgent-content">
      <div class="job-header">
        <div class="company-logo">{{ companyLogo }}</div>
        <div class="job-info">
          <h3>{{ title }}</h3>
          <div class="company-name">{{ company }}</div>
        </div>
      </div>
      <div class="job-details">
        <div class="detail-item">
          <span class="detail-icon">💰</span>
          <span>{{ salary }} ₸ смена</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">📍</span>
          <span>{{ city }}</span>
        </div>
        <div class="detail-item" v-if="!isRegular">
          <span class="detail-icon">⏰</span>
          <span>{{ dateLabelComputed }}</span>
        </div>
        <div class="detail-item" v-else>
          <span class="detail-icon">🗓️</span>
          <span>Опубликовано {{ published }}</span>
        </div>
      </div>
      <div class="job-description">
        {{ description }}
      </div>
      <div class="job-tags">
        <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="job-benefits" v-if="benefits && benefits.length && !isRegular">
        <h4>Преимущества:</h4>
        <ul>
          <li v-for="benefit in benefits" :key="benefit">{{ benefit }}</li>
        </ul>
      </div>
      <div class="job-footer">
        <div class="publish-date" v-if="!isRegular">Опубликовано {{ published }}</div>
        <button class="apply-btn" @click="$emit('apply')">Откликнуться</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { notificationService } from '@/services/notificationService'

const props = defineProps({
  companyLogo: { type: String, default: '🏪' },
  title: { type: String, required: true },
  company: { type: String, required: true },
  salary: { type: String, required: true },
  city: { type: String, required: true },
  deadline: { type: String, default: '' },
  description: { type: String, required: true },
  tags: { type: Array, default: () => [] },
  benefits: { type: Array, default: () => [] },
  published: { type: String, default: 'сегодня' },
  isRegular: { type: Boolean, default: false },
  isUrgent: { type: Boolean, default: false }
})

const emit = defineEmits(['apply', 'details'])
const router = useRouter()
const isLoading = ref(false)

const isTomorrowComputed = computed(() => {
  if (props.isRegular || !props.deadline) return false;
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deadlineDate = new Date(props.deadline);

  return deadlineDate.toDateString() === tomorrow.toDateString();
});

const dateLabelComputed = computed(() => {
  if (props.isRegular) return ''
  if (!props.deadline) return ''
  const today = new Date()
  const deadlineDate = new Date(props.deadline)

  if (deadlineDate.toDateString() === today.toDateString()) {
    return 'Сегодня'
  } else if (isTomorrowComputed.value) {
    return 'Завтра'
  } else {
    return new Date(props.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  }
});

const badgeText = computed(() => {
  if (props.isRegular) return 'Обычное объявление'
  if (isTomorrowComputed.value) return 'Завтра'
  return 'Срочно'
});

const isExpired = computed(() => {
  return new Date(props.job.work_date) < new Date()
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (time) => {
  return time.substring(0, 5)
}

const handleApply = async () => {
  if (isExpired.value || isLoading.value) return
  
  try {
    isLoading.value = true
    await emit('apply', props.job.id)
    
    // Уведомляем работодателя о новом отклике
    await notificationService.notifyNewResponse({
      job_id: props.job.id,
      employer_id: props.job.employer_id
    })
    
    router.push(`/jobs/${props.job.id}`)
  } catch (error) {
    console.error('Error applying for job:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.urgent-card {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%);
  border-radius: 16px;
  padding: 0;
  margin-bottom: 20px;
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.3);
  border: 3px solid #ff9ff3;
  position: relative;
  overflow: hidden;
  animation: pulse-border 2s infinite;
}

.urgent-today {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%);
  border: 3px solid #ff9ff3;
}

.tomorrow-urgent {
  background: linear-gradient(135deg, #fd9644 0%, #f7931e 100%);
  border: 3px solid #ffbe76;
}

.regular-card {
  background: linear-gradient(135deg, #6B94FF 0%, #4D7EEB 100%);
  border: 3px solid #85a8ff;
  animation: none;
}

.urgent-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d, #ff9ff3, #74b9ff);
  border-radius: 18px;
  z-index: -1;
  animation: gradient-rotate 3s linear infinite;
}

.regular-card::before {
  background: linear-gradient(45deg, #6B94FF, #85a8ff, #4D7EEB, #6B94FF);
  animation: none;
}

@keyframes pulse-border {
  0%, 100% { border-color: #ff9ff3; }
  50% { border-color: #ffd93d; }
}

@keyframes gradient-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.urgent-badge {
  background: #ffd93d;
  color: #d63031;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: glow 1.5s ease-in-out infinite alternate;
  position: absolute;
  top: 16px;
  right: 16px;
}

.urgent-today-badge {
  background: #ffd93d;
  color: #d63031;
}

.tomorrow-badge {
  background: #ffcc5c;
  color: #e67e22;
}

.regular-badge {
  background: #a8c8ff;
  color: #2e60cf;
  animation: none;
}

@keyframes glow {
  from { box-shadow: 0 0 10px rgba(255, 217, 61, 0.5); }
  to { box-shadow: 0 0 20px rgba(255, 217, 61, 0.8); }
}

.lightning {
  font-size: 14px;
  animation: flash 1s infinite;
}

@keyframes flash {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.3; }
}

.urgent-content {
  padding: 20px;
  background: white;
  color: #2d3748;
}

.job-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.company-logo {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.job-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
  line-height: 1.3;
}

.company-name {
  color: #718096;
  font-size: 14px;
  font-weight: 500;
}

.job-details {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
}

.detail-icon {
  font-size: 16px;
  color: #ff6b6b;
}

.job-description {
  color: #4a5568;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.job-tags {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.job-benefits {
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.job-benefits h4 {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.job-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.job-benefits li {
  background: #e2e8f0;
  color: #2d3748;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.publish-date {
  color: #718096;
  font-size: 12px;
}

.apply-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.urgent-job-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 1px solid #e1e1e1;
  margin-bottom: 20px;
}

.urgent-job-card.is-featured {
  border: 2px solid #f1c40f;
}

.urgent-badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: #e74c3c;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.job-title {
  font-size: 1.5em;
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.job-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.job-details p {
  margin: 0;
  color: #7f8c8d;
}

.company {
  font-weight: bold;
  color: #34495e !important;
}

.job-description {
  margin: 15px 0;
  color: #34495e;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.apply-button, .edit-button {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s ease;
}

.apply-button {
  background: #2ecc71;
  color: white;
}

.apply-button:hover {
  background: #27ae60;
}

.apply-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.edit-button {
  background: #3498db;
  color: white;
}

.edit-button:hover {
  background: #2980b9;
}

.urgent-job-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.urgent-job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.urgent-job-card--expired {
  opacity: 0.7;
}

.urgent-job-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.urgent-job-card__badge {
  background: #ffebee;
  color: #d32f2f;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.urgent-job-card__time {
  color: #666;
  font-size: 14px;
}

.urgent-job-card__title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #1a1a1a;
}

.urgent-job-card__details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.urgent-job-card__detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #444;
}

.urgent-job-card__icon {
  font-size: 18px;
}

.urgent-job-card__description {
  margin: 0 0 20px;
  color: #666;
  line-height: 1.5;
}

.urgent-job-card__actions {
  display: flex;
  gap: 12px;
}

.urgent-job-card__button {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.urgent-job-card__button:not(:disabled) {
  background: #1976d2;
  color: white;
}

.urgent-job-card__button:not(:disabled):hover {
  background: #1565c0;
}

.urgent-job-card__button--secondary {
  background: #f5f5f5 !important;
  color: #333 !important;
}

.urgent-job-card__button--secondary:hover {
  background: #eeeeee !important;
}

.urgent-job-card__button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>