import type { PingRecord } from '@/entities'
import { Badge } from '@/shared/ui/badge'
import { EMPTY, formatBytes, formatDate, formatDateTime, formatLatency, formatPercent } from '@/shared/lib/format'

function formatDetails(record: PingRecord) {
  if (record.errorMessage) {
    return record.errorMessage
  }

  if (record.isSuccess && record.latencyMs !== null) {
    return `Latency ${formatLatency(record.latencyMs)}`
  }

  if (!record.isSuccess) {
    return 'Probe failed without an error message'
  }

  return 'Successful check'
}

function buildFacts(record: PingRecord) {
  switch (record.protocol) {
    case 'HTTP':
    case 'HTTPS':
      return [
        { label: 'DNS', value: formatLatency(record.dnsLookupMs) },
        { label: 'TLS', value: record.tlsVersion ?? EMPTY },
        { label: 'Cert', value: formatDate(record.certExpiresAt) },
      ]
    case 'ICMP':
      return [
        { label: 'Loss', value: formatPercent(record.packetLossPercent) },
        { label: 'RTT Min', value: formatLatency(record.rttMinMs) },
        { label: 'RTT Max', value: formatLatency(record.rttMaxMs) },
        { label: 'TTL', value: record.ttl === null ? EMPTY : String(record.ttl) },
      ]
    case 'TCP':
      return [
        { label: 'Sent', value: formatBytes(record.sentBytes) },
        { label: 'Recv', value: formatBytes(record.receivedBytes) },
      ]
    default:
      return []
  }
}

function getPrimaryMetric(record: PingRecord) {
  if (record.statusCode !== null) {
    return { label: 'Status', value: String(record.statusCode) }
  }

  if (record.protocol === 'ICMP' && record.packetLossPercent !== null) {
    return { label: 'Loss', value: formatPercent(record.packetLossPercent) }
  }

  if (record.protocol === 'TCP' && (record.sentBytes !== null || record.receivedBytes !== null)) {
    return {
      label: 'Transfer',
      value: `${formatBytes(record.sentBytes)} / ${formatBytes(record.receivedBytes)}`,
    }
  }

  return { label: 'Latency', value: formatLatency(record.latencyMs) }
}

export function RecentChecksTable({ records }: { records: PingRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-surface-control/65 p-6 text-sm text-muted">
        No raw checks were found for this window.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const facts = buildFacts(record)
        const primaryMetric = getPrimaryMetric(record)

        return (
          <div
            key={record.id}
            className="rounded-card border border-white/7 bg-surface-control p-4"
          >
            <div className="grid gap-3 lg:grid-cols-[170px_96px_180px_minmax(0,1fr)] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Timestamp</p>
                <p className="mt-2 text-sm font-semibold text-stroke">{formatDateTime(record.timestamp, true)}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Result</p>
                <Badge
                  variant={record.isSuccess ? 'up' : 'down'}
                  className="mt-2 w-fit"
                >
                  {record.isSuccess ? 'Success' : 'Failed'}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{primaryMetric.label}</p>
                <p className="mt-2 text-sm font-semibold text-stroke">{primaryMetric.value}</p>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Details</p>
                <p className="mt-2 text-sm text-muted">{formatDetails(record)}</p>
              </div>
            </div>

            {facts.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {facts.map((fact) => (
                  <div
                    key={`${record.id}-${fact.label}`}
                    className="rounded-full border border-white/10 bg-surface-shell/75 px-3 py-1.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                  >
                    <span className="font-semibold text-stroke">{fact.label}</span>
                    <span className="ml-2 text-muted">{fact.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
