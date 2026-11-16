import { useState, useEffect, useRef } from 'react'
import GefangeneAutocomplete from './GefangeneAutocomplete'
import { EMPFAENGER_DEFAULTS, STRAFANZEIGE_EMPFAENGER_PRUEFUNG, parseTatzeitParts, getDefaultTatzeitNow } from '../../utils/meldungen'
import { TATVORWURF_HINWEIS, TATVORWURF_OPTIONEN } from '../../constants/strafanzeigeUntertypen'
import { normalizeZeugen, validateZeugenListe } from '../../constants/zeugen'
import ZeugenEditor from './ZeugenEditor'
import BeweismittelErfassung, { validiereBeweismittelErfassung } from './BeweismittelErfassung'
import EinreichungFolgeaktionenDialog from './EinreichungFolgeaktionenDialog'
import MeldungFehlerModal from './MeldungFehlerModal'
import TatzeitEingabe from './TatzeitEingabe'
import TatortAutocomplete from './TatortAutocomplete'
import { istGueltigerTatort } from '../../constants/tatorte'
import { isRichTextEmpty, stripRichTextPlain } from '../../utils/richText'
import RichTextEditor from '../shared/RichTextEditor'
import { BESCHREIBUNG_MAX_LAENGE } from '../../constants/meldungAnhaenge'
import { useRolle } from '../../context/RollenContext'
import { getNutzerHafthaus } from '../../utils/hafthaus'

const INTERN_EMPFAENGER = [
  { value: 'INTERN_ABTEILUNG', label: 'Vollzugsabteilung (intern)' },
  { value: 'INTERN_LEITUNG', label: 'Anstaltsleitung (intern)' },
]

const AKTIVE_MELDUNGSTYPEN = ['STRAFANZEIGE', 'VORFALL_INTERN', 'MELDUNG_GERICHT']

