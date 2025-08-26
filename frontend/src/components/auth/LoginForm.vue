<template>
  <div class="login-form">
    <div class="login-header">
      <h1>Вход</h1>
      <p>Добро пожаловать обратно!</p>
    </div>
    
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

      <button type="submit" :disabled="isLoading" class="submit-btn">
        {{ isLoading ? 'Вход...' : 'Войти' }}
      </button>

      <div class="form-links">
        <router-link to="/auth/register" class="link">Нет аккаунта? Зарегистрироваться</router-link>
        <router-link to="/auth/reset-password" class="link">Забыли пароль?</router-link>
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

      console.log('Attempting login with:', this.email)
      
      const authStore = useAuthStore()
      const result = await authStore.login({
        email: this.email,
        password: this.password
      })

      console.log('Login result:', result)

      if (result && result.success) {
        console.log('Login successful, redirecting to home')
        this.$router.push('/')
      } else {
        console.error('Login failed:', result?.error)
      }
    }
  }
}
</script>

<style scoped>
.login-form {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1976d2;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

input {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
  background: #fafafa;
}

input:focus {
  outline: none;
  border-color: #1976d2;
  background: white;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

input.error {
  border-color: #f44336;
  background: #fff5f5;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-1px);
}

.form-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
  margin-top: 20px;
}

.link {
  color: #1976d2;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.link:hover {
  color: #1565c0;
  text-decoration: underline;
}

.alert.error {
  margin-top: 16px;
  padding: 12px 16px;
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  color: #c62828;
  text-align: center;
  font-size: 14px;
}

/* Мобильная адаптация */
@media (max-width: 480px) {
  .login-form {
    max-width: none;
    margin: 0;
    border-radius: 0;
    padding: 20px 16px;
    box-shadow: none;
    background: white;
  }

  .login-header {
    margin-bottom: 24px;
  }

  .login-header h1 {
    font-size: 20px;
  }

  .form {
    gap: 16px;
  }

  input {
    padding: 12px 14px;
    font-size: 16px; /* Предотвращает зум на iOS */
  }

  .submit-btn {
    padding: 12px;
    font-size: 16px;
  }
}

/* Адаптация для очень маленьких экранов */
@media (max-width: 320px) {
  .login-form {
    padding: 16px 12px;
  }

  .login-header h1 {
    font-size: 18px;
  }

  .form {
    gap: 14px;
  }
}
</style> 