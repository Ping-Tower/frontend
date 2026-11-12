<script setup lang="ts">
import { ref, computed } from 'vue'
import { useServers } from '@/features/monitoring/queries'
import type { Server } from '@/entities'
import ServerTable from '@/widgets/server-table/ServerTable.vue'
import ServerDialog from '@/widgets/server-table/ServerDialog.vue'
const { data: servers, isPending, isError } = useServers()
const open = ref(false),
  editing = ref<Server | null>(null)
const stats = computed(() => [
  { label: 'Total monitors', value: servers.value?.length ?? 0 },
  {
    label: '● Up',
    value: servers.value?.filter((s) => s.isActive && s.status === 'UP').length ?? 0,
  },
  {
    label: '⊘ Down',
    value: servers.value?.filter((s) => s.isActive && s.status === 'DOWN').length ?? 0,
  },
  {
    label: '◌ Unknown / paused',
    value: servers.value?.filter((s) => !s.isActive || s.status === 'UNKNOWN').length ?? 0,
  },
])
function add() {
  editing.value = null
  open.value = true
}
function edit(server: Server) {
  editing.value = server
  open.value = true
}
</script>
<template>
  <div class="page-content">
    <div>
      <p class="eyebrow mb-4">The control room</p>
      <h1 class="page-title">Your monitors.</h1>
      <p class="mt-4 max-w-2xl text-muted">
        What’s responding, what needs attention, and what we don’t know yet.
      </p>
    </div>
    <div v-if="!isError" class="kpi-grid">
      <div v-for="stat in stats" :key="stat.label" class="kpi">
        <p class="eyebrow">{{ stat.label }}</p>
        <div v-if="isPending" class="skeleton mt-3 h-14" />
        <p v-else class="kpi-value">{{ stat.value }}</p>
      </div>
    </div>
    <ServerTable @add="add" @edit="edit" /><ServerDialog
      :open="open"
      :editing="editing"
      @close="open = false"
    />
  </div>
</template>
