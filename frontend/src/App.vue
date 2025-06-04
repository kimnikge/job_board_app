<template>
  <GlobalErrorBoundary>
    <NotificationSystem />
    <router-view />
  </GlobalErrorBoundary>
</template>

<script setup>
import NotificationSystem from './shared/ui/NotificationSystem.vue'
import GlobalErrorBoundary from './shared/ui/GlobalErrorBoundary.vue'
import { ref, computed, watchEffect, onMounted } from 'vue'
import { supabase } from '@/supabase'
import JobSeekerProfile from './modules/user/components/JobSeekerProfile.vue'
import EmployerProfile from './modules/user/components/EmployerProfile.vue'
import MyApplications from './modules/otclik/components/MyApplications.vue'
import EmployerApplications from './modules/otclik/components/EmployerApplications.vue'

onMounted(async () => {
  const { data, error } = await supabase.from('resumes').select('*')

  if (error) {
    console.error('❌ Ошибка запроса к Supabase:', error.message)
  } else {
    console.log('✅ Резюме загружены из Supabase:', data)
  }
})

// Разделы приложения (нижнее меню)
const sections = [
  { label: 'Вакансии', icon: '💼', route: 'jobs', badge: 12 },
  { label: 'Сотрудники', icon: '👥', route: 'employees', badge: 24 },
  { label: 'Срочно', icon: '🔥', route: 'urgent', badge: 3 },
  { label: 'Профиль', icon: '👤', route: 'profile' },
]
const section = ref('jobs')

// Фильтры по профессиям (работают только в разделе сотрудники)
const filters = ['Все', 'Повара', 'Официанты', 'Бариста', 'Менеджеры', 'Уборка']
const filter = ref('Все')
const search = ref('')

const employees = ref([
  {
    name: 'Анна Петрова',
    position: 'Шеф-повар',
    skills: ['Европейская', 'Фьюжн', 'Веган'],
    price: '1 200 ₽/час',
    exp: '8 лет',
    status: 'available',
    photo: 'https://i.imgur.com/JqYeXZn.jpg',
    type: 'Повара',
    urgent: true,
  },
  {
    name: 'Иван Смирнов',
    position: 'Бариста',
    skills: ['Кофе', 'Коктейли', 'Обучение'],
    price: '900 ₽/час',
    exp: '5 лет',
    status: 'busy',
    photo: 'https://i.imgur.com/3ZQ4Q8a.jpg',
    type: 'Бариста',
    urgent: false,
  },
  {
    name: 'Мария Иванова',
    position: 'Официант',
    skills: ['VIP-обслуживание', 'Английский'],
    price: '800 ₽/час',
    exp: '3 года',
    status: 'offline',
    photo: 'https://i.imgur.com/5X5X5X5.jpg',
    type: 'Официанты',
    urgent: true,
  },
])

const filteredEmployees = computed(() => {
  let arr = employees.value
  if (section.value === 'urgent') arr = arr.filter(e => e.urgent)
  if (section.value === 'employees' && filter.value !== 'Все') arr = arr.filter(e => e.type === filter.value)
  if (search.value && (section.value === 'employees' || section.value === 'urgent')) arr = arr.filter(e => e.name.toLowerCase().includes(search.value.toLowerCase()))
  return arr
})

// Получение роли пользователя (из localStorage или JWT)
const userRole = ref(localStorage.getItem('role') || '')
watchEffect(() => {
  userRole.value = localStorage.getItem('role') || ''
})

function setSection(route) {
  section.value = route
  // Сброс фильтра и поиска при смене раздела
  if (route !== 'employees') filter.value = 'Все'
  search.value = ''
}
</script>

