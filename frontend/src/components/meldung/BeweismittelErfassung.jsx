import { useState } from 'react'
import RichTextEditor from '../shared/RichTextEditor'
import BeweismittelDateiUpload from './BeweismittelDateiUpload'
import { isRichTextEmpty } from '../../utils/richText'

/**
 * Standard-Beweismittel-Erfassung (Ja/Nein, Kurzbezeichnung, Upload, ggf. Begründung bei Nachreichung).
 */
export default function BeweismittelErfassung({
  meta,
  onMetaChange,
  nachreichungAktiv = false,
  anhaengeEintraege = [],
  onAnhaengeEintraegeChange,
  gespeicherteAnhaenge = [],
  onGespeicherteAnhaengeChange,
  meldungId = null,
  idPrefix = 'beweismittel',
  nachreichungHinweisAusblenden = false,
}) {
  const [beweismittelHinweis, setBeweismittelHinweis] = useState(false)

  function setMetaField(key, value) {
    onMetaChange(prev => ({ ...prev, [key]: value }))
  }

  function handleBeweismittelToggle(wert) {
    if (wert === 'nein') {
      onMetaChange(prev => ({
        ...prev,
        beweismittelGesichert: 'nein',
        beweismittelAngaben: '',
      }))
      const hatDateien = anhaengeEintraege.length > 0 || gespeicherteAnhaenge.length > 0
      setBeweismittelHinweis(hatDateien)
    } else {
      onMetaChange(prev => ({
        ...prev,
        beweismittelGesichert: 'ja',
        beweismittelKeineBegruendung: '',
      }))
      setBeweismittelHinweis(false)
    }
  }

  return (
    <fieldset className="border border-jhh-border rounded p-4 space-y-3">
      <legend className="form-label form-label-required px-1">Beweismittel</legend>
      <p className="text-sm text-jhh-text-light -mt-1 mb-2">
        Wurden relevante Beweismittel bereits gesichert? Bei <strong>Ja</strong> kurz benennen (z. B. Video, Gegenstände, Spuren).
      </p>
      {nachreichungAktiv && !nachreichungHinweisAusblenden && (
        <p className="text-sm text-jhh-text m-0 p-3 rounded border border-jhh-border bg-jhh-bg">
          VAL hat zur Klärung der Beweismittel zurückgegeben. Wählen Sie <strong>Ja</strong>, wenn
          Sie Beweismittel nachreichen, oder <strong>Nein</strong> mit Begründung, wenn nachweislich
          keine vorliegen (z. B. nur Zeugenaussagen).
        </p>
      )}
      <div className="flex flex-wrap gap-4 min-h-[44px] items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`${idPrefix}-beweismittelGesichert`}
            checked={meta.beweismittelGesichert === 'ja'}
            onChange={() => handleBeweismittelToggle('ja')}
          />
          <span>Ja</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`${idPrefix}-beweismittelGesichert`}
            checked={meta.beweismittelGesichert === 'nein'}
            onChange={() => handleBeweismittelToggle('nein')}
          />
          <span>Nein</span>
        </label>
      </div>
      {meta.beweismittelGesichert === 'ja' && (
        <>
          <div>
            <RichTextEditor
              id={`${idPrefix}-beweismittel-angaben`}
              label="Gesicherte Beweismittel (Kurzbezeichnung)"
              value={meta.beweismittelAngaben || ''}
              onChange={v => setMetaField('beweismittelAngaben', v)}
              required
              minHeight="72px"
            />
          </div>
          {onAnhaengeEintraegeChange && (
            <BeweismittelDateiUpload
              eintraege={anhaengeEintraege}
              onChange={onAnhaengeEintraegeChange}
              idPrefix={`${idPrefix}-datei`}
              meldungId={meldungId}
              gespeicherteEintraege={gespeicherteAnhaenge}
              onGespeicherteChange={meldungId ? onGespeicherteAnhaengeChange : undefined}
            />
          )}
        </>
      )}
      {nachreichungAktiv && meta.beweismittelGesichert === 'nein' && (
        <RichTextEditor
          id={`${idPrefix}-beweismittel-keine-begruendung`}
          label="Begründung: keine Beweismittel vorhanden"
          value={meta.beweismittelKeineBegruendung || ''}
          onChange={v => setMetaField('beweismittelKeineBegruendung', v)}
          required
          minHeight="72px"
          placeholder="z. B. Sachverhalt nur durch Zeugenaussagen belegbar, keine physischen Spuren …"
        />
      )}
      {beweismittelHinweis && (
        <div className="flex items-start gap-2 p-3 rounded bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <span aria-hidden="true" className="mt-0.5 flex-shrink-0">ℹ️</span>
          <span>
            Hochgeladene Dateien bleiben gespeichert, werden aber als nicht beweisrelevant markiert.
            <button
              type="button"
              className="ml-2 underline text-xs"
              onClick={() => setBeweismittelHinweis(false)}
            >
              Verstanden
            </button>
          </span>
        </div>
      )}
    </fieldset>
  )
}

/** Validierung für Beweismittel-Felder (Ersterfassung + Nachreichung). */
export function validiereBeweismittelErfassung(meta, { nachreichungAktiv = false } = {}) {
  if (meta.beweismittelGesichert !== 'ja' && meta.beweismittelGesichert !== 'nein') {
    return 'Bitte geben Sie an, ob Beweismittel gesichert wurden (Ja oder Nein).'
  }
  if (meta.beweismittelGesichert === 'ja' && isRichTextEmpty(meta.beweismittelAngaben)) {
    return 'Bitte beschreiben Sie kurz die gesicherten Beweismittel.'
  }
  if (nachreichungAktiv && meta.beweismittelGesichert === 'nein') {
    if (isRichTextEmpty(meta.beweismittelKeineBegruendung)) {
      return 'Bitte begründen Sie, warum nach Prüfung keine Beweismittel vorliegen (z. B. nur Zeugenaussagen).'
    }
  }
  return null
}
