<template>
  <div class="resume-view" v-if="resume">
    <h2>{{ resume.full_name }}</h2>
    <div class="resume-meta">
      <span v-if="resume.profession">Профессия: {{ resume.profession }}</span>
      <span v-if="resume.city"> · Город: {{ resume.city }}</span>
      <span v-if="resume.age"> · Возраст: {{ resume.age }}</span>
    </div>
    <div class="resume-section">
      <h3>Опыт работы</h3>
      <div v-if="resume.experience && resume.experience.length">
        <div v-for="exp in resume.experience" :key="exp.id" class="exp-item">
          <div>{{ exp.position }} — {{ exp.company }} ({{ exp.period }})</div>
        </div>
      </div>
      <div v-else>Нет опыта</div>
    </div>
    <div class="resume-section">
      <h3>Навыки</h3>
      <div v-if="resume.skills && resume.skills.length">
        <span v-for="s in resume.skills" :key="s" class="skill">{{ s }}</span>
      </div>
      <div v-else>Не указаны</div>
    </div>
    <div class="resume-section" v-if="resume.about">
      <h3>О себе</h3>
      <div>{{ resume.about }}</div>
    </div>
  </div>
  <div v-else class="empty">Резюме не найдено</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'
const props = defineProps({ resumeId: Number })
const resume = ref(null)

onMounted(async () => {
  if (!props.resumeId) return
  const res = await api.getResume(props.resumeId)
  resume.value = res.data
})
</script>

<style scoped>
.resume-view {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,136,204,0.07);
  padding: 24px;
  max-width: 500px;
  margin: 0 auto;
}
.resume-meta {
  color: #888;
  font-size: 14px;
  margin-bottom: 12px;
}
.resume-section {
  margin-bottom: 18px;
}
.skill {
  background: #eaf6fb;
  color: #0088cc;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 13px;
  margin-right: 6px;
}
.empty {
  text-align: center;
  color: #aaa;
  margin: 40px 0 20px 0;
  font-size: 15px;
}
</style>
