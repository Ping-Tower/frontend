import { useMemo, useState } from 'react'
import { useServerPings } from '@/features/monitoring/hooks'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { NativeSelect } from '@/shared/ui/native-select'
import { Skeleton } from '@/shared/ui/skeleton'
import { RecentChecksTable } from './RecentChecksTable'
import { isValidRange, parseDateTimeLocalValue, toDateTimeLocalValue } from './monitoring-window'

type SortOrder = 'desc' | 'asc'

interface LogsTabProps {
  serverId: string
  from: string
  to: string
  refetchInterval: number | false
}

export function LogsTab({ serverId, from, to, refetchInterval }: LogsTabProps) {
  const [sort, setSort] = useState<SortOrder>('desc')
  const [filterFrom, setFilterFrom] = useState(() => toDateTimeLocalValue(new Date(from)))
  const [filterTo, setFilterTo] = useState(() => toDateTimeLocalValue(new Date(to)))

  const debouncedFrom = useDebounce(filterFrom, 600)
  const debouncedTo = useDebounce(filterTo, 600)

  const parsedFrom = parseDateTimeLocalValue(debouncedFrom)
  const parsedTo = parseDateTimeLocalValue(debouncedTo)
  const isRangeValid = isValidRange(parsedFrom, parsedTo)

  const { data: records, isLoading, isFetching } = useServerPings(
    serverId,
    {
      from: isRangeValid && parsedFrom ? parsedFrom.toISOString() : from,
      to: isRangeValid && parsedTo ? parsedTo.toISOString() : to,
      limit: 100,
    },
    { refetchInterval }
  )

  const sorted = useMemo(
    () =>
      [...(records ?? [])].sort((a, b) => {
        const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        return sort === 'desc' ? -diff : diff
      }),
    [records, sort]
  )

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
            <NativeSelect value={sort} onChange={(e) => setSort(e.target.value as SortOrder)}>
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </NativeSelect>
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
