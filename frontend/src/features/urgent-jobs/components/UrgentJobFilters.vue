<!--
  🔍 ФИЛЬТРЫ СРОЧНЫХ ВАКАНСИЙ
  
  Компонент для фильтрации срочных вакансий по различным критериям
-->

<template>
  <div class="urgent-filters">
    <!-- Быстрые фильтры -->
    <div class="quick-filters">
      <div class="filter-row">
        <FilterChip
          v-for="filter in quickFilters"
          :key="filter.key"
          :label="filter.label"
          :icon="filter.icon"
          :active="isQuickFilterActive(filter.key)"
          :count="filter.count"
          @click="toggleQuickFilter(filter.key)"
        />
      </div>
    </div>

    <!-- Расширенные фильтры -->
    <Transition name="filters-expand">
      <div v-if="showAdvanced" class="advanced-filters">
        <!-- Специализации -->
        <div class="filter-group">
          <h4 class="filter-title">
            <DynamicIcon name="briefcase" />
            Специализации
          </h4>
          <div class="filter-options">
            <FilterCheckbox
              v-for="spec in specializations"
              :key="spec.id"
              :label="spec.name"
              :icon="spec.icon"
              :checked="filters.specialization_ids.includes(spec.id)"
              :count="spec.count"
              @change="toggleSpecialization(spec.id)"
            />
          </div>
        </div>

        <!-- Районы -->
        <div class="filter-group">
          <h4 class="filter-title">
            <DynamicIcon name="map-pin" />
            Районы
          </h4>
          <div class="filter-options">
            <FilterCheckbox
              v-for="district in districts"
              :key="district.id"
              :label="district.name"
              :icon="district.icon"
              :checked="filters.district_ids.includes(district.id)"
              :count="district.count"
              @change="toggleDistrict(district.id)"
            />
          </div>
        </div>

        <!-- Зарплата -->
        <div class="filter-group">
          <h4 class="filter-title">
            <DynamicIcon name="dollar-sign" />
            Зарплата
          </h4>
          <div class="salary-range">
            <BaseInput
              v-model="filters.salary_min"
              type="number"
              placeholder="От"
              size="small"
              @input="onSalaryChange"
            />
            <span class="range-separator">—</span>
            <BaseInput
              v-model="filters.salary_max"
              type="number"
              placeholder="До"
              size="small"
              @input="onSalaryChange"
            />
          </div>
          <div class="salary-presets">
            <FilterChip
              v-for="preset in salaryPresets"
              :key="preset.key"
              :label="preset.label"
              size="small"
              :active="isSalaryPresetActive(preset)"
              @click="applySalaryPreset(preset)"
            />
          </div>
        </div>

        <!-- Тип заведения -->
        <div class="filter-group">
          <h4 class="filter-title">
            <DynamicIcon name="building" />
            Тип заведения
          </h4>
          <div class="filter-options">
            <FilterCheckbox
              v-for="type in venueTypes"
              :key="type.id"
              :label="type.name"
              :icon="type.icon"
              :checked="filters.venue_type_ids.includes(type.id)"
              :count="type.count"
              @change="toggleVenueType(type.id)"
            />
          </div>
        </div>

        <!-- Опыт работы -->
        <div class="filter-group">
          <h4 class="filter-title">
            <DynamicIcon name="award" />
            Опыт работы
          </h4>
          <div class="filter-options">
            <FilterRadio
              v-for="exp in experienceOptions"
              :key="exp.value"
              :label="exp.label"
              :value="exp.value"
              :checked="filters.experience_required === exp.value"
              :count="exp.count"
              @change="setExperience(exp.value)"
            />
          </div>
        </div>

        <!-- Дополнительные опции -->
        <div class="filter-group">
          <h4 class="filter-title">
            <DynamicIcon name="settings" />
            Дополнительно
          </h4>
          <div class="filter-toggles">
            <FilterToggle
              :checked="filters.instant_contact"
              icon="zap"
              label="Мгновенная связь"
              @change="filters.instant_contact = $event"
            />
            <FilterToggle
              :checked="filters.verified_companies"
              icon="shield-check"
              label="Проверенные компании"
              @change="filters.verified_companies = $event"
            />
            <FilterToggle
              :checked="filters.with_bonus"
              icon="gift"
              label="С бонусами"
              @change="filters.with_bonus = $event"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Кнопки управления -->
    <div class="filter-actions">
      <BaseButton
        variant="ghost"
        size="small"
        :icon-left="showAdvanced ? 'chevron-up' : 'chevron-down'"
        @click="showAdvanced = !showAdvanced"
      >
        {{ showAdvanced ? 'Скрыть фильтры' : 'Больше фильтров' }}
      </BaseButton>

      <div class="action-buttons">
        <BaseButton
          variant="ghost"
          size="small"
          icon-left="x"
          @click="resetFilters"
          :disabled="!hasActiveFilters"
        >
          Сбросить
        </BaseButton>

        <BaseButton
          variant="primary"
          size="small"
          icon-left="check"
          @click="applyFilters"
          :disabled="!hasChanges"
        >
          Применить ({{ filteredCount }})
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted } from 'vue'
import { useUrgentJobFilters } from '../composables/useUrgentJobs.js'

