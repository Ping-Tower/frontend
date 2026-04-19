interface MetricTileProps {
  label: string
  value: string
  accent?: string
  hint?: string
}

export function MetricTile({ label, value, accent = 'text-stroke', hint }: MetricTileProps) {
  return (
    <div className="rounded-[8px] border border-white/7 bg-surface-control p-4">
      <p className="font-alatsi text-[0.68rem] uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className={`mt-2 font-alatsi text-[1.25rem] font-bold tracking-[-0.03em] ${accent}`}>{value}</p>
      {hint && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
    </div>
  )
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-[10px] border border-dashed border-line/80 bg-surface-control/65 px-6 text-center text-sm text-muted">
      {message}
    </div>
  )
}
