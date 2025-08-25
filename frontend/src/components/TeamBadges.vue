<template>
  <section class="team-badges">
    <h3>Командные достижения</h3>
    <div v-if="badges.length">
      <ul class="team-badges__list">
        <li v-for="b in badges" :key="b.id" class="team-badge-item">
          <span class="team-badge__name">🏅 {{ b.badge?.name || b.badge_id }}</span>
          <span v-if="b.badge?.level" class="team-badge__level">({{ b.badge.level }})</span>
          <span v-if="b.badge?.is_rare" class="team-badge__rare">🌟</span>
          <span class="team-badge__date">{{ formatDate(b.awarded_at) }}</span>
          <span v-if="b.reason" class="team-badge__reason">— {{ b.reason }}</span>
        </li>
      </ul>
    </div>
    <div v-else class="team-badges__empty">Нет командных достижений</div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { teamBadgesService } from '@/services/teamBadges.service.js'

const props = defineProps({ teamId: { type: String, required: true } })
const badges = ref([])

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  const { data } = await teamBadgesService.list(props.teamId)
  badges.value = data || []
})
</script>

<style scoped>
.team-badges { margin: 1.5rem 0; }
.team-badges__list { list-style: none; padding: 0; }
.team-badge-item { margin-bottom: 0.5rem; }
.team-badge__name { font-weight: 600; }
.team-badge__level { color: #888; margin-left: 0.5em; }
.team-badge__rare { color: gold; margin-left: 0.5em; }
.team-badge__date { color: #aaa; margin-left: 1em; font-size: 0.95em; }
.team-badge__reason { color: #555; margin-left: 0.5em; font-style: italic; }
.team-badges__empty { color: #bbb; font-size: 0.98em; }
</style>
