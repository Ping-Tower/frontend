import type { CSSProperties } from 'react'

export const CHART_COLORS = {
  blue: '#4da8d4',
  green: '#5db87a',
  red: '#e07060',
  orange: '#e09a40',
  purple: '#b87ab0',
  slate: '#5a6778',
  gray: '#6b7280',
  threshold: '#b74b4b',
} as const

export const CHART_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.orange,
  CHART_COLORS.purple,
  CHART_COLORS.red,
  '#8090a0',
]

export const CHART_GRID_STROKE = 'rgba(255,255,255,0.06)'

export const CHART_TICK = {
  fontFamily: 'Manrope, sans-serif',
  fontSize: 12,
  fill: CHART_COLORS.gray,
}

export const LINE_CURSOR = { stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }
export const BAR_CURSOR = { fill: 'rgba(255,255,255,0.04)' }

/** Shared Recharts <Tooltip> styling props. */
export const TOOLTIP_PROPS = {
  contentStyle: {
    background: 'rgba(18,18,26,0.97)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    boxShadow: '0 18px 60px rgba(0,0,0,0.4)',
    fontFamily: 'Manrope, sans-serif',
    fontSize: 13,
    color: '#c8cdd6',
  } satisfies CSSProperties,
  labelStyle: { color: '#9ca3af' } satisfies CSSProperties,
  itemStyle: { color: '#c8cdd6' } satisfies CSSProperties,
}

/** Shared Recharts <Legend> props. */
export const LEGEND_PROPS = {
  verticalAlign: 'top',
  align: 'left',
  iconType: 'plainline',
  wrapperStyle: { paddingBottom: '14px', fontFamily: 'Manrope, sans-serif', fontSize: '12px', color: '#9ca3af' },
} as const
