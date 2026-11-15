<script setup lang="ts">
import Select from '@/shared/ui/Select.vue'
import { computed, ref } from 'vue'
import type { Server } from '@/entities'
import { PROTOCOLS, formatEndpoint } from '@/entities/status'
import { useServers } from '@/features/monitoring/queries'
import Feedback from '@/shared/ui/Feedback.vue'
import StatusBadge from '@/shared/ui/StatusBadge.vue'
import DeleteServerDialog from './DeleteServerDialog.vue'
defineEmits<{ add: []; edit: [server: Server] }>()
const { data: servers, isPending, isError, refetch } = useServers()
const search = ref(''),
  status = ref('all'),
  protocol = ref('all'),
  deleting = ref<Server | null>(null)
const filtered = computed(() =>
  servers.value?.filter(
    (s) =>
      `${s.name} ${s.host}`.toLowerCase().includes(search.value.trim().toLowerCase()) &&
      (protocol.value === 'all' || s.protocol === protocol.value) &&
      (status.value === 'all' ||
        (status.value === 'paused' ? !s.isActive : s.isActive && s.status === status.value)),
  ),
)
function requestDelete(server: Server) {
  deleting.value = server
}
</script>
<template>
  <section aria-label="Monitor list">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="eyebrow">All targets / {{ servers?.length ?? '—' }}</p>
        <h2 class="mt-2 text-2xl">Keeping watch.</h2>
      </div>
      <button class="btn" @click="$emit('add')">+ Add monitor</button>
    </div>
    <div class="monitor-filters mb-6 flex flex-wrap items-center gap-5">
      <input
        v-model="search"
        class="input min-w-40 flex-1"
        placeholder="Find a monitor…"
        aria-label="Search monitors"
      /><Select
        v-model="status"
        aria-label="Filter by status"
        :options="[
          { value: 'all', label: 'All statuses' },
          { value: 'UP', label: 'Up' },
          { value: 'DOWN', label: 'Down' },
          { value: 'UNKNOWN', label: 'Unknown' },
          { value: 'paused', label: 'Paused' },
        ]"
      />
      <Select
        v-model="protocol"
        aria-label="Filter by protocol"
        :options="[
          { value: 'all', label: 'All protocols' },
          ...PROTOCOLS.map((p) => ({ value: p, label: p })),
        ]"
      />
    </div>
    <Feedback v-if="isError" title="Could not load monitors." @retry="refetch()" />
    <div v-else-if="isPending" aria-label="Loading monitors" class="space-y-4">
      <div v-for="i in 4" :key="i" class="skeleton h-20" />
    </div>
    <div v-else-if="!servers?.length" class="border-y border-line py-16 text-center">
      <h3 class="text-3xl">Nothing to watch. Yet.</h3>
      <p class="mt-3 text-muted">Add your first monitor. We’ll take it from here.</p>
      <button class="btn mt-6" @click="$emit('add')">+ Add your first monitor</button>
    </div>
    <div v-else class="table-scroll">
      <table class="data-table monitor-table">
        <thead>
          <tr>
            <th>Monitor</th>
            <th>Protocol</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="server in filtered"
            :key="server.id"
            class="monitor-row"
            :data-status="server.isActive ? server.status : 'PAUSED'"
          >
            <td>
              <RouterLink class="monitor-link" :to="`/app/servers/${server.id}`"
                >{{ server.name }} ↗</RouterLink
              >
              <p class="mt-1 font-mono text-xs text-muted">{{ formatEndpoint(server) }}</p>
            </td>
            <td class="font-mono text-xs">{{ server.protocol }}</td>
            <td><StatusBadge :status="server.status" :paused="!server.isActive" /></td>
            <td>
              <div class="flex justify-end gap-2">
                <button
                  class="btn btn-outline btn-sm"
                  :aria-label="`Edit ${server.name}`"
                  @click="$emit('edit', server)"
                >
                  Edit</button
                ><button
                  class="btn btn-outline btn-sm"
                  :aria-label="`Delete ${server.name}`"
                  @click="requestDelete(server)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!filtered?.length">
            <td colspan="4" class="!py-14 text-center text-muted">
              No monitors match these filters. Try another search.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <DeleteServerDialog :server="deleting" @close="deleting = null" />
</template>
