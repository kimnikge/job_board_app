import { defineAsyncComponent } from 'vue'

// Разделяем крупные компоненты на async chunks
export const JobCard = defineAsyncComponent(() => import(/* webpackChunkName: "job-card" */ './JobCard.vue'))
export const ResumeCard = defineAsyncComponent(() => import(/* webpackChunkName: "resume-card" */ './ResumeCard.vue'))
export const SearchOverlay = defineAsyncComponent(() => import(/* webpackChunkName: "search-overlay" */ '@/shared/components/SearchOverlay.vue'))
export const StatisticsSection = defineAsyncComponent(() => import(/* webpackChunkName: "statistics-section" */ './StatisticsSection.vue'))
