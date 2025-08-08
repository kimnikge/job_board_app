<template>
  <div class="reset-password-form">
    <h1>Сброс пароля</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required placeholder="Введите ваш email" />
      </div>
      <button type="submit">Сбросить пароль</button>
    </form>
    <div v-if="message" class="success-message">{{ message }}</div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
export default {
  name: 'ResetPassword',
  data() {
    return {
      email: '',
      message: '',
      error: ''
    }
  },
  methods: {
    async handleSubmit() {
      this.message = ''
      this.error = ''
      if (!this.email) {
        this.error = 'Email обязателен'
        return
      }
      // Здесь должен быть реальный запрос на сброс пароля
      this.message = 'Если email существует, инструкция отправлена.'
    }
  }
}
</script>

<style scoped>
.reset-password-form {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.form-group { margin-bottom: 18px; }
.success-message { color: green; margin-top: 10px; }
.error-message { color: red; margin-top: 10px; }
</style>
