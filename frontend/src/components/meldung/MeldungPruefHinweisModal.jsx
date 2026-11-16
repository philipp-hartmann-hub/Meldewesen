import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/**
 * Prototyp: Simuliert eine Mitteilung an prüf- bzw. bearbeitungsberechtigte Personen,
 * sobald eingereichte Meldungen zur fachlichen Prüfung anstehen.
 * Im Zielsystem: Aufgabe/E-Mail über LC-Plattform (siehe Lastenheft A2-F-SLA-003).
 */
export default function MeldungPruefHinweisModal({
  anzahlEingereicht,
  offen,
  onSchliessen,
  untertitel,
  linkEingereichtFilter,
}) {
  const schliessenRef = useRef(null)

  useEffect(() => {
    if (!offen) return
    schliessenRef.current?.focus()
    function onKey(e) {
      if (e.key === 'Escape') onSchliessen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [offen, onSchliessen])

  if (!offen || anzahlEingereicht < 1) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40"
      aria-hidden={false}
      onClick={onSchliessen}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pruef-hinweis-titel"
        aria-describedby="pruef-hinweis-text"
        className="max-w-md w-full rounded-lg border-2 border-jhh-secondary bg-white shadow-xl p-6 focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="pruef-hinweis-titel" className="text-lg font-bold text-jhh-primary mb-2">
          Meldungen zur fachlichen Prüfung
        </h3>
        <p id="pruef-hinweis-text" className="text-sm text-jhh-text mb-4">
          Für Ihre Rolle liegen{' '}
          <strong>{anzahlEingereicht === 1 ? 'eine eingereichte Meldung' : `${anzahlEingereicht} eingereichte Meldungen`}</strong>{' '}
          zur <strong>fachlichen Prüfung</strong> bzw. zur Übernahme in den Status „Fachliche Prüfung" vor (aktuell „Eingereicht").
          {untertitel ? <>{' '}{untertitel}</> : null}
        </p>
        <p className="text-xs text-jhh-text-light mb-2">
          <span aria-hidden="true">ℹ️ </span>
          <strong>Prototyp:</strong> Dieses Fenster ersetzt keine E-Mail- oder Aufgabenbenachrichtigung.
          Im fertigen Prozess (Zielsystem) werden berechtigte Personen über die LC-Plattform informiert;
          siehe Lastenheft A2-F-SLA-003 und Anhang A.
        </p>
        <div className="flex flex-wrap gap-3 justify-end mt-6">
          {linkEingereichtFilter && (
            <Link
              to={linkEingereichtFilter}
              className="btn-secondary min-h-[44px] inline-flex items-center justify-center"
              onClick={onSchliessen}
            >
              Nur „Eingereicht" anzeigen
            </Link>
          )}
          <button
            type="button"
            ref={schliessenRef}
            className="btn-primary min-h-[44px]"
            onClick={onSchliessen}
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  )
}
