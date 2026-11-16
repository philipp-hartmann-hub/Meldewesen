import { useState } from 'react'
import RichTextDisplay from '../shared/RichTextDisplay'
import { getZeugenTyp, getZeugenTypLabel, zeugeBrauchtBenachrichtigungsStandort } from '../../constants/zeugen'
import { isRichTextEmpty } from '../../utils/richText'

function AussageInhalt({ z, typ }) {
  if (z.zeugenTyp === 'inhaftierter' && isRichTextEmpty(z.aussage)) {
    return (
      <span className="text-jhh-text-light italic">
        {z.aussageAufgenommenAm ? '–' : 'Wird als Gruppenaufgabe in der Abteilung erfasst.'}
      </span>
    )
  }
  if (z.zeugenTyp === 'bediensteter' && isRichTextEmpty(z.aussage)) {
    return (
      <span className="text-jhh-text-light italic">
        {z.aussageBestaetigtAm ? '–' : 'Wird im Arbeitskorb der/des Bediensteten erfasst.'}
      </span>
    )
  }
  if (isRichTextEmpty(z.aussage)) {
    return '–'
  }
  return <RichTextDisplay html={z.aussage} />
}

/**
 * Aufklappbare Zeugenliste (Detailansicht Meldung oder fachliche Prüfung).
 * @param {'full' | 'aussage'} variant – full: Stammdaten + Aussage; aussage: nur Aussage
 */
export default function ZeugenAccordionListe({
  zeugen,
  variant = 'full',
  className = '',
  ersterOffen = true,
}) {
  const [offen, setOffen] = useState(() => {
    if (!ersterOffen || !zeugen.length) return {}
    const firstKey = zeugen[0].id || 0
    return { [firstKey]: true }
  })

  if (!zeugen.length) return null

  return (
    <ul className={`space-y-4 list-none p-0 m-0 ${className}`.trim()} aria-label="Zeugen">
      {zeugen.map((z, i) => {
        const typ = getZeugenTyp(z.zeugenTyp)
        const key = z.id || i
        const aussageLabel = z.zeugenTyp === 'bediensteter'
          ? 'Zeugenaussage'
          : (typ?.aussageLabel || 'Zeugenaussage')

        return (
          <li key={key} className="border border-jhh-border rounded bg-jhh-bg">
            <button
              type="button"
              className="w-full flex justify-between items-center gap-2 px-4 py-3 text-left font-bold text-sm text-jhh-primary min-h-[44px]"
              onClick={() => setOffen(prev => ({ ...prev, [key]: !prev[key] }))}
              aria-expanded={!!offen[key]}
            >
              <span className="min-w-0">
                Zeuge {i + 1}: {z.name || '–'}
                <span className="ml-2 font-normal text-jhh-text-light">
                  {getZeugenTypLabel(z.zeugenTyp)}
                </span>
              </span>
              <span className="flex-shrink-0" aria-hidden="true">
                {offen[key] ? '▲' : '▼'}
              </span>
            </button>

            {offen[key] && (
              <div className="px-4 pb-4 border-t border-jhh-border">
                {variant === 'full' && (
                  <dl className="grid gap-2 text-sm sm:grid-cols-2 mb-3 mt-3">
                    <div>
                      <dt className="text-jhh-text-light">Art</dt>
                      <dd>{getZeugenTypLabel(z.zeugenTyp)}</dd>
                    </div>
                    {zeugeBrauchtBenachrichtigungsStandort(z.zeugenTyp) && (z.benachrichtigungJva || z.benachrichtigungHaus) && (
                      <div>
                        <dt className="text-jhh-text-light">Station / Hafthaus (Benachrichtigung)</dt>
                        <dd>{[z.benachrichtigungJva, z.benachrichtigungHaus].filter(Boolean).join(' · ') || '–'}</dd>
                      </div>
                    )}
                    {z.zeugenTyp === 'inhaftierter' && z.gefangenenNr && (
                      <div>
                        <dt className="text-jhh-text-light">Gefangenen-Nr.</dt>
                        <dd>{z.gefangenenNr}</dd>
                      </div>
                    )}
                  </dl>
                )}
                <div className={variant === 'full' ? '' : 'mt-3'}>
                  <dt className="text-jhh-text-light text-sm mb-1">{aussageLabel}</dt>
                  <dd className="text-sm m-0">
                    <AussageInhalt z={z} typ={typ} />
                  </dd>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
