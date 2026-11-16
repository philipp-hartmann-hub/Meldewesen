import { useEffect, useRef } from 'react'
import RichTextDisplay from '../shared/RichTextDisplay'
import { getZeugenTyp, getZeugenTypLabel } from '../../constants/zeugen'
import { isRichTextEmpty } from '../../utils/richText'

/**
 * Zeugenaussage im Lesemodus (z. B. fachliche Prüfung im Arbeitskorb).
 */
export default function ZeugenaussageLesenModal({ zeuge, offen, onSchliessen }) {
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

  if (!offen || !zeuge) return null

  const typ = getZeugenTyp(zeuge.zeugenTyp)
  const aussageLabel = zeuge.zeugenTyp === 'bediensteter'
    ? 'Zeugenaussage'
    : (typ?.aussageLabel || 'Zeugenaussage')
  const hatAussage = !isRichTextEmpty(zeuge.aussage)

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40"
      onClick={onSchliessen}
      aria-hidden={false}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="zeugenaussage-lesen-titel"
        className="max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-lg border-2 border-jhh-secondary bg-white shadow-xl p-6 focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="zeugenaussage-lesen-titel" className="text-lg font-bold text-jhh-primary m-0 mb-1">
          {aussageLabel}
        </h2>
        <p className="text-sm text-jhh-text-light m-0 mb-4">
          <span className="font-semibold text-jhh-text">{zeuge.name}</span>
          {zeuge.zeugenTyp && (
            <> · {getZeugenTypLabel(zeuge.zeugenTyp)}</>
          )}
        </p>

        <div className="rounded border border-jhh-border bg-jhh-bg p-4 mb-6">
          {hatAussage ? (
            <RichTextDisplay html={zeuge.aussage} />
          ) : (
            <p className="text-sm text-jhh-text-light m-0 italic">
              Keine Zeugenaussage hinterlegt.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            ref={schliessenRef}
            className="btn-primary min-h-[44px]"
            onClick={onSchliessen}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}
