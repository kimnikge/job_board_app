<template>
  <div class="resume-sharing">
    <div class="share-link-block">
      <input :value="publicLink" readonly />
      <button @click="copyLink">Скопировать ссылку</button>
    </div>
    <div class="share-desc">Поделитесь этой ссылкой, чтобы показать резюме работодателю или коллегам.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const props = defineProps({ resumeId: Number })
const publicLink = ref('')

onMounted(() => {
  // В реальном проекте — получить ссылку с backend
  publicLink.value = `${window.location.origin}/resume/public/${props.resumeId}`
})

function copyLink() {
  navigator.clipboard.writeText(publicLink.value)
}
</script>

<style scoped>
.resume-sharing {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,136,204,0.07);
  padding: 24px;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.share-link-block {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  width: 100%;
}
.share-link-block input {
  flex: 1;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #d0eaf6;
  font-size: 15px;
}
.share-link-block button {
  background: #0088cc;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 16px;
  font-weight: 500;
  cursor: pointer;
}
.share-desc {
  color: #888;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
}
</style>
