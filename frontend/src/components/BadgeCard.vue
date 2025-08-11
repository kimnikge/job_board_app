<template>
  <div
    class="relative group inline-block"
    :class="size === 'large' ? 'w-30 h-30' : 'w-16 h-16'"
  >
    <div
      class="rounded-full border-[3px] flex items-center justify-center overflow-hidden shadow-md transition-transform duration-300 ease-in-out"
      :class="{
        'hover:scale-105': true,
        'border-white bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] text-white font-bold':
          badge.type === 'company' && !badge.logoUrl,
        'border-white bg-white':
          badge.type === 'company' && badge.logoUrl,
        'border-white bg-white':
          badge.type === 'company' && badge.initials && !badge.logoUrl,
        'border-white bg-[#F3F4F6] text-gray-400':
          badge.type !== 'company',
        'dark:border-[#1F2937] dark:bg-[#1F2937] dark:text-white':
          $vuetify && $vuetify.theme.dark,
      }"
      :style="{
        width: size === 'large' ? '120px' : '64px',
        height: size === 'large' ? '120px' : '64px',
        padding: size === 'large' ? '16px' : '8px',
      }"
    >
      <template v-if="badge.type === 'company'">
        <img
          v-if="badge.logoUrl"
          :src="badge.logoUrl"
          alt="Company Logo"
          class="w-full h-full object-cover rounded-full"
        />
        <span v-else-if="badge.initials" class="select-none text-white text-lg md:text-2xl font-bold">
          {{ badge.initials }}
        </span>
      </template>
      <template v-else>
        <img
          v-if="badge.iconUrl"
          :src="badge.iconUrl"
          alt="Badge Icon"
          class="w-2/3 h-2/3 object-contain"
        />
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="w-2/3 h-2/3 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 2a8 8 0 108 8 8 8 0 00-8-8zm3.5 8.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
        </svg>
      </template>
    </div>
    <div
      v-if="showTooltip"
      class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-sm rounded px-3 py-2 whitespace-nowrap z-10 shadow-lg transition-opacity duration-300 ease-in-out"
      :style="{ minWidth: size === 'large' ? '140px' : '100px' }"
    >
      <strong>{{ badge.name }}</strong><br />
      {{ badge.description }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  badge: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: 'small',
    validator: (value) => ['small', 'large'].includes(value),
  },
  showTooltip: {
    type: Boolean,
    default: true,
  },
});

const size = computed(() => props.size);
const showTooltip = computed(() => props.showTooltip);
const badge = computed(() => props.badge);
</script>
