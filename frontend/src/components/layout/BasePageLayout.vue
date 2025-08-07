<!-- filepath: /Users/hubmarket/Desktop/job_board_app/frontend/src/layouts/BasePageLayout.vue -->
<template>
  <div class="page-container">
    <div class="bg-animation"></div>
    <div class="content-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-container {
  position: relative;
  min-height: 100vh;
  color: white;
}

.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -10;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

.bg-animation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(0.5deg); }
  66% { transform: translateY(15px) rotate(-0.5deg); }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 80px 20px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 60px 16px;
  }
}
</style>
