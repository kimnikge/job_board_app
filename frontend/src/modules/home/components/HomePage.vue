<template>
  <div class="home-page">
    <!-- Фильтр по городам -->
    <div class="location-filter">
      <div class="filter-tabs">
        <div v-for="city in cities" :key="city" class="filter-tab" :class="{active: city === selectedCity}" @click="selectedCity = city">
          {{ city }}
        </div>
      </div>
    </div>
    <!-- Поисковая строка -->
    <div class="search-container">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Поиск вакансий и резюме..."
          v-model="searchQuery"
          @input="handleSearch"
        >
      </div>
    </div>

    <!-- Категории -->
    <div class="categories-section">
      <div class="section-title"><i class="fas fa-th-large"></i>Категории</div>
      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-card"
          @click="navigateToCategory(category.id)"
        >
          <i :class="category.icon"></i>
          <span>{{ category.name }}</span>
        </div>
      </div>
    </div>

    <!-- Популярные вакансии -->
    <div class="popular-jobs">
      <div class="section-title"><i class="fas fa-fire"></i>Популярные вакансии</div>
      <div class="jobs-grid">
        <div 
          v-for="job in filteredPopularJobs" 
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
          </div>
          <div class="job-details">
            <span class="salary">от {{ job.salary.toLocaleString() }} ₸</span>
            <span class="location">{{ job.location }}</span>
          </div>
          <div class="job-meta">
            <span class="meta">Языки: {{ job.languages.join(', ') }}</span>
            <span class="meta">Смена: {{ job.shift }}</span>
            <span class="meta" v-if="job.season">Сезон: {{ job.season }}</span>
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
          <div class="job-social">
            <a v-if="job.whatsapp" :href="`https://wa.me/${job.whatsapp}`" target="_blank" class="social-btn whatsapp"><i class="fab fa-whatsapp"></i></a>
            <a v-if="job.telegram" :href="`https://t.me/${job.telegram}`" target="_blank" class="social-btn telegram"><i class="fab fa-telegram"></i></a>
          </div>
          <div class="job-rating">
            <i v-for="n in 5" :key="n" class="fa-star" :class="n <= job.rating ? 'fas' : 'far'"></i>
            <span class="rating-num">({{ job.rating }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Срочные вакансии -->
    <div class="urgent-jobs">
      <div class="section-title"><i class="fas fa-bolt"></i>Срочные вакансии</div>
      <div class="urgent-jobs-slider">
        <div 
          v-for="job in filteredUrgentJobs" 
          :key="job.id"
          class="urgent-job-card"
          @click="navigateToJob(job.id)"
        >
          <div class="urgent-badge">Срочно</div>
          <h3>{{ job.title }}</h3>
          <p class="company-name">{{ job.companyName }}</p>
          <span class="salary">от {{ job.salary.toLocaleString() }} ₸</span>
          <div class="job-meta">
            <span class="meta">Языки: {{ job.languages.join(', ') }}</span>
            <span class="meta">Смена: {{ job.shift }}</span>
            <span class="meta" v-if="job.season">Сезон: {{ job.season }}</span>
          </div>
          <div class="job-social">
            <a v-if="job.whatsapp" :href="`https://wa.me/${job.whatsapp}`" target="_blank" class="social-btn whatsapp"><i class="fab fa-whatsapp"></i></a>
            <a v-if="job.telegram" :href="`https://t.me/${job.telegram}`" target="_blank" class="social-btn telegram"><i class="fab fa-telegram"></i></a>
          </div>
          <div class="job-rating">
            <i v-for="n in 5" :key="n" class="fa-star" :class="n <= job.rating ? 'fas' : 'far'"></i>
            <span class="rating-num">({{ job.rating }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      searchQuery: '',
      cities: ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Костанай'],
      selectedCity: 'Алматы',
      categories: [
        { id: 1, name: 'IT', icon: 'fas fa-laptop-code' },
        { id: 2, name: 'Маркетинг', icon: 'fas fa-bullhorn' },
        { id: 3, name: 'Дизайн', icon: 'fas fa-palette' },
        { id: 4, name: 'Продажи', icon: 'fas fa-shopping-cart' },
        { id: 5, name: 'Менеджмент', icon: 'fas fa-users' },
        { id: 6, name: 'Финансы', icon: 'fas fa-chart-line' }
      ],
      popularJobs: [
        {
          id: 1,
          title: 'Frontend Developer',
          companyName: 'Tech Solutions',
          companyLogo: '/images/company1.png',
          salary: 350000,
          location: 'Алматы',
          tags: ['Vue.js', 'React', 'TypeScript'],
          languages: ['Рус', 'Каз', 'Англ'],
          shift: 'Дневная',
          season: 'Лето',
          whatsapp: '77001234567',
          telegram: 'frontenddev',
          rating: 4
        },
        {
          id: 2,
          title: 'Официант',
          companyName: 'Ресторан "Астана"',
          companyLogo: '/images/company2.png',
          salary: 250000,
          location: 'Астана',
          tags: ['Обслуживание', 'Гостиница'],
          languages: ['Рус', 'Каз'],
          shift: 'Ночная',
          season: 'Круглый год',
          whatsapp: '77007654321',
          telegram: 'waiterastana',
          rating: 5
        }
      ],
      urgentJobs: [
        {
          id: 1,
          title: 'Повар в летнее кафе',
          companyName: 'Summer Cafe',
          salary: 300000,
          location: 'Алматы',
          tags: ['Повар', 'Лето'],
          languages: ['Каз', 'Рус'],
          shift: 'Дневная',
          season: 'Лето',
          whatsapp: '77005556677',
          telegram: 'chefkz',
          rating: 5
        }
      ]
    }
  },
  computed: {
    filteredPopularJobs() {
      return this.popularJobs.filter(j => j.location === this.selectedCity)
    },
    filteredUrgentJobs() {
      return this.urgentJobs.filter(j => j.location === this.selectedCity)
    }
  },
  methods: {
    handleSearch() {
      // Реализация поиска
      console.log('Searching for:', this.searchQuery)
    },
    navigateToCategory(categoryId) {
      this.$router.push({ 
        name: 'jobs', 
        query: { category: categoryId }
      })
    },
    navigateToJob(jobId) {
      this.$router.push({ 
        name: 'job-details', 
        params: { id: jobId }
      })
    }
  }
}
</script>

<style scoped>
@import '@/assets/main.css';
.home-page {
  padding: 0 0 40px 0;
}
.location-filter {
  padding: 0 20px 20px;
}
.filter-tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}
.filter-tab {
  background: white;
  border: 2px solid #e0e7ff;
  padding: 8px 16px;
  border-radius: 20px;
  white-space: nowrap;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 14px;
}
.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}
.filter-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}
.search-container {
  padding: 20px;
  background: white;
  margin: -10px 15px 20px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.1);
  position: relative;
  z-index: 10;
}
.search-bar {
  display: flex;
  align-items: center;
  background: #f8f9ff;
  border-radius: 12px;
  padding: 12px 15px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}
