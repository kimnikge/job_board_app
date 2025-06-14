<template>
  <div class="company-card" @click="navigateToCompany">
    <div class="company-card__header">
      <div class="company-card__logo">
        {{ company.name.charAt(0) }}
      </div>
      <div class="company-card__rating">
        <i class="fas fa-star"></i>
        {{ company.rating }}
      </div>
    </div>

    <h3 class="company-card__name">{{ company.name }}</h3>
    <p class="company-card__industry">{{ company.industry }}</p>

    <div class="company-card__details">
      <span class="company-card__detail">
        <i class="fas fa-map-marker-alt"></i>
        {{ company.location }}
      </span>
      <span class="company-card__detail">
        <i class="fas fa-users"></i>
        {{ company.size }} сотрудников
      </span>
    </div>

    <div class="company-card__jobs">
      <span class="company-card__job-count">
        {{ company.activeJobs }} активных вакансий
      </span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  company: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const navigateToCompany = () => {
  router.push({ name: 'company-details', params: { id: props.company.id } })
}
</script>

<style scoped>
.company-card {
  background: var(--color-card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.company-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s;
}

.company-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--color-shadow-lg);
  border-color: var(--color-primary);
}

.company-card:hover::before {
  left: 100%;
}

.company-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.company-card__logo {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: bold;
  color: white;
}

.company-card__rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  color: #ffd700;
  font-weight: 600;
}

.company-card__rating i {
  color: #ffd700;
}

.company-card__name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.company-card__industry {
  color: var(--color-text-light);
  margin-bottom: 1rem;
}

.company-card__details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.company-card__detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-light);
  font-size: 0.875rem;
}

.company-card__detail i {
  color: var(--color-primary);
}

.company-card__jobs {
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.company-card__job-count {
  color: var(--color-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .company-card {
    padding: 1rem;
  }

  .company-card__logo {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .company-card__name {
    font-size: 1.1rem;
  }

  .company-card__details {
    gap: 0.5rem;
  }
}
</style> 