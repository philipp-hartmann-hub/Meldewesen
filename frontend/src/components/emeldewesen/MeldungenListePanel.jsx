import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import StatusBadge, { ERVBadge } from '../shared/StatusBadge'
import MeldungPruefHinweisModal from '../meldung/MeldungPruefHinweisModal'
import GefangeneAutocomplete from '../meldung/GefangeneAutocomplete'
import { useApiClient } from '../../api/client'
import { useRolle } from '../../context/RollenContext'
import { useMeldungPruefPopup } from '../../hooks/useMeldungPruefPopup'
import {
  formatGefangene,
  formatDatumKurz,
  getMeldungstypLabel,
  getStrafanzeigeUntertypLabel,
  getSlaHinweise,
  istUeberfaellig,
} from '../../utils/meldungen'

const STATUS_OPTIONS = [
  { value: '', label: 'Alle Status' },
  { value: 'DRAFT', label: 'Entwurf' },
  { value: 'SUBMITTED', label: 'Eingereicht' },
  { value: 'IN_PROGRESS', label: 'Fachliche Prüfung' },
  { value: 'FORWARDED', label: 'Weitergeleitet' },
  { value: 'ARCHIVED', label: 'Archiviert' },
]

const ERV_OPTIONS = [
  { value: '', label: 'Alle' },
  { value: 'offen', label: 'ERV & offen' },
  { value: '1', label: 'ERV-pflichtig' },
  { value: '0', label: 'Nicht ERV' },
]

const DRINGEND_OPTIONS = [
  { value: '', label: 'Alle' },
  { value: '1', label: 'Überfällig' },
]

const SORT_COLUMNS = [
  { id: 'meldungsNr', label: 'Nr.' },
  { id: 'meldungsTyp', label: 'Typ' },
  { id: 'gefangene', label: 'Gefangene/r' },
  { id: 'status', label: 'Status' },
  { id: 'erstelltAm', label: 'Erstellt' },
]

function SortableColumnHeader({ label, columnId, sortBy, sortDir, onSort }) {
  const active = sortBy === columnId
  const ariaSort = active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'

  return (
    <th scope="col" aria-sort={ariaSort}>
      <button
        type="button"
        className="table-sort-btn"
        onClick={() => onSort(columnId)}
        aria-label={
          active
            ? `${label}, sortiert ${sortDir === 'asc' ? 'aufsteigend' : 'absteigend'}`
            : `${label}, sortierbar`
        }
      >
        <span>{label}</span>
        <span className="table-sort-icon" aria-hidden="true">
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </button>
    </th>
  )
}

/**
 * Vollständige Meldungsliste – standalone oder eingebettet im eMeldewesen-Hub.
 */
