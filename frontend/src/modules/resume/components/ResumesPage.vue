<template>
  <div class="resumes-page">
    <div class="pt-4 pb-16">
      <!-- Заголовок -->
      <div class="page-header">
        <h1 class="text-2xl font-bold text-gray-900">Резюме</h1>
        <p class="text-gray-600 mt-2">Найдите подходящего специалиста</p>
      </div>

      <!-- Фильтры -->
      <div class="filters">
        <div class="search-box">
          <SearchIcon class="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Поиск резюме..."
            v-model="searchQuery"
            @input="handleSearch"
            class="w-full bg-transparent border-none outline-none text-gray-700"
          >
        </div>
        
        <!-- Сетка основных кнопок фильтров -->
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

        <!-- Выпадающие списки для фильтров -->
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
            Оплата
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
                <h3 class="text-lg font-semibold text-gray-900">{{ resume.fullName }}</h3>
                <p class="text-gray-600">{{ resume.position }}</p>
              </div>
            </div>
            <div class="resume-actions">
              <button 
                class="save-btn"
                @click.stop="toggleSave(resume)"
                :class="{ 'saved': resume.isSaved }"
              >
                <BookmarkIcon :class="['w-5 h-5', resume.isSaved ? 'text-yellow-400' : '']" />
              </button>
            </div>
          </div>

          <div class="resume-details">
            <div class="detail-item">
              <BanknoteIcon class="w-5 h-5 text-gray-400" />
              <span class="text-gray-700">Ожидания: {{ resume.salary.toLocaleString() }} ₸</span>
            </div>
            <div class="detail-item">
              <MapPinIcon class="w-5 h-5 text-gray-400" />
              <span class="text-gray-700">{{ resume.location }}</span>
            </div>
            <div class="detail-item">
              <BriefcaseIcon class="w-5 h-5 text-gray-400" />
              <span class="text-gray-700">Опыт: {{ resume.experience }}</span>
            </div>
            <div class="detail-item">
              <LanguagesIcon class="w-5 h-5 text-gray-400" />
              <span class="text-gray-700">Языки: {{ resume.languages.join(', ') }}</span>
            </div>
          </div>

          <div class="resume-description text-gray-600">
            {{ resume.description }}
          </div>

          <div class="skills">
            <h4 class="text-sm font-semibold text-gray-900 mb-2">Навыки</h4>
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
            <span class="updated-date text-sm text-gray-500">Обновлено {{ resume.updatedDate }}</span>
            <button 
              class="contact-btn"
              @click.stop="contactCandidate(resume)"
            >
              Связаться
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon, BookmarkIcon, BanknoteIcon, MapPinIcon, BriefcaseIcon, LanguagesIcon } from 'lucide-vue-next'

