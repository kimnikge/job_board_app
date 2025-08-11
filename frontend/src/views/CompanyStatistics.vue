<template>
  <div class="stats-page">
    <h1 class="page-title">Статистика компании</h1>
    <div class="toolbar">
      <button @click="load" :disabled="loading">🔄 Обновить</button>
    </div>
    <div v-if="loading" class="state">Загрузка...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-title">Сотрудников</div>
          <div class="stat-value">{{ stats.total_employees || '—' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Всего бейджей выдано</div>
          <div class="stat-value">{{ stats.total_badges_awarded || '—' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Создано корпоративных бейджей</div>
          <div class="stat-value">{{ stats.company_badges_created || '—' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Среднее бейджей на сотрудника</div>
          <div class="stat-value">{{ stats.avg_badges_per_employee || '—' }}</div>
        </div>
      </div>
      <div class="stats-section">
        <h2>Топ категории</h2>
        <CategoryStats :categories="stats.top_categories || []" />
      </div>
      <div class="stats-section">
        <h2>Недавние награждения</h2>
        <ul>
          <li v-for="award in stats.recent_awards || []" :key="award.badge_name + award.user_name">
            <span class="award-user">{{ award.user_name }}</span>
            <span class="award-badge">🏅 {{ award.badge_name }}</span>
            <span class="award-date">{{ formatDate(award.awarded_at) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { employerService } from '@/services/employer.service.js'
import { useAuthStore } from '@/stores/auth'
import CategoryStats from '@/components/CategoryStats.vue'

const auth = useAuthStore()
const loading = ref(false)
const error = ref(null)
const stats = ref({})

async function load() {
  error.value = null
  loading.value = true
  try {
    const companyId = auth.user?.user_metadata?.company_id || 'demo-company'
    const { data, error: err } = await employerService.getCompanyStatistics(companyId)
    if (err) throw err
    stats.value = data || {}
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleDateString('ru-RU', { day:'2-digit', month:'short', year:'2-digit' })
}
onMounted(load)
</script>
<style scoped>
.stats-page { padding:1.5rem; min-height:100vh; background:linear-gradient(135deg,#101622,#182233); }
.page-title { color:#fff; margin:0 0 1rem; font-size:1.6rem; font-weight:600; }
.toolbar { margin-bottom:1rem; }
button { background:#2f3a52; color:#fff; border:1px solid #3d4a63; padding:.55rem 1rem; border-radius:8px; cursor:pointer; font:inherit; }
button:hover { background:#3d4a63; }
.state { color:#ccd; padding:1rem 0; }
.state.error { color:#f66; }
.stats-grid { display:grid; gap:1rem; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); margin-bottom:2rem; }
.stat-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); padding:1rem; border-radius:14px; }
.stat-title { color:#9fb0c7; font-size:.85rem; margin-bottom:.3rem; }
.stat-value { color:#fff; font-size:1.3rem; font-weight:600; }
.stats-section { margin-bottom:2rem; }
h2 { color:#fff; font-size:1.1rem; margin-bottom:.7rem; }
ul { list-style:none; padding:0; margin:0; }
li { display:flex; gap:1.2rem; align-items:center; padding:.3rem 0; font-size:.9rem; }
.cat-name { color:#7dd3fc; font-weight:500; }
.cat-count { color:#fff; font-weight:600; }
.award-user { color:#fff; font-weight:500; }
.award-badge { color:#f6c; font-weight:600; margin-left:.5rem; }
.award-date { color:#9fb0c7; font-size:.85rem; margin-left:.7rem; }
</style>
