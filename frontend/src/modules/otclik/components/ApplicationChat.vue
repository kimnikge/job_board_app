<template>
  <div class="chat">
    <div class="chat-messages">
      <div v-for="msg in messages" :key="msg.id" :class="['chat-message', msg.from === 'me' ? 'me' : 'other']">
        <div class="chat-author">{{ msg.from === 'me' ? 'Вы' : msg.author }}</div>
        <div class="chat-text">{{ msg.text }}</div>
        <div class="chat-time">{{ formatDate(msg.created_at) }}</div>
      </div>
    </div>
    <form class="chat-input" @submit.prevent="sendMessage">
      <input v-model="newMessage" placeholder="Введите сообщение..." />
      <button type="submit">Отправить</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  applicationId: Number,
  initialMessages: { type: Array, default: () => [] }
})
const messages = ref([...props.initialMessages])
const newMessage = ref('')

function sendMessage() {
  if (!newMessage.value.trim()) return
  messages.value.push({
    id: Date.now(),
    from: 'me',
    author: 'Я',
    text: newMessage.value,
    created_at: new Date().toISOString()
  })
  newMessage.value = ''
  // Здесь должен быть вызов API для отправки сообщения
}
function formatDate(date) {
  return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.chat {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,136,204,0.07);
  padding: 16px;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chat-messages {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.chat-message {
  padding: 8px 12px;
  border-radius: 8px;
  background: #eaf6fb;
  align-self: flex-start;
  max-width: 80%;
}
.chat-message.me {
  background: #c8e6c9;
  align-self: flex-end;
}
.chat-author {
  font-size: 12px;
  color: #888;
  margin-bottom: 2px;
}
.chat-text {
  font-size: 15px;
  color: #222;
}
.chat-time {
  font-size: 11px;
  color: #aaa;
  margin-top: 2px;
  text-align: right;
}
.chat-input {
  display: flex;
  gap: 8px;
}
.chat-input input {
  flex: 1;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #d0eaf6;
}
.chat-input button {
  background: #0088cc;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 16px;
  font-weight: 500;
  cursor: pointer;
}
</style>
