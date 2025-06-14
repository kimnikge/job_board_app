import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import * as lucide from 'lucide-vue-next'

const app = createApp(App)
const pinia = createPinia()

Object.entries(lucide).forEach(([name, component]) => {
  app.component(name, component)
})

app.use(router)
app.use(pinia)

app.mount('#app')
