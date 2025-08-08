<template>
  <div style="padding: 2rem; background: #000; color: #fff; min-height: 100vh;">
    <h1>🧪 Тест данных профилей</h1>
    
    <div v-if="testResults">
      <h2>📊 Результаты тестирования:</h2>
      
      <h3>Импорт данных:</h3>
      <pre>{{ JSON.stringify(testResults.imports, null, 2) }}</pre>
      
      <h3>Функции:</h3>
      <pre>{{ JSON.stringify(testResults.functions, null, 2) }}</pre>
      
      <h3>Текущий пользователь:</h3>
      <pre>{{ JSON.stringify(testResults.currentUser, null, 2) }}</pre>
    </div>
    
    <div v-else>
      ⏳ Загрузка тестов...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const testResults = ref(null)

onMounted(async () => {
  try {
    console.log('🧪 Начинаем тестирование импорта данных...')
    
    // Тест 1: Импорт модуля
    const dataModule = await import('@/data/index.js')
    console.log('📦 Модуль данных:', dataModule)
    
    // Тест 2: Импорт функций
    const { getCurrentUserProfile, userProfilesData } = dataModule
    console.log('📊 Данные профилей:', userProfilesData)
    console.log('🔧 Функция getCurrentUserProfile:', getCurrentUserProfile)
    
    // Тест 3: Вызов функции
    const currentUser = getCurrentUserProfile()
    console.log('👤 Текущий пользователь:', currentUser)
    
    testResults.value = {
      imports: {
        moduleLoaded: !!dataModule,
        userProfilesLength: userProfilesData?.length || 0,
        functionExists: typeof getCurrentUserProfile === 'function'
      },
      functions: {
        getCurrentUserProfileResult: !!currentUser,
        currentUserName: currentUser?.full_name || 'Не найден'
      },
      currentUser: currentUser || 'Пользователь не найден'
    }
    
    console.log('✅ Тестирование завершено:', testResults.value)
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error)
    testResults.value = {
      error: error.message,
      stack: error.stack
    }
  }
})
</script>
