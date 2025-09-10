<template>
  <div class="urgent-card" @click="openJobDetails">
    <div class="emergency-banner">
      СРОЧНАЯ ПОДМЕНА ТРЕБУЕТСЯ!
    </div>

    <div class="card-header">
      <button class="back-btn" v-if="showBackButton" @click.stop="$emit('back')">
        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      
      <div class="urgency-badges">
        <div class="urgency-badge primary">🔥 {{ getUrgencyText() }}</div>
        <div class="urgency-badge secondary">⚡ {{ getTimeText() }}</div>
      </div>
      
      <h1 class="job-title">{{ job.title }}</h1>
      <p class="job-subtitle">{{ getSubtitle() }}</p>
      
      <div class="time-critical">
        <div class="time-critical-title">
          ⏰ Время критично!
        </div>
        <div class="countdown">{{ getTimeDetails() }}</div>
      </div>
    </div>

    <div class="card-content">
      <div class="emergency-info">
        <div class="emergency-title">{{ getShiftTitle() }}</div>
        <div class="emergency-details">{{ getShiftTime() }}</div>
      </div>

      <div class="shift-details">
        <h3 class="section-title">
          📋 Детали подмены
        </h3>
        
        <div class="shift-item">
          <div class="shift-icon">📅</div>
          <div>
            <strong>Дата:</strong> {{ formatDate(job.needed_date) }}<br>
            <span class="shift-subtitle">{{ getDayDescription() }}</span>
          </div>
        </div>
        
        <div class="shift-item">
          <div class="shift-icon">⏰</div>
          <div>
            <strong>Время:</strong> {{ getShiftTime() }}<br>
            <span class="shift-subtitle">{{ getShiftDescription() }}</span>
          </div>
        </div>
        
        <div class="shift-item">
          <div class="shift-icon">👥</div>
          <div>
            <strong>Причина:</strong> {{ getReason() }}<br>
            <span class="shift-subtitle">Временно, возможно продление</span>
          </div>
        </div>

        <div class="shift-item">
          <div class="shift-icon">📍</div>
          <div>
            <strong>Локация:</strong> {{ job.company_name || job.venue_name }}<br>
            <span class="shift-subtitle">{{ job.location || 'Астана' }}</span>
          </div>
        </div>
      </div>

      <div class="requirements-section">
        <h3 class="section-title">
          ⚡ Срочные требования
        </h3>
        
        <div class="requirement-item" v-for="requirement in getRequirements()" :key="requirement.text">
          <span class="requirement-icon">{{ requirement.icon }}</span>
          {{ requirement.text }}
        </div>
      </div>

      <div class="payment-section">
        <div class="payment-highlight">Экстренная доплата</div>
        <div class="payment-amount">{{ formatSalary() }}</div>
        <div class="payment-description">{{ getSalaryDescription() }}</div>
      </div>

      <div class="benefits-urgent">
        <h3 class="section-title">
          🎁 Экстра-бонусы за срочность
        </h3>
        
        <div class="benefit-item" v-for="benefit in getBenefits()" :key="benefit.text">
          <div class="benefit-icon">{{ benefit.icon }}</div>
          {{ benefit.text }}
        </div>
      </div>

      <div class="contact-info">
        ⚠️ Решение принимается в течение 30 минут после отклика<br>
        📞 Менеджер свяжется с вами сразу для собеседования по телефону
      </div>

      <div class="action-buttons">
        <button 
          class="btn-urgent-apply" 
          @click.stop="handleUrgentApply"
          :disabled="loading || userResponse"
        >
          {{ getApplyButtonText() }}
        </button>
        <button class="btn-call" @click.stop="handleCall" v-if="job.contact_phone">
          📞
        </button>
      </div>
    </div>

    <!-- Контактная информация (показывается после отклика) -->
    <div v-if="showContacts" class="contacts-reveal">
      <h4>📞 Контакты для срочной связи:</h4>
      <div v-if="job.contact_phone" class="contact-item">
        <span class="contact-icon">📱</span>
        <a :href="`tel:${job.contact_phone}`" class="contact-link">
          {{ job.contact_phone }}
        </a>
      </div>
      <div v-if="job.contact_telegram" class="contact-item">
        <span class="contact-icon">💬</span>
        <a :href="`https://t.me/${job.contact_telegram}`" class="contact-link">
          @{{ job.contact_telegram }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  job: {
    type: Object,
    required: true
  },
  showBackButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['ready-click', 'share', 'back'])

const router = useRouter()
const loading = ref(false)
const showContacts = ref(false)
const userResponse = ref(null)

