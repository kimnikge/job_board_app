<template>
  <header class="app-header">
    <nav class="nav-menu">
      <router-link to="/" class="nav-item">Главная</router-link>
      <router-link to="/jobs" class="nav-item">Вакансии</router-link>
      <router-link to="/urgent" class="nav-item urgent-link">
        <i class="fas fa-bolt"></i>
        Срочно
      </router-link>
      <router-link to="/companies" class="nav-item">Компании</router-link>
    </nav>
  </header>
</template>

<style scoped>
.urgent-link {
  color: #ef4444;
  font-weight: 600;
}

.urgent-link i {
  margin-right: 5px;
}
</style> 