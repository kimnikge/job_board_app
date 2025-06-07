import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { supabase } from './supabase'

import './assets/main.css'

// Lucide Icons integration (Шаг 1 из redme-instr.md)
import * as lucide from 'lucide-vue-next'

const app = createApp(App)

// Регистрация всех Lucide-иконок как компонентов
Object.entries(lucide).forEach(([name, component]) => {
  app.component(name, component)
})

app.use(router)
app.use(store)

// Пример добавления экземпляра Supabase в глобальные свойства (опционально, если используется в компонентах через this.$supabase)
// app.config.globalProperties.$supabase = supabase

// Пример базовой проверки авторизации при старте приложения (можно раскомментировать при необходимости)
// async function checkAuth() {
//   const { data: { user } } = await supabase.auth.getUser()
//   store.commit('auth/SET_USER', user)
// }
// checkAuth().then(() => {
//   app.mount('#app')
// })

// Монтирование приложения (если проверка авторизации не асинхронная перед монтированием)
app.mount('#app')
