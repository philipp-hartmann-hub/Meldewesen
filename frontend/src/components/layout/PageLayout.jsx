// ============================================================
// Footer.jsx – HEUREKA 2.0 | NICHT VERÄNDERN
// ============================================================
export function Footer({ fachverfahren = 'eMeldewesen' }) {
  return (
    <footer className="w-full mt-16" style={{ background: 'var(--jhh-primary)' }}>
      <div
        className="page-container py-4 flex flex-wrap items-center justify-between gap-4 text-xs"
        style={{ color: 'rgba(255,255,255,0.55)' }}
      >
        <div className="flex flex-wrap gap-4">
          <span>© 2026 Behörde für Justiz und Verbraucherschutz Hamburg</span>
          <a href="#" className="hover:text-white transition-colors">Impressum</a>
          <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          <a href="#" className="hover:text-white transition-colors">Barrierefreiheit</a>
        </div>
        <div>{fachverfahren} · HEUREKA 2.0 · Prototyp</div>
      </div>
    </footer>
  )
}

// ============================================================
// PageLayout.jsx – HEUREKA 2.0 | NICHT VERÄNDERN
// ============================================================

import PrototypBanner from './PrototypBanner'
import Header from './Header'
import Breadcrumb from './Breadcrumb'

export default function PageLayout({
  children,
  plattformTitel = 'eMeldewesen',
  fachverfahren = null,
  seiten = [],
}) {
  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <PrototypBanner />
      <Header plattformTitel={plattformTitel} />
      <Breadcrumb fachverfahren={fachverfahren} seiten={seiten} />
      <main className="flex-1 w-full">
        <div className="page-container py-5 lg:py-6">
          {children}
        </div>
      </main>
      <Footer fachverfahren={plattformTitel} />
    </div>
  )
}
