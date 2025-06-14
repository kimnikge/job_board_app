<template>
  <header class="app-header">
    <div class="header-content">
      <h1 class="app-title">
        <ZapIcon class="w-5 h-5" />
        Job Board
      </h1>
    </div>
  </header>
</template>

<script>
import { ZapIcon } from 'lucide-vue-next'

export default {
  name: 'AppHeader',
  components: {
    ZapIcon
  }
}
</script>

<style scoped>
.urgent-link {
  color: #ef4444;
  font-weight: 600;
}

.urgent-link i {
  margin-right: 5px;
}
</style> 