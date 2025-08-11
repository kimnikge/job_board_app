<template>
  <div class="public-profile-page">
    <div class="public-profile__container" v-if="!loading && userProfile">
      <div class="public-profile__header">
        <div class="public-profile__media">
          <img :src="userProfile.avatar_url || '/images/default-company.png'" :alt="`Профиль ${userProfile.full_name}`" class="public-profile__avatar" />
          <div v-if="isFeatureEnabled('videoProfile') && userProfile.video_url" class="public-profile__video-wrapper">
            <video :src="userProfile.video_url" controls playsinline preload="metadata" class="public-profile__video"></video>
          </div>
        </div>
        <div class="public-profile__main">
          <h1 class="public-profile__name">{{ userProfile.full_name }}</h1>
          <p class="public-profile__role">{{ userProfile.specializations?.icon }} {{ userProfile.specializations?.name }}</p>
          <p class="public-profile__bio" v-if="userProfile.about">{{ userProfile.about }}</p>
          <div class="public-profile__meta">
            <span v-if="userProfile.experience_years">💼 {{ userProfile.experience_years }} лет опыта</span>
            <span v-if="userProfile.city_districts?.name">📍 {{ userProfile.city_districts.name }}</span>
            <span v-if="userProfile.ready_for_urgent">⚡ Срочные смены</span>
          </div>
        </div>
      </div>

      <!-- Бейджи -->
      <div v-if="badges.length && isFeatureEnabled('badgeCarousel')" class="public-profile__section">
        <Suspense>
          <DynamicBadgeCarousel :badges="badges" />
        </Suspense>
      </div>

      <!-- Навыки -->
      <div v-if="skills.length && isFeatureEnabled('skillBars')" class="public-profile__section">
        <h2 class="section-title">Навыки</h2>
        <div class="skills-container">
          <Suspense>
            <DynamicSkillBar v-for="s in skills" :key="s.id" :skill="s" />
          </Suspense>
        </div>
      </div>

      <!-- Опыт -->
      <div v-if="experience.length && isFeatureEnabled('experienceTimeline')" class="public-profile__section">
        <Suspense>
          <DynamicExperienceTimeline :work-logs="experience" />
        </Suspense>
      </div>
    </div>
    <div v-else-if="loading" class="public-profile__loading">Загрузка...</div>
    <div v-else class="public-profile__error">Профиль не найден</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { isFeatureEnabled } from '@/utils/featureFlags.js'
import { 
  LazySkillBar, 
  LazyBadgeCarousel, 
  LazyExperienceTimeline, 
  LazyVideoProfile,
  shouldUseLazyLoading 
} from '@/utils/lazyComponents.js'
import SkillBar from '@/components/profile/SkillBar.vue'
import BadgeCarousel from '@/components/profile/BadgeCarousel.vue'
import ExperienceTimeline from '@/components/profile/ExperienceTimeline.vue'
import VideoProfile from '@/components/profile/VideoProfile.vue'

const DynamicSkillBar = shouldUseLazyLoading() && isFeatureEnabled('lazyProfileSections') ? LazySkillBar : SkillBar
const DynamicBadgeCarousel = shouldUseLazyLoading() && isFeatureEnabled('lazyProfileSections') ? LazyBadgeCarousel : BadgeCarousel  
const DynamicExperienceTimeline = shouldUseLazyLoading() && isFeatureEnabled('lazyProfileSections') ? LazyExperienceTimeline : ExperienceTimeline
const DynamicVideoProfile = shouldUseLazyLoading() && isFeatureEnabled('lazyProfileSections') ? LazyVideoProfile : VideoProfile

const route = useRoute()
const profileStore = useProfileStore()

const loading = ref(true)
const userProfile = computed(() => profileStore.profile)
const skills = computed(() => profileStore.skills)
const badges = computed(() => profileStore.badges)
const experience = computed(() => profileStore.experience)

onMounted(async () => {
  const id = route.params.id
  if (!id) return
  loading.value = true
  try {
    await profileStore.fetchProfile(id)
    await Promise.all([
      profileStore.fetchSkills(id),
      profileStore.fetchBadges(id),
      profileStore.fetchExperience(id)
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.public-profile-page { min-height: 100vh; background: linear-gradient(135deg,#101522,#1a2032); padding: 1.5rem; }
.public-profile__container { max-width: 960px; margin:0 auto; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:2rem; backdrop-filter:blur(18px); }
.public-profile__header { display:flex; gap:2rem; flex-wrap:wrap; }
.public-profile__media { width:220px; flex:0 0 auto; display:flex; flex-direction:column; gap:1rem; }
.public-profile__avatar { width:220px; height:220px; object-fit:cover; border-radius:20px; border:3px solid rgba(255,255,255,0.15); background:#222; }
.public-profile__video-wrapper { position:relative; width:100%; aspect-ratio:1/1; overflow:hidden; border-radius:16px; border:2px solid rgba(255,255,255,0.1); }
.public-profile__video { width:100%; height:100%; object-fit:cover; }
.public-profile__main { flex:1; min-width:260px; }
.public-profile__name { font-size:2rem; font-weight:600; color:#fff; margin:0 0 .5rem; }
.public-profile__role { color:#7dd3fc; margin:0 0 1rem; font-weight:500; }
.public-profile__bio { color:rgba(255,255,255,0.85); line-height:1.5; margin:0 0 1rem; }
.public-profile__meta { display:flex; flex-wrap:wrap; gap:.75rem; font-size:.9rem; color:rgba(255,255,255,0.7); }
.public-profile__section { margin-top:2rem; }
.section-title { color:#fff; font-size:1.25rem; margin:0 0 1rem; font-weight:600; }
.skills-container { display:flex; flex-direction:column; gap:8px; }
.public-profile__loading, .public-profile__error { color:#fff; text-align:center; padding:4rem 1rem; }
@media (max-width: 780px){
  .public-profile__header { flex-direction:column; }
  .public-profile__media { width:160px; }
  .public-profile__avatar { width:160px; height:160px; }
  .public-profile__name { font-size:1.6rem; }
}
</style>
