<template>
  <div>
    <slot v-if="!error" />
    <div v-else class="error-boundary">
      <h2>Что-то пошло не так</h2>
      <p>{{ errorMsg }}</p>
      <button @click="reload">Перезагрузить страницу</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlobalErrorBoundary',
  data() {
    return {
      error: null,
      errorMsg: ''
    }
  },
  errorCaptured(err) {
    this.error = err
    this.errorMsg = err?.message || 'Неизвестная ошибка'
    // Можно интегрировать с ErrorHandler.js
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-alert
      alert('Произошла ошибка: ' + this.errorMsg)
    }
    return false // чтобы не прерывать всплытие
  },
  methods: {
    reload() {
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.error-boundary {
  max-width: 400px;
  margin: 60px auto;
  background: #fff0f0;
  border: 1px solid #dc2626;
  border-radius: 8px;
  padding: 32px 24px;
  text-align: center;
}
.error-boundary h2 {
  color: #dc2626;
  margin-bottom: 12px;
}
.error-boundary button {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 18px;
}
.error-boundary button:hover {
  background: #1d4ed8;
}
</style>
