// Директива для обработки клика вне элемента
export const clickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      // Проверяем, что клик не внутри элемента
      if (!(el === event.target || el.contains(event.target))) {
        // Вызываем переданную функцию
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