import BaseButton from '../../../shared/ui/BaseButton.vue'
import BaseInput from '../../../shared/ui/BaseInput.vue'
import DynamicIcon from '../../../components/DynamicIcon.vue'

// Компоненты фильтров
import FilterChip from './FilterChip.vue'
import FilterCheckbox from './FilterCheckbox.vue'
import FilterRadio from './FilterRadio.vue'
import FilterToggle from './FilterToggle.vue'

export default {
  name: 'UrgentJobFilters',
  components: {
    BaseButton,
    BaseInput,
    DynamicIcon,
    FilterChip,
    FilterCheckbox,
    FilterRadio,
    FilterToggle
  },
  
  emits: ['update:filters', 'apply'],
  
  setup(props, { emit }) {
    const {
      filters,
      specializations,
      districts,
      venueTypes,
      filteredCount,
      resetFilters: resetStoreFilters,
      setFilters
    } = useUrgentJobFilters()
    
    const showAdvanced = ref(false)
    const hasChanges = ref(false)
    
    // Быстрые фильтры
    const quickFilters = computed(() => [
      {
        key: 'critical',
        label: 'Критично',
        icon: 'alert-triangle',
        count: 5
      },
      {
        key: 'high',
        label: 'Срочно',
        icon: 'clock',
        count: 12
      },
      {
        key: 'expires_soon',
        label: 'Истекает скоро',
        icon: 'timer',
        count: 8
      },
      {
        key: 'instant_contact',
        label: 'Быстрая связь',
        icon: 'zap',
        count: 15
      },
      {
        key: 'high_salary',
        label: 'Высокая зарплата',
        icon: 'trending-up',
        count: 6
      }
    ])
    
    // Пресеты зарплаты
    const salaryPresets = [
      { key: 'entry', label: '100-150К', min: 100000, max: 150000 },
      { key: 'middle', label: '150-250К', min: 150000, max: 250000 },
      { key: 'senior', label: '250-400К', min: 250000, max: 400000 },
      { key: 'premium', label: '400К+', min: 400000, max: null }
    ]
    
    // Опции опыта
    const experienceOptions = [
      { value: '', label: 'Любой опыт', count: 25 },
      { value: 'no_experience', label: 'Без опыта', count: 8 },
      { value: 'up_to_1_year', label: 'До 1 года', count: 6 },
      { value: '1_to_3_years', label: '1-3 года', count: 7 },
      { value: '3_to_5_years', label: '3-5 лет', count: 3 },
      { value: 'more_than_5_years', label: 'Более 5 лет', count: 1 }
    ]
    
    // Проверка активных фильтров
    const hasActiveFilters = computed(() => {
      return (
        filters.value.specialization_ids.length > 0 ||
        filters.value.district_ids.length > 0 ||
        filters.value.venue_type_ids.length > 0 ||
        filters.value.urgency_level ||
        filters.value.salary_min ||
        filters.value.salary_max ||
        filters.value.experience_required ||
        filters.value.instant_contact ||
        filters.value.verified_companies ||
        filters.value.with_bonus
      )
    })
    
    // Методы для быстрых фильтров
    function isQuickFilterActive(key) {
      switch (key) {
        case 'critical':
          return filters.value.urgency_level === 'critical'
        case 'high':
          return filters.value.urgency_level === 'high'
        case 'expires_soon':
          return filters.value.expires_soon
        case 'instant_contact':
          return filters.value.instant_contact
        case 'high_salary':
          return filters.value.salary_min >= 250000
        default:
          return false
      }
    }
    
    function toggleQuickFilter(key) {
      const newFilters = { ...filters.value }
      
      switch (key) {
        case 'critical':
          newFilters.urgency_level = newFilters.urgency_level === 'critical' ? '' : 'critical'
          break
        case 'high':
          newFilters.urgency_level = newFilters.urgency_level === 'high' ? '' : 'high'
          break
        case 'expires_soon':
          newFilters.expires_soon = !newFilters.expires_soon
          break
        case 'instant_contact':
          newFilters.instant_contact = !newFilters.instant_contact
          break
        case 'high_salary':
          if (newFilters.salary_min >= 250000) {
            newFilters.salary_min = null
          } else {
            newFilters.salary_min = 250000
          }
          break
      }
      
      setFilters(newFilters)
      hasChanges.value = true
    }
    
    // Методы для специализаций
    function toggleSpecialization(id) {
      const ids = [...filters.value.specialization_ids]
      const index = ids.indexOf(id)
      
      if (index > -1) {
        ids.splice(index, 1)
      } else {
        ids.push(id)
      }
      
      setFilters({ ...filters.value, specialization_ids: ids })
      hasChanges.value = true
    }
    
    // Методы для районов
    function toggleDistrict(id) {
      const ids = [...filters.value.district_ids]
      const index = ids.indexOf(id)
      
      if (index > -1) {
        ids.splice(index, 1)
      } else {
        ids.push(id)
      }
      
      setFilters({ ...filters.value, district_ids: ids })
      hasChanges.value = true
    }
    
    // Методы для типов заведений
    function toggleVenueType(id) {
      const ids = [...filters.value.venue_type_ids]
      const index = ids.indexOf(id)
      
      if (index > -1) {
        ids.splice(index, 1)
      } else {
        ids.push(id)
      }
      
      setFilters({ ...filters.value, venue_type_ids: ids })
      hasChanges.value = true
    }
    
    // Методы для зарплаты
    function onSalaryChange() {
      hasChanges.value = true
    }
    
    function isSalaryPresetActive(preset) {
      return (
        filters.value.salary_min === preset.min &&
        (preset.max === null || filters.value.salary_max === preset.max)
      )
    }
    
    function applySalaryPreset(preset) {
      setFilters({
        ...filters.value,
        salary_min: preset.min,
        salary_max: preset.max
      })
      hasChanges.value = true
    }
    
    // Методы для опыта
    function setExperience(value) {
      setFilters({ ...filters.value, experience_required: value })
      hasChanges.value = true
    }
    
    // Общие методы
    function resetFilters() {
      resetStoreFilters()
      hasChanges.value = false
      emit('apply')
    }
    
    function applyFilters() {
      hasChanges.value = false
      emit('apply')
    }
    
    // Отслеживание изменений
    watch(filters, (newFilters) => {
      emit('update:filters', newFilters)
    }, { deep: true })
    
    return {
      // Data
      showAdvanced,
      hasChanges,
      filters,
      
      // Computed
      quickFilters,
      salaryPresets,
      experienceOptions,
      specializations,
      districts,
      venueTypes,
      filteredCount,
      hasActiveFilters,
      
      // Methods
      isQuickFilterActive,
      toggleQuickFilter,
      toggleSpecialization,
      toggleDistrict,
      toggleVenueType,
      onSalaryChange,
      isSalaryPresetActive,
      applySalaryPreset,
      setExperience,
      resetFilters,
      applyFilters
    }
  }
}
</script>

