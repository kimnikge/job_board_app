<template>
  <div class="urgent-page">
    <!-- Заголовок -->
    <div class="page-header">
      <h1>Срочные вакансии</h1>
      <p class="subtitle">Актуальные предложения, требующие быстрого отклика</p>
    </div>

    <!-- Фильтры -->
    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Поиск срочных вакансий..."
          v-model="searchQuery"
          @input="handleSearch"
        >
      </div>
      
      <div class="filter-options">
        <select v-model="selectedCategory" @change="applyFilters">
          <option value="">Все категории</option>
          <option 
            v-for="category in categories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>

        <select v-model="selectedLocation" @change="applyFilters">
          <option value="">Все города</option>
          <option value="moscow">Москва</option>
          <option value="spb">Санкт-Петербург</option>
          <option value="remote">Удаленно</option>
        </select>
      </div>
    </div>

    <!-- Список срочных вакансий -->
    <div class="urgent-jobs">
      <div 
        v-for="job in filteredJobs" 
        :key="job.id"
        class="urgent-job-card"
        @click="navigateToJob(job.id)"
      >
        <div class="urgent-badge">
          <i class="fas fa-bolt"></i>
          Срочно
        </div>

        <div class="job-header">
          <img :src="job.companyLogo" :alt="job.companyName" class="company-logo">
          <div class="job-info">
            <h3>{{ job.title }}</h3>
            <p class="company-name">{{ job.companyName }}</p>
          </div>
        </div>

        <div class="job-details">
          <div class="detail-item">
            <i class="fas fa-money-bill-wave"></i>
            <span class="salary">{{ job.salary }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ job.location }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>{{ job.deadline }}</span>
          </div>
        </div>

        <div class="job-description">
          {{ job.description }}
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

        <div class="job-footer">
          <div class="benefits">
            <span 
              v-for="benefit in job.benefits" 
              :key="benefit"
              class="benefit-tag"
            >
              <i class="fas fa-check"></i>
              {{ benefit }}
            </span>
          </div>
          <button class="apply-btn" @click.stop="applyForJob(job)">
            Откликнуться
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UrgentPage',
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      selectedLocation: '',
      categories: [
        { id: 1, name: 'IT' },
        { id: 2, name: 'Маркетинг' },
        { id: 3, name: 'Дизайн' },
        { id: 4, name: 'Продажи' },
        { id: 5, name: 'Менеджмент' },
        { id: 6, name: 'Финансы' }
      ],
      jobs: [
        {
          id: 1,
          title: 'Senior Frontend Developer',
          companyName: 'Tech Solutions',
          companyLogo: '/images/company1.png',
          salary: 'от 250 000 ₽',
          location: 'Москва',
          deadline: 'До конца недели',
          description: 'Срочно требуется опытный Frontend разработчик для работы над новым проектом...',
          tags: ['Vue.js', 'React', 'TypeScript'],
          benefits: ['Удаленная работа', 'Гибкий график', 'Медицинская страховка']
        },
        // Добавьте больше срочных вакансий
      ]
    }
  },
  computed: {
    filteredJobs() {
      return this.jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            job.companyName.toLowerCase().includes(this.searchQuery.toLowerCase())
        const matchesCategory = !this.selectedCategory || job.categoryId === this.selectedCategory
        const matchesLocation = !this.selectedLocation || job.location.toLowerCase().includes(this.selectedLocation)
        
        return matchesSearch && matchesCategory && matchesLocation
      })
    }
  },
  methods: {
    handleSearch() {
      // Здесь можно добавить логику поиска
    },
    applyFilters() {
      // Здесь можно добавить логику фильтрации
    },
    navigateToJob(jobId) {
      this.$router.push({ 
        name: 'job-details', 
        params: { id: jobId }
      })
    },
    applyForJob(job) {
      // Здесь можно добавить логику отклика на вакансию
      console.log('Applying for urgent job:', job.id)
    }
  }
}
</script>

<style scoped>
.urgent-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: #1f2937;
  font-size: 32px;
  margin-bottom: 10px;
}

.subtitle {
  color: #6b7280;
  font-size: 18px;
}

.filters {
  margin-bottom: 30px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-box i {
  color: #666;
  margin-right: 10px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 16px;
}

.filter-options {
  display: flex;
  gap: 15px;
}

.filter-options select {
  padding: 8px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #4b5563;
  cursor: pointer;
}

.urgent-jobs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.urgent-job-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  overflow: hidden;
}

.urgent-job-card:hover {
  transform: translateY(-5px);
}

.urgent-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.job-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.company-logo {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-right: 15px;
}

.job-info h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.company-name {
  color: #6b7280;
  font-size: 14px;
  margin: 5px 0 0;
}

.job-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  color: #6b7280;
}

.detail-item i {
  margin-right: 8px;
  width: 16px;
}

.salary {
  color: #10b981;
  font-weight: 600;
}

.job-description {
  color: #4b5563;
  margin-bottom: 15px;
  line-height: 1.5;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.tag {
  background: #f3f4f6;
  color: #4b5563;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.job-footer {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.benefit-tag {
  background: #f0fdf4;
  color: #059669;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.apply-btn {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  font-weight: 600;
}

.apply-btn:hover {
  opacity: 0.9;
}
</style> 