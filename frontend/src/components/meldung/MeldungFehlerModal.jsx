import { useEffect, useRef } from 'react'

/**
 * Modal für Validierungs- und Speicherfehler bei der Meldungserstellung.
 */
export default function MeldungFehlerModal({ offen, meldung, onSchliessen }) {
  const schliessenRef = useRef(null)

  useEffect(() => {
    if (!offen) return undefined
    schliessenRef.current?.focus()
    function onKey(e) {
      if (e.key === 'Escape') onSchliessen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [offen, onSchliessen])

  if (!offen || !meldung) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40"
      aria-hidden={false}
      onClick={onSchliessen}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="meldung-fehler-titel"
        aria-describedby="meldung-fehler-text"
        className="max-w-md w-full rounded-lg border-2 border-jhh-danger bg-white shadow-xl p-6 focus:outline-none focus:ring-2 focus:ring-jhh-danger"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="meldung-fehler-titel" className="text-lg font-bold text-jhh-primary mb-2">
          Eingabe unvollständig
        </h3>
        <p id="meldung-fehler-text" className="text-sm text-jhh-text mb-4">
          {meldung}
        </p>
        <div className="flex gap-3 justify-end mt-6">
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
