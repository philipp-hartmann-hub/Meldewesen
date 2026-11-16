import { useEffect } from 'react'

/**
 * Vollbild-Vorschau für Bild-Anhänge (ohne Download).
 */
export default function AnhangVorschauModal({ offen, titel, bildUrl, onSchliessen }) {
  useEffect(() => {
    if (!offen) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onSchliessen()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [offen, onSchliessen])

  if (!offen || !bildUrl) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anhang-vorschau-titel"
      onClick={onSchliessen}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded shadow-lg flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-jhh-border">
          <h2 id="anhang-vorschau-titel" className="text-sm font-semibold text-jhh-primary truncate m-0">
            {titel}
          </h2>
          <button
            type="button"
            className="btn-secondary btn-sm min-h-[44px] shrink-0"
            onClick={onSchliessen}
          >
            Schließen
          </button>
        </div>
        <div className="p-4 overflow-auto flex items-center justify-center bg-jhh-bg min-h-[200px]">
          <img
            src={bildUrl}
            alt={titel ? `Vorschau: ${titel}` : 'Bildvorschau'}
            className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
          />
        </div>
      </div>
    </div>
  )
}
