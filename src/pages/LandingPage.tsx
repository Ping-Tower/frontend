import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import logo from '/pingtower logo.png'

const PING_HOSTS = [
  { host: 'api.acme.com:443',    proto: 'HTTPS', ms: 98,   code: 200,  ok: true  },
  { host: 'db.staging.internal', proto: 'TCP',   ms: null, code: null, ok: false },
  { host: 'auth.acme.com:443',   proto: 'HTTPS', ms: 64,   code: 200,  ok: true  },
  { host: 'health.acme.com:80',  proto: 'HTTP',  ms: 42,   code: 200,  ok: true  },
  { host: 'gw-legacy.acme.com',  proto: 'HTTP',  ms: null, code: 503,  ok: false },
]

type PingLine = {
  id: number
  host: string
  ms: number | null
  code: number | null
  ok: boolean
  time: string
}

function buildSpark(color: string, count = 16) {
  return Array.from({ length: count }, () => ({
    h: Math.max(4, Math.random() * 24),
    color,
  }))
}

const DEMO_SERVERS = [
  {
    name: 'Production API', host: 'api.acme.com:443 · HTTPS',
    status: 'UP', uptime: '99.94%', fill: '99.9%',
    fillColor: '#4ade80', uptimeColor: '#4ade80',
    stats: [{ l: 'AVG', v: '112 ms' }, { l: 'P90', v: '187 ms' }, { l: 'P99', v: '334 ms' }],
    sparkColor: '#4ade80', sparkId: 0,
  },
  {
    name: 'Staging DB', host: 'db.staging.internal:5432 · TCP',
    status: 'DOWN', uptime: '82.31%', fill: '82%',
    fillColor: '#f87171', uptimeColor: '#f87171',
    stats: [{ l: 'AVG', v: '— ms' }, { l: 'Last seen', v: '3 min ago' }],
    sparkColor: '#f87171', sparkId: 1,
  },
  {
    name: 'Auth Service', host: 'auth.acme.com:443 · HTTPS',
    status: 'UP', uptime: '100.00%', fill: '100%',
    fillColor: '#4ade80', uptimeColor: '#4ade80',
    stats: [{ l: 'AVG', v: '68 ms' }, { l: 'P90', v: '110 ms' }, { l: 'P99', v: '198 ms' }],
    sparkColor: '#4ade80', sparkId: 2,
  },
  {
    name: 'Legacy Gateway', host: 'gw-legacy.acme.com:8080 · HTTP',
    status: 'UNKNOWN', uptime: '71.42%', fill: '71%',
    fillColor: '#fbbf24', uptimeColor: '#fbbf24',
    stats: [{ l: 'AVG', v: '—' }, { l: 'Status', v: 'No data' }],
    sparkColor: '#fbbf24', sparkId: 3,
  },
]

const STATUS_STYLE: Record<string, { bg: string; border: string; color: string; dot: string }> = {
  UP:      { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.22)',  color: '#4ade80', dot: '●' },
  DOWN:    { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.22)', color: '#f87171', dot: '●' },
  UNKNOWN: { bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.16)', color: '#6b7280', dot: '○' },
}

const NAV_BUTTON: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 106,
  height: 30,
  padding: '0 12px',
  borderRadius: 6,
  fontSize: '.75rem',
  fontWeight: 600,
  textDecoration: 'none',
}

