// useForm.js — работа с формами
import { ref } from 'vue'

export function useForm(initial = {}) {
  const form = ref({ ...initial })
  const errors = ref({})

  function setField(field, value) {
    form.value[field] = value
  }

  function setError(field, message) {
    errors.value[field] = message
  }

  function reset() {
    form.value = { ...initial }
    errors.value = {}
  }

  return { form, errors, setField, setError, reset }
}
