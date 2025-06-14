<template>
  <div class="profile-page">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else-if="profile" class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-start space-x-6">
          <!-- Фото профиля -->
          <div class="flex-shrink-0">
            <img 
              :src="profile.photo || '/default-avatar.png'" 
              :alt="profile.fullName"
              class="w-32 h-32 rounded-full object-cover"
            >
          </div>

          <!-- Основная информация -->
          <div class="flex-grow">
            <h1 class="text-2xl font-bold text-gray-900">{{ profile.fullName }}</h1>
            <p class="text-gray-600">{{ profile.position }}</p>
            
            <div class="mt-4 space-y-2">
              <div class="flex items-center text-gray-600">
                <i class="fas fa-map-marker-alt w-5"></i>
                <span>{{ profile.location }}</span>
              </div>
              <div class="flex items-center text-gray-600">
                <i class="fas fa-envelope w-5"></i>
                <span>{{ profile.email }}</span>
              </div>
              <div class="flex items-center text-gray-600">
                <i class="fas fa-phone w-5"></i>
                <span>{{ profile.phone }}</span>
              </div>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="flex-shrink-0 space-y-2">
            <router-link 
              to="/profile/setup"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              <i class="fas fa-edit mr-2"></i>
              Редактировать
            </router-link>
          </div>
        </div>

        <!-- О себе -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">О себе</h2>
          <p class="text-gray-600 whitespace-pre-line">{{ profile.about }}</p>
        </div>

        <!-- Навыки -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Навыки</h2>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="skill in profile.skills" 
              :key="skill"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- Опыт работы -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Опыт работы</h2>
          <div class="space-y-4">
            <div 
              v-for="experience in profile.experience" 
              :key="experience.id"
              class="border-l-4 border-primary pl-4"
            >
              <h3 class="font-semibold text-gray-900">{{ experience.position }}</h3>
              <p class="text-gray-600">{{ experience.company }}</p>
              <p class="text-sm text-gray-500">
                {{ experience.startDate }} - {{ experience.endDate || 'Настоящее время' }}
              </p>
              <p class="mt-2 text-gray-600">{{ experience.description }}</p>
            </div>
          </div>
        </div>

        <!-- Образование -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Образование</h2>
          <div class="space-y-4">
            <div 
              v-for="education in profile.education" 
              :key="education.id"
              class="border-l-4 border-primary pl-4"
            >
              <h3 class="font-semibold text-gray-900">{{ education.institution }}</h3>
              <p class="text-gray-600">{{ education.degree }}</p>
              <p class="text-sm text-gray-500">
                {{ education.startDate }} - {{ education.endDate || 'Настоящее время' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Сертификаты -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Сертификаты</h2>
          <div class="space-y-4">
            <div 
              v-for="certificate in profile.certificates" 
              :key="certificate.id"
              class="border-l-4 border-primary pl-4"
            >
              <h3 class="font-semibold text-gray-900">{{ certificate.name }}</h3>
              <p class="text-gray-600">{{ certificate.issuer }}</p>
              <p class="text-sm text-gray-500">{{ certificate.date }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Профиль не найден</h2>
        <router-link 
          to="/profile/setup"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
        >
          Создать профиль
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProfileStore } from '../store/profile'

const profileStore = useProfileStore()
const { profile, loading, error } = profileStore

onMounted(async () => {
  await profileStore.fetchProfile()
})
</script> 