<style scoped>
.urgent-filters {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

/* 🚀 БЫСТРЫЕ ФИЛЬТРЫ */
.quick-filters {
  margin-bottom: 1rem;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* 🔧 РАСШИРЕННЫЕ ФИЛЬТРЫ */
.advanced-filters {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.filter-title :deep(.dynamic-icon) {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary);
}

.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}

/* 💰 ЗАРПЛАТА */
.salary-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.range-separator {
  color: var(--text-secondary);
  font-weight: 500;
}

.salary-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* 🎛️ ПЕРЕКЛЮЧАТЕЛИ */
.filter-toggles {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 🎬 ДЕЙСТВИЯ */
.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* 🎭 АНИМАЦИИ */
.filters-expand-enter-active,
.filters-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.filters-expand-enter-from,
.filters-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.filters-expand-enter-to,
.filters-expand-leave-from {
  max-height: 800px;
  opacity: 1;
  transform: translateY(0);
}

/* 📱 АДАПТИВНОСТЬ */
@media (max-width: 768px) {
  .urgent-filters {
    padding: 1rem;
  }
  
  .filter-row {
    gap: 0.375rem;
  }
  
  .filter-options {
    grid-template-columns: 1fr;
  }
  
  .salary-range {
    flex-direction: column;
    align-items: stretch;
  }
  
  .range-separator {
    text-align: center;
    padding: 0.25rem 0;
  }
  
  .filter-actions {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .filter-row {
    flex-direction: column;
  }
  
  .salary-presets {
    flex-direction: column;
  }
}
</style>
