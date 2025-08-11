<template>
  <div class="employer-page">
    <h1 class="page-title">Корпоративные бейджи</h1>
    <div v-if="loading" class="state">Загрузка...</div>
    <div v-else>
      <BadgeCreator @created="handleBadgeCreated" />
      <div class="toolbar">
        <input v-model="query" placeholder="Поиск бейджа..." />
        <button @click="load" :disabled="loading">🔄 Обновить</button>
      </div>
      <div v-if="error" class="state error">{{ error }}</div>
      <div v-else-if="!badges.length" class="state empty">Нет бейджей</div>
      <div class="badge-grid" v-else>
        <div v-for="b in paged" :key="b.id" class="badge-card">
          <div class="badge-icon">{{ b.icon_url || '🏅' }}</div>
          <div class="badge-info">
            <h3>{{ b.name }}</h3>
            <p class="desc">{{ b.description }}</p>
            <div class="meta">
              <span class="pill level">{{ b.level }}</span>
              <span class="pill count" v-if="b.total_awarded">Выдано: {{ b.total_awarded }}</span>
              <span class="pill cat">{{ b.category }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="totalPages > 1" class="pagination">
        <button @click="page.value--" :disabled="page.value === 1">←</button>
        <span>Стр. {{ page.value }} / {{ totalPages }}</span>
        <button @click="page.value++" :disabled="page.value === totalPages">→</button>
      </div>
    </div>
    <Snackbar :message="snackbar.message" :type="snackbar.type" @close="snackbar.message = ''" />
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { employerService } from '@/services/employer.service.js'
import { useAuthStore } from '@/stores/auth'
import BadgeCreator from '@/components/employer/BadgeCreator.vue'
import Snackbar from '@/components/Snackbar.vue'

const auth = useAuthStore()
const loading = ref(false)
const error = ref(null)
const badges = ref([])
const snackbar = ref({ message: '', type: 'info' })

// Пагинация и фильтр
const page = ref(1)
const pageSize = 8
const query = ref('')
const filtered = computed(() => {
  if (!query.value) return badges.value
  const q = query.value.toLowerCase()
  return badges.value.filter(b => b.name.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q))
})
const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})
const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize))

function prependBadge(b) { badges.value.unshift(b) }
async function load() {
  error.value = null
  loading.value = true
  try {
    const companyId = auth.user?.user_metadata?.company_id
    if (!companyId) {
      error.value = 'company_id отсутствует в user_metadata'
      snackbar.value = { message: error.value, type: 'error' }
      return
    }
    const { data, error: err } = await employerService.getCompanyBadges(companyId)
    if (err) throw err
    badges.value = data || []
    page.value = 1
    snackbar.value = { message: 'Бейджи обновлены', type: 'success' }
  } catch (e) { error.value = e.message; snackbar.value = { message: error.value, type: 'error' } } finally { loading.value = false }
}
function handleBadgeCreated(b) {
  prependBadge(b)
  snackbar.value = { message: 'Бейдж создан', type: 'success' }
}
onMounted(load)
</script>
<style scoped>
.employer-page { padding:1.5rem; min-height:100vh; background:linear-gradient(135deg,#121826,#1d2331); }
.page-title { color:#fff; margin:0 0 1rem; font-size:1.6rem; font-weight:600; }
.toolbar { margin:1rem 0; display:flex; gap:.75rem; }
button { background:#2f3a52; color:#fff; border:1px solid #3d4a63; padding:.55rem 1rem; border-radius:8px; cursor:pointer; font:inherit; }
button:hover { background:#3d4a63; }
.state { color:#ccd; padding:1rem 0; }
.state.error { color:#f66; }
.state.empty { color:#889; font-style:italic; }
.badge-grid { display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); }
.badge-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:1rem; border-radius:14px; display:flex; gap:.85rem; }
.badge-icon { font-size:2rem; }
.badge-info h3 { margin:0 0 .35rem; font-size:1rem; font-weight:600; color:#fff; }
.badge-info .desc { margin:0 0 .5rem; font-size:.75rem; line-height:1.2; color:#9fb0c7; }
.meta { display:flex; flex-wrap:wrap; gap:.35rem; }
.pill { background:#243047; color:#cfe; padding:.25rem .55rem; border-radius:20px; font-size:.65rem; letter-spacing:.5px; text-transform:uppercase; font-weight:600; }
.pill.level { background:#483b78; }
.pill.count { background:#2c5d4f; }
.pill.cat { background:#414b5b; }
.pagination { margin:1rem 0; display:flex; gap:.7rem; align-items:center; justify-content:center; }
.pagination button { background:#2f3a52; color:#fff; border:1px solid #3d4a63; padding:.3rem .8rem; border-radius:8px; font-size:.8rem; cursor:pointer; }
.pagination button:disabled { opacity:.5; cursor:default; }
</style>
