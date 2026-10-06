interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="font-alatsi text-[1.5rem] font-bold leading-none tracking-[-0.03em] text-stroke">
        {title}
      </h1>
      {description && (
        <p className="mt-2 font-sans text-[0.82rem] leading-relaxed text-muted">{description}</p>
      )}
    </div>
  )
}
