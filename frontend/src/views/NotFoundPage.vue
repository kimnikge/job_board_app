<template>
  <div class="not-found">
    <h1 class="not-found__title">404</h1>
    <p class="not-found__text">Страница не найдена</p>
    <router-link to="/" class="btn btn--primary">
      Вернуться на главную
    </router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.not-found__title {
  font-size: 6rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.not-found__text {
  font-size: 1.5rem;
  color: var(--color-text-light);
  margin-bottom: 2rem;
}
</style> 