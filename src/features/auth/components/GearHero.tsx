const GEAR_STROKE = 'rgba(74, 222, 128, 0.25)'
const GEAR_FILL = '#1d1d23'
const GEAR_FILL_SOFT = '#17171c'
const GEAR_HOLE = '#0a0a0c'

const BASE_DURATION_SECONDS = 18
const MODULE = 7.5
const OUTER_ADDENDUM = 16
const INNER_DEDENDUM = 16

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
      <div className="absolute bottom-3 left-4 font-alatsi text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-muted z-10">
        SYS:MONITORING
      </div>
      <div className="absolute bottom-3 right-4 font-alatsi text-[0.65rem] font-semibold tracking-[0.06em] text-muted z-10">
        <span className="text-brand">●</span> ONLINE
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-[48rem] items-center justify-center">
        <svg viewBox="0 0 680 560" className="w-full" aria-hidden="true">
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
  const path = buildGearPath(teeth, outerR, innerR)

  return (
    <g>
      <path
        d={path}
        fill={fill}
        stroke={GEAR_STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="0" cy="0" r={holeR + 8} fill="rgba(74,222,128,0.04)" />
      <circle cx="0" cy="0" r={holeR} fill={GEAR_HOLE} stroke={GEAR_STROKE} strokeWidth="2" />
      <circle cx="0" cy="0" r={holeR / 3.4} fill="rgba(74,222,128,0.6)" />
    </g>
  )
}

function buildGearPath(teeth: number, outerR: number, innerR: number): string {
  const step = (Math.PI * 2) / teeth
  const half = step / 2
  const toothWidth = 0.44

  let d = ''
  for (let i = 0; i < teeth; i++) {
    const angle = i * step - Math.PI / 2

    const a1 = angle - half * toothWidth
    const a2 = angle - half * 0.34
    const a3 = angle + half * 0.34
    const a4 = angle + half * toothWidth

    d += i === 0 ? 'M' : 'L'
    d += `${(innerR * Math.cos(a1)).toFixed(2)},${(innerR * Math.sin(a1)).toFixed(2)} `
    d += `L${(outerR * Math.cos(a2)).toFixed(2)},${(outerR * Math.sin(a2)).toFixed(2)} `
    d += `L${(outerR * Math.cos(a3)).toFixed(2)},${(outerR * Math.sin(a3)).toFixed(2)} `
    d += `L${(innerR * Math.cos(a4)).toFixed(2)},${(innerR * Math.sin(a4)).toFixed(2)} `
  }
  d += 'Z'
  return d
}