.search-bar:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.search-bar input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 16px;
  margin-left: 10px;
}
.search-bar i {
  color: #667eea;
}
.categories-section {
  padding: 0 20px 20px;
}
.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}
.category-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}
.category-card:hover::before {
  transform: scaleX(1);
}
.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}
.popular-jobs {
  padding: 0 20px 20px;
}
.jobs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}
.job-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}
.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}
.job-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 15px;
  object-fit: cover;
}
.job-info h3 {
  margin: 0;
  font-size: 18px;
  color: #667eea;
}
.company-name {
  color: #6b7280;
  font-size: 14px;
}
.job-details {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}
.salary {
  color: #764ba2;
  font-weight: bold;
}
.location {
  color: #667eea;
}
.job-meta {
  margin: 8px 0 4px 0;
  font-size: 13px;
  color: #555;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag {
  background: #e0e7ff;
  color: #667eea;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}
.urgent-jobs {
  padding: 0 20px 20px;
}
.urgent-jobs-slider {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}
.urgent-job-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  padding: 20px;
  min-width: 220px;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.15);
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}
.urgent-job-card:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.25);
}
.urgent-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #fff;
  color: #764ba2;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.12);
}
.job-social {
  margin: 8px 0 4px 0;
  display: flex;
  gap: 10px;
}
.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 18px;
  color: #fff;
  transition: background 0.2s;
}
.social-btn.whatsapp {
  background: #25d366;
}
.social-btn.telegram {
  background: #0088cc;
}
.social-btn:hover {
  filter: brightness(1.1);
}
.job-rating {
  margin: 8px 0 0 0;
  color: #fbbf24;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 2px;
}
.rating-num {
  color: #888;
  font-size: 13px;
  margin-left: 4px;
}
</style> 