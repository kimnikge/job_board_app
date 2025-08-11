<template>
  <div class="employer-page">
    <h1 class="page-title">Сотрудники</h1>
    <div class="toolbar">
      <input v-model="query" placeholder="Поиск сотрудника..." />
      <button @click="load" :disabled="loading">🔄 Обновить</button>
    </div>
    <div v-if="loading" class="state">Загрузка...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="!employees.length" class="state empty">Нет сотрудников</div>
    <div v-else class="employees-table">
      <table>
        <thead>
          <tr>
            <th>Имя</th><th>Бейджи</th><th>Смены</th><th>Недавние</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in paged" :key="e.id">
            <td>{{ e.full_name }}</td>
            <td>{{ e.total_badges }}</td>
            <td>{{ e.total_shifts }}</td>
            <td>
              <span v-for="b in e.badges" :key="b.name" class="mini-badge">{{ b.name }}</span>
              <button class="award-btn" @click="openModal(e.id)">🏅 Выдать бейдж</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="totalPages > 1" class="pagination">
      <button @click="page.value--" :disabled="page.value === 1">←</button>
      <span>Стр. {{ page.value }} / {{ totalPages }}</span>
      <button @click="page.value++" :disabled="page.value === totalPages">→</button>
    </div>
    <AwardBadgeModal
      :visible="modalVisible"
      :userId="selectedUserId"
      :onClose="closeModal"
      @awarded="handleAwarded"
    />
    <Snackbar :message="snackbar.message" :type="snackbar.type" @close="snackbar.message = ''" />
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { employerService } from '@/services/employer.service.js'
import { useAuthStore } from '@/stores/auth'
import AwardBadgeModal from '@/components/employer/AwardBadgeModal.vue'
import Snackbar from '@/components/Snackbar.vue'
import { ROLES } from '@/constants/roles.js'

const auth = useAuthStore()
const loading = ref(false)
const error = ref(null)
const employees = ref([])
const snackbar = ref({ message: '', type: 'info' })
const modalVisible = ref(false)
const selectedUserId = ref(null)

const isEmployer = computed(() => auth.user?.user_metadata?.user_type === ROLES.EMPLOYER)

// Пагинация и фильтр
const page = ref(1)
const pageSize = 10
const query = ref('')
const filtered = computed(() => {
  if (!query.value) return employees.value
  const q = query.value.toLowerCase()
  return employees.value.filter(e => e.full_name.toLowerCase().includes(q))
})
const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})
const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize))

function openModal(userId) {
  if (!isEmployer.value) {
    snackbar.value = { message: 'Только работодатель может выдавать бейджи', type: 'error' }
    return
  }
  selectedUserId.value = userId
  modalVisible.value = true
}
function closeModal() {
  modalVisible.value = false
  selectedUserId.value = null
}
function handleAwarded() {
  closeModal()
  snackbar.value = { message: 'Бейдж успешно выдан', type: 'success' }
  load()
}
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
    const { data, error: err } = await employerService.getEmployees(companyId)
    if (err) throw err
    employees.value = data || []
    page.value = 1
    snackbar.value = { message: 'Сотрудники обновлены', type: 'success' }
  } catch (e) { error.value = e.message; snackbar.value = { message: error.value, type: 'error' } } finally { loading.value = false }
}
onMounted(load)
</script>
<style scoped>
.employer-page { padding:1.5rem; min-height:100vh; background:linear-gradient(135deg,#121826,#1d2331); }
.page-title { color:#fff; margin:0 0 1rem; font-size:1.6rem; font-weight:600; }
.toolbar { margin:.5rem 0 1rem; display:flex; gap:.75rem; }
button { background:#2f3a52; color:#fff; border:1px solid #3d4a63; padding:.55rem 1rem; border-radius:8px; cursor:pointer; font:inherit; }
button:hover { background:#3d4a63; }
.state { color:#ccd; padding:1rem 0; }
.state.error { color:#f66; }
.state.empty { color:#889; font-style:italic; }
.employees-table table { width:100%; border-collapse:collapse; }
th, td { text-align:left; padding:.55rem .6rem; font-size:.8rem; }
th { background:#202a3b; color:#fff; position:sticky; top:0; }
tr:nth-child(even) { background:#182131; }
tr:nth-child(odd) { background:#1c2534; }
tr:hover { background:#243044; }
.mini-badge { display:inline-block; background:#394864; color:#d0e6ff; padding:.15rem .45rem; margin:.1rem; border-radius:12px; font-size:.6rem; font-weight:600; }
.award-btn { margin-left:.5rem; background:#2f3a52; color:#fff; border:1px solid #3d4a63; padding:.25rem .7rem; border-radius:8px; font-size:.7rem; cursor:pointer; }
.award-btn:hover { background:#3d4a63; }
.pagination { margin:1rem 0; display:flex; gap:.7rem; align-items:center; justify-content:center; }
.pagination button { background:#2f3a52; color:#fff; border:1px solid #3d4a63; padding:.3rem .8rem; border-radius:8px; font-size:.8rem; cursor:pointer; }
.pagination button:disabled { opacity:.5; cursor:default; }
</style>
