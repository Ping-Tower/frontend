const GEAR_STROKE = 'rgba(74, 222, 128, 0.32)'
const GEAR_FILL = 'url(#gear-fill)'
const GEAR_FILL_SOFT = 'url(#gear-fill-soft)'
const GEAR_HOLE = '#0a0a0c'
const GEAR_ACCENT = '#4ade80'

const BASE_DURATION_SECONDS = 18
const MODULE = 7.5
const OUTER_ADDENDUM = 13
const INNER_DEDENDUM = 16
/** Angular half-widths of a tooth as a fraction of the tooth pitch. */
const TOOTH_ROOT_HALF = 0.27
const TOOTH_TIP_HALF = 0.13

type GearSpec = {
  teeth: number
  fill: string
  x?: number
  y?: number
  angleDeg?: number
  outerR?: number
  innerR?: number
  holeR?: number
}

type GearGeometry = GearSpec & {
  pitchR: number
  outerR: number
  innerR: number
  holeR: number
  x: number
  y: number
}

const CENTER_GEAR: GearGeometry = createGear({
  teeth: 16,
  fill: GEAR_FILL,
  x: 320,
  y: 292,
})

const MESHED_GEARS: GearGeometry[] = [
  createMeshedGear(CENTER_GEAR, { teeth: 10, fill: GEAR_FILL_SOFT, angleDeg: 225 }),
  createMeshedGear(CENTER_GEAR, { teeth: 12, fill: GEAR_FILL_SOFT, angleDeg: 337.5 }),
  createMeshedGear(CENTER_GEAR, { teeth: 8, fill: GEAR_FILL, angleDeg: 67.5 }),
]

const REFERENCE_MESH_ANGLE = 337.5
const CENTER_INITIAL_DEG = normalizeDeg(REFERENCE_MESH_ANGLE + 90)

export function GearHero() {
  return (
    <div className="hero-panel relative flex h-[72vh] max-h-[48rem] min-h-[32rem] w-full items-center justify-center p-4">
      <div className="relative z-10 mx-auto flex w-full max-w-[48rem] items-center justify-center">
        <svg viewBox="0 0 680 560" className="w-full" aria-hidden="true">
          <defs>
            <radialGradient id="gear-fill" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#24242b" />
              <stop offset="100%" stopColor="#18181d" />
            </radialGradient>
            <radialGradient id="gear-fill-soft" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#1e1e24" />
              <stop offset="100%" stopColor="#141418" />
            </radialGradient>
            <filter id="gear-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <SynchronizedGear
            gear={CENTER_GEAR}
            initialDeg={CENTER_INITIAL_DEG}
            direction={1}
            durationSeconds={BASE_DURATION_SECONDS}
          />

          {MESHED_GEARS.map((gear) => (
            <SynchronizedGear
              key={`${gear.teeth}-${gear.angleDeg}`}
              gear={gear}
              initialDeg={computeMeshedInitialDeg(gear)}
              direction={-1}
              durationSeconds={BASE_DURATION_SECONDS * (gear.teeth / CENTER_GEAR.teeth)}
            />
          ))}
        </svg>
      </div>
    </div>
  )
}

function SynchronizedGear({
  gear,
  initialDeg,
  direction,
  durationSeconds,
}: {
  gear: GearGeometry
  initialDeg: number
  direction: 1 | -1
  durationSeconds: number
}) {
  const endDeg = initialDeg + direction * 360

  return (
    <g transform={`translate(${gear.x}, ${gear.y})`}>
      <g transform={`rotate(${initialDeg})`}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`${initialDeg} 0 0`}
          to={`${endDeg} 0 0`}
          dur={`${durationSeconds}s`}
          repeatCount="indefinite"
        />
        <GearShape {...gear} />
      </g>
    </g>
  )
}

function createMeshedGear(center: GearGeometry, spec: GearSpec): GearGeometry {
  const gear = createGear(spec)
  const angleRad = toRad(spec.angleDeg ?? 0)
  const distance = center.pitchR + gear.pitchR

  return {
    ...gear,
    angleDeg: spec.angleDeg,
    x: center.x + Math.cos(angleRad) * distance,
    y: center.y + Math.sin(angleRad) * distance,
  }
}

function createGear(spec: GearSpec): GearGeometry {
  const pitchR = spec.teeth * MODULE
  const outerR = spec.outerR ?? pitchR + OUTER_ADDENDUM
  const innerR = spec.innerR ?? pitchR - INNER_DEDENDUM
  const holeR = spec.holeR ?? Math.max(12, pitchR * 0.31)

  return {
    ...spec,
    pitchR,
    outerR,
    innerR,
    holeR,
    x: spec.x ?? 0,
    y: spec.y ?? 0,
  }
}

function computeMeshedInitialDeg(gear: GearGeometry) {
  const toothStep = 360 / gear.teeth

  return normalizeDeg(
    (gear.angleDeg ?? 0) + 270 - toothStep / 2 + CENTER_INITIAL_DEG * (CENTER_GEAR.teeth / gear.teeth)
  )
}

function normalizeDeg(value: number) {
  const normalized = value % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function GearShape({ teeth, outerR, innerR, holeR, fill }: GearGeometry) {
  return (
    <g>
      <path d={buildGearPath(teeth, outerR, innerR)} fill={fill} stroke={GEAR_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <circle r={holeR} fill={GEAR_HOLE} stroke={GEAR_STROKE} strokeWidth="1.5" />
      <circle r={holeR / 3} fill={GEAR_ACCENT} opacity="0.35" filter="url(#gear-glow)" />
      <circle r={holeR / 4.5} fill={GEAR_ACCENT} opacity="0.85" />
    </g>
  )
}

/** Trapezoid teeth with arcs along the tip and root circles. */
function buildGearPath(teeth: number, outerR: number, innerR: number): string {
  const step = (Math.PI * 2) / teeth
  const rootHalf = step * TOOTH_ROOT_HALF
  const tipHalf = step * TOOTH_TIP_HALF
  const pt = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`

  let d = ''
  for (let i = 0; i < teeth; i++) {
    const angle = i * step - Math.PI / 2
    d += `${i === 0 ? 'M' : 'L'}${pt(innerR, angle - rootHalf)} `
    d += `L${pt(outerR, angle - tipHalf)} `
    d += `A${outerR},${outerR} 0 0 1 ${pt(outerR, angle + tipHalf)} `
    d += `L${pt(innerR, angle + rootHalf)} `
    d += `A${innerR},${innerR} 0 0 1 ${pt(innerR, angle + step - rootHalf)} `
  }
  return d + 'Z'
}
