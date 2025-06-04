<template>
  <div v-if="resume" class="resume-details">
    <h2 class="title">{{ resume.full_name }}</h2>
    <div class="meta">
      <span>Город: {{ resume.city }}</span>
      <span>Телефон: {{ resume.phone }}</span>
    </div>
    <div class="section">
      <h3>Навыки</h3>
      <ul>
        <li v-for="skill in resume.hard_skills" :key="skill.name">
          {{ skill.name }} <span v-if="skill.level">({{ skill.level }}/5)</span>
        </li>
      </ul>
    </div>
    <div class="section">
      <h3>Языки</h3>
      <ul>
        <li v-for="lang in resume.languages" :key="lang">{{ lang }}</li>
      </ul>
    </div>
    <div class="section">
      <h3>Образование</h3>
      <ul>
        <li v-for="edu in resume.education" :key="edu.name + edu.year">
          {{ edu.name }}, {{ edu.organization }} ({{ edu.year }})
        </li>
      </ul>
    </div>
    <div class="section">
      <h3>Опыт работы</h3>
      <ul>
        <li v-for="exp in resume.work_experience" :key="exp.place + exp.period">
          <strong>{{ exp.place }}</strong> — {{ exp.position }} ({{ exp.period }})<br />
          <span class="desc">{{ exp.description }}</span>
        </li>
      </ul>
    </div>
    <div v-if="resume.social_links && Object.values(resume.social_links).some(Boolean)" class="section">
      <h3>Соцсети</h3>
      <ul>
        <li v-for="(link, key) in resume.social_links" :key="key" v-if="link">
          <a :href="link" target="_blank">{{ key }}</a>
        </li>
      </ul>
    </div>
    <div v-if="resume.tags && resume.tags.length" class="section">
      <h3>Теги</h3>
      <span v-for="tag in resume.tags" :key="tag" class="tag">#{{ tag }}</span>
    </div>
  </div>
  <div v-else class="empty">Резюме не найдено</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjgxOTksImV4cCI6MjA2NDU0NDE5OX0.b9_7QdZDvt36ohzVOl4OGGEt344c7x1AMOQzFTNOT8k'
const supabase = createClient(supabaseUrl, supabaseKey)

const route = useRoute()
const resume = ref(null)

onMounted(async () => {
  const { data, error } = await supabase.from('resumes').select('*').eq('id', route.params.id).single()
  if (!error) resume.value = data
})
</script>

<style scoped>
.resume-details {
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 32px 24px;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 18px;
}
.meta {
  color: #555;
  font-size: 1rem;
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}
.section {
  margin-bottom: 18px;
}
.tag {
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 12px;
  padding: 4px 12px;
  margin-right: 8px;
  font-size: 0.95em;
}
.desc {
  color: #666;
  font-size: 0.97em;
}
.empty {
  text-align: center;
  color: #aaa;
  margin: 40px 0 20px 0;
  font-size: 1.1rem;
}
</style>
