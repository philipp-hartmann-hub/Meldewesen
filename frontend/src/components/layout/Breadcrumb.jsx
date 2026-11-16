// ============================================================
// Breadcrumb.jsx – HEUREKA 2.0 | NICHT VERÄNDERN
// ============================================================
import { Link } from 'react-router-dom'

const linkClass = 'font-medium transition-colors'
const linkStyle = { color: 'var(--jhh-secondary)' }

export default function Breadcrumb({ fachverfahren, seiten = [] }) {
  return (
    <nav
      className="w-full shrink-0 border-b border-jhh-border py-1.5 bg-white"
      aria-label="Breadcrumb"
    >
      <ol className="page-container flex items-center flex-wrap gap-1 text-sm">
        <li>
          <Link to="/dashboard" className={linkClass} style={linkStyle}>
            Dashboard
          </Link>
        </li>
        {fachverfahren && (
          <>
            <li aria-hidden="true" className="text-jhh-border select-none">›</li>
            <li>
              {fachverfahren.href ? (
                <Link to={fachverfahren.href} className={linkClass} style={linkStyle}>
                  {fachverfahren.label}
                </Link>
              ) : (
                <span className="font-semibold text-jhh-primary" aria-current="page">
                  {fachverfahren.label}
                </span>
              )}
            </li>
          </>
        )}
        {seiten.map((s, i) => (
          <li key={i} className="flex items-center gap-1">
            <span aria-hidden="true" className="text-jhh-border select-none">›</span>
            {s.href ? (
              <Link to={s.href} className={linkClass} style={linkStyle}>
                {s.label}
              </Link>
            ) : (
              <span className="font-semibold text-jhh-primary" aria-current="page">
                {s.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
