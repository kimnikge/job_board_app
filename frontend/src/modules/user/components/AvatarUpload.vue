<template>
  <div class="avatar-upload">
    <div class="avatar-preview" v-if="avatarUrl">
      <img :src="avatarUrl" alt="avatar" />
    </div>
    <input type="file" accept="image/*" @change="onFileChange" />
    <button v-if="avatarUrl" @click="removeAvatar" class="btn-remove">Удалить</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['update:avatar'])
const avatarUrl = ref('')

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarUrl.value = ev.target.result
    emit('update:avatar', avatarUrl.value)
  }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  avatarUrl.value = ''
  emit('update:avatar', '')
}
</script>

<style scoped>
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
.avatar-preview img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2563eb;
}
.btn-remove {
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 0.95em;
  transition: background 0.2s;
}
.btn-remove:hover {
  background: #991b1b;
}
</style>
