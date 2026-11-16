import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../shared/StatusBadge'
import ZuweisenDialog from '../meldung/ZuweisenDialog'
import { useApiClient } from '../../api/client'
import { useRolle } from '../../context/RollenContext'
import { formatDatumKurz, getMeldungstypLabel } from '../../utils/meldungen'

const KPI_FILTER = [
  { id: 'alle', label: 'Alle Stationstasks', key: 'stationAufgabenOffen', tab: 'aufgaben' },
  { id: 'gruppeUnzugewiesen', label: 'Gruppe unzugewiesen', key: 'gruppeUnzugewiesen', tab: 'aufgaben' },
  { id: 'beiStation', label: 'Bei Station in Arbeit', key: 'beiStation', tab: 'aufgaben' },
  { id: 'beweismittel', label: 'Beweismittel offen', key: 'beweismittelOffen', tab: 'aufgaben' },
  { id: 'ergaenzung', label: 'Ergänzung offen', key: 'ergaenzungOffen', tab: 'ergaenzung' },
  { id: 'ueberfaellig', label: 'Überfällig', key: 'ueberfaellig', tab: 'aufgaben' },
]

const AUFGABEN_TYP_LABEL = {
  zeugenaussage_bestaetigen: 'Zeugenaussage bestätigen',
  zeugenaussage_inhaftierter_erfassen: 'Zeugenaussage (Inhaftierter)',
  beweismittel_nachreichen: 'Beweismittel nachreichen',
}

const RUECKGABE_GRUND_LABEL = {
  zeugen: 'Zeugen',
  beweismittel: 'Beweismittel',
  beides: 'Zeugen & Beweismittel',
  sonstiges: 'Sonstiges',
}

const GUELTIGE_FILTER = new Set([
  'alle', 'gruppeUnzugewiesen', 'beiStation', 'beweismittel', 'ergaenzung', 'ueberfaellig',
])

function tabFromFilter(filterId) {
  const kpi = KPI_FILTER.find(k => k.id === filterId)
  return kpi?.tab || 'aufgaben'
}

