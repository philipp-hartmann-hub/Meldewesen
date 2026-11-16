import { useEffect, useRef, useState } from 'react'
import RichTextEditor from '../shared/RichTextEditor'
import AnhangVorschauModal from './AnhangVorschauModal'
import { buildMockHeaders, downloadMeldungAnhangBlob } from '../../api/meldungAnhaengeApi'
import { useRolle } from '../../context/RollenContext'
import { istBildDatei } from '../../utils/anhangVorschau'
import {
  ANHAENGE_ACCEPT,
  ANHAENGE_MAX_ANZAHL,
  ANHAENGE_MAX_MB,
  ANLAGE_TYPEN_HINWEIS,
  BESCHREIBUNG_MAX_LAENGE,
  ERLAUBTE_DATEIFORMATE_HINWEIS,
} from '../../constants/meldungAnhaenge'

let entryId = 0
function nextId() {
  entryId += 1
  return `anhang-${entryId}`
}

/**
 * Optionale Beweismittel-Dateien mit Kurzbeschreibung je Datei.
 * Neue Dateien liegen im Formular-State; gespeicherte Anhänge beim Bearbeiten ebenfalls editierbar.
 */
export default function BeweismittelDateiUpload({
  eintraege,
  onChange,
  idPrefix = 'beweismittel-datei',
  meldungId = null,
  gespeicherteEintraege = [],
  onGespeicherteChange,
}) {
  const { aktiveRolle, aktiverNutzer } = useRolle()
  const inputRef = useRef(null)
  const [vorschau, setVorschau] = useState(null)
  const [vorschauLaedt, setVorschauLaedt] = useState(false)
  const [vorschauFehler, setVorschauFehler] = useState(null)
  const vorschauUrlRef = useRef(null)

  const gesamtAnzahl = gespeicherteEintraege.length + eintraege.length

  useEffect(() => () => {
    if (vorschauUrlRef.current) {
      URL.revokeObjectURL(vorschauUrlRef.current)
    }
  }, [])

  function addFiles(fileList) {
    const files = fileList ? Array.from(fileList) : []
    if (!files.length) return
    const rest = ANHAENGE_MAX_ANZAHL - gesamtAnzahl
    if (rest <= 0) return
    const neu = files.slice(0, rest).map(file => ({
      id: nextId(),
      file,
      beschreibung: '',
    }))
    onChange([...eintraege, ...neu])
  }

  function updateBeschreibung(id, beschreibung) {
    onChange(
      eintraege.map(e => (e.id === id ? { ...e, beschreibung } : e)),
    )
  }

  function updateGespeicherteBeschreibung(id, beschreibung) {
    if (!onGespeicherteChange) return
    onGespeicherteChange(
      gespeicherteEintraege.map(e => (e.id === id ? { ...e, beschreibung } : e)),
    )
  }

  function removeEntry(id) {
    onChange(eintraege.filter(e => e.id !== id))
  }

  function removeGespeichert(id) {
    if (!onGespeicherteChange) return
    onGespeicherteChange(gespeicherteEintraege.filter(e => e.id !== id))
  }

  function schliesseVorschau() {
    if (vorschauUrlRef.current) {
      URL.revokeObjectURL(vorschauUrlRef.current)
      vorschauUrlRef.current = null
    }
    setVorschau(null)
  }

  function oeffneVorschau(file) {
    if (!istBildDatei(file.type, file.name)) return
    setVorschauFehler(null)
    schliesseVorschau()
    const url = URL.createObjectURL(file)
    vorschauUrlRef.current = url
    setVorschau({ url, titel: file.name })
  }

  async function oeffneGespeicherteVorschau(eintrag) {
    if (!meldungId || !istBildDatei(eintrag.dateityp, eintrag.dateiname)) return
    setVorschauFehler(null)
    setVorschauLaedt(true)
    try {
      const { blob } = await downloadMeldungAnhangBlob(
        buildMockHeaders({ aktiveRolle, aktiverNutzer }),
        meldungId,
        eintrag.id,
      )
      schliesseVorschau()
      const url = URL.createObjectURL(blob)
      vorschauUrlRef.current = url
      setVorschau({ url, titel: eintrag.dateiname })
    } catch (e) {
      setVorschauFehler(e.message || 'Vorschau konnte nicht geladen werden.')
    } finally {
      setVorschauLaedt(false)
    }
  }

  return (
    <>
    <div className="border border-jhh-border rounded p-4 space-y-3">
      <label htmlFor={`${idPrefix}-input`} className="form-label">
        Beweismittel als Datei (optional)
      </label>
      <p className="text-sm text-jhh-text-light -mt-1 mb-1">
        Sie können Fotos oder Dokumente zu gesicherten Beweismitteln anfügen. Zu jeder Datei ist eine
        kurze Beschreibung erforderlich. Bei Bildern: Dateiname anklicken für Vorschau.
      </p>
      <div>
        <p className="text-sm font-semibold text-jhh-primary mb-1">Erlaubte Dateiformate</p>
        <ul className="text-sm text-jhh-text-light list-disc pl-5 space-y-0.5">
          {ERLAUBTE_DATEIFORMATE_HINWEIS.map(t => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="text-xs text-jhh-text-light mt-1">
          Max. {ANHAENGE_MAX_ANZAHL} Dateien, je max. {ANHAENGE_MAX_MB} MB. Nur solange die Meldung ein{' '}
          <strong>Entwurf</strong> ist.
        </p>
      </div>
      <div>
        <p className="text-sm font-semibold text-jhh-primary mb-1">Mögliche Anlagetypen (fachlich)</p>
        <ul className="text-sm text-jhh-text-light list-disc pl-5 space-y-0.5">
          {ANLAGE_TYPEN_HINWEIS.map(t => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <input
        ref={inputRef}
        id={`${idPrefix}-input`}
        type="file"
        multiple
        className="block w-full text-sm min-h-[44px] py-2"
        accept={ANHAENGE_ACCEPT}
        onChange={e => {
          addFiles(e.target.files)
          e.target.value = ''
        }}
        disabled={gesamtAnzahl >= ANHAENGE_MAX_ANZAHL}
        aria-describedby={`${idPrefix}-hinweis`}
      />
      <p id={`${idPrefix}-hinweis`} className="text-xs text-jhh-text-light">
        {gesamtAnzahl} von {ANHAENGE_MAX_ANZAHL} Dateien
      </p>

      {vorschauFehler && (
        <p role="alert" className="text-sm text-jhh-danger">{vorschauFehler}</p>
      )}

      {gesamtAnzahl > 0 && (
        <ul className="space-y-4 list-none p-0 m-0">
          {gespeicherteEintraege.map((e, index) => {
            const istBild = istBildDatei(e.dateityp, e.dateiname)
            return (
            <li
              key={e.id}
              className="border border-jhh-border rounded p-3 space-y-2 bg-jhh-bg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                {istBild ? (
                  <button
                    type="button"
                    className="text-sm font-medium text-jhh-secondary underline text-left break-all min-h-[44px] px-0"
                    onClick={() => oeffneGespeicherteVorschau(e)}
                    disabled={vorschauLaedt}
                    title="Bildvorschau anzeigen"
                  >
                    {e.dateiname}
                  </button>
                ) : (
                  <span className="text-sm font-medium break-all">{e.dateiname}</span>
                )}
                <button
                  type="button"
                  className="btn-secondary btn-sm min-h-[44px]"
                  onClick={() => removeGespeichert(e.id)}
                >
                  Entfernen
                </button>
              </div>
              <div>
                <RichTextEditor
                  id={`${idPrefix}-gespeichert-besch-${e.id}`}
                  label="Kurzbeschreibung"
                  value={e.beschreibung || ''}
                  onChange={v => updateGespeicherteBeschreibung(e.id, v)}
                  required
                  minHeight="44px"
                  maxPlainLength={BESCHREIBUNG_MAX_LAENGE}
                  describedBy={`${idPrefix}-gespeichert-besch-${e.id}-hint`}
                  placeholder="z. B. Foto der sichergestellten Substanz"
                />
                <p className="text-xs text-jhh-text-light mt-1" id={`${idPrefix}-gespeichert-besch-${e.id}-hint`}>
                  Datei {index + 1} von {gesamtAnzahl}
                </p>
              </div>
            </li>
            )
          })}
          {eintraege.map((e, index) => {
            const istBild = istBildDatei(e.file.type, e.file.name)
            const dateiIndex = gespeicherteEintraege.length + index + 1
            return (
            <li
              key={e.id}
              className="border border-jhh-border rounded p-3 space-y-2 bg-jhh-bg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                {istBild ? (
                  <button
                    type="button"
                    className="text-sm font-medium text-jhh-secondary underline text-left break-all min-h-[44px] px-0"
                    onClick={() => oeffneVorschau(e.file)}
                    title="Bildvorschau anzeigen"
                  >
                    {e.file.name}
                  </button>
                ) : (
                  <span className="text-sm font-medium break-all">{e.file.name}</span>
                )}
                <button
                  type="button"
                  className="btn-secondary btn-sm min-h-[44px]"
                  onClick={() => removeEntry(e.id)}
                >
                  Entfernen
                </button>
              </div>
              <div>
                <RichTextEditor
                  id={`${idPrefix}-besch-${e.id}`}
                  label="Kurzbeschreibung"
                  value={e.beschreibung}
                  onChange={v => updateBeschreibung(e.id, v)}
                  required
                  minHeight="44px"
                  maxPlainLength={BESCHREIBUNG_MAX_LAENGE}
                  describedBy={`${idPrefix}-besch-${e.id}-hint`}
                  placeholder="z. B. Foto der sichergestellten Substanz"
                />
                <p className="text-xs text-jhh-text-light mt-1" id={`${idPrefix}-besch-${e.id}-hint`}>
                  Datei {dateiIndex} von {gesamtAnzahl}
                </p>
              </div>
            </li>
            )
          })}
        </ul>
      )}
    </div>

    <AnhangVorschauModal
      offen={Boolean(vorschau)}
      titel={vorschau?.titel}
      bildUrl={vorschau?.url}
      onSchliessen={schliesseVorschau}
    />
    </>
  )
}
