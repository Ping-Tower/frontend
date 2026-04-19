import React from 'react'
import { cn } from '@/shared/lib/cn'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex gap-0.5 border-b border-white/7',
        className
      )}
      role="tablist"
      aria-orientation="horizontal"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          role="tab"
          type="button"
          aria-selected={active === tab.key}
          aria-controls={`panel-${tab.key}`}
          id={`tab-${tab.key}`}
          className={cn(
            'px-4 py-2 font-alatsi text-sm transition-colors border-b-2 -mb-px',
            active === tab.key
              ? 'border-brand text-stroke'
              : 'border-transparent text-muted hover:text-stroke'
          )}
        >
          <span className="block">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

interface TabPanelProps {
  value: string
  active: string
  children: React.ReactNode
}

export function TabPanel({ value, active, children }: TabPanelProps) {
  if (value !== active) return null
  return (
    <div role="tabpanel" id={`panel-${value}`} aria-labelledby={`tab-${value}`}>
      {children}
    </div>
  )
}
