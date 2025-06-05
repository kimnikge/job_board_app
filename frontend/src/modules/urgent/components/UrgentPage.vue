<template>
  <div class="urgent-page">
    <div class="pt-4 pb-16">
      <!-- Заголовок -->
      <div class="page-header">
        <h1 class="text-2xl font-bold text-gray-900">Срочные вакансии</h1>
        <p class="text-gray-600 mt-2">Актуальные предложения, требующие быстрого отклика</p>
      </div>

      <!-- Фильтры -->
      <div class="filters" ref="filtersContainer">
        <div class="search-box">
          <SearchIcon class="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Поиск срочных вакансий..."
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

      <!-- Список срочных вакансий -->
      <div class="urgent-jobs">
        <div 
          v-for="job in filteredJobs" 
          :key="job.id"
          class="urgent-job-card"
          @click="navigateToJob(job.id)"
        >
          <div class="urgent-badge">
            <ZapIcon class="w-4 h-4" />
            <span>Срочно</span>
          </div>

          <div class="job-header">
            <img :src="job.companyLogo" :alt="job.companyName" class="company-logo">
            <div class="job-info">
              <h3 class="text-lg font-semibold text-white">{{ job.title }}</h3>
              <p class="text-gray-200">{{ job.companyName }}</p>
            </div>
          </div>

          <div class="job-details">
            <div class="detail-item">
              <BanknoteIcon class="w-5 h-5 text-gray-400" />
              <span class="salary">{{ job.salary.toLocaleString() }} ₸</span>
            </div>
            <div class="detail-item">
              <MapPinIcon class="w-5 h-5 text-gray-400" />
              <span>{{ job.location }}</span>
            </div>
            <div class="detail-item">
              <ClockIcon class="w-5 h-5 text-gray-400" />
              <span>{{ job.deadline }}</span>
            </div>
          </div>

          <div class="job-description text-gray-200">
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
                <CheckIcon class="w-4 h-4 mr-1" />
                {{ benefit }}
              </span>
            </div>
            <button 
              class="apply-btn"
              @click.stop="applyForJob(job)"
            >
              <CheckIcon class="w-5 h-5" />
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
import { SearchIcon, ZapIcon, BanknoteIcon, MapPinIcon, ClockIcon, CheckIcon } from 'lucide-vue-next'

