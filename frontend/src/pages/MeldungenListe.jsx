import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import StatusBadge, { ERVBadge } from '../components/shared/StatusBadge'
import FallStatusBadge from '../components/shared/FallStatusBadge'
import MeldungPruefHinweisModal from '../components/meldung/MeldungPruefHinweisModal'
import { useApiClient } from '../api/client'
import { useRolle } from '../context/RollenContext'
import { useMeldungPruefPopup } from '../hooks/useMeldungPruefPopup'
import {
  formatDatumKurz,
  formatGefangene,
  formatTatzeit,
  getMeldungstypLabel,
  getSlaHinweise,
  getStrafanzeigeUntertypLabel,
  istUeberfaellig,
} from '../utils/meldungen'
import { stripRichTextPlain } from '../utils/richText'

const STATUS_TABS = [
  { id: 'offen', label: 'Offen' },
  { id: 'erledigt', label: 'Erledigt' },
]

const BEREICH_FILTER = [
  { id: '', label: 'Alle Aufgaben' },
  { id: 'meine', label: 'Meine Aufgaben' },
  { id: 'gruppe', label: 'Gruppenaufgaben' },
]

const SORT_OPTIONS = [
  { value: 'neueste', label: 'Neueste zuerst' },
  { value: 'aelteste', label: 'Älteste zuerst' },
  { value: 'ueberfaellig', label: 'Überfällig zuerst' },
  { value: 'typ', label: 'Meldungstyp A–Z' },
]

function sichtbereichFromFilter(statusTab, bereich) {
  if (statusTab === 'erledigt') return 'erledigt'
  if (bereich === 'meine') return 'meine'
  if (bereich === 'gruppe') return 'unvergeben'
  return 'offen'
}

function sortMeldungen(liste, sortierung) {
  const items = [...liste]
  if (sortierung === 'neueste') {
    items.sort((a, b) => new Date(b.erstelltAm) - new Date(a.erstelltAm))
  } else if (sortierung === 'aelteste') {
    items.sort((a, b) => new Date(a.erstelltAm) - new Date(b.erstelltAm))
  } else if (sortierung === 'ueberfaellig') {
    items.sort((a, b) => {
      const ua = istUeberfaellig(a) ? 1 : 0
      const ub = istUeberfaellig(b) ? 1 : 0
      if (ub !== ua) return ub - ua
      return new Date(b.erstelltAm) - new Date(a.erstelltAm)
    })
  } else if (sortierung === 'typ') {
    items.sort((a, b) =>
      getMeldungstypLabel(a.meldungsTyp).localeCompare(getMeldungstypLabel(b.meldungsTyp), 'de'),
    )
  }
  return items
}

function kurztextSachverhalt(meldung) {
  const meta = meldung.metadaten || {}
  if (meldung.meldungsTyp === 'STRAFANZEIGE' && meta.tatvorwurf) {
    return getStrafanzeigeUntertypLabel(meta.tatvorwurf || meta.strafanzeigeUntertyp)
  }
  const plain = stripRichTextPlain(meldung.sachverhalt || '')
  if (!plain) return '–'
  return plain.length > 80 ? plain.slice(0, 80) + '…' : plain
}

