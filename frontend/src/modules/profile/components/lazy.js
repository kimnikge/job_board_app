import { defineAsyncComponent } from 'vue'

// Lazy loading для компонентов профиля
export const ProfileStats = defineAsyncComponent(() => 
  import(/* webpackChunkName: "profile-stats" */ '@/modules/profile/components/ProfileStats.vue')
)
export const ProfileApplications = defineAsyncComponent(() => 
  import(/* webpackChunkName: "profile-applications" */ '@/modules/profile/components/ProfileApplications.vue')
)
export const ProfileSubscriptions = defineAsyncComponent(() => 
  import(/* webpackChunkName: "profile-subscriptions" */ '@/modules/profile/components/ProfileSubscriptions.vue')
)
