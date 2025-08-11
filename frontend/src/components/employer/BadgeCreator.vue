<template>
  <form class="badge-creator" @submit.prevent="handleSubmit">
    <h3 class="badge-creator__title">Создать корпоративный бейдж</h3>
    <div class="badge-creator__grid">
      <label>
        <span>Название</span>
        <input v-model="form.name" required placeholder="Лучший сотрудник" />
      </label>
      <label>
        <span>Описание</span>
        <textarea v-model="form.description" rows="2" required placeholder="За выдающиеся результаты" />
      </label>
      <label>
        <span>Иконка (emoji или URL)</span>
        <input v-model="form.icon_url" placeholder="🏆 или https://...png" />
      </label>
      <label>
        <span>Категория</span>
        <input v-model="form.category" placeholder="Company" />
      </label>
      <label>
        <span>Уровень</span>
        <select v-model="form.level">
          <option>Bronze</option>
          <option>Silver</option>
          <option>Gold</option>
          <option>Platinum</option>
        </select>
      </label>
    </div>
    <div class="badge-creator__actions">
      <button type="submit" :disabled="loading">{{ loading ? 'Создание...' : 'Создать' }}</button>
      <span v-if="error" class="error">{{ error }}</span>
      <span v-if="success" class="success">✅ Создано</span>
    </div>
    <Snackbar :message="snackbar.message" :type="snackbar.type" @close="snackbar.message = ''" />
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { employerService } from '@/services/employer.service.js'
import { useAuthStore } from '@/stores/auth'
import Snackbar from '@/components/Snackbar.vue'

const emit = defineEmits(['created'])
const auth = useAuthStore()
const snackbar = ref({ message: '', type: 'info' })

const form = ref({
  name: '',
  description: '',
  icon_url: '',
  category: 'Company',
  level: 'Bronze'
})
const loading = ref(false)
const error = ref(null)
const success = ref(false)

async function handleSubmit() {
  error.value = null
  success.value = false
  loading.value = true
  try {
    const companyId = auth.user?.user_metadata?.company_id || null
    if (!companyId) throw new Error('company_id отсутствует в user_metadata')
    const { data, error: err } = await employerService.createCompanyBadge(companyId, form.value)
    if (err) throw err
    success.value = true
    emit('created', data)
    snackbar.value = { message: 'Бейдж создан', type: 'success' }
    // Сброс
    form.value.name = ''
    form.value.description = ''
    form.value.icon_url = ''
  } catch (e) {
    error.value = e.message
    snackbar.value = { message: error.value, type: 'error' }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.badge-creator { background:rgba(255,255,255,0.05); padding:1rem 1.25rem; border:1px solid rgba(255,255,255,0.12); border-radius:12px; display:flex; flex-direction:column; gap:1rem; }
.badge-creator__title { margin:0; font-size:1.05rem; font-weight:600; color:#fff; }
.badge-creator__grid { display:grid; gap:.75rem; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); }
label { display:flex; flex-direction:column; gap:.25rem; font-size:.8rem; color:#bcd; }
input, textarea, select { background:#1d2331; border:1px solid #334; color:#fff; padding:.55rem .6rem; border-radius:8px; font:inherit; resize:vertical; }
input:focus, textarea:focus, select:focus { outline:2px solid #5562ff; border-color:#5562ff; }
.badge-creator__actions { display:flex; align-items:center; gap:1rem; }
button { background:linear-gradient(45deg,#5562ff,#6a33d4); color:#fff; border:none; padding:.7rem 1.2rem; border-radius:8px; cursor:pointer; font-weight:500; }
button:disabled { opacity:.6; cursor:default; }
.error { color:#f66; font-size:.8rem; }
.success { color:#4ade80; font-size:.85rem; }
</style>
