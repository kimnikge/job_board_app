<template>
  <div class="register-form">
    <h1>Регистрация</h1>
    
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label>Тип аккаунта</label>
        <div class="user-type-selector">
          <label class="user-type-option" :class="{ active: userType === 'specialist' }">
            <input
              type="radio"
              name="userType"
              value="specialist"
              v-model="userType"
              required
            >
            <span class="option-content">
              <span class="icon">👨‍💼</span>
              <span class="text">Соискатель</span>
            </span>
          </label>
          
          <label class="user-type-option" :class="{ active: userType === 'company' }">
            <input
              type="radio"
              name="userType"
              value="company"
              v-model="userType"
              required
            >
            <span class="option-content">
              <span class="icon">🏢</span>
              <span class="text">Компания</span>
            </span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="email"
          :class="{ 'error': errors.email }"
          placeholder="Введите email"
          required
        >
        <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="password">Пароль</label>
        <input
          type="password"
          id="password"
          v-model="password"
          :class="{ 'error': errors.password }"
          placeholder="Введите пароль"
          required
        >
        <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Подтвердите пароль</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          :class="{ 'error': errors.confirmPassword }"
          placeholder="Повторите пароль"
          required
        >
        <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </div>

      <div class="form-footer">
        <router-link to="/auth/login">Уже есть аккаунт? Войти</router-link>
      </div>
    </form>

    <div v-if="error" class="alert error">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store/auth'

export default {
  name: 'RegisterForm',
  
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'specialist', // По умолчанию регистрируем как специалиста
      errors: {
        email: '',
        password: '',
        confirmPassword: ''
      }
    }
  },

  computed: {
    isLoading() {
      const authStore = useAuthStore()
      return authStore.loading
    },
    error() {
      const authStore = useAuthStore()
      return authStore.error
    }
  },

  methods: {
    validateForm() {
      this.errors = {
        email: '',
        password: '',
        confirmPassword: ''
      }

      if (!this.email) {
        this.errors.email = 'Email обязателен'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        this.errors.email = 'Введите корректный email'
      }

      if (!this.password) {
        this.errors.password = 'Пароль обязателен'
      } else if (this.password.length < 6) {
        this.errors.password = 'Пароль должен быть не менее 6 символов'
      }

      if (this.password !== this.confirmPassword) {
        this.errors.confirmPassword = 'Пароли не совпадают'
      }

      return !Object.values(this.errors).some(error => error)
    },

    async handleSubmit() {
      if (!this.validateForm()) return

      const authStore = useAuthStore()
      const success = await authStore.register({
        email: this.email,
        password: this.password,
        type: this.userType
      })

      if (success) {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.register-form {
  padding: 20px;
  max-width: 400px;
  margin: 20px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

@media (max-width: 480px) {
  .register-form {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  width: 100%;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

input.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 14px;
}

.form-actions {
  margin-top: 10px;
}

.form-actions button {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.form-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.form-actions button:hover:not(:disabled) {
  background: #45a049;
}

.form-footer {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}

.form-footer a {
  color: #4CAF50;
  text-decoration: none;
  font-size: 14px;
}

.form-footer a:hover {
  text-decoration: underline;
}

.alert.error {
  margin-top: 20px;
  padding: 12px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #f44336;
  text-align: center;
}

.user-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.user-type-option {
  position: relative;
  cursor: pointer;
}

.user-type-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-type-option.active .option-content {
  border-color: #4CAF50;
  background-color: #f1f8e9;
}

.icon {
  font-size: 2rem;
}

.text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}
</style> 