<template>
  <div class="auth-page">
    <div class="auth-page__container">
      <h1 class="auth-page__title">{{ isLogin ? 'Вход' : 'Регистрация' }}</h1>
      
      <form @submit.prevent="handleSubmit" class="auth-page__form">
        <div class="auth-page__form-group">
          <label for="email" class="auth-page__label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="auth-page__input"
            placeholder="Введите ваш email"
          >
        </div>

        <div class="auth-page__form-group">
          <label for="password" class="auth-page__label">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="auth-page__input"
            placeholder="Введите ваш пароль"
          >
        </div>

        <div v-if="!isLogin" class="auth-page__form-group">
          <label for="role" class="auth-page__label">Роль</label>
          <select
            id="role"
            v-model="role"
            required
            class="auth-page__input"
          >
            <option value="jobseeker">Соискатель</option>
            <option value="employer">Работодатель</option>
          </select>
        </div>

        <button type="submit" class="auth-page__submit">
          {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
        </button>
      </form>

      <div class="auth-page__toggle">
        <button @click="toggleMode" class="auth-page__toggle-button">
          {{ isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт? Войти' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth'
import { showSuccess } from '@/shared/services/notificationService'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const role = ref('jobseeker')

const toggleMode = () => {
  isLogin.value = !isLogin.value
  email.value = ''
  password.value = ''
  role.value = 'jobseeker'
}

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value)
      showSuccess('Вход выполнен', 'Вы успешно вошли в систему')
    } else {
      await authStore.register(email.value, password.value, role.value)
      showSuccess('Регистрация успешна', 'Вы успешно зарегистрировались')
    }
    router.push('/')
  } catch (error) {
    console.error('Ошибка:', error)
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 2rem;
}

.auth-page__container {
  width: 100%;
  max-width: 400px;
  background: var(--color-card);
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: var(--color-shadow);
}

.auth-page__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--color-text);
}

.auth-page__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-page__form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-page__label {
  font-weight: 500;
  color: var(--color-text);
}

.auth-page__input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: var(--color-bg);
  color: var(--color-text);
  transition: border-color 0.2s;
}

.auth-page__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.auth-page__submit {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-page__submit:hover {
  background: var(--color-secondary);
}

.auth-page__toggle {
  margin-top: 1.5rem;
  text-align: center;
}

.auth-page__toggle-button {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
}

.auth-page__toggle-button:hover {
  color: var(--color-secondary);
}
</style> 