

<script setup>
import { ref } from 'vue'

const title = ref('')
const description = ref('')
const salary = ref('')
const submitJob = () => {
  console.log('Создание вакансии:', { title: title.value, description: description.value, salary: salary.value })
  // TODO: добавить сохранение в Supabase
}
</script>

<template>
  <form @submit.prevent="submitJob" class="space-y-4">
    <div>
      <label class="block text-sm font-medium">Название вакансии</label>
      <input v-model="title" type="text" class="input" required />
    </div>

    <div>
      <label class="block text-sm font-medium">Описание</label>
      <textarea v-model="description" class="textarea" required></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium">Зарплата</label>
      <input v-model="salary" type="text" class="input" />
    </div>

    <button type="submit" class="btn-primary">Создать вакансию</button>
  </form>
</template>

<style scoped>
.input {
  @apply w-full border rounded px-3 py-2;
}
.textarea {
  @apply w-full border rounded px-3 py-2 min-h-[100px];
}
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700;
}
</style>