export default function MeldungForm({
  meldungstypen,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Als Entwurf speichern',
  fullWidth = false,
}) {
  const { aktiverNutzer } = useRolle()
  const hafthausFilter = getNutzerHafthaus(aktiverNutzer)

  const [typ, setTyp] = useState(initialValues?.meldungsTyp || '')
  const [gefangene, setGefangene] = useState(
    initialValues?.gefangene
      ? initialValues.gefangene
      : null
  )
  const [sachverhalt, setSachverhalt] = useState(initialValues?.sachverhalt || '')
  const [prioritaet, setPrioritaet] = useState(initialValues?.prioritaet ? 1 : 0)
  const [empfaenger, setEmpfaenger] = useState(initialValues?.empfaenger || '')
  const [empfaengerTyp, setEmpfaengerTyp] = useState(initialValues?.empfaengerTyp || '')
  const [meta, setMeta] = useState(() => {
    const base = {
      ...(initialValues?.metadaten || {}),
      zeugen: normalizeZeugen(initialValues?.metadaten),
    }
    if (!base.tatzeit) {
      base.tatzeit = getDefaultTatzeitNow()
    }
    return base
  })
  const [fehlerModal, setFehlerModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [anhaengeEintraege, setAnhaengeEintraege] = useState([])
  const [gespeicherteAnhaenge, setGespeicherteAnhaenge] = useState(
    () => (initialValues?.anhaenge || []).map(a => ({ ...a })),
  )
  const anhaengeInitialRef = useRef(
    JSON.stringify((initialValues?.anhaenge || []).map(a => ({ id: a.id, beschreibung: a.beschreibung || '' }))),
  )
  const [einreichungDialogOffen, setEinreichungDialogOffen] = useState(false)
  const beweismittelNachreichungAktiv = ['beweismittel', 'beides'].includes(
    meta.rueckgabeErgaenzung?.grund,
  )

  useEffect(() => {
    if (!typ || initialValues?.meldungsTyp) return
    const def = EMPFAENGER_DEFAULTS[typ]
    if (def) {
      setEmpfaenger(def.empfaenger)
      setEmpfaengerTyp(def.empfaengerTyp)
    }
  }, [typ, initialValues?.meldungsTyp])

  useEffect(() => {
    if (typ === 'MELDUNG_GERICHT' && !empfaengerTyp) setEmpfaengerTyp('GERICHT')
  }, [typ, empfaengerTyp])

  function setMetaField(key, value) {
    setMeta(prev => ({ ...prev, [key]: value }))
  }

  function sanitizeZeugen(liste) {
    return (liste || [])
      .filter(z => !z._ausstehend)
      .map(({ _gefangeneId, _bediensteterId, _ausstehend, ...z }) => {
        const out = {
          ...z,
          name: z.name?.trim() || '',
          aussage: z.zeugenTyp === 'bediensteter' || z.zeugenTyp === 'inhaftierter' ? '' : (z.aussage || ''),
          gefangenenNr: z.gefangenenNr?.trim() || '',
          benachrichtigungJva: z.benachrichtigungJva?.trim() || '',
          benachrichtigungHaus: z.benachrichtigungHaus?.trim() || '',
        }
        if (out.zeugenTyp === 'bediensteter') {
          out.benachrichtigungJva = ''
          out.benachrichtigungHaus = ''
          const bid = _bediensteterId || z.bediensteterId
          if (bid) out.bediensteterId = bid
          else delete out.bediensteterId
        } else {
          delete out.bediensteterId
        }
        return out
      })
      .filter(z => z.zeugenTyp || z.name || z.aussage)
  }

  function getAnhaengeAenderungen() {
    const initial = JSON.parse(anhaengeInitialRef.current)
    const entfernen = initial
      .filter(o => !gespeicherteAnhaenge.some(g => g.id === o.id))
      .map(o => o.id)
    const aktualisierungen = gespeicherteAnhaenge
      .filter(g => {
        const orig = initial.find(o => o.id === g.id)
        return orig && (orig.beschreibung || '') !== (g.beschreibung || '')
      })
      .map(g => ({ id: g.id, beschreibung: g.beschreibung || '' }))
    return { entfernen, aktualisierungen }
  }

  function validateAnhaengeBeschreibungen(eintraege) {
    if (!eintraege.length) return null
    const ohneText = eintraege.some(e => isRichTextEmpty(e.beschreibung))
    if (ohneText) return 'Bitte geben Sie zu jeder Datei eine Kurzbeschreibung an.'
    const zuLang = eintraege.some(
      e => stripRichTextPlain(e.beschreibung).length > BESCHREIBUNG_MAX_LAENGE,
    )
    if (zuLang) return `Kurzbeschreibungen dürfen maximal ${BESCHREIBUNG_MAX_LAENGE} Zeichen haben.`
    return null
  }

  function validate(alsEntwurf = true) {
    if (!typ) return 'Bitte wählen Sie einen Meldungstyp.'
    const t = meldungstypen?.find(m => m.id === typ)
    if (!t?.aktiv) return 'Dieser Meldungstyp ist noch nicht verfügbar (in Planung).'
    if (!gefangene?.id) return 'Bitte wählen Sie einen Gefangenen.'
    if (isRichTextEmpty(sachverhalt)) return 'Bitte geben Sie einen Sachverhalt ein.'

    const aktivTyp = AKTIVE_MELDUNGSTYPEN.includes(typ)
    if (!alsEntwurf && aktivTyp) {
      if (!meta.tatzeit) return 'Bitte geben Sie die Tatzeit an.'
      const { date, time } = parseTatzeitParts(meta.tatzeit)
      if (!date) return 'Bitte geben Sie das Datum der Tatzeit an.'
      if (!time) return 'Bitte geben Sie die Uhrzeit an.'
      if (!meta.tatort?.trim()) return 'Bitte geben Sie den Tatort an.'
      if (!istGueltigerTatort(meta.tatort)) {
        return 'Bitte wählen Sie einen Tatort aus der Liste.'
      }
      const bmErr = validiereBeweismittelErfassung(meta, { nachreichungAktiv: beweismittelNachreichungAktiv })
      if (bmErr) return bmErr
    }

    if (typ === 'STRAFANZEIGE') {
      const tatvorwurf = meta.tatvorwurf || meta.strafanzeigeUntertyp
      if (!alsEntwurf && !tatvorwurf) return 'Bitte wählen Sie einen Tatvorwurf aus der Liste.'
      // Zeugen optional (Einzelfall); nur unvollständig begonnene Zeilen prüfen (A2-F-ERF-002)
      const zErr = validateZeugenListe(normalizeZeugen(meta))
      if (zErr) return zErr
    }
    if (typ === 'MELDUNG_GERICHT' && !alsEntwurf && isRichTextEmpty(empfaenger)) {
      return 'Bitte geben Sie den Empfänger (Gericht) an.'
    }
    const anhangErr = validateAnhaengeBeschreibungen([...gespeicherteAnhaenge, ...anhaengeEintraege])
    if (anhangErr) return anhangErr
    return null
  }

  async function submitMeldung(alsEntwurf) {
    const t = meldungstypen.find(m => m.id === typ)
    setSaving(true)
    setFehlerModal(null)
    try {
      await onSubmit(
        {
          meldungsTyp: typ,
          gefangeneId: gefangene.id,
          sachverhalt: sachverhalt,
          metadaten: {
            ...meta,
            zeugen: sanitizeZeugen(meta.zeugen),
          },
          ervRelevant: t.ervRelevant,
          prioritaet,
          empfaenger:
            typ === 'STRAFANZEIGE' && !alsEntwurf
              ? STRAFANZEIGE_EMPFAENGER_PRUEFUNG.empfaenger
              : stripRichTextPlain(empfaenger) || null,
          empfaengerTyp:
            typ === 'STRAFANZEIGE' && !alsEntwurf
              ? STRAFANZEIGE_EMPFAENGER_PRUEFUNG.empfaengerTyp
              : empfaengerTyp || null,
          alsEntwurf,
        },
        { anhaengeEintraege, ...getAnhaengeAenderungen() },
      )
      setAnhaengeEintraege([])
      setEinreichungDialogOffen(false)
    } catch (err) {
      setFehlerModal(err.message || 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  function handleSubmit(e, alsEntwurf = true) {
    e.preventDefault()
    const v = validate(alsEntwurf)
    if (v) {
      setFehlerModal(v)
      return
    }
    if (!alsEntwurf) {
      setEinreichungDialogOffen(true)
      return
    }
    submitMeldung(true)
  }

  function handleEinreichungBestaetigen() {
    submitMeldung(false)
  }

  return (
    <form
      onSubmit={e => handleSubmit(e, true)}
      className={fullWidth ? 'w-full max-w-none space-y-6' : 'max-w-form w-full space-y-6'}
    >

      <fieldset className="border-0 p-0 m-0">
        <legend className="form-label mb-2">Meldungstyp</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {meldungstypen?.map(t => (
            <label
              key={t.id}
              className={`flex items-center gap-2 p-2 rounded border min-h-[44px] ${
                !t.aktiv
                  ? 'opacity-50 cursor-not-allowed border-jhh-border'
                  : typ === t.id
                    ? 'border-jhh-secondary ring-2 ring-jhh-secondary hover:bg-jhh-bg cursor-pointer'
                    : 'border-transparent hover:bg-jhh-bg cursor-pointer'
              }`}
              title={!t.aktiv ? 'Noch nicht verfügbar (in Planung)' : undefined}
            >
              <input
                type="radio"
                name="meldungsTyp"
                value={t.id}
                checked={typ === t.id}
                disabled={!t.aktiv}
                onChange={() => setTyp(t.id)}
                className="accent-jhh-secondary"
              />
              <span className="font-semibold text-sm">{t.label}</span>
              {!t.aktiv && (
                <span className="ml-auto text-xs text-jhh-text-light bg-jhh-bg px-2 py-0.5 rounded">
                  in Planung
                </span>
              )}
              {t.ervRelevant && t.aktiv && (
                <span className="ml-auto text-xs text-purple-700">ERV-pflichtig</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {typ === 'STRAFANZEIGE' && (
        <div>
          <label htmlFor="tatvorwurf" className="form-label form-label-required">
            Tatvorwurf
          </label>
          <select
            id="tatvorwurf"
            className="form-input"
            value={meta.tatvorwurf || meta.strafanzeigeUntertyp || ''}
            onChange={e => {
              const v = e.target.value
              setMeta(prev => ({ ...prev, tatvorwurf: v, strafanzeigeUntertyp: v }))
            }}
            aria-required="true"
          >
            <option value="">Bitte wählen …</option>
            {TATVORWURF_OPTIONEN.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
          <p className="text-xs text-jhh-text-light mt-2 m-0 leading-relaxed">
            {TATVORWURF_HINWEIS}
          </p>
        </div>
      )}

      {typ && (
        <>
          <GefangeneAutocomplete
            value={gefangene}
            onChange={setGefangene}
            required
            hafthausModus
            standortJva={hafthausFilter.jva}
            standortHaus={hafthausFilter.haus}
          />

          {AKTIVE_MELDUNGSTYPEN.includes(typ) && (
            <>
              <TatzeitEingabe
                id="tatzeit"
                value={meta.tatzeit || ''}
                onChange={v => setMetaField('tatzeit', v)}
                required
              />
              <TatortAutocomplete
                id="tatort"
                value={meta.tatort || ''}
                onChange={v => setMetaField('tatort', v)}
                required
              />
            </>
          )}

          <RichTextEditor
            id="sachverhalt"
            label="Sachverhalt"
            value={sachverhalt}
            onChange={setSachverhalt}
            required
            minHeight="120px"
          />

          {AKTIVE_MELDUNGSTYPEN.includes(typ) && (
            <BeweismittelErfassung
              meta={meta}
              onMetaChange={setMeta}
              nachreichungAktiv={beweismittelNachreichungAktiv}
              anhaengeEintraege={anhaengeEintraege}
              onAnhaengeEintraegeChange={setAnhaengeEintraege}
              gespeicherteAnhaenge={gespeicherteAnhaenge}
              onGespeicherteAnhaengeChange={setGespeicherteAnhaenge}
              meldungId={initialValues?.id || null}
            />
          )}

          {typ === 'STRAFANZEIGE' && (
            <>
              <ZeugenEditor
                zeugen={normalizeZeugen(meta)}
                onChange={liste => setMetaField('zeugen', liste)}
                hauptGefangeneJva={gefangene?.jva || ''}
                hauptGefangeneHaus={gefangene?.haus || ''}
              />
            </>
          )}

          <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={prioritaet === 1}
              onChange={e => setPrioritaet(e.target.checked ? 1 : 0)}
            />
            <span className="text-sm font-semibold">Als dringend markieren</span>
          </label>

          {typ === 'VORFALL_INTERN' && (
            <>
              <div>
                <label htmlFor="intern-ziel" className="form-label form-label-required">Interner Empfänger</label>
                <select
                  id="intern-ziel"
                  className="form-input"
                  value={empfaengerTyp || 'INTERN_ABTEILUNG'}
                  onChange={e => {
                    setEmpfaengerTyp(e.target.value)
                    const opt = INTERN_EMPFAENGER.find(o => o.value === e.target.value)
                    setEmpfaenger(opt?.label || '')
                  }}
                >
                  {INTERN_EMPFAENGER.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <RichTextEditor
                id="fundort"
                label="Zusätzlicher Fundort / genauer Ort (optional)"
                value={meta.fundort || ''}
                onChange={v => setMetaField('fundort', v)}
                minHeight="44px"
                placeholder="z. B. konkrete Zelle"
              />
              <p className="text-xs text-jhh-text-light -mt-2 mb-2">Ergänzung zu Tatort, falls sinnvoll.</p>
            </>
          )}

          {typ === 'MELDUNG_GERICHT' && (
            <>
              <RichTextEditor
                id="empfaenger-gericht"
                label="Empfänger (Gericht)"
                value={empfaenger}
                onChange={setEmpfaenger}
                required
                minHeight="44px"
                placeholder="z. B. Amtsgericht Hamburg"
              />
            </>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={saving || !typ}>
          {saving ? 'Speichern …' : submitLabel}
        </button>
        {typ && (
          <button
            type="button"
            className="btn-success"
            disabled={saving}
            onClick={e => handleSubmit(e, false)}
          >
            Einreichen
          </button>
        )}
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Abbrechen
          </button>
        )}
      </div>

      <EinreichungFolgeaktionenDialog
        offen={einreichungDialogOffen}
        meldungsTyp={typ}
        ervRelevant={meldungstypen?.find(m => m.id === typ)?.ervRelevant}
        zeugen={normalizeZeugen(meta)}
        onAbbrechen={() => !saving && setEinreichungDialogOffen(false)}
        onBestaetigen={handleEinreichungBestaetigen}
        saving={saving}
      />

      <MeldungFehlerModal
        offen={Boolean(fehlerModal)}
        meldung={fehlerModal}
        onSchliessen={() => setFehlerModal(null)}
      />
    </form>
  )
}
