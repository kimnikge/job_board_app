<template>
  <div class="companies-page">
    <div class="hero">
      <div class="hero-content">
        <h1 class="hero-title">🏢 Заведения общепита Астаны</h1>
        <p class="hero-sub">Каталог кафе, ресторанов и сервисов с открытыми сменами</p>
        <div class="hero-actions">
          <button class="btn-primary" @click="refresh()">Обновить</button>
          <button class="btn-ready" @click="filterUrgent = !filterUrgent">
            {{ filterUrgent ? 'Показать все' : 'Только с вакансиями' }}
          </button>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="toolbar">
        <input v-model="search" class="search" type="text" placeholder="Поиск заведения..." />
        <span class="result-count" v-if="filteredCompanies.length">{{ filteredCompanies.length }} найдено</span>
      </div>

      <div class="companies-grid" v-if="filteredCompanies.length">
        <article
          v-for="company in filteredCompanies"
          :key="company.id"
          class="company-card"
        >
          <div class="logo" aria-hidden="true">{{ company.name.charAt(0) }}</div>
          <div class="card-body">
            <header class="card-header">
              <h3 class="company-name">{{ company.name }}</h3>
              <span class="pill type">{{ company.type }}</span>
            </header>
            <div class="meta">
              <span class="jobs" :class="{ none: !company.jobs }">
                {{ company.jobs ? company.jobs + ' вакансий' : 'Нет открытых вакансий' }}
              </span>
            </div>
            <footer class="card-footer">
              <button class="link-btn" @click="open(company)">Открыть</button>
            </footer>
          </div>
        </article>
      </div>
      <div v-else class="empty">Ничего не найдено</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const notificationsStore = useNotificationsStore()

const companies = ref([
  { id: 1, name: 'Ресторан "Астана"', type: 'Ресторан', jobs: 5 },
  { id: 2, name: 'Кафе "Барбекю"', type: 'Кафе', jobs: 3 },
  { id: 3, name: 'Пиццерия "Италия"', type: 'Пиццерия', jobs: 7 },
  { id: 4, name: 'Фаст-фуд "Burger King"', type: 'Фаст-фуд', jobs: 12 },
  { id: 5, name: 'Coffee Lab', type: 'Кофейня', jobs: 0 },
  { id: 6, name: 'Green Vegan', type: 'Ресторан', jobs: 2 }
])

const search = ref('')
const filterUrgent = ref(false)

const filteredCompanies = computed(() => {
  let list = companies.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
  }
  if (filterUrgent.value) list = list.filter(c => c.jobs > 0)
  return list
})

function refresh(){ 
  notificationsStore.showInfo('Обновление списка заведений...')
  // TODO: загрузка с API
}

function open(company){ 
  router.push(`/companies/${company.id}`)
}
</script>

<style scoped>
/* Layout */
.companies-page { min-height: 100vh; display:flex; flex-direction:column; }
.hero { padding: clamp(2rem,4vw,4rem) 1.5rem 1rem; text-align:center; }
.hero-title { font-size: clamp(1.9rem,4vw,3rem); background: var(--gradient-header); -webkit-background-clip:text; color:transparent; font-weight:700; letter-spacing:.5px; }
.hero-sub { color: var(--color-text-secondary); margin-top:.5rem; font-size:1rem; }
.hero-actions { margin-top:1.25rem; display:flex; gap:.75rem; flex-wrap:wrap; justify-content:center; }

.content-wrapper { width:100%; max-width:1200px; margin:0 auto; padding: 0 1.5rem 3rem; flex:1; }
.toolbar { display:flex; flex-wrap:wrap; gap:1rem; align-items:center; margin: 0 0 1.25rem; }
.search { flex:1 1 260px; padding:.75rem 1rem; border-radius:14px; border:1px solid var(--color-border); background:rgba(255,255,255,0.07); color: var(--color-text-primary); backdrop-filter: var(--glass-blur); }
.search:focus { outline:none; border-color: var(--color-border-hover); background:rgba(255,255,255,0.1); }
.result-count { font-size:.85rem; color: var(--color-text-muted); }

/* Grid */
.companies-grid { display:grid; gap:1.25rem; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); }

