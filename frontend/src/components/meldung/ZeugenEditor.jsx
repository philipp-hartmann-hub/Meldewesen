import { useState } from 'react'
import RichTextEditor from '../shared/RichTextEditor'
import ZeugenNameFeld from './ZeugenNameFeld'
import {
  BENACHRICHTIGUNG_STANDORTE,
  ZEUGEN_TYPEN,
  createEmptyZeuge,
  getZeugenTyp,
  zeugeBrauchtBenachrichtigungsStandort,
} from '../../constants/zeugen'

function ZeugeFelder({
  z,
  typ,
  hauptGefangeneJva,
  hauptGefangeneHaus,
  idPrefix,
  onPatch,
}) {
  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-typ-${z.id}`} className="form-label form-label-required">
          Art des Zeugen
        </label>
        <select
          id={`${idPrefix}-typ-${z.id}`}
          className="form-input"
          value={z.zeugenTyp || ''}
          onChange={e => {
            const v = e.target.value
            const brauchtStandort = zeugeBrauchtBenachrichtigungsStandort(v)
            onPatch({
              zeugenTyp: v,
              name: '',
              aussage: '',
              gefangenenNr: '',
              _gefangeneId: undefined,
              _bediensteterId: undefined,
              benachrichtigungJva: brauchtStandort ? (hauptGefangeneJva || '') : '',
              benachrichtigungHaus: brauchtStandort ? (hauptGefangeneHaus || '') : '',
            })
          }}
          aria-required="true"
        >
          <option value="">Bitte wählen …</option>
          {ZEUGEN_TYPEN.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {typ?.beschreibung && (
          <p className="text-xs text-jhh-text-light mt-1">{typ.beschreibung}</p>
        )}
      </div>

      {zeugeBrauchtBenachrichtigungsStandort(z.zeugenTyp) && (
        <div>
          <label htmlFor={`${idPrefix}-standort-${z.id}`} className="form-label form-label-required">
            Abteilung für Gruppenaufgabe
          </label>
          <select
            id={`${idPrefix}-standort-${z.id}`}
            className="form-input"
            value={
              z.benachrichtigungJva && z.benachrichtigungHaus
                ? `${z.benachrichtigungJva}|||${z.benachrichtigungHaus}`
                : ''
            }
            onChange={e => {
              const val = e.target.value
              if (!val) {
                onPatch({
                  benachrichtigungJva: '',
                  benachrichtigungHaus: '',
                  ...(z.zeugenTyp === 'inhaftierter'
                    ? { name: '', gefangenenNr: '', _gefangeneId: undefined }
                    : {}),
                })
                return
              }
              const [jva, haus] = val.split('|||')
              onPatch({
                benachrichtigungJva: jva || '',
                benachrichtigungHaus: haus || '',
                ...(z.zeugenTyp === 'inhaftierter'
                  ? { name: '', gefangenenNr: '', _gefangeneId: undefined }
                  : {}),
              })
            }}
            aria-required="true"
          >
            <option value="">Bitte wählen …</option>
            {BENACHRICHTIGUNG_STANDORTE.map(s => (
              <option key={`${s.jva}-${s.haus}`} value={`${s.jva}|||${s.haus}`}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-jhh-text-light mt-1">
            Alle Bediensteten dieser Abteilung erhalten die Gruppenaufgabe zur Zeugenaufnahme.
          </p>
        </div>
      )}

      <ZeugenNameFeld
        zeuge={z}
        zeugenTyp={z.zeugenTyp}
        typConfig={typ}
        idPrefix={idPrefix}
        onChange={onPatch}
      />

      {z.zeugenTyp === 'bediensteter' && (
        <p className="text-sm text-jhh-text-light m-0 p-3 rounded border border-jhh-border bg-white">
          Die Zeugenaussage wird nach Einreichung der Meldung im persönlichen Arbeitskorb
          der/des benannten Bediensteten erfasst.
        </p>
      )}

      {z.zeugenTyp === 'inhaftierter' && (
        <p className="text-sm text-jhh-text-light m-0 p-3 rounded border border-jhh-border bg-white">
          Die Zeugenaussage wird nach Einreichung als Gruppenaufgabe an alle Bediensteten
          der gewählten Abteilung verteilt. Eine Person kann die Aufgabe übernehmen und die
          Aussage aufnehmen (Pull-Prinzip).
        </p>
      )}

      {z.zeugenTyp === 'ohne_meldeberechtigung' && (
        <RichTextEditor
          id={`${idPrefix}-aussage-${z.id}`}
          label={typ?.aussageLabel || 'Zeugenaussage'}
          value={z.aussage || ''}
          onChange={v => onPatch({ aussage: v })}
          required
          minHeight="100px"
          placeholder="Wörtlich oder sinngemäß festgehaltene mitgeteilte Aussage …"
        />
      )}
    </>
  )
}

export default function ZeugenEditor({
  zeugen = [],
  onChange,
  disabled = false,
  hauptGefangeneJva = '',
  hauptGefangeneHaus = '',
}) {
  const [pendingZeuge, setPendingZeuge] = useState(null)
  const [pendingFehler, setPendingFehler] = useState(null)

  const bestaetigteZeugen = zeugen.filter(z => !z._ausstehend)

  function updateZeuge(index, patch) {
    const next = bestaetigteZeugen.map((z, i) => (i === index ? { ...z, ...patch } : z))
    onChange(next)
  }

  function removeZeuge(index) {
    onChange(bestaetigteZeugen.filter((_, i) => i !== index))
  }

  function addZeuge() {
    setPendingZeuge(createEmptyZeuge())
    setPendingFehler(null)
  }

  function updatePending(patch) {
    setPendingZeuge(prev => ({ ...prev, ...patch }))
    setPendingFehler(null)
  }

  function confirmZeuge() {
    if (!pendingZeuge?.zeugenTyp) {
      setPendingFehler('Bitte wählen Sie die Art des Zeugen aus.')
      return
    }
    onChange([...bestaetigteZeugen, pendingZeuge])
    setPendingZeuge(null)
    setPendingFehler(null)
  }

  function cancelPending() {
    setPendingZeuge(null)
    setPendingFehler(null)
  }

  return (
    <fieldset className="border-0 p-0 m-0 space-y-4" disabled={disabled}>
      <legend className="form-label mb-1">Zeugen und Zeugenaussagen</legend>
      <p className="text-sm text-jhh-text-light mb-3">
        <strong>Einzelfallentscheidung:</strong> Zeugen nur erfassen, wenn es tatsächlich Zeugen gab.
        Wählen Sie pro Zeuge: Bedienstete/r, Inhaftierte/r oder Person ohne Zugriff auf das Meldewesen.
        Bei Inhaftierten und Personen ohne Meldewesen-Zugriff wählen Sie zusätzlich die <strong>Station bzw. das Hafthaus</strong>,
        an dessen Bedienstete die Benachrichtigung zur Zeugenaufnahme geht.
        Nach dem Ausfüllen bestätigen Sie mit <strong>Anlegen</strong>.
      </p>

      {bestaetigteZeugen.length === 0 && !pendingZeuge && (
        <p className="text-sm text-jhh-text-light italic" id="zeugen-leer-hinweis">
          Keine Zeugen erfasst – zulässig, wenn es keine Zeugen gab.
        </p>
      )}

      <ul className="space-y-4 list-none p-0 m-0" aria-labelledby="zeugen-leer-hinweis">
        {bestaetigteZeugen.map((z, index) => {
          const typ = getZeugenTyp(z.zeugenTyp)
          const zeugeNr = index + 1

          return (
            <li
              key={z.id}
              className="p-4 border border-jhh-border rounded bg-white space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-jhh-primary m-0">Zeuge {zeugeNr}</h4>
                {!disabled && (
                  <button
                    type="button"
                    className="btn-secondary btn-sm min-h-[44px]"
                    onClick={() => removeZeuge(index)}
                    aria-label={`Zeuge ${zeugeNr} entfernen`}
                  >
                    Entfernen
                  </button>
                )}
              </div>

              <ZeugeFelder
                z={z}
                typ={typ}
                hauptGefangeneJva={hauptGefangeneJva}
                hauptGefangeneHaus={hauptGefangeneHaus}
                idPrefix="zeugen"
                onPatch={patch => updateZeuge(index, patch)}
              />
            </li>
          )
        })}

        {pendingZeuge && (
          <li className="p-4 border-2 border-dashed border-jhh-secondary rounded bg-blue-50 space-y-3">
            <h4 className="text-sm font-bold text-jhh-secondary m-0">Neuer Zeuge</h4>

            {pendingFehler && (
              <p role="alert" className="text-sm text-jhh-danger m-0">{pendingFehler}</p>
            )}

            <ZeugeFelder
              z={pendingZeuge}
              typ={getZeugenTyp(pendingZeuge.zeugenTyp)}
              hauptGefangeneJva={hauptGefangeneJva}
              hauptGefangeneHaus={hauptGefangeneHaus}
              idPrefix="zeugen-pending"
              onPatch={updatePending}
            />

            <div className="flex gap-3 pt-2 border-t border-jhh-border mt-3">
              <button
                type="button"
                className="btn-primary min-h-[44px]"
                onClick={confirmZeuge}
              >
                Anlegen
              </button>
              <button
                type="button"
                className="btn-secondary min-h-[44px]"
                onClick={cancelPending}
              >
                Abbrechen
              </button>
            </div>
          </li>
        )}
      </ul>

      {!disabled && (
        <button
          type="button"
          className="btn-secondary min-h-[44px]"
          onClick={addZeuge}
          disabled={pendingZeuge !== null}
          title={pendingZeuge !== null ? 'Bitte zuerst den neuen Zeugen anlegen oder abbrechen' : undefined}
        >
          + Zeuge hinzufügen
        </button>
      )}
    </fieldset>
  )
}
