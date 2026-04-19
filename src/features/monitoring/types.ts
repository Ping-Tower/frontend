export interface TimeRangeFilters {
  from?: string
  to?: string
}

export interface ServerOverviewFilters extends TimeRangeFilters {
  bucketSec?: number
}

export interface ServerPingsFilters extends TimeRangeFilters {
  limit?: number
}

export type ServerUptimeFilters = TimeRangeFilters

export interface MonitoringQueryOptions {
  refetchInterval?: number | false
}
