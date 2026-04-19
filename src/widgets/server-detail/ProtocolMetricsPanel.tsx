import type { MonitoringChart, Protocol, UptimeStats } from '@/entities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { HttpMetricsView } from './protocol-metrics/HttpMetricsView'
import { IcmpMetricsView } from './protocol-metrics/IcmpMetricsView'
import { TcpMetricsView } from './protocol-metrics/TcpMetricsView'

interface ProtocolMetricsPanelProps {
  protocol: Protocol
  summary: UptimeStats
  chart: MonitoringChart
}

function getDescription(protocol: Protocol) {
  switch (protocol) {
    case 'HTTP':
    case 'HTTPS':
      return 'DNS resolution, TLS composition, and certificate horizon for web checks.'
    case 'ICMP':
      return 'Signal integrity for echo probes, including loss and round-trip envelope.'
    case 'TCP':
      return 'Connect latency and DNS resolution overhead for TCP probes.'
    default:
      return 'Protocol-aware telemetry for the selected target.'
  }
}

export function ProtocolMetricsPanel({ protocol, summary, chart }: ProtocolMetricsPanelProps) {
  return (
    <Card className="overflow-hidden border-white/7">
      <CardHeader>
        <CardTitle>Protocol Metrics</CardTitle>
        <CardDescription>{getDescription(protocol)}</CardDescription>
      </CardHeader>
      <CardContent>
        {protocol === 'HTTP' || protocol === 'HTTPS' ? (
          <HttpMetricsView protocol={protocol} summary={summary} chart={chart} />
        ) : protocol === 'ICMP' ? (
          <IcmpMetricsView summary={summary} chart={chart} />
        ) : (
          <TcpMetricsView summary={summary} chart={chart} />
        )}
      </CardContent>
    </Card>
  )
}