export default function MeldungenListePanel({ embedded = false, idPrefix = 'meldungen-liste' }) {
  const navigate = useNavigate()
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api
  const { kannMeldungBearbeiten, aktiverNutzer, istVAL, istAL } = useRolle()
  const istPruefer = istVAL || istAL
  const { anzahlEingereicht, modalOffen, schliessenModal } = useMeldungPruefPopup({
    aktiverNutzerId: aktiverNutzer.id,
    kannMeldungBearbeiten,
    istPruefer,
    enabled: !embedded,
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterLocal, setFilterLocal] = useState({
    status: '',
    meldungsTyp: '',
    ervRelevant: '',
    dringend: '',
    gefangeneId: '',
    sortBy: '',
    sortDir: 'desc',
  })
  const [meldungen, setMeldungen] = useState([])
  const [typen, setTypen] = useState([])
  const [loading, setLoading] = useState(true)
  const [fehler, setFehler] = useState(null)
  const [gefangeneAuswahl, setGefangeneAuswahl] = useState(null)

  const statusFilter = embedded ? filterLocal.status : (searchParams.get('status') || '')
  const typFilter = embedded ? filterLocal.meldungsTyp : (searchParams.get('meldungsTyp') || '')
  const ervFilter = embedded ? filterLocal.ervRelevant : (searchParams.get('ervRelevant') || '')
  const dringendFilter = embedded ? filterLocal.dringend : (searchParams.get('dringend') || '')
  const gefangeneFilter = embedded ? filterLocal.gefangeneId : (searchParams.get('gefangeneId') || '')
  const sortBy = embedded ? filterLocal.sortBy : (searchParams.get('sortBy') || '')
  const sortDir = embedded
    ? filterLocal.sortDir
    : (searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc')

  useEffect(() => {
    apiRef.current.get('/api/meldungstypen').then(r => setTypen(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!gefangeneFilter) {
      setGefangeneAuswahl(null)
      return undefined
    }
    if (gefangeneAuswahl?.id === gefangeneFilter) return undefined
    let cancelled = false
    apiRef.current.get(`/api/gefangene/${gefangeneFilter}`)
      .then(r => {
        if (!cancelled) setGefangeneAuswahl(r.data || null)
      })
      .catch(() => {
        if (!cancelled) setGefangeneAuswahl(null)
      })
    return () => { cancelled = true }
  }, [gefangeneFilter])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setFehler(null)
      try {
        const q = new URLSearchParams()
        if (statusFilter) q.set('status', statusFilter)
        if (typFilter) q.set('meldungsTyp', typFilter)
        if (ervFilter) q.set('ervRelevant', ervFilter)
        if (dringendFilter) q.set('dringend', dringendFilter)
        if (gefangeneFilter) q.set('gefangeneId', gefangeneFilter)
        if (sortBy) {
          q.set('sortBy', sortBy)
          q.set('sortDir', sortDir)
        }
        q.set('limit', '50')
        const res = await apiRef.current.get(`/api/meldungen?${q}`)
        if (!cancelled) setMeldungen(res.data || [])
      } catch (e) {
        if (!cancelled) setFehler(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [statusFilter, typFilter, ervFilter, dringendFilter, gefangeneFilter, sortBy, sortDir])

  function setFilter(key, value) {
    if (embedded) {
      setFilterLocal(prev => ({ ...prev, [key]: value }))
      return
    }
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  function handleGefangeneFilter(gefangene) {
    setGefangeneAuswahl(gefangene)
    setFilter('gefangeneId', gefangene?.id || '')
  }

  function toggleSort(columnId) {
    if (embedded) {
      setFilterLocal(prev => {
        if (prev.sortBy === columnId) {
          return { ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }
        }
        return { ...prev, sortBy: columnId, sortDir: 'asc' }
      })
      return
    }
    const next = new URLSearchParams(searchParams)
    if (sortBy === columnId) {
      next.set('sortDir', sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      next.set('sortBy', columnId)
      next.set('sortDir', 'asc')
    }
    setSearchParams(next)
  }

  const content = (
    <>
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-jhh-primary m-0">Alle Meldungen</h1>
          <div className="flex flex-wrap gap-2">
            <Link to="/meldungen/neu" className="btn-primary">
              + Neue Meldung
            </Link>
          </div>
        </div>
      )}

      <div className="card p-4 mb-6 grid grid-cols-5 gap-3 items-end w-full">
        <div className="min-w-0">
          <label htmlFor={`${idPrefix}-filter-status`} className="form-label">Status</label>
          <select
            id={`${idPrefix}-filter-status`}
            className="form-input"
            value={statusFilter}
            onChange={e => setFilter('status', e.target.value)}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor={`${idPrefix}-filter-typ`} className="form-label">Meldungstyp</label>
          <select
            id={`${idPrefix}-filter-typ`}
            className="form-input"
            value={typFilter}
            onChange={e => setFilter('meldungsTyp', e.target.value)}
          >
            <option value="">Alle Typen</option>
            {typen.map(t => (
              <option key={t.id} value={t.id} disabled={!t.aktiv}>
                {t.label}{!t.aktiv ? ' (in Planung)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor={`${idPrefix}-filter-erv`} className="form-label">ERV-Pflicht</label>
          <select
            id={`${idPrefix}-filter-erv`}
            className="form-input"
            value={ervFilter}
            onChange={e => setFilter('ervRelevant', e.target.value)}
          >
            {ERV_OPTIONS.map(o => (
              <option key={o.value || 'all'} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor={`${idPrefix}-filter-dringend`} className="form-label">Überfällig</label>
          <select
            id={`${idPrefix}-filter-dringend`}
            className="form-input"
            value={dringendFilter}
            onChange={e => setFilter('dringend', e.target.value)}
          >
            {DRINGEND_OPTIONS.map(o => (
              <option key={o.value || 'all'} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <GefangeneAutocomplete
            id={`${idPrefix}-filter-gefangene`}
            label="Gefangene/r"
            showHint={false}
            placeholder="Alle · Name oder Nr."
            value={gefangeneAuswahl}
            onChange={handleGefangeneFilter}
            className="w-full min-w-0"
          />
        </div>
      </div>

      {fehler && (
        <p role="alert" className="text-jhh-danger mb-4">{fehler}</p>
      )}

      {loading ? (
        <p className="text-jhh-text-light">Meldungen werden geladen …</p>
      ) : meldungen.length === 0 ? (
        <p className="text-jhh-text-light">Keine Meldungen gefunden.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="table-header">
                {SORT_COLUMNS.map(col => (
                  <SortableColumnHeader
                    key={col.id}
                    label={col.label}
                    columnId={col.id}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSort={toggleSort}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {meldungen.map(m => {
                const sla = getSlaHinweise(m)
                const ueberfaellig = istUeberfaellig(m)
                return (
                  <tr
                    key={m.id}
                    className={`table-row ${ueberfaellig ? 'bg-red-50' : ''}`}
                    onClick={() => navigate(`/meldungen/${m.id}`)}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/meldungen/${m.id}`)}
                    tabIndex={0}
                    role="link"
                    aria-label={`Meldung ${m.meldungsNr} öffnen`}
                  >
                    <td className="table-cell font-semibold">
                      {m.meldungsNr}
                      {m.prioritaet > 0 && (
                        <span className="ml-1 text-jhh-danger text-xs" title="Dringend">⚠️</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {getMeldungstypLabel(m.meldungsTyp)}
                      {m.meldungsTyp === 'STRAFANZEIGE' && (m.metadaten?.tatvorwurf || m.metadaten?.strafanzeigeUntertyp) && (
                        <span className="block text-xs text-jhh-text-light mt-0.5">
                          {getStrafanzeigeUntertypLabel(m.metadaten.tatvorwurf || m.metadaten.strafanzeigeUntertyp)}
                        </span>
                      )}
                      {m.ervRelevant && <span className="ml-1"><ERVBadge /></span>}
                    </td>
                    <td className="table-cell">{formatGefangene(m.gefangene)}</td>
                    <td className="table-cell">
                      <StatusBadge status={m.status} />
                      {sla.map((h, i) => (
                        <span key={i} className="block text-xs text-jhh-danger mt-1" role="status">
                          ⚠️ {h.text}
                        </span>
                      ))}
                    </td>
                    <td className="table-cell text-jhh-text-light">
                      {formatDatumKurz(m.erstelltAm)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )

  if (embedded) {
    return content
  }

  return (
    <>
      {content}
      <MeldungPruefHinweisModal
        anzahlEingereicht={anzahlEingereicht}
        offen={modalOffen}
        onSchliessen={schliessenModal}
        linkEingereichtFilter={
          istPruefer
            ? '/arbeitskorb?status=OFFEN'
            : (statusFilter !== 'SUBMITTED' ? '/meldungen?status=SUBMITTED' : null)
        }
      />
    </>
  )
}
