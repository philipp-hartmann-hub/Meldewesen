import { useEffect, useRef } from 'react'
import { ZIELPROZESS_GRUPPEN } from '../../constants/zielprozessNichtUmgesetzt'

/**
 * Workshop-Modal: Zielprozess-Optionen, die im Prototyp noch nicht klickbar sind.
 * docs/LASTENHEFT/12_PROTOTYP_POPUP_ZIELOPTIONEN.md
 */
export default function MeldungZieloptionenModal({ offen, onSchliessen, meldungsNr }) {
  const schliessenRef = useRef(null)
  const gesamt = ZIELPROZESS_GRUPPEN.reduce((n, g) => n + g.optionen.length, 0)

  useEffect(() => {
    if (!offen) return
    schliessenRef.current?.focus()
    function onKey(e) {
      if (e.key === 'Escape') onSchliessen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [offen, onSchliessen])

  if (!offen) return null

  return (
    <ModalBackdrop onSchliessen={onSchliessen}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="zieloptionen-titel"
        className="max-w-2xl w-full max-h-[min(90vh,720px)] flex flex-col rounded-lg border-2 border-jhh-warning bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-5 border-b border-jhh-border shrink-0">
          <h3 id="zieloptionen-titel" className="text-lg font-bold text-jhh-primary mb-2">
            Optionen im fertigen Prozess
          </h3>
          <p className="text-sm text-jhh-text-light mt-2 m-0">
            {meldungsNr ? (
              <>Kontext: Meldung <strong>{meldungsNr}</strong> · </>
            ) : null}
            <strong>{gesamt} Aktionen</strong> sind im Zielprozess vorgesehen, im Prototyp aber{' '}
            <strong>noch nicht umsetzbar</strong> (nur zur Orientierung).
          </p>
        </header>

        <div className="overflow-y-auto flex-1 p-5 min-h-0">
          {ZIELPROZESS_GRUPPEN.map(gruppe => (
            <section key={gruppe.id} className="mb-5 last:mb-0">
              <h3 className="text-sm font-bold text-jhh-secondary uppercase tracking-wide mb-2 m-0">
                {gruppe.titel}
              </h3>
              <ul className="list-none p-0 m-0 space-y-2">
                {gruppe.optionen.map(opt => (
                  <li
                    key={opt.id}
                    className="rounded border border-jhh-border bg-jhh-bg p-3"
                    aria-disabled="true"
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xs font-mono text-jhh-text-light">{opt.id}</span>
                      <span className="font-semibold text-sm text-jhh-primary">{opt.titel}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-medium">
                        nicht im Prototyp
                      </span>
                    </div>
                    <p className="text-sm text-jhh-text-light mt-1 mb-0">{opt.beschreibung}</p>
                    {opt.rolle && opt.rolle !== '–' && (
                      <p className="text-xs text-jhh-text-light mt-1 mb-0">Typische Rolle: {opt.rolle}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="p-5 border-t border-jhh-border shrink-0 space-y-3">
          <p className="text-xs text-jhh-text-light m-0">
            Die klickbaren Aktionen auf dieser Seite zeigen den <strong>vereinfachten Kernpfad</strong> des
            Prototyps. Im Zielsystem werden die oben genannten Schritte über die LC-Plattform abgebildet.
          </p>
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              ref={schliessenRef}
              className="btn-primary min-h-[44px]"
              onClick={onSchliessen}
            >
              Schließen
            </button>
          </div>
        </footer>
      </div>
    </ModalBackdrop>
  )
}

function ModalBackdrop({ children, onSchliessen }) {
  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/40"
      onClick={e => {
        if (e.target === e.currentTarget) onSchliessen()
      }}
    >
      {children}
    </div>
  )
}
