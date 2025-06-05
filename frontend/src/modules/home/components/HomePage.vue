<template>
  <div class="home-page">
    <div class="pt-4 pb-16">
      <!-- Фильтр по городам -->
      <div class="location-filter">
        <div class="filter-tabs">
          <button 
            v-for="city in cities" 
            :key="city"
            :class="['filter-tab', { active: selectedCity === city }]"
            @click="selectedCity = city"
          >
            {{ city }}
          </button>
        </div>
      </div>

      <!-- Поиск -->
      <div class="search-container">
        <div class="search-bar">
          <SearchIcon class="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Поиск вакансий..."
            @input="handleSearch"
          >
        </div>
      </div>

      <!-- Категории -->
      <div class="categories-section">
        <div class="section-title">Категории</div>
        <div class="categories-grid">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-card"
            @click="navigateToCategory(category.id)"
          >
            <component :is="category.icon" class="w-6 h-6 text-primary" />
            <h3>{{ category.name }}</h3>
            <p>{{ category.count }} вакансий</p>
          </div>
        </div>
      </div>

      <!-- Популярные вакансии -->
      <div class="popular-jobs">
        <div class="section-title">Популярные вакансии</div>
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
              <a v-if="job.whatsapp" :href="`https://wa.me/${job.whatsapp}`" target="_blank" class="social-btn whatsapp">
                <MessageCircleIcon class="w-5 h-5" />
              </a>
              <a v-if="job.telegram" :href="`https://t.me/${job.telegram}`" target="_blank" class="social-btn telegram">
                <SendIcon class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Срочные вакансии -->
      <div class="urgent-jobs">
        <div class="section-title">Срочные вакансии</div>
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
              <a v-if="job.whatsapp" :href="`https://wa.me/${job.whatsapp}`" target="_blank" class="social-btn whatsapp">
                <MessageCircleIcon class="w-5 h-5" />
              </a>
              <a v-if="job.telegram" :href="`https://t.me/${job.telegram}`" target="_blank" class="social-btn telegram">
                <SendIcon class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { 
  SearchIcon,
  MessageCircleIcon,
  SendIcon,
  UtensilsIcon,
  WineIcon,
  BellIcon,
  ChefHatIcon,
  CoffeeIcon,
  UserIcon,
  UsersIcon
} from 'lucide-vue-next'

export default {
  name: 'HomePage',
  components: {
    SearchIcon,
    MessageCircleIcon,
    SendIcon,
    UtensilsIcon,
    WineIcon,
    BellIcon,
    ChefHatIcon,
    CoffeeIcon,
    UserIcon,
    UsersIcon
  },
  data() {
    return {
      searchQuery: '',
      cities: ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Костанай'],
      selectedCity: 'Алматы',
      categories: [
        { id: 1, name: 'Повар', icon: 'UtensilsIcon' },
        { id: 2, name: 'Официант/Бармен', icon: 'WineIcon' },
        { id: 3, name: 'Администратор/Хостес', icon: 'BellIcon' },
        { id: 4, name: 'Кухонный работник', icon: 'ChefHatIcon' },
        { id: 5, name: 'Уборщик/Посудомойщик', icon: 'CoffeeIcon' },
        { id: 6, name: 'Менеджер зала', icon: 'UsersIcon' }
      ],
      popularJobs: [
        {
          id: 1,
          title: 'Повар',
          companyName: 'Ресторан "Алаша"',
          companyLogo: '/images/company1.jpg',
          salary: 250000,
          location: 'Алматы',
          languages: ['Русский', 'Казахский'],
          shift: 'Дневная',
          season: 'Постоянная',
          tags: ['Опыт от 2 лет', 'Полный день'],
          whatsapp: '+77771234567',
          telegram: 'alasha_hr'
        },
        // ... другие вакансии
      ],
      urgentJobs: [
        {
          id: 1,
          title: 'Официант',
          companyName: 'Кафе "Солнышко"',
          companyLogo: '/images/company2.jpg',
          salary: 180000,
          location: 'Алматы',
          languages: ['Русский'],
          shift: 'Вечерняя',
          season: 'Постоянная',
          tags: ['Срочно', 'Без опыта'],
          whatsapp: '+77776543210',
          telegram: 'solnce_cafe'
        },
        // ... другие срочные вакансии
      ]
    }
  },
  computed: {
    filteredPopularJobs() {
      return this.popularJobs.filter(job => 
        job.location === this.selectedCity &&
        (this.searchQuery ? 
          job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          job.companyName.toLowerCase().includes(this.searchQuery.toLowerCase())
          : true)
      )
    },
    filteredUrgentJobs() {
      return this.urgentJobs.filter(job => 
        job.location === this.selectedCity &&
        (this.searchQuery ? 
          job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          job.companyName.toLowerCase().includes(this.searchQuery.toLowerCase())
          : true)
      )
    }
  },
  methods: {
    handleSearch() {
      // Можно добавить дебаунс для оптимизации
    },
    navigateToCategory(categoryId) {
      // Навигация к категории
      console.log('Navigate to category:', categoryId)
    },
    navigateToJob(jobId) {
      // Навигация к деталям вакансии
      console.log('Navigate to job:', jobId)
    }
  }
}
</script>

<style scoped>
.home-page {
  padding: 0;
}

.location-filter {
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
  -webkit-overflow-scrolling: touch;
}

.filter-tab {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: #f0f0f0;
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab.active {
  background: #667eea;
  color: white;
}

.search-container {
  margin-bottom: 24px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  margin-left: 12px;
  font-size: 16px;
}

.categories-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.category-card h3 {
  margin: 12px 0 4px;
  font-size: 16px;
  color: #333;
}

.category-card p {
  color: #666;
  font-size: 14px;
}

.jobs-grid {
  display: grid;
  gap: 16px;
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.job-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.company-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.job-info h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.company-name {
  color: #666;
  font-size: 14px;
}

.job-details {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.salary {
  color: #667eea;
  font-weight: 600;
}

.location {
  color: #666;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.meta {
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  font-size: 12px;
  color: #667eea;
  background: #e0e7ff;
  padding: 4px 8px;
  border-radius: 4px;
}

.job-social {
  display: flex;
  gap: 8px;
}

.social-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.social-btn.whatsapp {
  background: #25D366;
}

.social-btn.telegram {
  background: #0088cc;
}

.social-btn:hover {
  transform: scale(1.1);
}

.urgent-jobs {
  margin-top: 32px;
}

.urgent-jobs-slider {
  display: grid;
  gap: 16px;
}

.urgent-job-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.urgent-job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.urgent-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff6b6b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
</style> 