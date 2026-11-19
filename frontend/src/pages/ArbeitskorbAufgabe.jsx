import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import RichTextEditor from '../components/shared/RichTextEditor'
import ZeugenAccordionListe from '../components/meldung/ZeugenAccordionListe'
import BeweismittelErfassung, { validiereBeweismittelErfassung } from '../components/meldung/BeweismittelErfassung'
import DetailSeitenleiste from '../components/meldung/DetailSeitenleiste'
import RueckgabeDialog from '../components/meldung/RueckgabeDialog'
import { useApiClient } from '../api/client'
import { buildMockHeaders, uploadMeldungAnhaenge } from '../api/meldungAnhaengeApi'
import { useRolle } from '../context/RollenContext'
import { BESCHREIBUNG_MAX_LAENGE } from '../constants/meldungAnhaenge'
import { stripRichTextPlain } from '../utils/richText'
import { getZeugenTypLabel } from '../constants/zeugen'
import { formatDatum, formatGefangene, formatTatzeit, getStrafanzeigeUntertypLabel } from '../utils/meldungen'
import { isRichTextEmpty } from '../utils/richText'
import { markiereAufgabeGelesen } from '../utils/arbeitskorbGelesen'
import { AUFGABEN_TYPEN, getNavigationNachAufgabenAbschluss, ZUWEISUNG } from '../utils/arbeitskorb'

const FACH = { label: 'eMeldewesen', href: '/emeldewesen' }

function AufgabenStatusBadge({ status }) {
  const offen = status === 'OFFEN'
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded ${
        offen
          ? 'bg-orange-50 text-jhh-warning border border-orange-200'
          : 'bg-green-50 text-jhh-success border border-green-200'
      }`}
    >
      {offen ? '⏳ Offen' : '✅ Erledigt'}
    </span>
  )
}

function DetailField({ label, value }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-jhh-text-light text-xs mb-0.5">{label}</dt>
      <dd className="font-semibold text-jhh-text m-0">{value}</dd>
    </div>
  )
}

function BezugUnterblock({ titel, children, className = '' }) {
  return (
    <div className={`rounded-lg border border-jhh-border bg-jhh-bg p-4 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-wide text-jhh-text-light m-0 mb-3">
        {titel}
      </h3>
      {children}
    </div>
  )
}

