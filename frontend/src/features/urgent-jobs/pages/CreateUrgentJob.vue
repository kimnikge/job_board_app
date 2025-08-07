<template>
  <div class="create-urgent-job-page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">🚨 Создать срочную вакансию</h1>
        <p class="page-subtitle">Заполните форму для размещения срочной вакансии в сфере общепита</p>
      </header>

      <div class="form-container glass-card">
        <form @submit.prevent="handleSubmit" class="urgent-job-form">
          <!-- Основная информация -->
          <section class="form-section">
            <h3>Основная информация</h3>
            
            <div class="form-group">
              <label for="title" class="form-label">Название вакансии *</label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                class="form-input"
                placeholder="Например: Повар-горячий цех"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="specialization" class="form-label">Специализация *</label>
                <BaseSelect
                  id="specialization"
                  v-model="form.specialization_id"
                  :options="specializationOptions"
                  placeholder="Выберите специализацию"
                  required
                />
              </div>

              <div class="form-group">
                <label for="venue_type" class="form-label">Тип заведения *</label>
                <BaseSelect
                  id="venue_type"
                  v-model="form.venue_type_id"
                  :options="venueTypeOptions"
                  placeholder="Выберите тип заведения"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="venue_name" class="form-label">Название заведения *</label>
              <input
                id="venue_name"
                v-model="form.venue_name"
                type="text"
                class="form-input"
                placeholder="Например: Ресторан \"Алатау\""
                required
              />
            </div>
          </section>

          <!-- Локация -->
          <section class="form-section">
            <h3>Местоположение</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="district" class="form-label">Район Астаны *</label>
                <BaseSelect
                  id="district"
                  v-model="form.city_district_id"
                  :options="districtOptions"
                  placeholder="Выберите район"
                  required
                />
              </div>

              <div class="form-group">
                <label for="address" class="form-label">Адрес</label>
                <input
                  id="address"
                  v-model="form.address"
                  type="text"
                  class="form-input"
                  placeholder="Улица, дом"
                />
              </div>
            </div>
          </section>

          <!-- Условия работы -->
          <section class="form-section">
            <h3>Условия работы</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="salary_min" class="form-label">Зарплата от (₸) *</label>
                <input
                  id="salary_min"
                  v-model.number="form.salary_min"
                  type="number"
                  class="form-input"
                  placeholder="120000"
                  min="50000"
                  required
                />
              </div>

              <div class="form-group">
                <label for="salary_max" class="form-label">Зарплата до (₸)</label>
                <input
                  id="salary_max"
                  v-model.number="form.salary_max"
                  type="number"
                  class="form-input"
                  placeholder="200000"
                  min="50000"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="work_schedule" class="form-label">График работы *</label>
              <BaseSelect
                id="work_schedule"
                v-model="form.work_schedule"
                :options="scheduleOptions"
                placeholder="Выберите график"
                required
              />
            </div>
          </section>

          <!-- Срочность -->
          <section class="form-section urgent-section">
            <h3>⏰ Параметры срочности</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="needed_by" class="form-label">Нужен к дате *</label>
                <input
                  id="needed_by"
                  v-model="form.needed_by"
                  type="date"
                  class="form-input"
                  :min="todayDate"
                  required
                />
              </div>

              <div class="form-group">
                <label for="auto_close_hours" class="form-label">Автозакрытие через (часов)</label>
                <BaseSelect
                  id="auto_close_hours"
                  v-model="form.auto_close_hours"
                  :options="autoCloseOptions"
                  placeholder="Выберите время"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="checkbox-group">
                <input
                  id="is_immediate"
                  v-model="form.is_immediate"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="is_immediate" class="checkbox-label">
                  🔥 Требуется немедленно (в течение 2-3 часов)
                </label>
              </div>
            </div>
          </section>

          <!-- Описание -->
          <section class="form-section">
            <h3>Описание вакансии</h3>
            
            <div class="form-group">
              <label for="description" class="form-label">Описание *</label>
              <BaseTextarea
                id="description"
                v-model="form.description"
                placeholder="Опишите обязанности, требования и условия работы..."
                rows="5"
                required
              />
            </div>

            <div class="form-group">
              <label for="requirements" class="form-label">Требования</label>
              <BaseTextarea
                id="requirements"
                v-model="form.requirements"
                placeholder="Опыт работы, навыки, образование..."
                rows="3"
              />
            </div>

            <div class="form-group">
              <label for="benefits" class="form-label">Что предлагаем</label>
              <BaseTextarea
                id="benefits"
                v-model="form.benefits"
                placeholder="Льготы, бонусы, дополнительные условия..."
                rows="3"
              />
            </div>
          </section>

          <!-- Контакты -->
          <section class="form-section">
            <h3>Контактная информация</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="contact_person" class="form-label">Контактное лицо *</label>
                <input
                  id="contact_person"
                  v-model="form.contact_person"
                  type="text"
                  class="form-input"
                  placeholder="Имя контактного лица"
                  required
                />
              </div>

              <div class="form-group">
                <label for="contact_phone" class="form-label">Телефон *</label>
                <input
                  id="contact_phone"
                  v-model="form.contact_phone"
                  type="tel"
                  class="form-input"
                  placeholder="+7 (___) ___-__-__"
                  required
                />
              </div>
            </div>
          </section>

          <!-- Действия -->
          <div class="form-actions">
            <BaseButton
              type="button"
              variant="secondary"
              @click="goBack"
            >
              Отмена
            </BaseButton>
            
            <BaseButton
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="!isFormValid"
            >
              {{ isSubmitting ? "Создаём..." : "🚨 Создать срочную вакансию" }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import BaseSelect from "@/shared/ui/BaseSelect.vue"
import BaseTextarea from "@/shared/ui/BaseTextarea.vue"
import BaseButton from "@/shared/ui/BaseButton.vue"
import { useUrgentJobs } from "../composables/useUrgentJobs"
import { useReferences } from "@/shared/composables/useReferences"
import { useNotifications } from "@/shared/composables/useNotifications"

const router = useRouter()
const { createUrgentJob } = useUrgentJobs()
const { specializations, venueTypes, cityDistricts } = useReferences()
const { showNotification } = useNotifications()

// Состояние формы
const isSubmitting = ref(false)

// Данные формы
const form = ref({
  title: "",
  specialization_id: "",
  venue_type_id: "",
  venue_name: "",
  city_district_id: "",
  address: "",
  salary_min: "",
  salary_max: "",
  work_schedule: "",
  needed_by: "",
  auto_close_hours: 24,
  is_immediate: false,
  description: "",
  requirements: "",
  benefits: "",
  contact_person: "",
  contact_phone: ""
})

// Опции для селектов
const specializationOptions = computed(() => {
  return specializations.value.map(spec => ({
    value: spec.id,
    label: `${spec.icon} ${spec.name}`
  }))
})

const venueTypeOptions = computed(() => {
  return venueTypes.value.map(type => ({
    value: type.id,
    label: type.name
  }))
})

const districtOptions = computed(() => {
  return cityDistricts.value.map(district => ({
    value: district.id,
    label: district.name
  }))
})

const scheduleOptions = [
  { value: "full_time", label: "Полный день" },
  { value: "part_time", label: "Неполный день" },
  { value: "shift_work", label: "Сменный график" },
  { value: "flexible", label: "Гибкий график" }
]

const autoCloseOptions = [
  { value: 6, label: "6 часов" },
  { value: 12, label: "12 часов" },
  { value: 24, label: "24 часа" },
  { value: 48, label: "48 часов" }
]

// Вычисляемые свойства
const todayDate = computed(() => {
  return new Date().toISOString().split("T")[0]
})

const isFormValid = computed(() => {
  return form.value.title &&
         form.value.specialization_id &&
         form.value.venue_type_id &&
         form.value.venue_name &&
         form.value.city_district_id &&
         form.value.salary_min &&
         form.value.work_schedule &&
         form.value.needed_by &&
         form.value.description &&
         form.value.contact_person &&
         form.value.contact_phone
})

// Методы
const handleSubmit = async () => {
  if (!isFormValid.value) {
    showNotification("Заполните все обязательные поля", "error")
    return
  }

  isSubmitting.value = true

  try {
    const urgentJob = await createUrgentJob(form.value)
    
    showNotification("Срочная вакансия успешно создана!", "success")
    
    // Переход на страницу созданной вакансии
    router.push(`/urgent/${urgentJob.id}`)
    
  } catch (error) {
    console.error("Ошибка создания срочной вакансии:", error)
    showNotification("Ошибка при создании вакансии", "error")
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.go(-1)
}

// Инициализация
onMounted(() => {
  // Устанавливаем дату по умолчанию на завтра
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  form.value.needed_by = tomorrow.toISOString().split("T")[0]
})
</script>

<style scoped>
.create-urgent-job-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
  background: var(--gradient-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.form-container {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.urgent-job-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary);
}

.urgent-section h3 {
  color: var(--color-danger);
  border-bottom-color: var(--color-danger);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;
  margin: 0;
}

.form-input {
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(245, 87, 108, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(245, 87, 108, 0.3);
}

.form-checkbox {
  width: 18px;
  height: 18px;
  margin: 0;
}

.checkbox-label {
  font-size: 0.95rem;
  color: var(--color-danger);
  font-weight: 500;
  margin: 0;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
