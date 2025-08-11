<template>
  <div v-if="visible" class="snackbar" :class="type">
    <span>{{ message }}</span>
    <button @click="close">✕</button>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ message: String, type: { type: String, default: 'info' }, duration: { type: Number, default: 3000 } })
const emit = defineEmits(['close'])
const visible = ref(!!props.message)
watch(() => props.message, (msg) => {
  visible.value = !!msg
  if (msg) setTimeout(close, props.duration)
})
function close() { visible.value = false; emit('close') }
</script>
<style scoped>
.snackbar { position:fixed; bottom:2rem; left:50%; transform:translateX(-50%); background:#232b3a; color:#fff; padding:.7rem 1.5rem; border-radius:12px; box-shadow:0 4px 24px #0007; display:flex; align-items:center; gap:1rem; font-size:.95rem; z-index:2000; }
.snackbar.info { background:#232b3a; }
.snackbar.success { background:#2c5d4f; }
.snackbar.error { background:#a33; }
button { background:none; border:none; color:#fff; font-size:1.1rem; cursor:pointer; }
</style>