function PruefMeldungsBezug({ aufgabe, kontext }) {
  const hatTat = kontext?.tatvorwurf || kontext?.tatzeit || kontext?.tatort
  const zeugen = kontext?.weitereZeugen || []

  return (
    <>
    <section className="section-card mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-jhh-border">
        <h2 className="text-lg font-bold text-jhh-primary m-0">Bezug zur Meldung</h2>
        <Link
          to={`/meldungen/${aufgabe.meldungId}`}
          className="btn-secondary btn-sm min-h-[44px] inline-flex items-center gap-1 no-underline"
        >
          {aufgabe.meldungsNr}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(aufgabe.gefangene || hatTat) && (
          <BezugUnterblock titel="Tat & Hauptbeteiligte/r">
            <dl className="grid gap-3 sm:grid-cols-2 text-sm m-0">
              {aufgabe.gefangene && (
                <div className="sm:col-span-2">
                  <dt className="text-jhh-text-light text-xs mb-0.5">Gefangene/r (Hauptbeteiligte/r)</dt>
                  <dd className="font-semibold text-jhh-text m-0">{formatGefangene(aufgabe.gefangene)}</dd>
                </div>
              )}
              <DetailField
                label="Tatvorwurf"
                value={kontext?.tatvorwurf ? getStrafanzeigeUntertypLabel(kontext.tatvorwurf) : null}
              />
              <DetailField
                label="Tatzeit"
                value={kontext?.tatzeit ? formatTatzeit(kontext.tatzeit) : null}
              />
              {kontext?.tatort && (
                <div className="sm:col-span-2">
                  <dt className="text-jhh-text-light text-xs mb-0.5">Tatort</dt>
                  <dd className="font-semibold text-jhh-text m-0">{kontext.tatort}</dd>
                </div>
              )}
            </dl>
          </BezugUnterblock>
        )}

        <BezugUnterblock titel="Prüfvoraussetzung">
          <p className="text-sm text-jhh-text m-0 mb-2">
            Die fachliche Prüfung steht an, weil alle Zeugenaussagen eingeholt wurden.
          </p>
          <p className="text-sm font-semibold text-jhh-success m-0">
            ✅ Zeugenaussagen vollständig
          </p>
        </BezugUnterblock>
      </div>

      <BezugUnterblock titel="Beweismittel" className="mt-4">
        {kontext?.beweismittelGesichert === 'nein' ? (
          <p className="text-sm text-jhh-warning font-medium m-0">
            ⚠️ Bei Ersterfassung: keine Beweismittel. Sie können zur Klärung nachfordern – der AVD
            kann nachreichen oder mit Begründung erneut „Nein“ bestätigen (z. B. nur Zeugenaussagen).
          </p>
        ) : kontext?.beweismittelGesichert === 'ja' ? (
          <p className="text-sm text-jhh-success font-medium m-0">
            ✅ Beweismittel bei Ersterfassung als gesichert angegeben
            {kontext.beweismittelAngaben && (
              <span className="block font-normal text-jhh-text mt-1">
                {kontext.beweismittelAngaben.replace(/<[^>]+>/g, '').slice(0, 200)}
              </span>
            )}
          </p>
        ) : (
          <p className="text-sm text-jhh-text-light m-0">Keine Angabe zu Beweismitteln.</p>
        )}
      </BezugUnterblock>

      <BezugUnterblock titel="Zeugen" className="mt-4">
        {zeugen.length > 0 ? (
          <ZeugenAccordionListe zeugen={zeugen} variant="aussage" ersterOffen={false} className="space-y-2" />
        ) : (
          <p className="text-sm text-jhh-text-light m-0">Keine Zeugen erfasst.</p>
        )}
      </BezugUnterblock>

      {aufgabe.sachverhalt && (
        <div className="mt-4 pt-4 border-t border-jhh-border">
          <h3 className="text-xs font-bold uppercase tracking-wide text-jhh-text-light m-0 mb-2">
            Sachverhalt
          </h3>
          <p className="text-sm text-jhh-text m-0 leading-relaxed">{aufgabe.sachverhalt}</p>
        </div>
      )}
    </section>
    </>
  )
}

