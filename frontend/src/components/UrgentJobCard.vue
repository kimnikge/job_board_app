<template>
  <div 
    class="urgent-job-card"
    :class="{ 'highlighted': job.is_highlighted }"
  >
    <div class="card-header">
      <h3 class="job-title">{{ job.title }}</h3>
      <span class="urgent-badge">Срочно</span>
    </div>

    <div class="company-info">
      <img 
        :src="job.company_logo || '/images/default-company.png'" 
        :alt="job.company_name"
        class="company-logo"
      />
      <span class="company-name">{{ job.company_name }}</span>
    </div>

    <div class="job-details">
      <div class="detail-item">
        <MapPinIcon class="icon" />
        <span>{{ job.location }}</span>
      </div>
      <div class="detail-item">
        <BriefcaseIcon class="icon" />
        <span>{{ job.employment_type }}</span>
      </div>
      <div class="detail-item">
        <BanknoteIcon class="icon" />
        <span>{{ formatSalary(job.salary_min, job.salary_max) }}</span>
      </div>
    </div>

    <div class="job-tags">
      <span 
        v-for="tag in job.tags" 
        :key="tag"
        class="tag"
      >
        {{ tag }}
      </span>
    </div>

    <div class="card-footer">
      <router-link 
        :to="{ name: 'job-details', params: { id: job.id }}" 
        class="view-details"
      >
        Подробнее
        <ArrowRightIcon class="arrow-icon" />
      </router-link>
      
      <span class="posted-date">
        {{ formatDate(job.created_at) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { MapPinIcon, BriefcaseIcon, BanknoteIcon, ArrowRightIcon } from 'lucide-vue-next'

const props = defineProps({
  job: {
    type: Object,
    required: true
  }
})

const formatSalary = (min, max) => {
  if (!min && !max) return 'По договоренности'
  if (!max) return `от ${min.toLocaleString()} ₽`
  if (!min) return `до ${max.toLocaleString()} ₽`
  return `${min.toLocaleString()} - ${max.toLocaleString()} ₽`
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}
</script>

<style scoped>
.urgent-job-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.urgent-job-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.urgent-job-card.highlighted {
  border: 1px solid rgba(255, 99, 71, 0.5);
  box-shadow: 0 0 20px rgba(255, 99, 71, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.job-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
  flex: 1;
  margin-right: 15px;
}

.urgent-badge {
  background: linear-gradient(45deg, #FF6B6B, #FF8E53);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.company-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 12px;
  object-fit: cover;
}

.company-name {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.job-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-details {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  margin-left: 6px;
  transition: transform 0.3s;
}

.view-details:hover .arrow-icon {
  transform: translateX(4px);
}

.posted-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .urgent-job-card {
    padding: 20px;
  }

  .job-title {
    font-size: 1.1rem;
  }

  .job-details {
    flex-direction: column;
    gap: 10px;
  }
}
</style>