export default function MeldungenListe({ embedded = false }) {
  const navigate = useNavigate()
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api
  const [searchParams, setSearchParams] = useSearchParams()
  const { kannMeldungBearbeiten, aktiverNutzer, rolleLabel, istVAL, istAL } = useRolle()
  const istPruefer = istVAL || istAL
  const { anzahlEingereicht, modalOffen, schliessenModal } = useMeldungPruefPopup({
    aktiverNutzerId: aktiverNutzer.id,
    kannMeldungBearbeiten,
    istPruefer,
    enabled: !embedded,
  })

  // --- Tab-Initialisierung aus Query-Params (nur Standalone-Seite) ---
  function initStatusTab() {
    if (embedded) return 'offen'
    const tab = searchParams.get('tab')
    if (tab === 'erledigt') return 'erledigt'
    const status = searchParams.get('status')
    if (status === 'ARCHIVED') return 'erledigt'
    return 'offen'
  }
  function initBereich() {
    if (embedded) return ''
    const bereich = searchParams.get('sichtbereich') || searchParams.get('bereich')
    if (['meine', 'gruppe'].includes(bereich)) return bereich
    return ''
  }

  const [statusTab, setStatusTab] = useState(initStatusTab)
  const [bereich, setBereich] = useState(initBereich)
  const [sortierung, setSortierung] = useState('neueste')
  const [suche, setSuche] = useState(() => (embedded ? '' : (searchParams.get('search') || '')))
  const [liste, setListe] = useState([])
  const [loading, setLoading] = useState(true)
  const [fehler, setFehler] = useState(null)
  const [uebernehmenLaden, setUebernehmenLaden] = useState(null)

  // Sync extra Query-Params (ervRelevant, dringend) für API-Aufruf
  const extraParams = useMemo(() => {
    const p = {}
    if (searchParams.get('ervRelevant')) p.ervRelevant = searchParams.get('ervRelevant')
    if (searchParams.get('dringend')) p.dringend = searchParams.get('dringend')
    return p
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setFehler(null)
      try {
        const q = new URLSearchParams()
        q.set('sichtbereich', sichtbereichFromFilter(statusTab, bereich))
        q.set('limit', '100')
        if (extraParams.ervRelevant) q.set('ervRelevant', extraParams.ervRelevant)
        if (extraParams.dringend) q.set('dringend', extraParams.dringend)
        const res = await apiRef.current.get(`/api/meldungen?${q}`)
        if (!cancelled) setListe(res.data || [])
      } catch (e) {
        if (!cancelled) setFehler(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [statusTab, bereich, extraParams])

  function wechselStatusTab(tabId) {
    setStatusTab(tabId)
    if (embedded) {
      if (tabId === 'erledigt' && bereich === 'gruppe') setBereich('')
      return
    }
    const next = new URLSearchParams(searchParams)
    next.set('tab', tabId)
    if (tabId === 'erledigt' && bereich === 'gruppe') {
      setBereich('')
      next.delete('bereich')
    }
    next.delete('status')
    setSearchParams(next, { replace: true })
  }

  function wechselBereich(bereichId) {
    setBereich(bereichId)
    if (embedded) return
    const next = new URLSearchParams(searchParams)
    if (bereichId) next.set('bereich', bereichId)
    else next.delete('bereich')
    setSearchParams(next, { replace: true })
  }

  async function handleUebernehmen(meldung) {
    setUebernehmenLaden(meldung.id)
    try {
      await apiRef.current.patch(`/api/meldungen/${meldung.id}/zuweisen`, {})
      wechselBereich('meine')
      if (statusTab !== 'offen') wechselStatusTab('offen')
    } catch (e) {
      alert(`Fehler beim Übernehmen: ${e.message}`)
    } finally {
      setUebernehmenLaden(null)
    }
  }

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase()
    if (!q) return liste
    return liste.filter(m => JSON.stringify(m).toLowerCase().includes(q))
  }, [liste, suche])

  const angezeigt = useMemo(
    () => sortMeldungen(gefiltert, sortierung),
    [gefiltert, sortierung],
  )

  const zeigGruppe = statusTab === 'offen' && bereich === 'gruppe'

  const inhalt = (
    <>
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-jhh-primary m-0">Meldungen</h1>
          <Link to="/meldungen/neu" className="btn-primary">
            + Neue Meldung
          </Link>
        </div>
      )}

      {embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-jhh-text-light m-0">
            Kartenansicht mit Filtern – dieselbe Liste wie unter{' '}
            <Link to="/meldungen" className="text-jhh-secondary font-semibold hover:underline">
              /meldungen
            </Link>
            .
          </p>
          <Link to="/meldungen" className="btn-secondary btn-sm min-h-[44px]">
            Vollständige Liste
          </Link>
        </div>
      )}

      {/* Zuständigkeits-Banner */}
      <div className="mb-4 p-3 rounded bg-jhh-bg border border-jhh-border text-sm text-jhh-text-light">
        Ihre Zuständigkeit: <span className="font-semibold text-jhh-text">{rolleLabel}</span>
        {aktiverNutzer.abteilung && <> · {aktiverNutzer.abteilung}</>}
        {aktiverNutzer.station && <> · Station {aktiverNutzer.station}</>}
        {aktiverNutzer.jva && <> · {aktiverNutzer.jva}</>}
      </div>

      {/* Schlagwortsuche */}
      <div className="mb-4">
        <input
          type="search"
          className="form-input w-full max-w-xl"
          placeholder="Meldungs-Nr., Sachverhalt, Gefangene/r, Typ …"
          value={suche}
          onChange={e => setSuche(e.target.value)}
          autoComplete="off"
          aria-label="Schlagwortsuche"
        />
      </div>

      {/* Status-Tabs: Offen | Erledigt */}
      <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Status-Filter">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`border-2 rounded px-5 py-2 font-semibold text-sm min-h-[44px] transition-colors ${
              statusTab === tab.id
                ? 'bg-jhh-primary text-white border-jhh-primary'
                : 'bg-white text-jhh-primary border-jhh-border hover:border-jhh-primary'
            }`}
            onClick={() => wechselStatusTab(tab.id)}
            role="tab"
            aria-selected={statusTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Zweite Filterzeile: Alle | Meine | Gruppe (nur bei "Offen") */}
      {statusTab === 'offen' && (
        <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Aufgaben-Filter">
          {BEREICH_FILTER.map(f => (
            <button
              key={f.id}
              type="button"
              className={`border rounded px-4 py-1.5 text-sm font-medium transition-colors ${
                bereich === f.id
                  ? 'bg-jhh-secondary text-white border-jhh-secondary'
                  : 'bg-white text-jhh-text border-jhh-border hover:border-jhh-secondary'
              }`}
              onClick={() => wechselBereich(f.id)}
              role="tab"
              aria-selected={bereich === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Sortierung + Zähler */}
      <div className="flex flex-wrap items-end gap-4 mb-5">
        <div className="min-w-[200px]">
          <label htmlFor="meldungen-sortierung" className="form-label">Sortierung</label>
          <select
            id="meldungen-sortierung"
            className="form-input"
            value={sortierung}
            onChange={e => setSortierung(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-jhh-text-light m-0 pb-1">
          {loading ? '…' : `${angezeigt.length} ${angezeigt.length === 1 ? 'Eintrag' : 'Einträge'}`}
        </p>
      </div>

      {fehler && (
        <p role="alert" className="text-jhh-danger mb-4">{fehler}</p>
      )}

      {loading ? (
        <p className="text-jhh-text-light">Meldungen werden geladen …</p>
      ) : angezeigt.length === 0 ? (
        <p className="text-jhh-text-light">Keine Meldungen in diesem Bereich.</p>
      ) : (
        <div className="space-y-3">
          {angezeigt.map(m => {
            const sla = getSlaHinweise(m)
            const ueberfaellig = istUeberfaellig(m)
            const meta = m.metadaten || {}
            const tatzeit = meta.tatzeit ? formatTatzeit(meta.tatzeit) : null
            const kurztext = kurztextSachverhalt(m)

            return (
              <div
                key={m.id}
                className={`card p-4 flex flex-col gap-2 ${ueberfaellig ? 'border-l-4 border-l-jhh-danger' : ''}`}
              >
                {/* Kopfzeile */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className="font-bold text-jhh-primary text-sm">{m.meldungsNr}</span>
                    <span className="mx-2 text-jhh-border">·</span>
                    <span className="text-sm text-jhh-text">{getMeldungstypLabel(m.meldungsTyp)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {m.zugewiesenAnName && (
                      <span className="text-xs px-2 py-0.5 rounded bg-jhh-bg border border-jhh-border text-jhh-text">
                        👤 Delegiert an: {m.zugewiesenAnName}
                      </span>
                    )}
                    {m.ervRelevant && <ERVBadge />}
                    {m.fall ? (
                      <Link to={`/faelle/${m.fall.id}`} className="inline-flex" onClick={e => e.stopPropagation()}>
                        <FallStatusBadge status={m.fall.status} />
                      </Link>
                    ) : m.status === 'SUBMITTED' ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-jhh-bg border border-jhh-border text-jhh-text-light">
                        ⏳ Ohne Fall
                      </span>
                    ) : null}
                    <StatusBadge status={m.status} />
                  </div>
                </div>

                {/* Kurztext */}
                <p className="text-sm text-jhh-text m-0 line-clamp-2">{kurztext}</p>

                {/* Metadaten */}
                <div className="flex flex-wrap gap-3 text-xs text-jhh-text-light">
                  {tatzeit && <span>🕐 {tatzeit}</span>}
                  {m.gefangene?.jva && <span>🏛 {m.gefangene.jva}</span>}
                  {m.gefangene && <span>👤 {formatGefangene(m.gefangene)}</span>}
                  <span>📅 {formatDatumKurz(m.erstelltAm)}</span>
                </div>

                {/* SLA-Warnung */}
                {sla.map((h, i) => (
                  <p key={i} className="text-xs text-jhh-danger font-medium m-0" role="status">
                    ⚠️ {h.text}
                  </p>
                ))}

                {/* Aktions-Buttons */}
                <div className="flex gap-2 pt-1 flex-wrap">
                  <Link to={`/meldungen/${m.id}`} className="btn-primary btn-sm">
                    Öffnen
                  </Link>
                  {zeigGruppe && (
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => handleUebernehmen(m)}
                      disabled={uebernehmenLaden === m.id}
                    >
                      {uebernehmenLaden === m.id ? 'Wird übernommen …' : 'Übernehmen'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!embedded && (
        <MeldungPruefHinweisModal
          anzahlEingereicht={anzahlEingereicht}
          offen={modalOffen}
          onSchliessen={schliessenModal}
          linkEingereichtFilter={
            istPruefer ? '/arbeitskorb?status=OFFEN' : '/meldungen?tab=offen'
          }
        />
      )}
    </>
  )

  if (embedded) return inhalt

  return (
    <PageLayout
      plattformTitel="eMeldewesen"
      seiten={[
        { label: 'eMeldewesen', href: '/emeldewesen' },
        { label: 'Meldungen' },
      ]}
    >
      {inhalt}
    </PageLayout>
  )
}
