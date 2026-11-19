import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import FallStatusBadge from '../shared/FallStatusBadge'
import { useApiClient } from '../../api/client'
import { useRolle } from '../../context/RollenContext'
import { formatDatumKurz, formatGefangene, formatTatzeit, getMeldungstypLabel } from '../../utils/meldungen'

export default function FallBuendelungPanel({ embedded = false }) {
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api
  const { darfBuendeln, darfFallPruefen, istAL, istVAL, istStationsleitung } = useRolle()

  const [faelle, setFaelle] = useState([])
  const [ungebundene, setUngebundene] = useState([])
  const [vorschlaege, setVorschlaege] = useState([])
  const [auswahl, setAuswahl] = useState(new Set())
  const [bezeichnung, setBezeichnung] = useState('')
  const [laden, setLaden] = useState(true)
  const [fehler, setFehler] = useState('')
  const [meldung, setMeldung] = useState('')
  const [speichern, setSpeichern] = useState(false)

  const ladenDaten = useCallback(async () => {
    setLaden(true)
    setFehler('')
    try {
      const reqs = [apiRef.current.get('/api/faelle')]
      if (darfBuendeln) {
        reqs.push(apiRef.current.get('/api/faelle/ungebundene-meldungen'))
        reqs.push(apiRef.current.get('/api/faelle/buendlungs-vorschlaege'))
      }
      const results = await Promise.all(reqs)
      setFaelle(results[0].data || [])
      if (darfBuendeln) {
        setUngebundene(results[1]?.data || [])
        setVorschlaege(results[2]?.data || [])
      }
    } catch (e) {
      setFehler(e.message || 'Daten konnten nicht geladen werden.')
    } finally {
      setLaden(false)
    }
  }, [darfBuendeln])

  useEffect(() => { ladenDaten() }, [ladenDaten])

  function toggleAuswahl(id) {
    setAuswahl(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function waehleVorschlagGruppe(meldungIds) {
    setAuswahl(new Set(meldungIds))
    const erste = ungebundene.find(m => meldungIds.includes(m.id))
    const meta = erste?.metadaten || {}
    if (!bezeichnung && (meta.tatort || meta.tatzeit)) {
      const zeit = meta.tatzeit ? formatTatzeit(meta.tatzeit) : ''
      setBezeichnung([meta.tatort, zeit].filter(Boolean).join(', '))
    }
  }

  async function handleFallAnlegen(e) {
    e.preventDefault()
    if (auswahl.size === 0) {
      setFehler('Bitte wählen Sie mindestens eine Meldung aus.')
      return
    }
    setSpeichern(true)
    setFehler('')
    try {
      const res = await apiRef.current.post('/api/faelle', {
        bezeichnung: bezeichnung.trim() || undefined,
        meldungIds: [...auswahl],
      })
      setMeldung(res.message || 'Fall angelegt.')
      setBezeichnung('')
      setAuswahl(new Set())
      await ladenDaten()
    } catch (err) {
      setFehler(err.message || 'Fall konnte nicht angelegt werden.')
    } finally {
      setSpeichern(false)
    }
  }

  const titel = darfBuendeln
    ? 'Fall-Bündelung (Zentrale)'
    : darfFallPruefen
      ? 'Fall-Prüfung (Dienstgruppenleitung)'
      : istStationsleitung
        ? 'Fallmeldungen (Stationsleitung)'
        : 'Fälle & ERV (AL/VAL)'

  const beschreibung = darfBuendeln
    ? 'Einzelmeldungen zum gleichen Vorfall bündeln und gebündelt an die Dienstgruppenleitung weiterleiten.'
    : darfFallPruefen
      ? 'Gebündelte Fälle prüfen, ggf. an die Zentrale zurückgeben oder an die Stationsleitung weiterleiten.'
      : istStationsleitung
        ? 'Fallmeldungen an AL/VAL zur Meldepflicht-Entscheidung weiterleiten.'
        : 'Meldepflicht entscheiden sowie versandfähig, beBPo und eGPA am Fall bearbeiten.'

  if (!darfBuendeln && !darfFallPruefen && !istAL && !istVAL && !istStationsleitung) return null

  return (
    <div className={embedded ? '' : 'section-card'}>
      {!embedded && (
        <header className="mb-4">
          <h2 className="text-xl font-bold text-jhh-primary m-0">{titel}</h2>
          <p className="text-sm text-jhh-text-light mt-1 mb-0">{beschreibung}</p>
        </header>
      )}

      {fehler && (
        <p className="text-jhh-danger text-sm mb-3" role="alert">{fehler}</p>
      )}
      {meldung && (
        <p className="text-jhh-success text-sm mb-3" role="status">{meldung}</p>
      )}

      {laden ? (
        <p className="text-jhh-text-light text-sm">Lade Fälle …</p>
      ) : (
        <>
          {darfBuendeln && vorschlaege.length > 0 && (
            <section className="mb-6 p-4 rounded border border-jhh-secondary bg-blue-50" aria-labelledby="vorschlaege-kopf">
              <h3 id="vorschlaege-kopf" className="text-base font-bold text-jhh-primary mb-2">
                Bündelungsvorschläge (gleiche Tatzeit/Tatort)
              </h3>
              <p className="text-sm text-jhh-text-light mb-3 m-0">
                Verschiedene aVD-Perspektiven zum wahrscheinlich gleichen Vorfall – nur Assistenz, keine Auto-Bündelung.
              </p>
              <ul className="space-y-3 list-none p-0 m-0">
                {vorschlaege.map((gruppe, idx) => (
                  <li key={idx} className="flex flex-wrap items-center justify-between gap-2 bg-white rounded p-3 border border-jhh-border">
                    <div className="text-sm">
                      <span className="font-semibold text-jhh-primary">
                        {gruppe.meldungen.length} Meldungen
                      </span>
                      {gruppe.tatort && <span className="ml-2">📍 {gruppe.tatort}</span>}
                      {gruppe.tatzeit && <span className="ml-2">🕐 {formatTatzeit(gruppe.tatzeit)}</span>}
                      <span className="block text-xs text-jhh-text-light mt-1">
                        {gruppe.meldungen.map(m => m.meldungsNr).join(' · ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => waehleVorschlagGruppe(gruppe.meldungen.map(m => m.id))}
                      className="btn-secondary btn-sm min-h-[44px]"
                    >
                      Alle auswählen
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {darfBuendeln && (
            <section className="mb-8" aria-labelledby="ungebundene-kopf">
              <h3 id="ungebundene-kopf" className="text-base font-bold text-jhh-primary mb-2">
                Eingereichte Einzelmeldungen ohne Fall ({ungebundene.length})
              </h3>
              {ungebundene.length === 0 ? (
                <p className="text-sm text-jhh-text-light">Derzeit keine ungebundenen Einzelmeldungen.</p>
              ) : (
                <form onSubmit={handleFallAnlegen}>
                  <div className="overflow-x-auto mb-4">
                    <table className="data-table w-full text-sm">
                      <thead>
                        <tr>
                          <th className="w-10"><span className="sr-only">Auswahl</span></th>
                          <th>Nr.</th>
                          <th>Typ</th>
                          <th>aVD</th>
                          <th>Gefangene/r</th>
                          <th>Eingereicht</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ungebundene.map(m => (
                          <tr key={m.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={auswahl.has(m.id)}
                                onChange={() => toggleAuswahl(m.id)}
                                aria-label={`Meldung ${m.meldungsNr} auswählen`}
                                className="w-5 h-5"
                              />
                            </td>
                            <td>
                              <Link to={`/meldungen/${m.id}`} className="text-jhh-secondary font-semibold hover:underline">
                                {m.meldungsNr}
                              </Link>
                            </td>
                            <td>{getMeldungstypLabel(m.meldungsTyp)}</td>
                            <td>{m.zustaendig?.bediensteterName || '–'}</td>
                            <td>{formatGefangene(m.gefangene)}</td>
                            <td>{formatDatumKurz(m.erstelltAm)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="flex-1 w-full">
                      <label htmlFor="fall-bezeichnung" className="block text-sm font-semibold mb-1">
                        Fallbezeichnung (optional)
                      </label>
                      <input
                        id="fall-bezeichnung"
                        type="text"
                        value={bezeichnung}
                        onChange={e => setBezeichnung(e.target.value)}
                        placeholder="z. B. Auseinandersetzung Hof, 10.05.2026"
                        className="input-field w-full"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={speichern || auswahl.size === 0}
                      className="btn-primary min-h-[44px] whitespace-nowrap"
                    >
                      {speichern ? 'Wird angelegt …' : `Fall bündeln (${auswahl.size})`}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          <section aria-labelledby="faelle-kopf">
            <h3 id="faelle-kopf" className="text-base font-bold text-jhh-primary mb-2">
              {darfBuendeln ? 'Meine Fälle' : 'Offene Fälle'} ({faelle.length})
            </h3>
            {faelle.length === 0 ? (
              <p className="text-sm text-jhh-text-light">Keine Fälle in diesem Bereich.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table w-full text-sm">
                  <thead>
                    <tr>
                      <th>Fall-Nr.</th>
                      <th>Bezeichnung</th>
                      <th>Status</th>
                      <th>Meldungen</th>
                      <th>Aktualisiert</th>
                      <th><span className="sr-only">Aktion</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {faelle.map(f => (
                      <tr key={f.id}>
                        <td className="font-semibold">{f.fallNr}</td>
                        <td>{f.bezeichnung || '–'}</td>
                        <td><FallStatusBadge status={f.status} /></td>
                        <td>{f.meldungen?.length ?? 0}</td>
                        <td>{formatDatumKurz(f.aktualisiertAm)}</td>
                        <td>
                          <Link
                            to={`/faelle/${f.id}`}
                            className="text-jhh-secondary font-semibold hover:underline min-h-[44px] inline-flex items-center"
                          >
                            Öffnen →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
