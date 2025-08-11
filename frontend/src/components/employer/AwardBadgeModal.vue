<template>
  <div v-if="visible" class="modal-bg">
    <div class="modal">
      <h3>Выдать бейдж сотруднику</h3>
      <form @submit.prevent="handleSubmit">
        <label>
          <span>Бейдж</span>
          <select v-model="form.badgeId" required>
            <option v-for="b in badges" :key="b.id" :value="b.id">{{ b.name }} ({{ b.level }})</option>
          </select>
        </label>
        <label>
          <span>Причина</span>
          <input v-model="form.reason" required placeholder="За отличную работу" />
        </label>
        <div class="actions">
          <button type="submit" :disabled="loading">Выдать</button>
          <button type="button" @click="close">Отмена</button>
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="success" class="success">✅ Выдано</div>
      </form>
    </div>
  </div>
  <Snackbar :message="snackbar.message" :type="snackbar.type" @close="snackbar.message = ''" />
</template>
<script setup>
import { ref, watch } from 'vue'
import { employerService } from '@/services/employer.service.js'
import { useAuthStore } from '@/stores/auth'
import Snackbar from '@/components/Snackbar.vue'

const props = defineProps({
  visible: Boolean,
  userId: String,
  onClose: Function
})
const emit = defineEmits(['awarded'])
const auth = useAuthStore()
const snackbar = ref({ message: '', type: 'info' })
const badges = ref([])
const form = ref({ badgeId: '', reason: '' })
const loading = ref(false)
const error = ref(null)
const success = ref(false)

watch(() => props.visible, async (v) => {
  if (v) await loadBadges()
})

async function loadBadges() {
  error.value = null
  loading.value = true
  try {
    const companyId = auth.user?.user_metadata?.company_id || null
    if (!companyId) {
      error.value = 'company_id отсутствует в user_metadata'
      snackbar.value = { message: error.value, type: 'error' }
      return
    }
    const { data, error: err } = await employerService.getBadgeCatalog(companyId)
    if (err) throw err
    badges.value = data || []
  } catch (e) { error.value = e.message; snackbar.value = { message: error.value, type: 'error' } } finally { loading.value = false }
}

async function handleSubmit() {
  error.value = null
  success.value = false
  loading.value = true
  try {
    const awarderId = auth.user?.id
    const companyId = auth.user?.user_metadata?.company_id || null
    if (!companyId) throw new Error('company_id отсутствует в user_metadata')
    const { data, error: err } = await employerService.awardBadgeToEmployee(form.value.badgeId, props.userId, form.value.reason, awarderId)
    if (err) throw err
    success.value = true
    emit('awarded', data)
    snackbar.value = { message: 'Бейдж выдан', type: 'success' }
    setTimeout(close, 1200)
  } catch (e) { error.value = e.message; snackbar.value = { message: error.value, type: 'error' } } finally { loading.value = false }
}
function close() {
  form.value.badgeId = ''
  form.value.reason = ''
  error.value = null
  success.value = false
  props.onClose && props.onClose()
}
</script>
<style scoped>
.modal-bg { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:1000; }
.modal { background:#1d2331; padding:2rem 2.5rem; border-radius:16px; box-shadow:0 8px 32px #0008; min-width:320px; max-width:90vw; }
h3 { margin:0 0 1rem; color:#fff; font-size:1.1rem; font-weight:600; }
form { display:flex; flex-direction:column; gap:1rem; }
label { display:flex; flex-direction:column; gap:.25rem; color:#bcd; font-size:.85rem; }
select, input { background:#232b3a; border:1px solid #334; color:#fff; padding:.5rem .7rem; border-radius:8px; font:inherit; }
.actions { display:flex; gap:.75rem; }
button { background:linear-gradient(45deg,#5562ff,#6a33d4); color:#fff; border:none; padding:.7rem 1.2rem; border-radius:8px; cursor:pointer; font-weight:500; }
button[type=button] { background:#2f3a52; }
.error { color:#f66; font-size:.85rem; }
.success { color:#4ade80; font-size:.9rem; }
</style>