export default function TeamUebersichtPanel({ embedded = false, initialFilter = 'alle' }) {
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api
  const { rolleLabel } = useRolle()

  const gueltigerFilter = GUELTIGE_FILTER.has(initialFilter) ? initialFilter : 'alle'

  const [daten, setDaten] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fehler, setFehler] = useState(null)
  const [aktiverTab, setAktiverTab] = useState(() => tabFromFilter(gueltigerFilter))
  const [kpiFilter, setKpiFilter] = useState(gueltigerFilter)
  const [zuweisenZiel, setZuweisenZiel] = useState(null)
  const [zuweisenLaeuft, setZuweisenLaeuft] = useState(false)

  const laden = useCallback(async () => {
    setLoading(true)
    setFehler(null)
    try {
      const res = await apiRef.current.get('/api/disposition/team-uebersicht')
      setDaten(res.data)
    } catch (e) {
      setFehler(e.message || 'Team-Übersicht konnte nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { laden() }, [laden])

  const aufgabenGefiltert = useMemo(() => {
    if (!daten?.aufgaben) return []
    const liste = daten.aufgaben
    switch (kpiFilter) {
      case 'gruppeUnzugewiesen':
        return liste.filter(a => a.zuweisung === 'gruppe' && a.kannZuweisen)
      case 'beiStation':
        return liste.filter(a => a.zugewiesenAn)
      case 'beweismittel':
        return liste.filter(a => a.typ === 'beweismittel_nachreichen')
      case 'ueberfaellig':
        return liste.filter(a => a.ueberfaellig)
      default:
        return liste
    }
  }, [daten, kpiFilter])

  const ergaenzungGefiltert = useMemo(() => {
    if (!daten?.meldungen) return []
    if (kpiFilter === 'ueberfaellig') {
      return daten.meldungen.filter(m => m.ueberfaellig)
    }
    if (kpiFilter === 'beweismittel') {
      return daten.meldungen.filter(m => ['beweismittel', 'beides'].includes(m.rueckgabeGrund))
    }
    return daten.meldungen
  }, [daten, kpiFilter])

  async function handleZuweisen({ zugewiesenAn, kommentar }) {
    if (!zuweisenZiel) return
    setZuweisenLaeuft(true)
    try {
      if (zuweisenZiel.typ === 'meldung') {
        await apiRef.current.patch(`/api/meldungen/${zuweisenZiel.id}/zuweisen`, {
          zugewiesenAn,
          kommentar,
        })
      } else {
        await apiRef.current.patch(
          `/api/arbeitskorb/${encodeURIComponent(zuweisenZiel.id)}/zuweisen`,
          { zugewiesenAn, kommentar },
        )
      }
      setZuweisenZiel(null)
      await laden()
    } catch (e) {
      setFehler(e.message || 'Zuweisung fehlgeschlagen.')
    } finally {
      setZuweisenLaeuft(false)
    }
  }

  function handleKpiClick(kpi) {
    setKpiFilter(kpi.id)
    setAktiverTab(kpi.tab)
  }

  const sicht = daten?.sichtbereich

  return (
    <div className={embedded ? '' : 'max-w-6xl'}>
      {!embedded && (
        <h1 className="text-2xl font-bold text-jhh-primary mb-6">Team-Übersicht</h1>
      )}

      {sicht && (
        <div className="mb-4 p-3 rounded bg-jhh-bg border border-jhh-border text-sm text-jhh-text-light">
          Ihre Zuständigkeit: {rolleLabel} · {sicht.abteilung} · {sicht.jva}
          <span className="block mt-1 text-xs">
            Überblick über Stationstasks (Zeugenaussagen, Ergänzung) – keine fachliche Prüfung (VAL).
          </span>
        </div>
      )}

      {fehler && (
        <p role="alert" className="text-sm text-jhh-danger mb-4">{fehler}</p>
      )}

      {daten?.kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          {KPI_FILTER.map(k => (
            <button
              key={k.id}
              type="button"
              onClick={() => handleKpiClick(k)}
              className={`stat-card text-left transition-transform hover:-translate-y-px ${
                kpiFilter === k.id ? 'border-jhh-secondary ring-2 ring-jhh-secondary/30' : 'border-jhh-border'
              }`}
            >
              <div className="stat-value text-lg">{daten.kpis[k.key] ?? 0}</div>
              <div className="stat-label text-xs">{k.label}</div>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4" role="tablist">
        {[
          { id: 'aufgaben', label: 'Stationstasks' },
          { id: 'ergaenzung', label: 'Ergänzung' },
        ].map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={aktiverTab === t.id}
            className={`border-2 rounded px-5 py-2 font-semibold text-sm min-h-[44px] ${
              aktiverTab === t.id
                ? 'bg-jhh-primary text-white border-jhh-primary'
                : 'bg-white text-jhh-primary border-jhh-border hover:border-jhh-primary'
            }`}
            onClick={() => setAktiverTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-jhh-text-light">Team-Übersicht wird geladen …</p>
      )}

      {!loading && aktiverTab === 'aufgaben' && (
        <div className="space-y-3">
          {aufgabenGefiltert.length === 0 ? (
            <p className="text-jhh-text-light text-sm">Keine offenen Stationstasks in diesem Filter.</p>
          ) : (
            aufgabenGefiltert.map(a => (
              <div
                key={a.id}
                className={`card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  a.ueberfaellig ? 'border-l-4 border-l-jhh-danger' : ''
                }`}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold text-sm text-jhh-primary m-0">
                    {a.meldungsNr} – {AUFGABEN_TYP_LABEL[a.typ] || a.titel}
                    {a.eskaliert && (
                      <span className="ml-2 text-xs font-normal text-jhh-danger">(eskaliert)</span>
                    )}
                  </p>
                  <p className="text-xs text-jhh-text-light m-0">
                    {a.station && `${a.station} · `}
                    {formatDatumKurz(a.gesendetAm)}
                  </p>
                  <p className="text-xs m-0">
                    <span className="text-jhh-text-light">Bearbeiter: </span>
                    <span className="font-semibold text-jhh-primary">
                      {a.zugewiesenAnName || (a.zuweisung === 'gruppe' ? 'Gruppenaufgabe' : '–')}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    to={`/arbeitskorb/aufgabe/${encodeURIComponent(a.id)}`}
                    className="btn-secondary btn-sm min-h-[44px]"
                  >
                    Öffnen
                  </Link>
                  <button
                    type="button"
                    className="btn-primary btn-sm min-h-[44px] whitespace-nowrap"
                    onClick={() => setZuweisenZiel({
                      typ: 'aufgabe',
                      id: a.id,
                      label: `${a.meldungsNr} – ${a.titel}`,
                      station: a.station,
                      zugewiesenAn: a.zugewiesenAn,
                    })}
                  >
                    {a.zugewiesenAn ? 'Ummelden' : 'Verantwortlichkeit zuweisen'}
                  </button>
                  {a.zugewiesenAn && (
                    <button
                      type="button"
                      className="btn-secondary btn-sm min-h-[44px] whitespace-nowrap"
                      onClick={async () => {
                        if (!window.confirm('Aufgabe zurück an Gruppe geben?')) return
                        setZuweisenLaeuft(true)
                        try {
                          await apiRef.current.patch(
                            `/api/arbeitskorb/${encodeURIComponent(a.id)}/zuweisen`,
                            { zugewiesenAn: null },
                          )
                          await laden()
                        } catch (e) {
                          setFehler(e.message || 'Zurückgabe fehlgeschlagen.')
                        } finally {
                          setZuweisenLaeuft(false)
                        }
                      }}
                      disabled={zuweisenLaeuft}
                    >
                      An Gruppe
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && aktiverTab === 'ergaenzung' && (
        <div className="space-y-3">
          {ergaenzungGefiltert.length === 0 ? (
            <p className="text-jhh-text-light text-sm">Keine offenen Ergänzungs-Meldungen.</p>
          ) : (
            ergaenzungGefiltert.map(m => (
              <div
                key={m.id}
                className={`card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  m.ueberfaellig ? 'border-l-4 border-l-jhh-danger' : ''
                }`}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-jhh-primary text-sm">{m.meldungsNr}</span>
                    <span className="text-sm text-jhh-text">{getMeldungstypLabel(m.meldungsTyp)}</span>
                    <StatusBadge status={m.status} />
                    <span className="text-xs font-semibold text-jhh-warning bg-yellow-50 border border-jhh-warning px-2 py-0.5 rounded">
                      ↩ Ergänzung
                    </span>
                    {m.rueckgabeGrund && (
                      <span className="text-xs font-semibold text-jhh-secondary bg-blue-50 border border-jhh-secondary px-2 py-0.5 rounded">
                        {RUECKGABE_GRUND_LABEL[m.rueckgabeGrund] || m.rueckgabeGrund}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-jhh-text-light m-0">
                    {m.station && `Station: ${m.station}`}
                    {m.haftraum && ` · ${m.haftraum}`}
                    {m.gefangene && ` · ${m.gefangene.nachname}, ${m.gefangene.vorname}`}
                    {` · ${formatDatumKurz(m.erstelltAm)}`}
                  </p>
                  <p className="text-xs m-0">
                    <span className="text-jhh-text-light">Bearbeiter: </span>
                    <span className="font-semibold text-jhh-primary">
                      {m.zugewiesenAnName || '– (unzugewiesen)'}
                    </span>
                  </p>
                  {m.rueckgabeErgaenzung?.kommentar && (
                    <p className="text-xs text-jhh-warning m-0 line-clamp-2">
                      {m.rueckgabeErgaenzung.kommentar}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/meldungen/${m.id}`} className="btn-secondary btn-sm min-h-[44px]">
                    Öffnen
                  </Link>
                  <button
                    type="button"
                    className="btn-primary btn-sm min-h-[44px] whitespace-nowrap"
                    onClick={() => setZuweisenZiel({
                      typ: 'meldung',
                      id: m.id,
                      label: m.meldungsNr,
                      station: m.station,
                      zugewiesenAn: m.zugewiesenAn,
                    })}
                  >
                    {m.zugewiesenAn ? 'Ummelden' : 'Zuweisen'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ZuweisenDialog
        offen={!!zuweisenZiel}
        onSchliessen={() => setZuweisenZiel(null)}
        onBestaetigen={handleZuweisen}
        laedt={zuweisenLaeuft}
        titel={
          zuweisenZiel?.zugewiesenAn
            ? 'Aufgabe ummelden'
            : (zuweisenZiel?.typ === 'aufgabe' ? 'Verantwortlichkeit zuweisen' : 'Ergänzung zuweisen')
        }
        beschreibung={
          zuweisenZiel
            ? `${zuweisenZiel.label} – wählen Sie Station und Bearbeiter/in.`
            : undefined
        }
        defaultStation={zuweisenZiel?.station}
        avds={daten?.avds || []}
      />
    </div>
  )
}
