import { getProzessSchritte } from '../../utils/meldungen'

export default function ProzessSchritte({ meldung, sticky = false }) {
  const schritte = getProzessSchritte(meldung)

  const navKlassen = [
    'bg-white border-b border-jhh-border px-3 sm:px-4 py-2',
    sticky ? 'sticky z-30 shadow-sm' : '',
  ].filter(Boolean).join(' ')

  const stickyStyle = sticky
    ? { top: 'var(--layout-sticky-under-header)' }
    : undefined

  return (
    <nav aria-label="Prozessfortschritt" className={navKlassen} style={stickyStyle}>
      <ol className="process-steps-scroll">
        {schritte.map((s, i) => (
          <li key={s.id} className="flex items-center flex-shrink-0">
            <span
              className={`inline-flex items-center whitespace-nowrap px-3 py-1.5 text-xs font-bold tracking-wide uppercase border-2 ${
                s.erledigt
                  ? 'bg-green-50 text-green-700 border-green-400'
                  : s.aktiv
                    ? 'bg-white text-jhh-primary border-jhh-primary'
                    : 'bg-jhh-bg text-jhh-text-light border-jhh-border'
              }`}
              aria-current={s.aktiv ? 'step' : undefined}
            >
              {s.erledigt ? (
                <span className="mr-1.5" aria-hidden="true">✓</span>
              ) : s.icon ? (
                <span className="mr-1.5" aria-hidden="true">{s.icon}</span>
              ) : null}
              {s.label}
            </span>
            {i < schritte.length - 1 && (
              <span className="text-jhh-text-light px-1" aria-hidden="true">→</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
