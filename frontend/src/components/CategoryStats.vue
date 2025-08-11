<template>
  <div class="category-stats">
    <h3>Топ категории</h3>
    <ul>
      <li v-for="cat in categories" :key="cat.category">
        <span class="cat-name">{{ cat.category }}</span>
        <span class="cat-count">{{ cat.count }}</span>
      </li>
    </ul>
  </div>
</template>
<script setup>
const props = defineProps({ categories: { type: Array, default: () => [] } })
</script>
<style scoped>
.category-stats { background:rgba(255,255,255,0.04); border-radius:12px; padding:1rem; margin-bottom:1.5rem; }
h3 { color:#fff; font-size:1rem; margin-bottom:.7rem; }
ul { list-style:none; padding:0; margin:0; }
li { display:flex; gap:1.2rem; align-items:center; padding:.3rem 0; font-size:.9rem; }
.cat-name { color:#7dd3fc; font-weight:500; }
.cat-count { color:#fff; font-weight:600; }
</style>
