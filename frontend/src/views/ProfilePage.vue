<template>
  <div class="profile-page">
    <div class="profile-page__container">
      <h1 class="profile-page__title">Профиль</h1>

      <div v-if="loading" class="profile-page__loading">
        Загрузка...
      </div>

      <div v-else-if="error" class="profile-page__error">
        {{ error }}
      </div>

      <template v-else>
        <div class="profile-page__info">
          <div class="profile-page__avatar">
            <img :src="user.avatar || '/default-avatar.png'" alt="Аватар" class="profile-page__avatar-image">
          </div>

          <div class="profile-page__details">
            <h2 class="profile-page__name">{{ user.name }}</h2>
            <p class="profile-page__email">{{ user.email }}</p>
            <p class="profile-page__role">{{ user.role === 'jobseeker' ? 'Соискатель' : 'Работодатель' }}</p>
          </div>
        </div>

        <div class="profile-page__actions">
          <button @click="handleEdit" class="profile-page__button">
            Редактировать профиль
          </button>
          <button @click="handleLogout" class="profile-page__button profile-page__button--danger">
            Выйти
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth'
import { showSuccess } from '@/shared/services/notificationService'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const user = ref(null)

const loadUserData = async () => {
  try {
    loading.value = true
    error.value = null
    // В реальном приложении здесь будет API запрос
    user.value = {
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      role: 'jobseeker',
      avatar: null
    }
  } catch (e) {
    error.value = 'Ошибка загрузки данных'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  // В реальном приложении здесь будет переход на страницу редактирования
  console.log('Редактирование профиля')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    showSuccess('Выход выполнен', 'Вы успешно вышли из системы')
    router.push('/auth')
  } catch (error) {
    console.error('Ошибка при выходе:', error)
  }
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 2rem;
  background: var(--color-bg);
}

.profile-page__container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--color-card);
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: var(--color-shadow);
}

.profile-page__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--color-text);
}

.profile-page__info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-page__avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-accent);
}

.profile-page__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-page__details {
  flex: 1;
}

.profile-page__name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.profile-page__email {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.profile-page__role {
  color: var(--color-secondary);
}

.profile-page__actions {
  display: flex;
  gap: 1rem;
}

.profile-page__button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--color-primary);
  color: white;
}

.profile-page__button:hover {
  background: var(--color-secondary);
  transform: translateY(-2px);
}

.profile-page__button--danger {
  background: #e53e3e;
}

.profile-page__button--danger:hover {
  background: #c53030;
}

.profile-page__loading,
.profile-page__error {
  text-align: center;
  padding: 2rem;
  font-size: 1.25rem;
  color: var(--color-text);
}

.profile-page__error {
  color: #e53e3e;
}
</style> 