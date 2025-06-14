// Simple event bus using mitt
import mitt from 'mitt';

const emitter = mitt();

export default {
  // Emit an event
  emit(event, payload) {
    emitter.emit(event, payload);
  },

  // Listen for an event
  on(event, handler) {
    emitter.on(event, handler);
  },

  // Stop listening for an event
  off(event, handler) {
    emitter.off(event, handler);
  }
};