// Методы для форматирования данных
const getUrgencyText = () => {
  if (props.job.employment_type === 'replacement') return 'ПОДМЕНА'
  if (props.job.notification_priority >= 4) return 'КРИТИЧНО'
  return 'СРОЧНО'
}

const getTimeText = () => {
  const neededDate = new Date(props.job.needed_date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  if (neededDate.toDateString() === today.toDateString()) return 'СЕГОДНЯ'
  if (neededDate.toDateString() === tomorrow.toDateString()) return 'ЗАВТРА'
  return 'СКОРО'
}

const getSubtitle = () => {
  if (props.job.employment_type === 'replacement') {
    return 'Коллега заболел - нужна срочная замена!'
  }
  return 'Требуется опытный специалист'
}

const getTimeDetails = () => {
  const neededDate = new Date(props.job.needed_date)
  const now = new Date()
  const timeDiff = neededDate - now
  const hours = Math.floor(timeDiff / (1000 * 60 * 60))
  
  if (hours < 24) return `Смена через ${hours} часов`
  return `Смена ${formatDate(props.job.needed_date)}`
}

const getShiftTitle = () => {
  const timeText = getTimeText()
  if (timeText === 'СЕГОДНЯ') return 'Сегодняшняя смена'
  if (timeText === 'ЗАВТРА') return 'Завтрашняя смена'
  return 'Предстоящая смена'
}

const getShiftTime = () => {
  if (props.job.needed_time && props.job.shift_duration) {
    const duration = props.job.shift_duration.replace('часов', 'часов').replace('час', 'час')
    return `${props.job.needed_time} (${duration})`
  }
  if (props.job.needed_time) return props.job.needed_time
  if (props.job.shift_duration) return props.job.shift_duration
  return '8:00 - 20:00'
}

const getDayDescription = () => {
  const date = new Date(props.job.needed_date)
  const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  const dayName = dayNames[date.getDay()]
  
  if (['Пятница', 'Суббота'].includes(dayName)) return `${dayName} - активный день`
  if (dayName === 'Воскресенье') return `${dayName} - спокойный день`
  return `${dayName} - рабочий день`
}

const getShiftDescription = () => {
  if (props.job.needed_time) {
    const hour = parseInt(props.job.needed_time.split(':')[0])
    if (hour >= 6 && hour < 12) return 'Утренняя смена'
    if (hour >= 12 && hour < 18) return 'Дневная смена'
    if (hour >= 18 && hour < 24) return 'Вечерне-ночная смена'
    return 'Ночная смена'
  }
  return 'Рабочая смена'
}

const getReason = () => {
  if (props.job.employment_type === 'replacement') return 'Замена заболевшего'
  if (props.job.notification_priority >= 4) return 'Критическая нехватка'
  return 'Срочная потребность'
}

const getRequirements = () => {
  const baseRequirements = [
    { icon: '⚡', text: 'Быстрая обучаемость и стрессоустойчивость' }
  ]
  
  // Добавляем специфические требования в зависимости от специализации
  if (props.job.specializations?.name?.includes('Бармен')) {
    baseRequirements.unshift(
      { icon: '🍸', text: 'Классические коктейли (Мохито, Пина Колада, Космополитан)' },
      { icon: '🥃', text: 'Знание премиум алкоголя и винной карты' },
      { icon: '☕', text: 'Навыки бариста (эспрессо, капучино, латте)' }
    )
  } else if (props.job.specializations?.name?.includes('Повар')) {
    baseRequirements.unshift(
      { icon: '👨‍🍳', text: 'Опыт работы на кухне от 1 года' },
      { icon: '🔥', text: 'Знание технологий приготовления' },
      { icon: '🥘', text: 'Умение работать с заказами разной сложности' }
    )
  } else if (props.job.specializations?.name?.includes('Официант')) {
    baseRequirements.unshift(
      { icon: '🍽️', text: 'Опыт обслуживания гостей' },
      { icon: '💬', text: 'Хорошие коммуникативные навыки' },
      { icon: '🏃', text: 'Физическая выносливость' }
    )
  } else {
    baseRequirements.unshift(
      { icon: '👔', text: 'Опыт работы в сфере общепита' },
      { icon: '🎯', text: 'Ответственность и пунктуальность' }
    )
  }
  
  return baseRequirements
}

const formatSalary = () => {
  if (props.job.pay_per_shift) {
    return `${props.job.pay_per_shift.toLocaleString()} ₸`
  }
  if (props.job.salary_min && props.job.salary_max) {
    return `${props.job.salary_min.toLocaleString()} - ${props.job.salary_max.toLocaleString()} ₸`
  }
  if (props.job.salary_min) {
    return `от ${props.job.salary_min.toLocaleString()} ₸`
  }
  return '15 000 ₸'
}

const getSalaryDescription = () => {
  if (props.job.pay_per_shift) {
    return 'За одну смену + чаевые (обычно 3-5к ₸)'
  }
  return 'За смену + чаевые и бонусы'
}

const getBenefits = () => {
  return [
    { icon: '🍕', text: 'Полноценное питание во время смены' },
    { icon: '🚗', text: 'Такси до дома после смены за счет заведения' },
    { icon: '📞', text: 'Быстрое трудоустройство без бюрократии' },
    { icon: '⭐', text: 'При хорошей работе - предложение постоянной позиции' }
  ]
}

const getApplyButtonText = () => {
  if (userResponse.value) return '✅ УЖЕ ГОТОВ!'
  if (loading.value) return '⚡ Отправляем...'
  const timeText = getTimeText()
  if (timeText === 'СЕГОДНЯ') return '🚨 Готов работать сегодня!'
  if (timeText === 'ЗАВТРА') return '🚨 Готов работать завтра!'
  return '🚨 ГОТОВ ВЫЙТИ!'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  })
}

