<template>
  <form @submit.prevent="onSubmit">
    <h2>Редактировать вакансию</h2>
    <label>
      Название:
      <input v-model="form.title" required />
    </label>
    <label>
      Компания:
      <input v-model="form.company" required />
    </label>
    <label>
      Город:
      <input v-model="form.location" required />
    </label>
    <label>
      Зарплата:
      <input v-model="form.salary" />
    </label>
    <label>
      Описание:
      <textarea v-model="form.description" />
    </label>
    <button type="submit">Сохранить</button>
  </form>
</template>

<script setup>
import { ref, watch, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import jobApi from '../services/jobApi'

const props = defineProps({
  job: Object
})
const emit = defineEmits(['saved'])
const form = ref({ ...props.job })

watch(() => props.job, (val) => {
  form.value = { ...val }
})

async function onSubmit() {
  await jobApi.updateJob(form.value)
  emit('saved', form.value)
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  padding: 20px;
  border-radius: 10px;
}
button {
  background: #0088cc;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
</style>
