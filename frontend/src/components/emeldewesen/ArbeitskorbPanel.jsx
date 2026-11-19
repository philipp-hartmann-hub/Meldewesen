import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useRolle } from '../../context/RollenContext'
import { useApiClient } from '../../api/client'
import { useArbeitskorb } from '../../hooks/useArbeitskorb'
import { formatDatum, formatGefangene } from '../../utils/meldungen'
import { AUFGABEN_TYPEN, AUFGABEN_TYP_LABEL, ZUWEISUNG } from '../../utils/arbeitskorb'
import {
  istAufgabeNeu,
  setLetzterBesuch,
  zaehleNeueAufgaben,
} from '../../utils/arbeitskorbGelesen'
import {
  berechneTier,
  getTierInfo,
  sortiereAufgaben,
} from '../../utils/arbeitskorbSortierung'

const SORTIERUNG_STORAGE_KEY = 'arbeitskorb_sortierung'

const STATUS_FILTER = [
  { value: 'OFFEN', label: 'Offen' },
  { value: 'ERLEDIGT', label: 'Erledigt' },
]

const BEREICH_FILTER = [
  { value: '', label: 'Alle Aufgaben' },
  { value: ZUWEISUNG.PERSOENLICH, label: 'Meine Aufgaben' },
  { value: ZUWEISUNG.GRUPPE, label: 'Gruppenaufgaben' },
]

function arbeitskorbHref(status, bereich) {
  const params = new URLSearchParams()
  params.set('status', status === 'ERLEDIGT' ? 'ERLEDIGT' : 'OFFEN')
  if (bereich) params.set('bereich', bereich)
  return `/arbeitskorb?${params.toString()}`
}

function normalizeStatusFilter(raw) {
  return raw === 'ERLEDIGT' ? 'ERLEDIGT' : 'OFFEN'
}

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

function ZuweisungBadge({ zuweisung }) {
  if (zuweisung !== ZUWEISUNG.GRUPPE) return null
  return (
    <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded bg-jhh-bg text-jhh-secondary border border-jhh-border">
      👥 Gruppe
    </span>
  )
}

function NeuBadge() {
  return (
    <span
      className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full text-white"
      style={{ background: 'var(--jhh-accent)' }}
    >
      Neu
    </span>
  )
}

function DringendBadge() {
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded bg-red-50 text-jhh-danger border border-red-200"
      role="status"
    >
      ⚠️ Dringend
    </span>
  )
}

function istAufgabeDringend(aufgabe) {
  return aufgabe.dringend === true || (aufgabe.prioritaet ?? 0) > 0
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`btn-sm min-h-[44px] ${active ? 'btn-primary' : 'btn-secondary'}`}
      onClick={onClick}
      role="tab"
      aria-selected={active}
    >
      {children}
    </button>
  )
}

function StatusTabButton({ active, onClick, children, asLink, to }) {
  const klassen = `inline-flex items-center border-2 rounded px-5 py-2 font-semibold text-sm min-h-[44px] no-underline ${
    active
      ? 'bg-jhh-primary text-white border-jhh-primary'
      : 'bg-white text-jhh-primary border-jhh-border hover:border-jhh-primary'
  }`
  if (asLink) {
    return (
      <Link to={to} className={klassen} role="tab" aria-selected={active}>
        {children}
      </Link>
    )
  }
  return (
    <button
      type="button"
      className={klassen}
      onClick={onClick}
      role="tab"
      aria-selected={active}
    >
      {children}
    </button>
  )
}

/**
 * Vollständiger Arbeitskorb – standalone oder eingebettet im eMeldewesen-Hub.
 */