// Обработчики событий
const handleUrgentApply = async () => {
  if (loading.value || userResponse.value) return
  
  loading.value = true
  try {
    emit('ready-click', props.job.id)
    showContacts.value = true
    userResponse.value = { created_at: new Date() }
    
    setTimeout(() => {
      showUrgentNotification('ОТЛИЧНО! 🎉 Менеджер позвонит вам в течение 10 минут для подтверждения!')
    }, 1200)
  } catch (error) {
    console.error('Ошибка отклика:', error)
  } finally {
    loading.value = false
  }
}

const handleCall = () => {
  if (props.job.contact_phone) {
    showUrgentNotification('📞 Звоним менеджеру... Ожидайте звонка!')
    window.location.href = `tel:${props.job.contact_phone}`
  }
}

const openJobDetails = () => {
  router.push(`/jobs/${props.job.id}`)
}

const showUrgentNotification = (message) => {
  // Создаем уведомление
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: white;
    padding: 18px 25px;
    border-radius: 15px;
    font-weight: 700;
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.5);
    z-index: 1000;
    animation: urgentSlideIn 0.6s ease;
    max-width: 90%;
    text-align: center;
    border: 2px solid rgba(255,255,255,0.3);
  `
  notification.textContent = message
  
  // Добавляем стили анимации если их нет
  if (!document.querySelector('#urgentNotificationStyles')) {
    const style = document.createElement('style')
    style.id = 'urgentNotificationStyles'
    style.textContent = `
      @keyframes urgentSlideIn {
        from { transform: translateX(-50%) translateY(-150%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `
    document.head.appendChild(style)
  }
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.animation = 'urgentSlideIn 0.6s ease reverse'
    setTimeout(() => notification.remove(), 600)
  }, 4000)
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.urgent-card {
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 25px 70px rgba(255, 107, 107, 0.3);
  position: relative;
  animation: urgentPulse 2s ease-in-out infinite, slideUp 0.8s ease;
  border: 3px solid #ff6b6b;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.urgent-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 80px rgba(255, 107, 107, 0.4);
}

@keyframes urgentPulse {
  0%, 100% { 
    box-shadow: 0 25px 70px rgba(255, 107, 107, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 30px 80px rgba(255, 107, 107, 0.5);
    transform: scale(1.01);
  }
}

@keyframes slideUp {
  from { 
    transform: translateY(50px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

.emergency-banner {
  background: linear-gradient(135deg, #ff4757, #ff3838);
  color: white;
  padding: 15px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  position: relative;
  overflow: hidden;
  animation: flashingBanner 1.5s ease-in-out infinite;
}

@keyframes flashingBanner {
  0%, 100% { background: linear-gradient(135deg, #ff4757, #ff3838); }
  50% { background: linear-gradient(135deg, #ff6b6b, #ff5252); }
}

.emergency-banner::before {
  content: '🚨';
  position: absolute;
  left: 20px;
  animation: shake 0.8s ease-in-out infinite;
}

.emergency-banner::after {
  content: '🚨';
  position: absolute;
  right: 20px;
  animation: shake 0.8s ease-in-out infinite 0.4s;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.card-header {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  padding: 25px;
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  animation: urgentFloat 3s ease-in-out infinite;
}

@keyframes urgentFloat {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-15px, -15px) rotate(8deg); }
}

.urgency-badges {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
}

.urgency-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  animation: badgePulse 1.8s infinite;
  border: 1px solid rgba(255,255,255,0.3);
}

.urgency-badge.primary {
  animation-delay: 0s;
}

.urgency-badge.secondary {
  animation-delay: 0.3s;
}

@keyframes badgePulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 1;
  }
  50% { 
    transform: scale(1.05); 
    opacity: 0.9;
  }
}

.job-title {
  font-size: 32px;
  font-weight: 800;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 3px 15px rgba(0,0,0,0.3);
  position: relative;
  z-index: 2;
}

.job-subtitle {
  color: rgba(255, 255, 255, 0.95);
  font-size: 17px;
  font-weight: 600;
  position: relative;
  z-index: 2;
  margin-bottom: 15px;
}

.time-critical {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255,255,255,0.3);
}

.time-critical-title {
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  font-weight: 600;
}

.card-content {
  padding: 25px;
}

.emergency-info {
  background: linear-gradient(135deg, #ff9ff3, #f368e0);
  color: white;
  padding: 20px;
  border-radius: 20px;
  margin: -10px -10px 25px -10px;
  position: relative;
  overflow: hidden;
  text-align: center;
}

.emergency-info::before {
  content: '⚡';
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  opacity: 0.4;
  animation: lightning 2s ease-in-out infinite;
}

@keyframes lightning {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.emergency-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
}

.emergency-details {
  font-size: 16px;
  font-weight: 600;
}

.shift-details {
  background: rgba(102, 126, 234, 0.1);
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 25px;
  border: 2px dashed #667eea;
}

.shift-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #4a5568;
}

.shift-item:last-child {
  margin-bottom: 0;
}

.shift-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 18px;
  color: white;
}

.shift-subtitle {
  color: #718096;
  font-size: 13px;
  font-weight: normal;
}

.requirements-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.requirement-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  border-radius: 15px;
  color: #2d3748;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.requirement-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: #667eea;
  border-radius: 0 10px 10px 0;
}

.requirement-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(168, 237, 234, 0.4);
}

.requirement-icon {
  margin-right: 12px;
  font-size: 18px;
}

.payment-section {
  background: linear-gradient(135deg, #ffeaa7, #fab1a0);
  padding: 25px;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 25px;
  position: relative;
  overflow: hidden;
  border: 3px solid #fdcb6e;
}

.payment-section::before {
  content: '💸';
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 35px;
  opacity: 0.3;
  animation: moneyFloat 3s ease-in-out infinite;
}

@keyframes moneyFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.payment-highlight {
  font-size: 16px;
  font-weight: 700;
  color: #d63031;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.payment-amount {
  font-size: 36px;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 8px;
}

.payment-description {
  color: #636e72;
  font-weight: 600;
  font-size: 14px;
}

.benefits-urgent {
  background: rgba(255, 107, 107, 0.1);
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 25px;
  border: 2px solid #ff6b6b;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #4a5568;
}

.benefit-item:last-child {
  margin-bottom: 0;
}

.benefit-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 16px;
  color: white;
}

.contact-info {
  background: rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 25px;
  font-size: 14px;
  color: #636e72;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-urgent-apply {
  flex: 3;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 20px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
}

.btn-urgent-apply:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-urgent-apply::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s;
}

.btn-urgent-apply:hover:not(:disabled)::before {
  left: 100%;
}

.btn-urgent-apply:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 107, 107, 0.6);
}

.btn-call {
  flex: 1;
  background: rgba(46, 213, 115, 0.1);
  color: #2ed573;
  border: 2px solid #2ed573;
  padding: 18px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-call:hover {
  background: #2ed573;
  color: white;
  transform: scale(1.05);
}

.back-btn {
  position: absolute;
  top: 25px;
  left: 25px;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  z-index: 10;
}

.back-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.contacts-reveal {
  margin-top: 20px;
  padding: 20px;
  background: rgba(46, 213, 115, 0.1);
  border-radius: 15px;
  border: 2px solid #2ed573;
  animation: slideUp 0.6s ease;
}

.contacts-reveal h4 {
  margin-bottom: 15px;
  color: #2d3748;
  font-size: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.contact-icon {
  font-size: 18px;
}

.contact-link {
  color: #2ed573;
  text-decoration: none;
  font-weight: 600;
}

.contact-link:hover {
  text-decoration: underline;
}

/* Адаптивность */
@media (max-width: 768px) {
  .urgent-card {
    max-width: 100%;
    margin: 0 10px 20px 10px;
  }
  
  .card-header {
    padding: 20px;
  }
  
  .card-content {
    padding: 20px;
  }
  
  .job-title {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-urgent-apply {
    flex: none;
  }
  
  .shift-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .shift-icon {
    margin-bottom: 8px;
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .urgent-card {
    border-radius: 15px;
    margin: 0 5px 15px 5px;
  }
  
  .card-header,
  .card-content {
    padding: 15px;
  }
  
  .job-title {
    font-size: 20px;
  }
  
  .payment-amount {
    font-size: 28px;
  }
  
  .urgency-badges {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
