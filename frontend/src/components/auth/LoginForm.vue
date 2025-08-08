<template>
  <div class="login-form">
    <h1>Вход</h1>
    
    <form @submit.prevent="handleSubmit" class="form">
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

      <div class="form-actions">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </button>
      </div>

      <div class="form-footer">
        <router-link to="/auth/register">Нет аккаунта? Зарегистрироваться</router-link>
        <router-link to="/auth/reset-password">Забыли пароль?</router-link>
      </div>
    </form>

    <div v-if="error" class="alert error">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginForm',
  
  mounted() {
    console.log('LoginForm компонент смонтирован!');
  },

  data() {
    return {
      email: '',
      password: '',
      errors: {
        email: '',
        password: ''
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
        password: ''
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

      return !Object.values(this.errors).some(error => error)
    },

    async handleSubmit() {
      if (!this.validateForm()) return

      const authStore = useAuthStore()
      const success = await authStore.login({
        email: this.email,
        password: this.password
      })

      if (success) {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.login-form {
  padding: 20px;
  max-width: 400px;
  margin: 20px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

@media (max-width: 480px) {
  .login-form {
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
  inline-size: 100%;
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
  inline-size: 100%;
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
</style> 