export default function ArbeitskorbPanel({ embedded = false }) {
  const navigate = useNavigate()
  const api = useApiClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [statusLocal, setStatusLocal] = useState('OFFEN')
  const [bereichLocal, setBereichLocal] = useState('')
  const [uebernehmenLaden, setUebernehmenLaden] = useState(null)
  const [sortierung, setSortierung] = useState(
    () => localStorage.getItem(SORTIERUNG_STORAGE_KEY) || 'dringlichkeit',
  )

  function handleSortierungAendern(wert) {
    setSortierung(wert)
    localStorage.setItem(SORTIERUNG_STORAGE_KEY, wert)
  }

  const statusFilter = normalizeStatusFilter(
    embedded ? statusLocal : searchParams.get('status'),
  )
  const bereichFilter = embedded ? bereichLocal : (searchParams.get('bereich') || '')

  const { aktiverNutzer, istVAL, istAL } = useRolle()
  const { aufgaben, offen, offenGruppe, loading, fehler, neuLaden } = useArbeitskorb({
    status: statusFilter,
    bereich: bereichFilter || undefined,
  })

  async function handleUebernehmen(aufgabe) {
    setUebernehmenLaden(aufgabe.id)
    try {
      await api.patch(
        `/api/arbeitskorb/${encodeURIComponent(aufgabe.id)}/uebernehmen`,
        {},
      )
      // Tab auf "Meine Aufgaben" wechseln
      if (embedded) {
        setBereichLocal(ZUWEISUNG.PERSOENLICH)
      } else {
        const next = new URLSearchParams(searchParams)
        next.set('bereich', ZUWEISUNG.PERSOENLICH)
        setSearchParams(next, { replace: true })
      }
      await neuLaden()
      navigate(`/arbeitskorb/aufgabe/${encodeURIComponent(aufgabe.id)}`)
    } catch (e) {
      alert(e.message || 'Aufgabe konnte nicht übernommen werden.')
    } finally {
      setUebernehmenLaden(null)
    }
  }

  useEffect(() => {
    return () => setLetzterBesuch(aktiverNutzer.id)
  }, [aktiverNutzer.id])

  const neueAnzahl = zaehleNeueAufgaben(
    aufgaben.filter(a => a.status === 'OFFEN'),
    aktiverNutzer.id,
  )

  return (
    <>
      {!embedded && (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-jhh-primary m-0 mb-1">Mein Arbeitskorb</h1>
            <p className="text-sm text-jhh-text-light m-0">
              Aufgaben für {aktiverNutzer.name}
              {neueAnzahl > 0 && (
                <span className="ml-2 font-semibold text-jhh-accent">
                  · {neueAnzahl} neue {neueAnzahl === 1 ? 'Aufgabe' : 'Aufgaben'}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {embedded && (
        <p className="text-sm text-jhh-text-light m-0 mb-4">
          Aufgaben für {aktiverNutzer.name}
          {neueAnzahl > 0 && (
            <span className="ml-2 font-semibold text-jhh-accent">
              · {neueAnzahl} neue {neueAnzahl === 1 ? 'Aufgabe' : 'Aufgaben'}
            </span>
          )}
        </p>
      )}

      {/* Status-Tabs + Sortierung in einer Zeile */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter Aufgabenstatus">
          {STATUS_FILTER.map(opt => {
            const active = statusFilter === opt.value
            const label = (
              <>
                {opt.label}
                {opt.value === 'OFFEN' && offen > 0 && (
                  <span className="ml-1.5 font-bold">({offen})</span>
                )}
              </>
            )
            if (embedded) {
              return (
                <StatusTabButton
                  key={opt.value}
                  active={active}
                  onClick={() => setStatusLocal(opt.value)}
                >
                  {label}
                </StatusTabButton>
              )
            }
            return (
              <StatusTabButton
                key={opt.value}
                active={active}
                asLink
                to={arbeitskorbHref(opt.value, bereichFilter)}
              >
                {label}
              </StatusTabButton>
            )
          })}
        </div>

        {/* Sortier-Dropdown */}
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="arbeitskorb-sortierung" className="text-jhh-text-light font-medium whitespace-nowrap">
            Sortierung:
          </label>
          <select
            id="arbeitskorb-sortierung"
            value={sortierung}
            onChange={e => handleSortierungAendern(e.target.value)}
            className="border border-jhh-border rounded px-3 py-1.5 text-sm text-jhh-primary bg-white focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
          >
            <option value="dringlichkeit">Dringlichkeit (empfohlen)</option>
            <option value="frist_aufsteigend">Fristablauf (früheste zuerst)</option>
            <option value="eingang_neu">Eingang: Neueste zuerst</option>
            <option value="eingang_alt">Eingang: Älteste zuerst</option>
            <option value="typ">Meldungstyp A–Z</option>
            <option value="prozessschritt">Prozessschritt</option>
          </select>
        </div>
      </div>

      {/* Bereich-Filter */}
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Filter Aufgabenbereich">
        {BEREICH_FILTER.map(opt => {
          const active = bereichFilter === opt.value
          const label = (
            <>
              {opt.label}
              {opt.value === ZUWEISUNG.GRUPPE && offenGruppe > 0 && (
                <span className="ml-1.5 font-bold">({offenGruppe})</span>
              )}
            </>
          )
          if (embedded) {
            return (
              <FilterButton
                key={opt.value || 'alle-bereich'}
                active={active}
                onClick={() => setBereichLocal(opt.value)}
              >
                {label}
              </FilterButton>
            )
          }
          return (
            <Link
              key={opt.value || 'alle-bereich'}
              to={arbeitskorbHref(statusFilter, opt.value)}
              className={`btn-sm min-h-[44px] ${active ? 'btn-primary' : 'btn-secondary'}`}
              role="tab"
              aria-selected={active}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {loading && aufgaben.length === 0 && (
        <p className="text-jhh-text-light" role="status">Aufgaben werden geladen …</p>
      )}

      {fehler && (
        <div className="p-4 rounded border border-jhh-danger bg-red-50 text-jhh-danger text-sm" role="alert">
          {fehler}
        </div>
      )}

      {!loading && !fehler && aufgaben.length === 0 && (
        <section className="section-card text-center py-10">
          <p className="text-jhh-text-light m-0 mb-2">Keine Aufgaben in Ihrem Arbeitskorb.</p>
          <p className="text-sm text-jhh-text-light m-0">
            {bereichFilter === ZUWEISUNG.GRUPPE
              ? 'Gruppenaufgaben erscheinen hier für offene Fall-Schritte, Zeugenaussagen (Inhaftierter) oder Beweismittel-Nachreichung.'
              : istVAL || istAL
                ? 'Persönliche Aufgaben als Zeuge/Zeugin, übernommene Gruppenaufgaben oder fachliche Prüfung, sobald alle Zeugenaussagen vorliegen.'
                : 'Persönliche Aufgaben als Zeuge/Zeugin, übernommene Gruppenaufgaben, Beweismittel-Nachreichung oder Zeugenaussagen.'}
          </p>
        </section>
      )}

      {!loading && aufgaben.length > 0 && (
        <ul className="space-y-3 list-none p-0 m-0" aria-label="Aufgabenliste">
          {sortiereAufgaben(aufgaben, sortierung).map(a => {
            const neu = istAufgabeNeu(a, aktiverNutzer.id)
            const dringend = istAufgabeDringend(a)
            const tier = berechneTier(a)
            const tierInfo = getTierInfo(tier)
            const dringendHervorheben = tier <= 2 && a.status === 'OFFEN'
            const href = a.zielPfad
              ? a.zielPfad
              : a.fallId
              ? `/faelle/${a.fallId}`
              : a.typ === AUFGABEN_TYPEN.DGL_RUECKGABE
                ? `/meldungen/${a.meldungId}/bearbeiten`
                : `/arbeitskorb/aufgabe/${encodeURIComponent(a.id)}`
            return (
              <li key={a.id}>
                <div
                  className={`flex justify-between items-start gap-4 p-4 border border-jhh-border rounded bg-white hover:shadow-sm transition-shadow ${
                    dringendHervorheben ? 'border-l-4 border-l-jhh-danger bg-red-50' : ''
                  } ${!dringendHervorheben && tier === 3 ? 'border-l-4 border-l-yellow-400' : ''
                  } ${!dringendHervorheben && tier !== 3 && neu ? 'border-l-4 border-l-jhh-accent' : ''}`}
                >
                  {/* Linke Spalte: Inhalt */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="font-semibold text-sm text-jhh-primary m-0 flex flex-wrap items-center gap-2">
                      {tierInfo.icon && (
                        <span className={`text-xs font-semibold ${tierInfo.farbe}`} aria-label={tierInfo.label}>
                          {tierInfo.icon} {tierInfo.label}
                        </span>
                      )}
                      <span>{a.meldungsNr} – {a.titel}</span>
                      {dringend && tier > 3 && <DringendBadge />}
                      {neu && <NeuBadge />}
                      <ZuweisungBadge zuweisung={a.zuweisung} />
                      <AufgabenStatusBadge status={a.status} />
                    </p>
                    <p className="text-xs text-jhh-text-light m-0">
                      {AUFGABEN_TYP_LABEL[a.typ] || a.typ}
                      {a.gefangene && <> · {formatGefangene(a.gefangene)}</>}
                      {a.zeugeName && <> · Zeuge/Zeugin: {a.zeugeName}</>}
                      {a.standort && <> · {a.standort}</>}
                    </p>
                    {a.gesendetAm && (
                      <p className="text-xs text-jhh-text-light m-0">
                        Zugewiesen am {formatDatum(a.gesendetAm)}
                      </p>
                    )}
                    {a.fristBis && a.status === 'OFFEN' && (
                      <p className="text-xs font-semibold text-jhh-warning m-0">
                        ⏰ Frist: {formatDatum(a.fristBis)}
                      </p>
                    )}
                    {a.typ === AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG && (
                      <p className="text-xs text-jhh-success font-medium m-0">
                        ✅ Alle Zeugenaussagen liegen vor
                      </p>
                    )}
                    {a.typ === AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN && (
                      <p className="text-xs text-jhh-warning font-medium m-0">
                        📎 Beweismittel nachreichen
                      </p>
                    )}
                  </div>

                  {/* Rechte Spalte: CTA */}
                  <div className="flex-shrink-0 flex gap-2 items-center">
                    {a.fallId || a.zielPfad ? (
                      <Link
                        to={href}
                        className="btn-primary btn-sm whitespace-nowrap min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                      >
                        {a.aktionLabel || (a.fallId ? 'Fall öffnen' : 'Meldung öffnen')}
                      </Link>
                    ) : a.zuweisung === ZUWEISUNG.GRUPPE ? (
                      <>
                        <button
                          type="button"
                          className="btn-secondary btn-sm whitespace-nowrap min-h-[44px] inline-flex items-center justify-center"
                          onClick={() => navigate(href)}
                        >
                          Aufgabe öffnen
                        </button>
                        <button
                          type="button"
                          className="btn-primary btn-sm whitespace-nowrap min-h-[44px] inline-flex items-center justify-center"
                          onClick={() => handleUebernehmen(a)}
                          disabled={uebernehmenLaden === a.id}
                        >
                          {uebernehmenLaden === a.id ? 'Wird übernommen …' : 'Aufgabe übernehmen'}
                        </button>
                      </>
                    ) : (
                      <Link
                        to={href}
                        className="btn-primary btn-sm whitespace-nowrap min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                      >
                        Aufgabe öffnen
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
