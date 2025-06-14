<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <slot />
      <button class="modal-close" @click="close">×</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
function close() { emit('close') }
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px 32px;
  position: relative;
  min-width: 280px;
}
.modal-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 22px;
  color: #888;
  cursor: pointer;
}
</style>
