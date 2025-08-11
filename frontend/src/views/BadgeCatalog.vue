<template>
  <div class="catalog-page">
    <h1 class="page-title">Каталог бейджей</h1>
    <div class="toolbar">
      <input v-model="query" placeholder="Поиск..." />
      <button @click="load" :disabled="loading">🔄</button>
    </div>
    <div v-if="loading" class="state">Загрузка...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="!filtered.length" class="state empty">Пусто</div>
    <div class="catalog-grid" v-else>
      <div v-for="b in filtered" :key="b.id" class="catalog-card">
        <div class="icon">{{ b.icon_url || '🏅' }}</div>
        <div class="info">
          <h3>{{ b.name }}</h3>
          <p class="desc">{{ b.description }}</p>
          <div class="tags">
            <span class="pill" :class="b.level.toLowerCase()">{{ b.level }}</span>
            <span class="pill type" :class="b.type">{{ b.type === 'manual' ? 'Manual' : 'Auto' }}</span>
            <span class="pill cat">{{ b.category }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { employerService } from '@/services/employer.service.js'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const loading = ref(false)
const error = ref(null)
const badges = ref([])
const query = ref('')

async function load() {
  error.value = null
  loading.value = true
  try {
    const companyId = auth.user?.user_metadata?.company_id || null
    const { data, error: err } = await employerService.getBadgeCatalog(companyId)
    if (err) throw err
    badges.value = data || []
  } catch (e) { error.value = e.message } finally { loading.value = false }
}

const filtered = computed(() => {
  if (!query.value) return badges.value
  const q = query.value.toLowerCase()
  return badges.value.filter(b => b.name.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q))
})

onMounted(load)
</script>
<style scoped>
.catalog-page { padding:1.5rem; min-height:100vh; background:linear-gradient(135deg,#101622,#182233); }
.page-title { color:#fff; margin:0 0 1rem; font-size:1.6rem; font-weight:600; }
.toolbar { display:flex; gap:.75rem; margin-bottom:1rem; }
input { background:#1c2737; border:1px solid #2d3a4f; padding:.55rem .7rem; border-radius:8px; color:#fff; flex:1; }
button { background:#2f3a52; color:#fff; border:1px solid #3d4a63; padding:.55rem 1rem; border-radius:8px; cursor:pointer; font:inherit; }
button:hover { background:#3d4a63; }
.state { color:#ccd; padding:1rem 0; }
.state.error { color:#f66; }
.state.empty { color:#889; font-style:italic; }
.catalog-grid { display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); }
.catalog-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); padding:1rem; border-radius:14px; display:flex; gap:.85rem; }
.icon { font-size:2rem; }
.info h3 { margin:0 0 .35rem; font-size:1rem; font-weight:600; color:#fff; }
.info .desc { margin:0 0 .5rem; font-size:.75rem; line-height:1.2; color:#9fb0c7; }
.tags { display:flex; flex-wrap:wrap; gap:.35rem; }
.pill { background:#243047; color:#cfe; padding:.25rem .55rem; border-radius:20px; font-size:.6rem; letter-spacing:.5px; text-transform:uppercase; font-weight:600; }
.pill.gold { background:#836012; }
.pill.silver { background:#6b717a; }
.pill.bronze { background:#7a4e2a; }
.pill.platinum { background:#5f6d86; }
.pill.type.manual { background:#4b3e6d; }
.pill.type.automatic { background:#254f5a; }
.pill.cat { background:#414b5b; }
</style>
