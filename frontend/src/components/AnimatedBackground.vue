<template>
  <div class="bg-animation" />
</template>

<script>
export default {
  name: 'AnimatedBackground'
}
</script>

<style scoped>
/* Анимированный фон для общепита */
.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: var(--gradient-main);
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

/* Дополнительные кулинарные элементы */
.bg-animation::after {
  content: '🍳';
  position: absolute;
  top: 20%;
  right: 10%;
  font-size: 2rem;
  opacity: 0.1;
  animation: float 25s ease-in-out infinite reverse;
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
</style>
