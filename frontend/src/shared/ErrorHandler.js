// ErrorHandler.js — глобальный сервис для обработки ошибок
import eventBus from './eventBus';

export default {
  handle(error, vm, info) {
    // Можно добавить отправку ошибок в Sentry, логирование и т.д.
    console.error('Global error:', error);
    console.error('Vue component:', vm);
    console.error('Vue specific info:', info);

    const errorMessage = error?.message || (typeof error === 'string' ? error : 'Произошла неизвестная ошибка');
    
    // Отправляем событие для системы уведомлений
    eventBus.emit('show-notification', {
      type: 'error',
      message: `Ошибка: ${errorMessage}`,
      details: info // Можно добавить детали, если они полезны для пользователя
    });

    // Для обратной совместимости или случаев, когда NotificationSystem может не работать
    // if (typeof window !== 'undefined') {
    //   alert('Произошла ошибка: ' + errorMessage);
    // }
  }
}
