// ============================================================
// Header.jsx – HEUREKA 2.0 | A2 eMeldewesen
// ============================================================

import { useRolle, getRolleLabel } from '../../context/RollenContext'
import BenachrichtigungenGlocke from './BenachrichtigungenGlocke'

const JVP_URL = import.meta.env.VITE_JVP_URL || '/'

export default function Header({ plattformTitel = '' }) {
  const { aktiverNutzer, aktiveRolle } = useRolle()

  return (
    <header
      className="sticky z-40 w-full shadow-md shrink-0"
      style={{ top: 'var(--layout-banner-h)', background: 'var(--jhh-primary)', height: 'var(--layout-header-h)' }}
    >
      <div
        className="page-container h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) auto',
          alignItems: 'center',
          gap: '0.5rem 0.75rem',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <a href={JVP_URL} aria-label="Zurück zur Justizvollzugsplattform" className="flex-shrink-0">
            <div className="flex items-center rounded px-1.5 py-0.5" style={{ background: '#ffffff' }}>
              <img
                src="/assets/Justizvollzug-Hamburg-logo.png"
                alt="Hamburg – Behörde für Justiz und Verbraucherschutz"
                className="h-8 w-auto"
              />
            </div>
          </a>

          <div
            className="flex-shrink-0 hidden sm:block"
            style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.25)' }}
            aria-hidden="true"
          />

          <div className="min-w-0">
            <div className="text-white font-bold text-sm sm:text-base leading-tight truncate">
              Justizvollzugsplattform Hamburg
              {plattformTitel && (
                <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {' '}– {plattformTitel}
                </span>
              )}
            </div>
            <div
              className="text-xs hidden md:block truncate"
              style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1px' }}
            >
              Behörde für Justiz und Verbraucherschutz (BJV)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <BenachrichtigungenGlocke />
          <div
            className="text-right hidden sm:block px-3 py-1.5 rounded"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.22)',
            }}
          >
            <div className="text-sm font-semibold leading-tight text-white">
              {aktiverNutzer.name}
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.72)' }}>
              {getRolleLabel(aktiveRolle)}
              {aktiverNutzer.jva ? ` · ${aktiverNutzer.jva}` : ''}
            </div>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}
            aria-hidden="true"
          >
            {aktiverNutzer.initials}
          </div>
        </div>
      </div>
    </header>
  )
}
