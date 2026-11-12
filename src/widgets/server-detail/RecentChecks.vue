<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePings } from '@/features/monitoring/queries'
import { formatDateTime, formatLatency, formatBytes } from '@/shared/lib/format'
import Feedback from '@/shared/ui/Feedback.vue'
const props = defineProps<{ serverId: string; from: string; to: string }>()
const sort = ref('desc'),
  result = ref('all'),
  expanded = ref<string | null>(null)
const {
  data: records,
  isPending,
  isError,
  refetch,
} = usePings(
  () => props.serverId,
  () => ({ from: props.from, to: props.to, limit: 100 }),
  true,
)
const sorted = computed(() =>
  [...(records.value ?? [])]
    .filter((r) => result.value === 'all' || r.isSuccess === (result.value === 'success'))
    .sort(
      (a, b) =>
        (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) *
        (sort.value === 'desc' ? -1 : 1),
    ),
)
</script>
<template>
  <section class="card min-w-0">
    <div class="flex flex-wrap items-end justify-between gap-5">
      <div>
        <h2 class="section-title">Recent Checks</h2>
        <p class="mt-2 text-sm text-muted">
          Latest 100 probe results in the selected window. Open a check for protocol details.
        </p>
      </div>
      <div class="flex gap-5">
        <select v-model="result" class="input !text-xs" aria-label="Filter checks">
          <option value="all">All checks</option>
          <option value="success">Successful</option>
          <option value="failed">Failed</option></select
        ><select v-model="sort" class="input !text-xs" aria-label="Sort checks">
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>
    </div>
    <div v-if="isPending" class="skeleton mt-6 h-40" />
    <Feedback v-else-if="isError" class="mt-6" @retry="refetch()" />
    <p v-else-if="!sorted.length" class="py-16 text-center text-muted">No checks in this window.</p>
    <div v-else class="table-scroll mt-6">
      <table class="data-table min-w-[600px]">
        <thead>
          <tr>
            <th>Time</th>
            <th>Result</th>
            <th>Latency</th>
            <th>Code</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="record in sorted" :key="record.id"
            ><tr>
              <td class="font-mono text-xs">{{ formatDateTime(record.timestamp, true) }}</td>
              <td>{{ record.isSuccess ? '● Passed' : '⊘ Failed' }}</td>
              <td class="font-mono text-xs">{{ formatLatency(record.latencyMs) }}</td>
              <td class="font-mono text-xs">{{ record.statusCode ?? '—' }}</td>
              <td>
                <button
                  class="btn btn-outline btn-sm"
                  :aria-expanded="expanded === record.id"
                  @click="expanded = expanded === record.id ? null : record.id"
                >
                  {{ expanded === record.id ? 'Hide' : 'Inspect' }}
                </button>
              </td>
            </tr>
            <tr v-if="expanded === record.id">
              <td colspan="5">
                <dl class="grid grid-cols-2 gap-4 text-xs">
                  <div
                    v-for="[label, value] in [
                      ['Error', record.errorMessage ?? 'None'],
                      ['TLS', record.tlsVersion ?? '—'],
                      [
                        'Certificate expires',
                        record.certExpiresAt ? formatDateTime(record.certExpiresAt) : '—',
                      ],
                      ['DNS', formatLatency(record.dnsLookupMs)],
                      [
                        'Packet loss',
                        record.packetLossPercent == null ? '—' : `${record.packetLossPercent}%`,
                      ],
                      ['TTL', record.ttl ?? '—'],
                      ['Sent', formatBytes(record.sentBytes)],
                      ['Received', formatBytes(record.receivedBytes)],
                      ['Minimum RTT', formatLatency(record.rttMinMs)],
                      ['Maximum RTT', formatLatency(record.rttMaxMs)],
                    ]"
                    :key="label"
                  >
                    <dt class="text-muted">{{ label }}</dt>
                    <dd class="font-mono mt-1 break-all">{{ value }}</dd>
                  </div>
                </dl>
              </td>
            </tr></template
          >
        </tbody>
      </table>
    </div>
  </section>
</template>
