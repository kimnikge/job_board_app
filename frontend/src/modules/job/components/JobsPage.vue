<template>
  <div class="jobs-page">
    <!-- Фильтры -->
    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Поиск вакансий..."
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

        <select v-model="selectedExperience" @change="applyFilters">
          <option value="">Любой опыт</option>
          <option value="no">Без опыта</option>
          <option value="1-3">1-3 года</option>
          <option value="3-5">3-5 лет</option>
          <option value="5+">Более 5 лет</option>
        </select>

        <select v-model="selectedSalary" @change="applyFilters">
          <option value="">Любая зарплата</option>
          <option value="0-100">до 100 000 ₽</option>
          <option value="100-200">100 000 - 200 000 ₽</option>
          <option value="200+">более 200 000 ₽</option>
        </select>
      </div>
    </div>

    <!-- Список вакансий -->
    <div class="jobs-list">
      <div 
        v-for="job in filteredJobs" 
        :key="job.id"
        class="job-card"
        @click="navigateToJob(job.id)"
      >
        <div class="job-header">
          <img :src="job.companyLogo" :alt="job.companyName" class="company-logo">
          <div class="job-info">
            <h3>{{ job.title }}</h3>
            <p class="company-name">{{ job.companyName }}</p>
          </div>
          <div class="job-actions">
            <button class="save-btn" @click.stop="toggleSave(job)">
              <i :class="['fas', job.isSaved ? 'fa-bookmark' : 'fa-bookmark-o']"></i>
            </button>
          </div>
        </div>

        <div class="job-details">
          <div class="detail-item">
            <i class="fas fa-money-bill-wave"></i>
            <span>{{ job.salary }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ job.location }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-briefcase"></i>
            <span>{{ job.experience }}</span>
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
          <span class="posted-date">{{ job.postedDate }}</span>
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
  name: 'JobsPage',
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      selectedExperience: '',
      selectedSalary: '',
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
          title: 'Frontend Developer',
          companyName: 'Tech Solutions',
          companyLogo: '/images/company1.png',
          salary: 'от 150 000 ₽',
          location: 'Москва',
          experience: '1-3 года',
          description: 'Мы ищем опытного Frontend разработчика для работы над современными веб-приложениями...',
          tags: ['Vue.js', 'React', 'TypeScript'],
          postedDate: '2 дня назад',
          isSaved: false
        },
        // Добавьте больше вакансий
      ]
    }
  },
  computed: {
    filteredJobs() {
      return this.jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            job.companyName.toLowerCase().includes(this.searchQuery.toLowerCase())
        const matchesCategory = !this.selectedCategory || job.categoryId === this.selectedCategory
        const matchesExperience = !this.selectedExperience || job.experience === this.selectedExperience
        const matchesSalary = !this.selectedSalary || this.checkSalaryRange(job.salary, this.selectedSalary)
        
        return matchesSearch && matchesCategory && matchesExperience && matchesSalary
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
    toggleSave(job) {
      job.isSaved = !job.isSaved
      // Здесь можно добавить логику сохранения в избранное
    },
    applyForJob(job) {
      // Здесь можно добавить логику отклика на вакансию
      console.log('Applying for job:', job.id)
    },
    checkSalaryRange(salary, range) {
      // Простая проверка диапазона зарплаты
      const salaryNum = parseInt(salary.replace(/[^0-9]/g, ''))
      switch(range) {
        case '0-100':
          return salaryNum <= 100000
        case '100-200':
          return salaryNum > 100000 && salaryNum <= 200000
        case '200+':
          return salaryNum > 200000
        default:
          return true
      }
    }
  }
}
</script>

<style scoped>
.jobs-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.job-card:hover {
  transform: translateY(-5px);
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

.job-info {
  flex: 1;
}

.job-info h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.company-name {
  color: #6b7280;
  font-size: 14px;
}

.job-actions {
  margin-left: 15px;
}

.save-btn {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  font-size: 20px;
}

.job-details {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  color: #6b7280;
}

.detail-item i {
  margin-right: 5px;
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
  justify-content: space-between;
  align-items: center;
}

.posted-date {
  color: #6b7280;
  font-size: 14px;
}

.apply-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.apply-btn:hover {
  opacity: 0.9;
}
</style> 