<template>
  <div class="jobs-page">
    <div class="pt-4 pb-16">
      <!-- Заголовок -->
      <div class="page-header">
        <h1 class="text-2xl font-bold text-gray-900">Вакансии</h1>
        <p class="text-gray-600 mt-2">Найдите работу мечты</p>
      </div>

      <!-- Фильтры -->
      <div class="filters" ref="filtersContainer">
        <div class="search-box">
          <SearchIcon class="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Поиск вакансий..."
            v-model="searchQuery"
            @input="handleSearch"
            class="w-full bg-transparent border-none outline-none text-gray-700"
          >
        </div>
        
        <div class="filter-grid">
          <div 
            class="filter-button"
            :class="{ active: !selectedCategory }"
            @click="toggleDropdown('category')"
          >
            Все категории
          </div>
          <div 
            class="filter-button"
            :class="{ active: !selectedExperience }"
            @click="toggleDropdown('experience')"
          >
            Любой опыт
          </div>
          <div 
            class="filter-button"
            :class="{ active: !selectedSalary }"
            @click="toggleDropdown('salary')"
          >
            Оплата
          </div>
           <div 
            class="filter-button"
            :class="{ active: !selectedLocation }"
            @click="toggleDropdown('location')"
          >
            Все города
          </div>
        </div>

        <div v-if="showCategoryDropdown" class="dropdown-options">
           <div 
            class="dropdown-item"
            :class="{ active: !selectedCategory }"
            @click="selectOption('category', '')"
          >
            Все категории
          </div>
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="dropdown-item"
            :class="{ active: selectedCategory === category.id }"
            @click="selectOption('category', category.id)"
          >
            {{ category.name }}
          </div>
        </div>

        <div v-if="showExperienceDropdown" class="dropdown-options">
           <div 
            class="dropdown-item"
            :class="{ active: !selectedExperience }"
            @click="selectOption('experience', '')"
          >
            Любой опыт
          </div>
          <div 
            v-for="exp in experienceOptions" 
            :key="exp.value"
            class="dropdown-item"
            :class="{ active: selectedExperience === exp.value }"
            @click="selectOption('experience', exp.value)"
          >
            {{ exp.text }}
          </div>
        </div>

        <div v-if="showSalaryDropdown" class="dropdown-options">
           <div 
            class="dropdown-item"
            :class="{ active: !selectedSalary }"
            @click="selectOption('salary', '')"
          >
            Любая зарплата
          </div>
          <div 
            v-for="salary in salaryOptions" 
            :key="salary.value"
            class="dropdown-item"
            :class="{ active: selectedSalary === salary.value }"
            @click="selectOption('salary', salary.value)"
          >
            {{ salary.text }}
          </div>
        </div>

        <div v-if="showLocationDropdown" class="dropdown-options">
           <div 
            class="dropdown-item"
            :class="{ active: !selectedLocation }"
            @click="selectOption('location', '')"
          >
            Все города
          </div>
          <div 
            v-for="loc in locationOptions" 
            :key="loc.value"
            class="dropdown-item"
            :class="{ active: selectedLocation === loc.value }"
            @click="selectOption('location', loc.value)"
          >
            {{ loc.text }}
          </div>
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
              <h3 class="text-lg font-semibold text-gray-900">{{ job.title }}</h3>
              <p class="text-gray-600">{{ job.companyName }}</p>
            </div>
          </div>

          <div class="job-details">
            <div class="detail-item">
              <BanknoteIcon class="w-5 h-5 text-gray-400" />
              <span>{{ job.salary.toLocaleString() }} ₸</span>
            </div>
            <div class="detail-item">
              <MapPinIcon class="w-5 h-5 text-gray-400" />
              <span>{{ job.location }}</span>
            </div>
            <div class="detail-item">
              <BriefcaseIcon class="w-5 h-5 text-gray-400" />
              <span>{{ job.experience }}</span>
            </div>
          </div>

          <div class="job-description text-gray-700">
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
            <span class="posted-date text-sm text-gray-500">Опубликовано {{ job.postedDate }}</span>
            <button 
              class="apply-btn"
              @click.stop="applyForJob(job)"
            >
              Откликнуться
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon, BookmarkIcon, BanknoteIcon, MapPinIcon, ClockIcon, SunIcon, LanguagesIcon, MessageCircleIcon, SendIcon, BriefcaseIcon } from 'lucide-vue-next'

