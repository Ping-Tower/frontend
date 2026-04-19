import { useEffect, useRef, useState } from 'react'
import { useServerPings } from '@/features/monitoring/hooks'
import type { PingRecord } from '@/entities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { RecentChecksTable } from './RecentChecksTable'
import { parseDateTimeLocalValue, toDateTimeLocalValue } from './monitoring-window'

type SortOrder = 'desc' | 'asc'

interface LogsTabProps {
  serverId: string
  from: string
  to: string
  refetchInterval: number | false
}

function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    timerRef.current = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timerRef.current)
  }, [value, delayMs])
  return debounced
}

export function LogsTab({ serverId, from, to, refetchInterval }: LogsTabProps) {
  const [sort, setSort] = useState<SortOrder>('desc')
  const [filterFrom, setFilterFrom] = useState(() => toDateTimeLocalValue(new Date(from)))
  const [filterTo, setFilterTo] = useState(() => toDateTimeLocalValue(new Date(to)))

  const debouncedFrom = useDebounce(filterFrom, 600)
  const debouncedTo = useDebounce(filterTo, 600)

  const parsedFrom = parseDateTimeLocalValue(debouncedFrom)
  const parsedTo = parseDateTimeLocalValue(debouncedTo)
  const isRangeValid = parsedFrom !== null && parsedTo !== null && parsedFrom.getTime() < parsedTo.getTime()

  const { data: records, isLoading, isFetching } = useServerPings(
    serverId,
    {
      from: isRangeValid && parsedFrom ? parsedFrom.toISOString() : from,
      to: isRangeValid && parsedTo ? parsedTo.toISOString() : to,
      limit: 100,
    },
    { refetchInterval }
  )

  const sorted: PingRecord[] = records
    ? [...records].sort((a, b) => {
        const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        return sort === 'desc' ? -diff : diff
      })
    : []

  const inputInvalid = filterFrom && filterTo && !isRangeValid && debouncedFrom === filterFrom && debouncedTo === filterTo

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Checks</CardTitle>
        <CardDescription>Raw probe results. Adjust range or sort order — filtering happens on the server.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">From</label>
            <Input
              type="datetime-local"
              className="h-9 w-56 text-sm"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">To</label>
            <Input
              type="datetime-local"
              className="h-9 w-56 text-sm"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">Sort</label>
            <select
              className="flex h-9 rounded-[6px] border border-white/7 bg-surface-panel px-3 font-alatsi text-sm text-stroke focus:outline-none focus:border-brand/40"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOrder)}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
          {isFetching && !isLoading && (
            <span className="text-sm text-muted">Updating...</span>
          )}
          {inputInvalid && (
            <span className="text-sm text-status-down">Invalid range.</span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <RecentChecksTable records={sorted} />
        )}
      </CardContent>
    </Card>
  )
}
