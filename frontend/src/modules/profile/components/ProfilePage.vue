<template>
  <BasePageLayout>
    <div class="max-w-5xl mx-auto">
      <div class="profile-header content-card">
        <div class="flex items-start gap-6">
          <div class="avatar-container">
            <img 
              :src="profile.avatar || '/images/default-avatar.png'" 
              :alt="profile.full_name"
              class="avatar"
            />
            <button class="edit-avatar-btn" @click="handleAvatarUpload">
              <CameraIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-2xl font-bold mb-2">{{ profile.full_name }}</h1>
                <p class="text-white/80 text-lg mb-4">{{ profile.position }}</p>
              </div>
              <router-link 
                to="/profile/edit" 
                class="edit-profile-btn"
              >
                <EditIcon class="w-5 h-5 mr-2" />
                Редактировать
              </router-link>
            </div>

            <div class="flex flex-wrap gap-4 mb-4">
              <div class="flex items-center">
                <MapPinIcon class="w-4 h-4 mr-2 opacity-70" />
                <span>{{ profile.location }}</span>
              </div>
              <div class="flex items-center">
                <MailIcon class="w-4 h-4 mr-2 opacity-70" />
                <span>{{ profile.email }}</span>
              </div>
              <div class="flex items-center">
                <PhoneIcon class="w-4 h-4 mr-2 opacity-70" />
                <span>{{ profile.phone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileStats :stats="profileStats" class="mt-8" />

      <div class="grid md:grid-cols-2 gap-6 mt-8">
        <div class="content-card">
          <h2 class="card-title">
            <BriefcaseIcon class="w-6 h-6 mr-2" />
            Последние отклики
          </h2>
          <div v-if="recentApplications.length === 0" class="empty-state">
            <InboxIcon class="w-12 h-12 opacity-50 mb-2" />
            <p>У вас пока нет откликов</p>
          </div>
          <div 
            v-else 
            v-for="application in recentApplications" 
            :key="application.id"
            class="application-item"
          >
            <div>
              <h3 class="font-semibold mb-1">{{ application.job_title }}</h3>
              <p class="text-sm text-white/70">{{ application.company_name }}</p>
            </div>
            <span 
              :class="[
                'status-badge',
                `status-${application.status.toLowerCase()}`
              ]"
            >
              {{ formatStatus(application.status) }}
            </span>
          </div>
        </div>

        <div class="content-card">
          <h2 class="card-title">
            <BookmarkIcon class="w-6 h-6 mr-2" />
            Сохраненные вакансии
          </h2>
          <div v-if="savedJobs.length === 0" class="empty-state">
            <BookmarkIcon class="w-12 h-12 opacity-50 mb-2" />
            <p>Нет сохраненных вакансий</p>
          </div>
          <div 
            v-else
            v-for="job in savedJobs" 
            :key="job.id"
            class="saved-job-item"
          >
            <div>
              <h3 class="font-semibold mb-1">{{ job.title }}</h3>
              <p class="text-sm text-white/70">{{ job.company_name }}</p>
            </div>
            <router-link 
              :to="{ name: 'job-details', params: { id: job.id }}"
              class="view-btn"
            >
              <ArrowRightIcon class="w-4 h-4" />
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </BasePageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  CameraIcon, EditIcon, MapPinIcon, MailIcon, PhoneIcon,
  BriefcaseIcon, BookmarkIcon, InboxIcon, ArrowRightIcon 
} from 'lucide-vue-next'
import BasePageLayout from '@/layouts/BasePageLayout.vue'
import ProfileStats from './ProfileStats.vue'

const profile = ref({
  // Здесь будут данные профиля
})

const profileStats = ref({
  applications: 12,
  views: 156,
  saved: 8,
  interviews: 3
})

const recentApplications = ref([])
const savedJobs = ref([])

const formatStatus = (status) => {
  const statusMap = {
    'PENDING': 'На рассмотрении',
    'ACCEPTED': 'Принято',
    'REJECTED': 'Отклонено',
    'INTERVIEW': 'Интервью'
  }
  return statusMap[status] || status
}

const handleAvatarUpload = () => {
  // Здесь будет логика загрузки аватара
}

onMounted(async () => {
  // Здесь будет загрузка данных
})
</script>

<style scoped>
.avatar-container {
  position: relative;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  object-fit: cover;
}

.edit-avatar-btn {
  position: absolute;
  bottom: -6px;
  right: -6px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s;
}

.edit-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px 16px;
  color: white;
  transition: all 0.3s;
}

.edit-profile-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.application-item,
.saved-job-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.application-item:last-child,
.saved-job-item:last-child {
  border-bottom: none;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
}

.status-pending {
  background: rgba(255, 171, 0, 0.2);
  color: #ffab00;
}

.status-accepted {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-rejected {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.status-interview {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.view-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(2px);
}

@media (max-width: 768px) {
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 16px;
  }

  .edit-avatar-btn {
    width: 30px;
    height: 30px;
  }

  .card-title {
    font-size: 1.1rem;
  }
}
</style>