export default {
  name: 'JobsPage',
  components: {
    SearchIcon,
    BookmarkIcon,
    BanknoteIcon,
    MapPinIcon,
    ClockIcon,
    SunIcon,
    LanguagesIcon,
    MessageCircleIcon,
    SendIcon,
    BriefcaseIcon
  },
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      selectedExperience: '',
      selectedSalary: '',
      selectedLocation: '',
      categories: [
        { id: '', name: 'Все категории' },
        { id: 1, name: 'Повар' },
        { id: 2, name: 'Официант/Бармен' },
        { id: 3, name: 'Администратор/Хостес' },
        { id: 4, name: 'Кухонный работник' },
        { id: 5, name: 'Уборщик/Посудомойщик' },
        { id: 6, name: 'Менеджер зала' }
      ],
      experienceOptions: [
        { value: '', text: 'Любой опыт' },
        { value: 'Без опыта', text: 'Без опыта' },
        { value: 'До 1 года', text: 'До 1 года' },
        { value: '1-3 года', text: '1-3 года' },
        { value: '3-5 лет', text: '3-5 лет' },
        { value: 'Более 5 лет', text: 'Более 5 лет' }
      ],
      salaryOptions: [
        { value: '', text: 'Любая зарплата' },
        { value: '0-100000', text: 'До 100 000 ₸' },
        { value: '100001-200000', text: '100 001 - 200 000 ₸' },
        { value: '200001-300000', text: '200 001 - 300 000 ₸' },
        { value: '300001-500000', text: '300 001 - 500 000 ₸' },
        { value: '500001+', text: 'Более 500 000 ₸' }
      ],
      locationOptions: [
         { value: '', text: 'Все города' },
        { value: 'алматы', text: 'Алматы' },
        { value: 'астана', text: 'Астана' },
        { value: 'шымкент', text: 'Шымкент' },
        { value: 'караганда', text: 'Караганда' },
        { value: 'актобе', text: 'Актобе' }
      ],
      jobs: [
        {
          id: 1,
          title: 'Повар холодного цеха',
          companyName: 'Кафе "Аромат" в Астане',
          companyLogo: '/images/cafe_logo4.png',
          salary: 350000,
          location: 'Астана',
          experience: '1-3 года',
          description: 'Требуется повар для приготовления холодных закусок и салатов. Знание основ европейской кухни...',
          tags: ['Холодный цех', 'Европейская кухня', 'Астана'],
          languages: ['Рус'],
          shift: 'Полная занятость',
          season: null,
          whatsapp: '77012345678',
          telegram: null,
          rating: 4.2,
          postedDate: '2 дня назад',
          isSaved: false
        },
        {
          id: 2,
          title: 'Бармен',
          companyName: 'Бар "Ночной город" в Караганде',
          companyLogo: '/images/bar_logo1.png',
          salary: 280000,
          location: 'Караганда',
          experience: 'Без опыта',
          description: 'Ищем активного бармена. Обучение предоставляется. Можно без опыта, главное желание учиться...',
          tags: ['Бармен', 'Без опыта', 'Караганда'],
          languages: ['Рус', 'Каз'],
          shift: 'Ночная смена',
          season: null,
          whatsapp: null,
          telegram: 'nightcity_barman',
          rating: 3.9,
          postedDate: '4 дня назад',
          isSaved: false
        },
         {
          id: 3,
          title: 'Администратор ресторана',
          companyName: 'Ресторан "Версаль" в Павлодаре',
          companyLogo: '/images/restaurant_logo5.png',
          salary: 400000,
          location: 'Павлодар',
          experience: '3-5 лет',
          description: 'Опыт управления персоналом, знание стандартов сервиса. Работа с поставщиками, контроль качества...',
          tags: ['Администратор', 'Ресторан', 'Павлодар', 'Управление'],
          languages: ['Рус', 'Каз'],
          shift: 'Полная занятость',
          season: null,
          whatsapp: '77077778899',
          telegram: null,
          rating: 4.7,
          postedDate: '1 неделя назад',
          isSaved: false
        },
        {
          id: 4,
          title: 'Су-шеф',
          companyName: 'Отель "Ак Булак" в Усть-Каменогорске',
          companyLogo: '/images/hotel_logo3.png',
          salary: 480000,
          location: 'Усть-Каменогорск',
          experience: '5+ лет',
          description: 'Опыт работы су-шефом или старшим поваром. Организация работы кухни, контроль качества...',
          tags: ['Су-шеф', 'Управление кухней', 'Усть-Каменогорск'],
          languages: ['Рус'],
          shift: 'Полная занятость',
          season: null,
          whatsapp: '77712345678',
          telegram: null,
          rating: 4.9,
          postedDate: '3 дня назад',
          isSaved: false
        },
        {
          id: 5,
          title: 'Посудомойщица/Уборщица',
          companyName: 'Кафе "Ботагоз" в Костанае',
          companyLogo: '/images/cafe_logo5.png',
          salary: 180000,
          location: 'Костанай',
          experience: 'Без опыта',
          description: 'Требуется ответственная сотрудница для мытья посуды и поддержания чистоты на кухне. Можно без опыта...',
          tags: ['Посудомойщица', 'Уборщица', 'Без опыта', 'Костанай'],
          languages: ['Рус', 'Каз'],
          shift: 'Полная занятость',
          season: null,
          whatsapp: '77055551122',
          telegram: null,
          rating: 4.0,
          postedDate: '1 день назад',
          isSaved: false
        }
      ],
      showCategoryDropdown: false,
      showExperienceDropdown: false,
      showSalaryDropdown: false,
      showLocationDropdown: false,
    }
  },
  computed: {
    filteredJobs() {
      return this.jobs.filter(job => {
        const matchesSearch = this.searchQuery ? job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            job.companyName.toLowerCase().includes(this.searchQuery.toLowerCase()) : true
        const matchesCategory = this.selectedCategory ? job.categoryId === this.selectedCategory : true
        const matchesExperience = this.selectedExperience ? job.experience === this.selectedExperience : true
        const matchesSalary = this.selectedSalary ? this.checkSalaryRange(job.salary, this.selectedSalary) : true
        const matchesLocation = this.selectedLocation ? job.location.toLowerCase().includes(this.selectedLocation.toLowerCase()) : true
        
        return matchesSearch && matchesCategory && matchesExperience && matchesSalary && matchesLocation
      })
    }
  },
  methods: {
    handleSearch() {
      // Логика поиска уже в computed свойстве filteredJobs
    },
    applyFilters() {
      // Логика фильтрации уже в computed свойстве filteredJobs
      this.closeAllDropdowns();
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
      const salaryNum = salary
      switch(range) {
        case '0-100000':
          return salaryNum <= 100000
        case '100001-200000':
          return salaryNum > 100000 && salaryNum <= 200000
        case '200001-300000':
          return salaryNum > 200000 && salaryNum <= 300000
         case '300001-500000':
          return salaryNum > 300000 && salaryNum <= 500000
        case '500001+':
          return salaryNum > 500000
        default:
          return true
      }
    },
    toggleDropdown(type) {
      this.closeAllDropdowns(type);
      
      switch(type) {
        case 'category':
          this.showCategoryDropdown = !this.showCategoryDropdown;
          break;
        case 'experience':
          this.showExperienceDropdown = !this.showExperienceDropdown;
          break;
        case 'salary':
          this.showSalaryDropdown = !this.showSalaryDropdown;
          break;
        case 'location':
          this.showLocationDropdown = !this.showLocationDropdown;
          break;
      }
    },
    closeAllDropdowns(excludeType = null) {
      if (excludeType !== 'category') this.showCategoryDropdown = false;
      if (excludeType !== 'experience') this.showExperienceDropdown = false;
      if (excludeType !== 'salary') this.showSalaryDropdown = false;
      if (excludeType !== 'location') this.showLocationDropdown = false;
    },
     selectOption(type, value) {
      switch(type) {
        case 'category':
          this.selectedCategory = value;
          break;
        case 'experience':
          this.selectedExperience = value;
          break;
        case 'salary':
          this.selectedSalary = value;
          break;
        case 'location':
          this.selectedLocation = value;
          break;
      }
      this.closeAllDropdowns();
      this.applyFilters();
    },
    handleClickOutside(event) {
      const filtersContainer = this.$refs.filtersContainer;
      if (filtersContainer && !filtersContainer.contains(event.target)) {
        this.closeAllDropdowns();
      }
    }
  },
   mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
   beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
}
</script>

<style scoped>
.jobs-page {
  padding: 0;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.filters {
  margin-bottom: 2rem;
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
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

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.filter-button {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #4b5563;
  font-weight: 500;
}

.filter-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.filter-button:hover {
  opacity: 0.9;
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 10px 0;
  margin-top: 5px;
}

.dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  color: #4b5563;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.active {
  background: #e5e7eb;
  font-weight: 600;
}

.filter-options select {
  display: none;
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
  color: #15803d;
  background: #bbf7d0;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.25rem;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-social {
  display: flex;
  gap: 10px;
}

.social-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 20px;
}

.job-rating {
  display: flex;
  align-items: center;
}

.rating-num {
  color: #6b7280;
  font-size: 14px;
  margin-left: 5px;
}

.apply-btn {
  background: linear-gradient(90deg, #ff9800 0%, #ef4444 100%);
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(239,68,68,0.08);
  transition: background 0.2s;
}

.apply-btn:hover {
  background: linear-gradient(90deg, #ffb347 0%, #ff5252 100%);
}
</style> 