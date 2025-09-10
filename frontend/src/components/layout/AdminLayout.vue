<template>
  <div class="admin-layout">
    <header class="admin-header">
      <slot name="header">
        <h1 class="logo">ShiftworkKZ — Админ</h1>
      </slot>
    </header>
    <main class="admin-main">
      <slot />
    </main>
    <footer class="admin-footer">
      <slot name="footer">
        <div>© {{ new Date().getFullYear() }} ShiftworkKZ</div>
      </slot>
    </footer>
  </div>
</template>

<script setup>
// Можно добавить provide/inject для глобальных сервисов
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}
.admin-header {
  background: #dc2626;
  color: #fff;
  padding: 18px 32px;
}
.logo {
  font-size: 1.3rem;
  font-weight: bold;
}
.admin-main {
  flex: 1;
  padding: 32px 16px;
}
.admin-footer {
  background: #1e293b;
  color: #fff;
  text-align: center;
  padding: 16px 0;
}
</style>