function BeweismittelMeldungsBezug({ aufgabe, kontext, meldung }) {
  const hatTat = kontext?.tatvorwurf || kontext?.tatzeit || kontext?.tatort
  const nachreichung = meldung?.metadaten?.beweismittelNachreichung

  return (
    <section className="section-card mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-jhh-border">
        <h2 className="text-lg font-bold text-jhh-primary m-0">Bezug zur Meldung</h2>
        <Link
          to={`/meldungen/${aufgabe.meldungId}`}
          className="btn-secondary btn-sm min-h-[44px] inline-flex items-center gap-1 no-underline"
        >
          {aufgabe.meldungsNr}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(aufgabe.gefangene || hatTat) && (
          <BezugUnterblock titel="Tat & Hauptbeteiligte/r">
            <dl className="grid gap-3 sm:grid-cols-2 text-sm m-0">
              {aufgabe.gefangene && (
                <div className="sm:col-span-2">
                  <dt className="text-jhh-text-light text-xs mb-0.5">Gefangene/r (Hauptbeteiligte/r)</dt>
                  <dd className="font-semibold text-jhh-text m-0">{formatGefangene(aufgabe.gefangene)}</dd>
                </div>
              )}
              <DetailField
                label="Tatvorwurf"
                value={kontext?.tatvorwurf ? getStrafanzeigeUntertypLabel(kontext.tatvorwurf) : null}
              />
              <DetailField
                label="Tatzeit"
                value={kontext?.tatzeit ? formatTatzeit(kontext.tatzeit) : null}
              />
              {kontext?.tatort && (
                <div className="sm:col-span-2">
                  <dt className="text-jhh-text-light text-xs mb-0.5">Tatort</dt>
                  <dd className="font-semibold text-jhh-text m-0">{kontext.tatort}</dd>
                </div>
              )}
            </dl>
          </BezugUnterblock>
        )}

        <BezugUnterblock titel="Ersterfassung Beweismittel">
          {kontext?.beweismittelGesichert === 'nein' ? (
            <p className="text-sm text-jhh-warning font-medium m-0">
              Bei Ersterfassung: keine Beweismittel angegeben.
            </p>
          ) : kontext?.beweismittelGesichert === 'ja' ? (
            <p className="text-sm text-jhh-success font-medium m-0">
              Bei Ersterfassung: Beweismittel als gesichert angegeben
              {kontext.beweismittelAngaben && (
                <span className="block font-normal text-jhh-text mt-1">
                  {kontext.beweismittelAngaben.replace(/<[^>]+>/g, '').slice(0, 200)}
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm text-jhh-text-light m-0">Keine Angabe zu Beweismitteln.</p>
          )}
        </BezugUnterblock>
      </div>

      <BezugUnterblock titel="Aufforderung durch VAL" className="mt-4">
        {aufgabe.nachricht ? (
          <p className="text-sm text-jhh-text m-0 mb-2">{aufgabe.nachricht}</p>
        ) : (
          <p className="text-sm text-jhh-text-light m-0 mb-2">Kein Kommentar hinterlegt.</p>
        )}
        {nachreichung?.angefordertVon && (
          <p className="text-xs text-jhh-text-light m-0 mb-1">
            Angefordert von: {nachreichung.angefordertVon}
            {nachreichung.angefordertAm && (
              <> · {formatDatum(nachreichung.angefordertAm)}</>
            )}
          </p>
        )}
        {aufgabe.fristBis && (
          <p className="text-xs font-semibold text-jhh-warning m-0">
            Frist: {formatDatum(aufgabe.fristBis)}
          </p>
        )}
      </BezugUnterblock>

      {aufgabe.sachverhalt && (
        <BezugUnterblock titel="Sachverhalt" className="mt-4">
          <p className="text-sm text-jhh-text m-0 leading-relaxed">{aufgabe.sachverhalt}</p>
        </BezugUnterblock>
      )}
    </section>
  )
}

function MeldungsBezug({ aufgabe, kontext }) {
  const hatTat = kontext?.tatvorwurf || kontext?.tatzeit || kontext?.tatort
  const weitere = kontext?.weitereZeugen || []

  return (
    <section className="section-card mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-jhh-border">
        <h2 className="text-lg font-bold text-jhh-primary m-0">Bezug zur Meldung</h2>
        <Link
          to={`/meldungen/${aufgabe.meldungId}`}
          className="btn-secondary btn-sm min-h-[44px] inline-flex items-center gap-1 no-underline"
        >
          {aufgabe.meldungsNr}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(aufgabe.gefangene || hatTat) && (
          <BezugUnterblock titel="Tat & Hauptbeteiligte/r">
            <dl className="grid gap-3 sm:grid-cols-2 text-sm m-0">
              {aufgabe.gefangene && (
                <div className="sm:col-span-2">
                  <dt className="text-jhh-text-light text-xs mb-0.5">Gefangene/r (Hauptbeteiligte/r)</dt>
                  <dd className="font-semibold text-jhh-text m-0">{formatGefangene(aufgabe.gefangene)}</dd>
                </div>
              )}
              <DetailField
                label="Tatvorwurf"
                value={kontext?.tatvorwurf ? getStrafanzeigeUntertypLabel(kontext.tatvorwurf) : null}
              />
              <DetailField
                label="Tatzeit"
                value={kontext?.tatzeit ? formatTatzeit(kontext.tatzeit) : null}
              />
              {kontext?.tatort && (
                <div className="sm:col-span-2">
                  <dt className="text-jhh-text-light text-xs mb-0.5">Tatort</dt>
                  <dd className="font-semibold text-jhh-text m-0">{kontext.tatort}</dd>
                </div>
              )}
            </dl>
          </BezugUnterblock>
        )}

        <BezugUnterblock titel="Ihre Zeugenschaft">
          <dl className="grid gap-3 text-sm m-0">
            <DetailField label="Zeuge/Zeugin" value={aufgabe.zeugeName} />
            {aufgabe.zeuge?.zeugenTyp && (
              <DetailField label="Art" value={getZeugenTypLabel(aufgabe.zeuge.zeugenTyp)} />
            )}
            {aufgabe.fristBis && aufgabe.status === 'OFFEN' && (
              <div>
                <dt className="text-jhh-text-light text-xs mb-0.5">Frist</dt>
                <dd className="font-semibold text-jhh-warning m-0">
                  bis {formatDatum(aufgabe.fristBis)}
                </dd>
              </div>
            )}
          </dl>
        </BezugUnterblock>
      </div>

      {aufgabe.sachverhalt && (
        <BezugUnterblock titel="Sachverhalt" className="mt-4">
          <p className="text-sm text-jhh-text m-0 leading-relaxed">{aufgabe.sachverhalt}</p>
        </BezugUnterblock>
      )}

      <BezugUnterblock titel="Weitere Zeugen" className="mt-4">
        {weitere.length > 0 ? (
          <ul className="space-y-2 list-none p-0 m-0" aria-label="Weitere Zeugen">
            {weitere.map(z => (
              <li
                key={z.id}
                className="flex flex-wrap items-center gap-2 px-3 py-2 rounded border border-jhh-border bg-white text-sm"
              >
                <span className="font-semibold text-jhh-text">{z.name}</span>
                {z.zeugenTyp && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-jhh-bg text-jhh-text-light border border-jhh-border">
                    {getZeugenTypLabel(z.zeugenTyp)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-jhh-text-light m-0">Keine weiteren Zeugen erfasst.</p>
        )}
      </BezugUnterblock>
    </section>
  )
}

export default function ArbeitskorbAufgabe() {
  const { aufgabeId: rawId } = useParams()
  const aufgabeId = decodeURIComponent(rawId || '')
  const navigate = useNavigate()
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api
  const { aktiverNutzer, aktiveRolle, istVAL, istAL } = useRolle()

  const [aufgabe, setAufgabe] = useState(null)
  const [meldung, setMeldung] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fehler, setFehler] = useState(null)
  const [aussage, setAussage] = useState('')
  const [bestaetigt, setBestaetigt] = useState(false)
  const [kommentar, setKommentar] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveFehler, setSaveFehler] = useState(null)
  const [rueckgabeOffen, setRueckgabeOffen] = useState(false)
  const [rueckgabeGrund, setRueckgabeGrund] = useState('beweismittel')
  const [beweismittelMeta, setBeweismittelMeta] = useState({})
  const [anhaengeEintraege, setAnhaengeEintraege] = useState([])
  const [gespeicherteAnhaenge, setGespeicherteAnhaenge] = useState([])

  const lastLoadKeyRef = useRef('')

  const ladeMeldung = useCallback(async (meldungId) => {
    if (!meldungId) return
    try {
      const res = await apiRef.current.get(`/api/meldungen/${meldungId}`)
      setMeldung(res.data ?? res)
    } catch (e) {
      console.warn('ladeMeldung fehlgeschlagen:', e.message)
    }
  }, [])

  useEffect(() => {
    const loadKey = `${aktiverNutzer.id}|${aufgabeId}`
    const kontextWechsel = lastLoadKeyRef.current !== loadKey
    lastLoadKeyRef.current = loadKey

    let cancelled = false
    if (kontextWechsel) {
      setLoading(true)
      setAufgabe(null)
      setMeldung(null)
    }
    setFehler(null)

    apiRef.current.get(`/api/arbeitskorb/${encodeURIComponent(aufgabeId)}`)
      .then(res => {
        if (cancelled) return
        const a = res.data
        if (a.zielPfad) {
          navigate(a.zielPfad, { replace: true })
          return
        }
        if (a.fallId) {
          navigate(`/faelle/${a.fallId}`, { replace: true })
          return
        }
        setAufgabe(a)
        setAussage(a.zeuge?.aussage || '')
        markiereAufgabeGelesen(aktiverNutzer.id, a.id)
        if (a.meldungId) ladeMeldung(a.meldungId)
      })
      .catch(e => {
        if (!cancelled) setFehler(e.message || 'Aufgabe konnte nicht geladen werden.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [aufgabeId, aktiverNutzer.id, ladeMeldung, navigate])

  useEffect(() => {
    if (!meldung?.metadaten) return
    const m = meldung.metadaten
    setBeweismittelMeta({
      beweismittelGesichert: m.beweismittelGesichert || '',
      beweismittelAngaben: m.beweismittelAngaben || '',
      beweismittelKeineBegruendung: m.beweismittelKeineBegruendung || '',
    })
    setGespeicherteAnhaenge((meldung.anhaenge || []).map(a => ({ ...a })))
    setAnhaengeEintraege([])
  }, [meldung?.id, meldung?.metadaten, meldung?.anhaenge])

  const erledigt = aufgabe?.status === 'ERLEDIGT'
  const istPruefAufgabe = aufgabe?.typ === AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG
  const istInhaftierterAufgabe = aufgabe?.typ === AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN
  const istBeweismittelAufgabe = aufgabe?.typ === AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN
  const kannUebernehmen = (istInhaftierterAufgabe || istBeweismittelAufgabe) && aufgabe?.kannUebernehmen
  const uebernommenVonMir = (istInhaftierterAufgabe || istBeweismittelAufgabe) && aufgabe?.uebernommenVonMir
  const kontext = aufgabe?.meldungsKontext
  const meldungsStatus = meldung?.status || aufgabe?.meldungsStatus
  const kannRueckgabe = (istVAL || istAL)
    && ['SUBMITTED', 'IN_PROGRESS', 'FORWARDED'].includes(meldungsStatus)

  function oeffneRueckgabe(grund = 'beweismittel') {
    setRueckgabeGrund(grund)
    setRueckgabeOffen(true)
  }

  async function handleRueckgabe(rueckgabeErgaenzung) {
    if (!aufgabe?.meldungId) return
    setSaveFehler(null)
    setSaving(true)
    try {
      await apiRef.current.patch(`/api/meldungen/${aufgabe.meldungId}/status`, {
        status: 'DRAFT',
        rueckgabeErgaenzung,
      })
      setRueckgabeOffen(false)
      navigate(`/meldungen/${aufgabe.meldungId}`)
    } catch (err) {
      setSaveFehler(err.message || 'Rückgabe zur Ergänzungserfassung fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUebernehmen() {
    setSaveFehler(null)
    setSaving(true)
    try {
      const res = await apiRef.current.patch(
        `/api/arbeitskorb/${encodeURIComponent(aufgabeId)}/uebernehmen`,
      )
      setAufgabe(res.data)
      setAussage('')
    } catch (err) {
      setSaveFehler(err.message || 'Die Aufgabe konnte nicht übernommen werden.')
    } finally {
      setSaving(false)
    }
  }

  function navigateNachAbschluss(meldungId, typ) {
    const { path, state } = getNavigationNachAufgabenAbschluss(typ, meldungId)
    navigate(path, { state })
  }

  async function handleInhaftierterAbschliessen(e) {
    e.preventDefault()
    setSaveFehler(null)
    if (isRichTextEmpty(aussage)) {
      setSaveFehler('Bitte halten Sie die Zeugenaussage fest.')
      return
    }
    setSaving(true)
    try {
      await apiRef.current.patch(
        `/api/arbeitskorb/${encodeURIComponent(aufgabeId)}/abschliessen`,
        { aussage },
      )
      navigateNachAbschluss(aufgabe.meldungId, aufgabe.typ)
    } catch (err) {
      setSaveFehler(err.message || 'Die Aufgabe konnte nicht abgeschlossen werden.')
      setSaving(false)
    }
  }

  async function handlePruefAbschliessen(e) {
    e.preventDefault()
    setSaveFehler(null)
    setSaving(true)
    try {
      await apiRef.current.patch(
        `/api/arbeitskorb/${encodeURIComponent(aufgabeId)}/abschliessen`,
        { kommentar: isRichTextEmpty(kommentar) ? undefined : kommentar },
      )
      navigateNachAbschluss(aufgabe.meldungId, aufgabe.typ)
    } catch (err) {
      setSaveFehler(err.message || 'Die Prüfung konnte nicht aufgenommen werden.')
      setSaving(false)
    }
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

  async function handleBeweismittelAbschliessen(e) {
    e.preventDefault()
    setSaveFehler(null)

    const bmErr = validiereBeweismittelErfassung(beweismittelMeta, { nachreichungAktiv: true })
    if (bmErr) {
      setSaveFehler(bmErr)
      return
    }

    const anhangErr = validateAnhaengeBeschreibungen(anhaengeEintraege)
    if (anhangErr) {
      setSaveFehler(anhangErr)
      return
    }

    setSaving(true)
    try {
      const headers = buildMockHeaders({ aktiveRolle, aktiverNutzer })
      if (anhaengeEintraege.length > 0) {
        await uploadMeldungAnhaenge(headers, aufgabe.meldungId, anhaengeEintraege)
      }

      await apiRef.current.patch(
        `/api/arbeitskorb/${encodeURIComponent(aufgabeId)}/abschliessen`,
        {
          beweismittelGesichert: beweismittelMeta.beweismittelGesichert,
          beweismittelAngaben: beweismittelMeta.beweismittelAngaben,
          beweismittelKeineBegruendung: beweismittelMeta.beweismittelKeineBegruendung,
        },
      )
      navigateNachAbschluss(aufgabe.meldungId, aufgabe.typ)
    } catch (err) {
      setSaveFehler(err.message || 'Die Beweismittel-Nachreichung konnte nicht abgeschlossen werden.')
      setSaving(false)
    }
  }

  async function handleAbschliessen(e) {
    e.preventDefault()
    setSaveFehler(null)

    if (isRichTextEmpty(aussage)) {
      setSaveFehler('Bitte halten Sie die Zeugenaussage fest.')
      return
    }
    if (!bestaetigt) {
      setSaveFehler('Bitte bestätigen Sie die Richtigkeit Ihrer Zeugenaussage.')
      return
    }

    setSaving(true)
    try {
      await apiRef.current.patch(
        `/api/arbeitskorb/${encodeURIComponent(aufgabeId)}/abschliessen`,
        { aussage, bestaetigt: true },
      )
      navigateNachAbschluss(aufgabe.meldungId, aufgabe.typ)
    } catch (err) {
      setSaveFehler(err.message || 'Die Aufgabe konnte nicht abgeschlossen werden.')
      setSaving(false)
    }
  }

  const seiten = [
    { label: 'Mein Arbeitskorb', href: '/arbeitskorb' },
    { label: aufgabe?.titel || 'Aufgabe' },
  ]

  return (
    <PageLayout
      plattformTitel="eMeldewesen"
      fachverfahren={FACH}
      seiten={seiten}
    >
      <div className="mb-4">
        <Link to="/arbeitskorb" className="text-sm text-jhh-secondary font-semibold hover:underline">
          ← Zurück zum Arbeitskorb
        </Link>
      </div>

      {loading && !aufgabe && (
        <p className="text-jhh-text-light" role="status">Aufgabe wird geladen …</p>
      )}

      {fehler && (
        <div className="p-4 rounded border border-jhh-danger bg-red-50 text-jhh-danger text-sm" role="alert">
          {fehler}
        </div>
      )}

      {aufgabe && !fehler && (
        <>
          <header className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-jhh-primary m-0">{aufgabe.titel}</h1>
              {aufgabe.zuweisung === ZUWEISUNG.GRUPPE && (
                <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded bg-jhh-bg text-jhh-secondary border border-jhh-border">
                  👥 Gruppenaufgabe
                </span>
              )}
              <AufgabenStatusBadge status={aufgabe.status} />
            </div>
            {aufgabe.standort && (
              <p className="text-sm text-jhh-text-light m-0 mb-1">Abteilung: {aufgabe.standort}</p>
            )}
            {aufgabe.nachricht && (
              <p className="text-sm text-jhh-text-light m-0">{aufgabe.nachricht}</p>
            )}
            {aufgabe.eskaliert && (
              <p className="text-sm text-jhh-danger font-medium m-0 mt-2" role="alert">
                Frist abgelaufen – Aufgabe wurde an die Stations-Gruppe eskaliert.
              </p>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
          {istPruefAufgabe ? (
            <PruefMeldungsBezug aufgabe={aufgabe} kontext={kontext} />
          ) : istBeweismittelAufgabe ? (
            <BeweismittelMeldungsBezug aufgabe={aufgabe} kontext={kontext} meldung={meldung} />
          ) : (
            <MeldungsBezug aufgabe={aufgabe} kontext={kontext} />
          )}

          {istPruefAufgabe ? (
            <form onSubmit={handlePruefAbschliessen} className="section-card">
              <h2 className="text-sm font-bold text-jhh-primary mb-1">Fachliche Prüfung aufnehmen</h2>
              <p className="text-sm text-jhh-text-light mb-4">
                Nehmen Sie die fachliche Prüfung auf, um die Meldung in den Status „Fachliche Prüfung“ zu übernehmen
                (24-h-SLA, Prototyp).
              </p>

              <RichTextEditor
                id="arbeitskorb-pruef-kommentar"
                label="Kommentar (optional)"
                value={kommentar}
                onChange={setKommentar}
                minHeight="44px"
                placeholder="z. B. Prüfung übernommen"
              />

              {saveFehler && (
                <div className="mt-4 p-3 rounded border border-jhh-danger bg-red-50 text-jhh-danger text-sm" role="alert">
                  {saveFehler}
                </div>
              )}

              {kannRueckgabe && aufgabe.status === 'OFFEN' && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-jhh-border">
                  <button
                    type="button"
                    className="btn-secondary min-h-[44px]"
                    disabled={saving}
                    onClick={() => oeffneRueckgabe('beweismittel')}
                  >
                    📎 Beweismittel nachfordern
                  </button>
                  <button
                    type="button"
                    className="btn-secondary min-h-[44px]"
                    disabled={saving}
                    onClick={() => oeffneRueckgabe('zeugen')}
                  >
                    ↩ Zur Ergänzungserfassung
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  className="btn-primary min-h-[44px]"
                  disabled={saving}
                >
                  {saving ? 'Wird übernommen …' : '🔍 Fachlich prüfen und Aufgabe abschließen'}
                </button>
                <button
                  type="button"
                  className="btn-secondary min-h-[44px]"
                  onClick={() => navigate('/arbeitskorb')}
                  disabled={saving}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          ) : kannUebernehmen ? (
            <section className="section-card">
              <h2 className="text-sm font-bold text-jhh-primary mb-1">Gruppenaufgabe übernehmen</h2>
              <p className="text-sm text-jhh-text-light mb-4">
                {istBeweismittelAufgabe
                  ? 'Diese Aufgabe steht allen Bediensteten Ihrer Station zur Verfügung. Übernehmen Sie sie, um die Beweismittel nachzureichen.'
                  : 'Diese Aufgabe steht allen Bediensteten Ihrer Abteilung zur Verfügung. Übernehmen Sie sie, um die Zeugenaussage des Inhaftierten aufzunehmen. Andere Bedienstete sehen die Aufgabe danach nicht mehr.'}
              </p>
              {saveFehler && (
                <div className="mb-4 p-3 rounded border border-jhh-danger bg-red-50 text-jhh-danger text-sm" role="alert">
                  {saveFehler}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-primary min-h-[44px]"
                  disabled={saving}
                  onClick={handleUebernehmen}
                >
                  {saving ? 'Wird übernommen …' : 'Aufgabe übernehmen'}
                </button>
                <button
                  type="button"
                  className="btn-secondary min-h-[44px]"
                  onClick={() => navigate('/arbeitskorb?bereich=gruppe')}
                  disabled={saving}
                >
                  Abbrechen
                </button>
              </div>
            </section>
          ) : istBeweismittelAufgabe && (uebernommenVonMir || !kannUebernehmen) ? (
            <form
              onSubmit={handleBeweismittelAbschliessen}
              className="section-card border-2 border-jhh-warning bg-amber-50/50 shadow-md ring-2 ring-amber-100"
              aria-labelledby="arbeitskorb-beweismittel-titel"
            >
              <h2
                id="arbeitskorb-beweismittel-titel"
                className="text-base font-bold text-jhh-primary mb-2"
              >
                Beweismittel nachreichen
              </h2>
              <p className="text-sm text-jhh-danger font-medium mb-4 m-0" role="note">
                VAL hat zur Klärung der Beweismittel zurückgegeben. Beweismittel Ja/Nein und Upload
                erfassen Sie hier. Zusätzliche Dateien können Sie bei Bedarf rechts unter Dokumente
                hochladen.
              </p>

              <BeweismittelErfassung
                meta={beweismittelMeta}
                onMetaChange={setBeweismittelMeta}
                nachreichungAktiv
                nachreichungHinweisAusblenden
                anhaengeEintraege={anhaengeEintraege}
                onAnhaengeEintraegeChange={setAnhaengeEintraege}
                gespeicherteAnhaenge={gespeicherteAnhaenge}
                onGespeicherteAnhaengeChange={setGespeicherteAnhaenge}
                meldungId={aufgabe.meldungId}
                idPrefix="arbeitskorb-bm"
              />

              {saveFehler && (
                <div className="mt-4 p-3 rounded border border-jhh-danger bg-red-50 text-jhh-danger text-sm" role="alert">
                  {saveFehler}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  className="btn-primary min-h-[44px]"
                  disabled={saving}
                >
                  {saving ? 'Wird eingereicht …' : 'Beweismittel speichern und Meldung einreichen'}
                </button>
                <button
                  type="button"
                  className="btn-secondary min-h-[44px]"
                  onClick={() => navigate('/arbeitskorb')}
                  disabled={saving}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          ) : uebernommenVonMir ? (
            <form onSubmit={handleInhaftierterAbschliessen} className="section-card">
              <h2 className="text-sm font-bold text-jhh-primary mb-1">Zeugenaussage aufnehmen</h2>
              <p className="text-sm text-jhh-text-light mb-4">
                Sie haben diese Aufgabe übernommen. Halten Sie die Zeugenaussage des Inhaftierten fest.
              </p>

              <RichTextEditor
                id="arbeitskorb-inhaft-aussage"
                label="Zeugenaussage"
                value={aussage}
                onChange={setAussage}
                required
                placeholder="Zeugenaussage des Inhaftierten …"
                minHeight="160px"
              />

              {saveFehler && (
                <div className="mt-4 p-3 rounded border border-jhh-danger bg-red-50 text-jhh-danger text-sm" role="alert">
                  {saveFehler}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  className="btn-primary min-h-[44px]"
                  disabled={saving}
                >
                  {saving ? 'Wird gespeichert …' : 'Zeugenaussage speichern und abschließen'}
                </button>
                <button
                  type="button"
                  className="btn-secondary min-h-[44px]"
                  onClick={() => navigate('/arbeitskorb')}
                  disabled={saving}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAbschliessen} className="section-card">
              <h2 className="text-sm font-bold text-jhh-primary mb-1">Ihre Zeugenaussage</h2>
              <p className="text-sm text-jhh-text-light mb-4">
                Prüfen Sie die erfasste Aussage, ergänzen Sie sie bei Bedarf und bestätigen Sie die Richtigkeit.
              </p>

              <RichTextEditor
                id="arbeitskorb-aussage"
                label="Zeugenaussage"
                value={aussage}
                onChange={setAussage}
                required
                placeholder="Ihre Zeugenaussage …"
                minHeight="160px"
              />

              <div className="mt-4">
                <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 accent-jhh-secondary"
                    checked={bestaetigt}
                    onChange={e => setBestaetigt(e.target.checked)}
                    aria-required="true"
                  />
                  <span className="text-sm">
                    Ich bestätige, dass meine Zeugenaussage vollständig und wahrheitsgemäß ist.
                  </span>
                </label>
              </div>

              {saveFehler && (
                <div className="mt-4 p-3 rounded border border-jhh-danger bg-red-50 text-jhh-danger text-sm" role="alert">
                  {saveFehler}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  className="btn-primary min-h-[44px]"
                  disabled={saving}
                >
                  {saving ? 'Wird gespeichert …' : 'Zeugenaussage bestätigen und abschließen'}
                </button>
                <button
                  type="button"
                  className="btn-secondary min-h-[44px]"
                  onClick={() => navigate('/arbeitskorb')}
                  disabled={saving}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}
          </div>{/* lg:col-span-2 */}

          {/* Rechte Seitenleiste */}
          <div className="lg:col-span-1">
            <DetailSeitenleiste
              meldungId={aufgabe.meldungId}
              meldung={meldung || { anhaenge: [], notizen: [], statusVerlauf: [], veraktungen: [], ervRelevant: false }}
              versand={meldung?.xJustizVersand || []}
              onAktualisiert={() => ladeMeldung(aufgabe.meldungId)}
            />
          </div>
          </div>{/* grid */}
        </>
      )}

      <RueckgabeDialog
        offen={rueckgabeOffen}
        onSchliessen={() => setRueckgabeOffen(false)}
        onBestaetigen={handleRueckgabe}
        laedt={saving}
        initialGrund={rueckgabeGrund}
      />
    </PageLayout>
  )
}
