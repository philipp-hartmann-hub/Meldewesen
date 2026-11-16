import { useEffect, useRef } from 'react'
import { berechneZeugenFolgeaktionenPreview } from '../../utils/zeugenFolgeaktionenPreview'

/**
 * Bestätigung vor Einreichung: beschreibt den weiteren Prozess (Status, Prüfung, Zeugen-Mock).
 */
export default function EinreichungFolgeaktionenDialog({
  offen,
  meldungsTyp,
  ervRelevant,
  zeugen,
  onAbbrechen,
  onBestaetigen,
  saving = false,
}) {
  const bestaetigenRef = useRef(null)
  const istStrafanzeige = meldungsTyp === 'STRAFANZEIGE'
  const preview = istStrafanzeige ? berechneZeugenFolgeaktionenPreview(zeugen) : null

  useEffect(() => {
    if (!offen) return
    bestaetigenRef.current?.focus()
    function onKey(e) {
      if (e.key === 'Escape' && !saving) onAbbrechen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [offen, onAbbrechen, saving])

  if (!offen) return null

  const hatZeugenAktionen =
    preview &&
    (preview.bediensteteBenachrichtigungen.length > 0
      || preview.gruppenAufgaben?.length > 0
      || preview.stationWeiterleitungen.length > 0)

  const prozessSchritte = [
    { nr: 1, label: 'Zentrale bündelt Einzelmeldungen', detail: 'Arbeitskoordination fasst alle aVD-Perspektiven zum gleichen Vorfall zusammen' },
    { nr: 2, label: 'Dienstgruppenleitung prüft Qualität', detail: 'Fachliche Kriterien und inhaltliche Stimmigkeit im gebündelten Fall' },
    { nr: 3, label: 'Stationsleitung (Fallmeldung)', detail: 'SL leitet die gebündelte Fallmeldung an AL/VAL weiter' },
    { nr: 4, label: 'AL/VAL entscheidet Meldepflicht', detail: 'Meldepflichtig = ERV-pflichtig; sonst eGPA am Fall ohne beBPo' },
    { nr: 5, label: 'ERV / Abschluss am Fall', detail: ervRelevant
      ? 'Nach Entscheid: versandfähig → beBPo → eGPA am Fall (AL/VAL)'
      : 'Bei meldepflichtigem Vorfall: versandfähig → beBPo → eGPA; sonst direkt eGPA' },
  ]

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40"
      aria-hidden={false}
      onClick={e => { if (!saving) onAbbrechen() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="einreichung-dialog-titel"
        aria-describedby="einreichung-dialog-text"
        className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-lg border-2 border-jhh-secondary bg-white shadow-xl p-6 focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="einreichung-dialog-titel" className="text-lg font-bold text-jhh-primary mb-2">
          Meldung einreichen – Was passiert als Nächstes?
        </h3>
        <p id="einreichung-dialog-text" className="text-sm text-jhh-text mb-4">
          Die Meldung erhält den Status <strong>Eingereicht</strong> und kann nicht mehr
          wie ein Entwurf bearbeitet werden.
        </p>

        <ol className="space-y-3 mb-4 list-none p-0">
          {prozessSchritte.map(s => (
            <li key={s.nr} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'var(--jhh-primary)' }}
                aria-hidden="true"
              >
                {s.nr}
              </span>
              <div>
                <p className="text-sm font-semibold text-jhh-primary m-0">{s.label}</p>
                <p className="text-xs text-jhh-text-light m-0">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        {istStrafanzeige && (
          <div className="border-t border-jhh-border pt-4 mb-4">
            <p className="text-xs font-bold text-jhh-primary mb-2">Zeugen (Strafanzeige)</p>
            {!hatZeugenAktionen ? (
              <p className="text-sm text-jhh-text-light m-0">
                Es sind keine vollständig erfassten Zeugen hinterlegt –
                es werden <strong>keine Zeugen-Benachrichtigungen</strong> ausgelöst.
              </p>
            ) : (
              <p className="text-sm text-jhh-text m-0">
                Für <strong>{preview.anzahlZeugen}</strong> erfasste Zeuginnen/Zeugen
                werden Mock-Folgeaktionen ausgelöst (sichtbar in der Detailansicht).
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            className="btn-secondary min-h-[44px]"
            onClick={onAbbrechen}
            disabled={saving}
          >
            Abbrechen
          </button>
          <button
            ref={bestaetigenRef}
            type="button"
            className="btn-primary min-h-[44px]"
            onClick={onBestaetigen}
            disabled={saving}
          >
            {saving ? 'Wird eingereicht …' : 'Jetzt einreichen'}
          </button>
        </div>
      </div>
    </div>
  )
}