<style scoped>
:root {
  --tg-primary: #0088cc;
  --tg-secondary: #f5f5f5;
  --tg-text: #333333;
  --tg-hover: #e6f2f8;
  --status-available: #4CAF50;
  --status-busy: #FF9800;
  --status-offline: #9E9E9E;
}
.mobile-app {
  /* max-width: 500px; */
  margin: 0 auto;
  min-height: 100vh;
  background: var(--tg-secondary);
  color: var(--tg-text);
  padding-bottom: 70px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
header {
  background: linear-gradient(90deg, #0088cc 0%, #00bfae 100%);
  color: white;
  padding: 18px 0 15px 0;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 100;
  font-size: 1.3rem;
  letter-spacing: 1px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,136,204,0.07);
}
.search-bar {
  margin: 18px 15px 10px 15px;
  background: #fff;
  border-radius: 20px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,136,204,0.04);
}
.search-bar input {
  border: none;
  outline: none;
  width: 100%;
  margin-left: 10px;
  font-size: 16px;
  background: transparent;
  color: #222;
}
.filters {
  display: flex;
  overflow-x: auto;
  padding: 10px 15px 0 15px;
  gap: 10px;
  background: transparent;
  margin-bottom: 5px;
}
.filter {
  background: #eaf6fb;
  color: #0088cc;
  padding: 8px 15px;
  border-radius: 15px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid #d0eaf6;
  transition: background 0.2s, color 0.2s;
}
.filter.active {
  background: linear-gradient(90deg, #0088cc 0%, #00bfae 100%);
  color: #fff;
  border: 1px solid #00bfae;
}
.cards-container {
  padding: 0 15px;
  margin-bottom: 20px;
}
.employee-card {
  background: linear-gradient(90deg, #fff 60%, #eaf6fb 100%);
  border-radius: 14px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,136,204,0.06);
  display: flex;
  overflow: hidden;
  height: 120px;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1.5px solid #eaf6fb;
}
.employee-card:hover {
  box-shadow: 0 6px 18px rgba(0,136,204,0.13);
  transform: translateY(-2px) scale(1.02);
  border-color: #00bfae;
}
.employee-photo {
  width: 100px;
  height: 120px;
  background-color: #eee;
  background-size: cover;
  background-position: center;
  position: relative;
}
.status {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #fff;
}
.status.available {
  background-color: var(--status-available);
}
.status.busy {
  background-color: var(--status-busy);
}
.status.offline {
  background-color: var(--status-offline);
}
.employee-info {
  padding: 12px 14px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.employee-name {
  font-weight: 700;
  font-size: 17px;
  margin-bottom: 4px;
  color: #222;
}
.employee-position {
  color: #0088cc;
  font-size: 14px;
  margin-bottom: 7px;
  font-weight: 500;
}
.employee-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;
}
.skill {
  background: #eaf6fb;
  color: #0088cc;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.employee-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.employee-price {
  color: #00bfae;
  font-weight: bold;
  font-size: 16px;
}
.employee-exp {
  font-size: 12px;
  color: #888;
}
footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  /* max-width: 500px; */
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 6px 0;
  box-shadow: 0 -2px 8px rgba(0,136,204,0.08);
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}
.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #888;
  font-size: 12px;
  position: relative;
  padding: 5px 0 0 0;
  cursor: pointer;
  min-width: 60px;
  transition: color 0.2s;
}
.tab.active {
  color: #0088cc;
  font-weight: 700;
}
.tab-icon {
  font-size: 22px;
  margin-bottom: 3px;
}
.badge {
  background: linear-gradient(90deg, #0088cc 0%, #00bfae 100%);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0,136,204,0.13);
}
.section-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  color: #aaa;
  background: #fff;
  border-radius: 14px;
  margin-top: 30px;
  box-shadow: 0 2px 8px rgba(0,136,204,0.04);
}
.section-icon {
  font-size: 38px;
  margin-bottom: 10px;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #0088cc;
}
.section-desc {
  font-size: 14px;
  color: #888;
  text-align: center;
  max-width: 220px;
}
.empty-msg {
  text-align: center;
  color: #aaa;
  margin: 40px 0 20px 0;
  font-size: 15px;
}
</style>