/* Card */
.company-card { position:relative; display:flex; gap:1rem; padding:1rem 1rem 1.1rem; background: var(--glass-bg); border:1px solid var(--glass-border); border-radius:20px; backdrop-filter: var(--glass-blur); box-shadow: var(--shadow-sm); transition: all .35s ease; overflow:hidden; }
.company-card::before { content:""; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0)); opacity:0; transition:opacity .35s; }
.company-card:hover { transform:translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--color-border-hover); }
.company-card:hover::before { opacity:1; }

.logo { width:48px; height:48px; border-radius:14px; background: var(--gradient-header); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.1rem; color:#fff; box-shadow: var(--shadow-sm); flex-shrink:0; }
.card-body { flex:1; display:flex; flex-direction:column; min-width:0; }
.card-header { display:flex; align-items:flex-start; justify-content:space-between; gap:.5rem; }
.company-name { font-size:1rem; font-weight:600; line-height:1.3; color: var(--color-text-primary); margin:0; flex:1; }
.pill { font-size:.65rem; text-transform:uppercase; letter-spacing:.5px; padding:.35rem .55rem; background:rgba(255,255,255,0.08); border:1px solid var(--glass-border); border-radius:30px; white-space:nowrap; }
.meta { margin-top:.4rem; font-size:.75rem; color: var(--color-text-secondary); display:flex; gap:.5rem; flex-wrap:wrap; }
.jobs.none { opacity:.5; }
.card-footer { margin-top:auto; display:flex; justify-content:flex-end; }
.link-btn { background:none; border:none; color: var(--color-accent); font-size:.8rem; cursor:pointer; padding:.35rem .5rem; border-radius:8px; transition:background .3s; }
.link-btn:hover { background:rgba(255,255,255,0.1); }

.empty { text-align:center; padding:4rem 0; color: var(--color-text-muted); }

/* Responsive Design согласно плану разработки */
@media (max-width: 480px) {
  .companies-page {
    padding: 0;
  }

  .hero {
    padding: 2rem 1rem 1rem;
  }

  .hero-title { 
    font-size: 1.8rem; 
  }

  .hero-sub {
    font-size: 0.9rem;
    margin-top: 0.75rem;
  }

  .hero-actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .hero-actions .btn-primary,
  .hero-actions .btn-ready {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }

  .content-wrapper {
    padding: 0 1rem 2rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search {
    width: 100%;
  }

  .companies-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .company-card {
    flex-direction: column;
    text-align: center;
  }

  .logo {
    align-self: center;
    margin-bottom: 0.5rem;
  }

  .card-header {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .card-footer {
    justify-content: center;
    margin-top: 1rem;
  }

  .link-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 600px) {
  .hero {
    padding: 1.5rem 1rem 1rem;
  }
  
  .hero-title { 
    font-size: 1.6rem; 
    line-height: 1.2;
  }
  
  .hero-actions {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
  
  .hero-actions .btn-primary,
  .hero-actions .btn-ready {
    width: 100%;
    padding: 12px 16px;
    min-height: 48px;
  }
  
  .content-wrapper {
    padding: 0 1rem 2rem; /* Removed extra bottom space */
  }
  
  .company-card { 
    padding: 1rem; 
  }
  
  .logo { 
    width: 44px; 
    height: 44px; 
    font-size: 1.2rem;
  }

  .companies-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .company-name {
    font-size: 1rem;
  }

  .link-btn {
    width: 100%;
    padding: 12px 16px;
    min-height: 44px;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 2rem 1.25rem 1.5rem;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .content-wrapper {
    padding: 0 1.25rem 4rem;
  }

  .companies-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .toolbar {
    gap: 0.75rem;
    flex-direction: column;
    align-items: stretch;
  }

  .search {
    flex: 1 1 100%;
    margin-bottom: 0.5rem;
  }

  .result-count {
    align-self: flex-start;
  }

  .logo {
    align-self: flex-start;
    margin-bottom: 0.75rem;
  }

  .card-header {
    align-items: flex-start;
    text-align: left;
  }

  .card-footer {
    margin-top: 1rem;
  }

  .link-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    width: 100%;
  }
}

@media (max-width: 1024px) {
  .companies-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .hero {
    padding: 2.5rem 1.5rem 2rem;
  }
}
</style>