export default {
  name: 'UrgentPage',
  components: {
    SearchIcon,
    ZapIcon,
    BanknoteIcon,
    MapPinIcon,
    ClockIcon,
    CheckIcon
  },
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      selectedLocation: '',
      showCategoryDropdown: false,
      showLocationDropdown: false,
      categories: [
        { id: 1, name: 'Повар' },
        { id: 2, name: 'Официант/Бармен' },
        { id: 3, name: 'Администратор/Хостес' },
        { id: 4, name: 'Кухонный работник' },
        { id: 5, name: 'Уборщик/Посудомойщик' },
        { id: 6, name: 'Менеджер зала' }
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
          title: 'Срочно требуется Повар горячего цеха',
          companyName: 'Ресторан "Восточная Сказка" в Алматы',
          companyLogo: '/images/restaurant_logo2.png',
          salary: 450000,
          location: 'Алматы',
          deadline: 'Сегодня',
          description: 'Требуется повар с опытом работы от 2-х лет для приготовления блюд восточной кухни. График 2/2...',
          tags: ['Горячий цех', 'Восточная кухня', 'Алматы'],
          benefits: ['Питание за счет компании', 'Развозка', 'Официальное трудоустройство']
        },
        {
          id: 2,
          title: 'Требуется Бармен на лето',
          companyName: 'Летняя терраса "Fresh Zone" в Астане',
          companyLogo: '/images/cafe_logo2.png',
          salary: 280000,
          location: 'Астана',
          deadline: 'До конца недели',
          description: 'Ищем энергичного бармена для работы на летней террасе. Опыт работы с коктейлями обязателен...',
          tags: ['Бармен', 'Лето', 'Астана'],
          benefits: ['Гибкий график', 'Бонусы по итогам сезона']
        },
         {
          id: 3,
          title: 'Срочно нужен Администратор в мини-отель',
          companyName: 'Мини-отель "Уютный Дом" в Шымкенте',
          companyLogo: '/images/hotel_logo2.png',
          salary: 300000,
          location: 'Шымкент',
          deadline: 'Завтра',
          description: 'Требуется ответственный администратор для работы в мини-отеле. Встреча гостей, оформление, решение текущих вопросов...',
          tags: ['Администратор', 'Отель', 'Шымкент'],
          benefits: ['Проживание', 'Бонусы за хорошую работу']
        }
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
      // Логика поиска уже в computed свойстве filteredJobs
    },
    applyFilters() {
      // Логика фильтрации уже в computed свойстве filteredJobs
       this.closeAllDropdowns();
    },
    navigateToJob(jobId) {
      // TODO: Реализовать переход на страницу деталей вакансии
       alert('Переход к деталям вакансии:' + jobId);
      //  this.$router.push({ 
      //   name: 'job-details', 
      //   params: { id: jobId }
      // });
    },
    applyForJob(job) {
      // TODO: Реализовать логику отклика на вакансию
      console.log('Applying for urgent job:', job.id);
       alert('Отклик на срочную вакансию:' + job.title);
    },
    toggleDropdown(type) {
       this.closeAllDropdowns(type);
      
      switch(type) {
        case 'category':
          this.showCategoryDropdown = !this.showCategoryDropdown;
          break;
        case 'location':
          this.showLocationDropdown = !this.showLocationDropdown;
          break;
      }
    },
    selectOption(type, value) {
      switch(type) {
        case 'category':
          this.selectedCategory = value;
          break;
        case 'location':
          this.selectedLocation = value;
          break;
      }
       this.applyFilters();
    },
    closeAllDropdowns(exceptType = null) {
      if (exceptType !== 'category') this.showCategoryDropdown = false;
      if (exceptType !== 'location') this.showLocationDropdown = false;
    },
    handleClickOutside(event) {
      if (this.$refs.filtersContainer && !this.$refs.filtersContainer.contains(event.target)) {
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
.urgent-page {
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
  background: #fff; /* Белый фон */
  border-radius: 12px;
  padding: 12px 20px; /* Увеличенные паддинги */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.search-box svg {
  color: #666; /* Цвет иконки */
  margin-right: 10px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 16px;
  color: #333; /* Цвет текста */
}

/* Стили для сетки кнопок фильтров */
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

/* Стили для кнопок фильтров */
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

/* Стили для выпадающего списка опций */
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

/* Стили для каждого элемента выпадающего списка */
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

/* Остальные стили */
.urgent-jobs {
  display: grid;
  gap: 20px;
}

.urgent-job-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 0; /* Убираем нижний отступ, т.к. есть gap в grid */
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.urgent-job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.urgent-badge {
  display: inline-flex;
  align-items: center;
  background-color: #ff5722;
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.urgent-badge svg {
  margin-right: 5px;
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
  background-color: white;
  padding: 5px;
  object-fit: contain; /* Используем contain, чтобы логотип полностью помещался */
}

.job-info {
  flex: 1;
}

.job-info h3 {
  margin: 0;
  font-size: 18px;
  color: white; /* Цвет заголовка */
}

.job-info p {
  margin: 2px 0 0 0;
  font-size: 14px;
  color: #e0e0e0; /* Светло-серый цвет для компании */
}

.job-details {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 15px; /* Размер шрифта */
  color: #e0e0e0; /* Цвет текста */
}

.detail-item svg {
  margin-right: 8px;
  color: #e0e0e0; /* Цвет иконок */
}

.salary {
  font-weight: bold;
  color: #a7ffeb;
}

.job-description {
  margin-bottom: 15px;
  font-size: 15px; /* Размер шрифта */
  line-height: 1.5;
  color: #e0e0e0; /* Цвет текста */
}

.job-tags {
  margin-bottom: 15px;
}

.tag {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 13px; /* Размер шрифта */
  margin-right: 8px;
  margin-bottom: 8px;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 20px; /* Добавляем отступ сверху */
  padding-top: 15px; /* Добавляем внутренний отступ сверху */
  border-top: 1px solid rgba(255, 255, 255, 0.2); /* Линия-разделитель */
}

.benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-grow: 1;
  margin-right: 10px;
}

.benefit-tag {
  display: inline-flex;
  align-items: center;
  background-color: rgba(167, 255, 235, 0.2); /* Прозрачный светло-зеленый */
  color: #a7ffeb; /* Светло-зеленый */
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px; /* Размер шрифта */
}

.benefit-tag svg {
  color: #a7ffeb;
  width: 14px; /* Размер иконки */
  height: 14px; /* Размер иконки */
}

.apply-btn {
  background-color: #a7ffeb;
  color: #2c3e50;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.2s ease;
}

.apply-btn svg {
  margin-right: 5px;
}

.apply-btn:hover {
  background-color: #8affd4;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .filters {
    padding: 0 10px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .job-details {
    flex-direction: column;
    gap: 10px;
  }

  .job-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .benefits {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .apply-btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 