export function LandingPage() {
  const [lines, setLines] = useState<PingLine[]>([])
  const lineCounter = useRef(0)
  const [sparks, setSparks] = useState(() => [
    buildSpark('#4ade80'),
    buildSpark('#f87171'),
    buildSpark('#4ade80'),
    buildSpark('#fbbf24'),
  ])

  // Terminal animation
  useEffect(() => {
    function addLine() {
      const h = PING_HOSTS[lineCounter.current % PING_HOSTS.length]
      const ms = h.ms ? h.ms + Math.round((Math.random() - 0.5) * 20) : null
      const time = new Date().toLocaleTimeString('en', { hour12: false })
      setLines((prev) => {
        const next = [...prev, { id: lineCounter.current, host: h.host, ms, code: h.code, ok: h.ok, time }]
        return next.slice(-8)
      })
      lineCounter.current++
    }
    for (let i = 0; i < 4; i++) addLine()
    const id = setInterval(addLine, 1600)
    return () => clearInterval(id)
  }, [])

  // Spark refresh
  useEffect(() => {
    const id = setInterval(() => {
      setSparks((prev) => [
        buildSpark('#4ade80'),
        prev[1],
        buildSpark('#4ade80'),
        prev[3],
      ])
    }, 3000)
    return () => clearInterval(id)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.lp-reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div style={{ background: '#080809', color: '#f2f2f4', fontFamily: "'JetBrains Mono', monospace", overflowX: 'hidden', minHeight: '100dvh' }}>
      <div className="lp-grid-bg" />

      {/* NAV */}
      <nav className="lp-nav">
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#f2f2f4' }}>
          <img src={logo} alt="PingTower" style={{ height: 22, objectFit: 'contain' }} />
          <span style={{ fontSize: '.9rem', fontWeight: 700, letterSpacing: '-0.02em' }}>PingTower</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login" style={{ ...NAV_BUTTON, color: '#c8c8d0', border: '1px solid rgba(255,255,255,0.12)' }}>
            Sign in
          </Link>
          <Link to="/register" style={{ ...NAV_BUTTON, color: '#080809', background: '#4ade80', border: '1px solid #4ade80' }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 1, height: '60%', background: 'linear-gradient(180deg,transparent,#4ade80,transparent)', opacity: .35, pointerEvents: 'none', animation: 'lp-beam-pulse 3s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(74,222,128,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <h1 style={{ fontSize: 'clamp(2.6rem,6vw,5.2rem)', fontWeight: 700, letterSpacing: '-0.045em', lineHeight: .95, color: '#f2f2f4', marginBottom: 22, animation: 'lp-fade-up .6s .1s ease both' }}>
          Know when your<br />servers go <em style={{ color: '#4ade80', fontStyle: 'normal' }}>down</em>.<br />Before anyone else.
        </h1>

        <p style={{ maxWidth: 520, fontSize: '.9rem', fontWeight: 400, color: '#7a7a88', lineHeight: 1.65, marginBottom: 36, animation: 'lp-fade-up .6s .2s ease both' }}>
          PingTower checks your HTTP, HTTPS, TCP, and ICMP endpoints every few seconds. Get alerted the moment something breaks — via Telegram, email, or whatever you connect.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64, animation: 'lp-fade-up .6s .3s ease both' }}>
          <Link to="/register" style={{ fontSize: '.85rem', fontWeight: 700, background: '#4ade80', color: '#080809', border: 'none', borderRadius: 6, padding: '12px 24px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
            Start monitoring free →
          </Link>
          <a href="#demo" style={{ fontSize: '.85rem', fontWeight: 600, background: '#161619', color: '#f2f2f4', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 6, padding: '12px 24px', cursor: 'pointer', textDecoration: 'none' }}>
            View dashboard
          </a>
        </div>

        {/* Terminal */}
        <div style={{ width: '100%', maxWidth: 700, animation: 'lp-fade-up .6s .4s ease both', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 8, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(74,222,128,0.05),0 32px 80px rgba(0,0,0,.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', background: '#161619', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#f87171' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontSize: '.72rem', color: '#3a3a48', marginLeft: 'auto', marginRight: 'auto', letterSpacing: '.04em' }}>pingtower — live checks</span>
          </div>
          <div style={{ background: '#0f0f12', padding: 16, fontSize: '.78rem', color: '#7a7a88', lineHeight: 1.8, minHeight: 180, textAlign: 'left' }}>
            {lines.map((line) => (
              <div key={line.id} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0', animation: 'lp-line-in .2s ease forwards' }}>
                <span style={{ fontWeight: 700, minWidth: 16, color: line.ok ? '#4ade80' : '#f87171' }}>{line.ok ? '✓' : '✗'}</span>
                <span style={{ color: '#3a3a48', fontSize: '.72rem' }}>[{line.time}]</span>
                <span style={{ color: '#f2f2f4', fontWeight: 600, minWidth: 200 }}>{line.host}</span>
                <span style={{ color: '#3a3a48', fontSize: '.72rem', minWidth: 60 }}>{line.ms ? `${line.ms}ms` : '—'}</span>
                <span style={{ fontSize: '.72rem', color: line.ok ? '#4ade80' : '#f87171' }}>{line.code ?? 'TIMEOUT'}</span>
              </div>
            ))}
            <span style={{ display: 'inline-block', width: 8, height: 14, background: '#4ade80', animation: 'lp-blink 1s step-end infinite', verticalAlign: 'middle', marginLeft: 2 }} />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="lp-reveal" id="features" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0f0f12', zIndex: 1, position: 'relative' }}>
        {[
          { num: '99.97%', label: 'Average uptime tracked' },
          { num: '<10 sec', label: 'Detection time' },
          { num: '4', label: 'Protocols supported' },
          { num: 'Instant', label: 'Telegram & email alerts' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '36px 20px', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#f2f2f4', lineHeight: 1 }}>
              <span style={{ color: '#4ade80' }}>{s.num.replace(/[^<>]/g, (c) => c)}</span>
            </div>
            <div style={{ fontSize: '.72rem', color: '#7a7a88', marginTop: 8, letterSpacing: '.05em', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* DEMO */}
      <section className="lp-reveal" id="demo" style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#4ade80', marginBottom: 16 }}>Live dashboard</div>
        <div style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 700, letterSpacing: '-0.04em', color: '#f2f2f4', lineHeight: 1.05, marginBottom: 32 }}>
          Your infrastructure,<br />at a glance.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {DEMO_SERVERS.map((srv) => {
            const st = STATUS_STYLE[srv.status]
            const spark = sparks[srv.sparkId]
            return (
              <div key={srv.name} style={{ background: '#0f0f12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#f2f2f4', marginBottom: 3 }}>{srv.name}</div>
                    <div style={{ fontSize: '.72rem', color: '#7a7a88' }}>{srv.host}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: st.bg, border: `1px solid ${st.border}`, color: st.color, borderRadius: 4, padding: '3px 9px', fontSize: '.72rem', fontWeight: 700 }}>
                    {st.dot} {srv.status}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#161619', overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', borderRadius: 3, background: srv.fillColor, width: srv.fill, transition: 'width 1s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: '.68rem', color: '#3a3a48' }}>Uptime</span>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: srv.uptimeColor }}>{srv.uptime}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                  {srv.stats.map((s) => (
                    <div key={s.l}>
                      <div style={{ fontSize: '.68rem', color: '#7a7a88', marginBottom: 4 }}>{s.l}</div>
                      <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#f2f2f4' }}>{s.v}</div>
                    </div>
                  ))}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', gap: 2, height: 24 }}>
                    {spark.map((b, i) => (
                      <div key={i} style={{ width: 3, borderRadius: 1, background: b.color, opacity: .6, height: b.h, transition: 'height .3s' }} />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f0f12', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="PingTower" style={{ height: 18, opacity: .5 }} />
          <span style={{ fontSize: '.75rem', color: '#3a3a48', fontWeight: 600 }}>PingTower</span>
        </div>
        <div style={{ fontSize: '.72rem', color: '#3a3a48' }}>Built by semao0</div>
      </footer>
    </div>
  )
}
