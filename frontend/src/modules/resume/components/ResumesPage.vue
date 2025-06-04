<template>
  <div class="resumes-page">
    <!-- Фильтры -->
    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Поиск резюме..."
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

    <!-- Список резюме -->
    <div class="resumes-list">
      <div 
        v-for="resume in filteredResumes" 
        :key="resume.id"
        class="resume-card"
        @click="navigateToResume(resume.id)"
      >
        <div class="resume-header">
          <div class="candidate-info">
            <img :src="resume.avatar" :alt="resume.fullName" class="avatar">
            <div class="info">
              <h3>{{ resume.fullName }}</h3>
              <p class="position">{{ resume.position }}</p>
            </div>
          </div>
          <div class="resume-actions">
            <button class="save-btn" @click.stop="toggleSave(resume)">
              <i :class="['fas', resume.isSaved ? 'fa-bookmark' : 'fa-bookmark-o']"></i>
            </button>
          </div>
        </div>

        <div class="resume-details">
          <div class="detail-item">
            <i class="fas fa-money-bill-wave"></i>
            <span>{{ resume.salary }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ resume.location }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-briefcase"></i>
            <span>{{ resume.experience }}</span>
          </div>
        </div>

        <div class="resume-description">
          {{ resume.description }}
        </div>

        <div class="skills">
          <h4>Навыки</h4>
          <div class="skills-list">
            <span 
              v-for="skill in resume.skills" 
              :key="skill"
              class="skill-tag"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <div class="resume-footer">
          <span class="updated-date">Обновлено {{ resume.updatedDate }}</span>
          <button class="contact-btn" @click.stop="contactCandidate(resume)">
            Связаться
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResumesPage',
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
      resumes: [
        {
          id: 1,
          fullName: 'Иван Петров',
          position: 'Frontend Developer',
          avatar: '/images/avatar1.png',
          salary: 'от 150 000 ₽',
          location: 'Москва',
          experience: '3 года',
          description: 'Опытный Frontend разработчик с фокусом на Vue.js и React. Имею опыт работы над крупными проектами...',
          skills: ['Vue.js', 'React', 'TypeScript', 'HTML5', 'CSS3', 'Git'],
          updatedDate: '2 дня назад',
          isSaved: false
        },
        // Добавьте больше резюме
      ]
    }
  },
  computed: {
    filteredResumes() {
      return this.resumes.filter(resume => {
        const matchesSearch = resume.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            resume.position.toLowerCase().includes(this.searchQuery.toLowerCase())
        const matchesCategory = !this.selectedCategory || resume.categoryId === this.selectedCategory
        const matchesExperience = !this.selectedExperience || resume.experience === this.selectedExperience
        const matchesSalary = !this.selectedSalary || this.checkSalaryRange(resume.salary, this.selectedSalary)
        
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
    navigateToResume(resumeId) {
      this.$router.push({ 
        name: 'resume-details', 
        params: { id: resumeId }
      })
    },
    toggleSave(resume) {
      resume.isSaved = !resume.isSaved
      // Здесь можно добавить логику сохранения в избранное
    },
    contactCandidate(resume) {
      // Здесь можно добавить логику связи с кандидатом
      console.log('Contacting candidate:', resume.id)
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
.resumes-page {
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

.resumes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.resume-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.resume-card:hover {
  transform: translateY(-5px);
}

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.candidate-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}

.info h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.position {
  color: #6b7280;
  font-size: 14px;
  margin: 5px 0 0;
}

.resume-actions {
  margin-left: 15px;
}

.save-btn {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  font-size: 20px;
}

.resume-details {
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

.resume-description {
  color: #4b5563;
  margin-bottom: 15px;
  line-height: 1.5;
}

.skills {
  margin-bottom: 15px;
}

.skills h4 {
  color: #1f2937;
  margin: 0 0 10px;
  font-size: 16px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: #f3f4f6;
  color: #4b5563;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.resume-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.updated-date {
  color: #6b7280;
  font-size: 14px;
}

.contact-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.contact-btn:hover {
  opacity: 0.9;
}
</style> 