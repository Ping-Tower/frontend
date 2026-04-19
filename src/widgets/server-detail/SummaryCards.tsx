interface SummaryCardItem {
  label: string
  value: string
  tone: string
}

export function SummaryCards({ items }: { items: SummaryCardItem[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-[6px] border border-white/7 bg-surface-control p-3">
          <p className="font-alatsi text-[0.68rem] uppercase tracking-[0.06em] text-muted">{item.label}</p>
          <p className={`mt-1.5 font-alatsi text-[1.2rem] font-bold tracking-[-0.02em] leading-none ${item.tone}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