export default {
  name: 'ResumesPage',
  components: {
    SearchIcon,
    BookmarkIcon,
    BanknoteIcon,
    MapPinIcon,
    BriefcaseIcon,
    LanguagesIcon
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
        { value: '', text: 'Оплата' },
        { value: '0-200000', text: 'До 200 000 ₸' },
        { value: '200000-400000', text: '200 000 - 400 000 ₸' },
        { value: '400000-600000', text: '400 000 - 600 000 ₸' },
        { value: '600000+', text: 'Более 600 000 ₸' }
      ],
      locationOptions: [
         { value: '', text: 'Все города' },
        { value: 'алматы', text: 'Алматы' },
        { value: 'астана', text: 'Астана' },
        { value: 'шымкент', text: 'Шымкент' },
        { value: 'караганда', text: 'Караганда' },
        { value: 'актобе', text: 'Актобе' }
      ],
      resumes: [
        {
          id: 1,
          fullName: 'Айжан Жумаева',
          position: 'Повар-кондитер',
          avatar: '/images/avatar2.png',
          salary: 400000,
          location: 'Алматы',
          experience: '3-5 лет',
          description: 'Опыт работы в кондитерских цехах и ресторанах. Приготовление десертов, выпечки, тортов на заказ...',
          skills: ['Кондитерское искусство', 'Европейские десерты', 'Выпечка', 'Работа с тестом'],
          languages: ['Рус', 'Каз'],
          updatedDate: '1 день назад',
          isSaved: false
        },
        {
          id: 2,
          fullName: 'Данияр Ибраев',
          position: 'Официант',
          avatar: '/images/avatar3.png',
          salary: 250000,
          location: 'Астана',
          experience: '1-3 года',
          description: 'Опыт работы в ресторанах и кафе. Знание стандартов сервиса, умение работать с R-keeper...',
          skills: ['Обслуживание клиентов', 'Стандарты сервиса', 'Работа в команде', 'R-keeper'],
          languages: ['Рус', 'Каз', 'Англ (базовый)'],
          updatedDate: '3 дня назад',
          isSaved: false
        },
         {
          id: 3,
          fullName: 'Елена Ковалева',
          position: 'Администратор зала',
          avatar: '/images/avatar4.png',
          salary: 300000,
          location: 'Шымкент',
          experience: '5+ лет',
          description: 'Опыт управления персоналом, контроль работы зала, решение конфликтных ситуаций. Знание программы автоматизации...',
          skills: ['Управление персоналом', 'Организация работы', 'Конфликт-менеджмент', 'Работа с клиентами'],
          languages: ['Рус'],
          updatedDate: '1 неделя назад',
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
    filteredResumes() {
      return this.resumes.filter(resume => {
        const matchesSearch = this.searchQuery ? resume.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            resume.position.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                             resume.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            resume.skills.some(skill => skill.toLowerCase().includes(this.searchQuery.toLowerCase()))
                          : true
        const matchesCategory = this.selectedCategory ? resume.categoryId === this.selectedCategory : true
        const matchesExperience = this.selectedExperience ? resume.experience === this.selectedExperience : true
        const matchesSalary = this.selectedSalary ? this.checkSalaryRange(resume.salary, this.selectedSalary) : true
        const matchesLocation = this.selectedLocation ? resume.location.toLowerCase().includes(this.selectedLocation.toLowerCase()) : true
        
        return matchesSearch && matchesCategory && matchesExperience && matchesSalary && matchesLocation
      })
    }
  },
  methods: {
    handleSearch() {
       // Логика поиска уже в computed свойстве filteredResumes
    },
    applyFilters() {
       // Логика фильтрации уже в computed свойстве filteredResumes
       this.closeAllDropdowns();
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
      // Закрываем все dropdowns, кроме текущего
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
      this.closeAllDropdowns(); // Закрываем dropdown после выбора опции
      this.applyFilters();
    },
    handleClickOutside(event) {
      const filtersContainer = this.$refs.filtersContainer; // Используем ref
      if (filtersContainer && !filtersContainer.contains(event.target)) {
        this.closeAllDropdowns();
      }
    }
  },
  mounted() {
    // Добавляем обработчик клика по документу для закрытия dropdowns при клике вне их
    document.addEventListener('click', this.handleClickOutside);
  },
   beforeUnmount() {
    // Удаляем обработчик при уничтожении компонента
    document.removeEventListener('click', this.handleClickOutside);
  }
}
</script>

<style scoped>
.resumes-page {
  max-width: 414px;
  margin: 0 auto;
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
  background: white;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
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

.resumes-list {
  display: grid;
  gap: 1rem;
}

.resume-card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.resume-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.save-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
}

.save-btn.saved {
  color: #667eea;
}

.save-btn:hover {
  transform: scale(1.1);
}

.resume-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-item i {
  width: 1rem;
  text-align: center;
}

.resume-description {
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.875rem;
}

.skills {
  margin-bottom: 1rem;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  color: #15803d;
  background: #bbf7d0;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.25rem;
}

.resume-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.contact-btn {
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
.contact-btn:hover {
  background: linear-gradient(90deg, #ffb347 0%, #ff5252 100%);
}
</style> 