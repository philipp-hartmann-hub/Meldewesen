import { useCallback, useEffect, useRef, useState } from 'react'
import { useApiClient } from '../../api/client'

export default function ZuweisenDialog({
  offen,
  onSchliessen,
  onBestaetigen,
  laedt = false,
  titel = 'Aufgabe zuweisen',
  beschreibung = 'Wählen Sie Station und Bearbeiter/in aus Ihrer JVA.',
  zielLabel = 'Bearbeiter/in',
  defaultStation = '',
  avds: avdsProp,
}) {
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api

  const [stationen, setStationen] = useState([])
  const [station, setStation] = useState('')
  const [personen, setPersonen] = useState([])
  const [zugewiesenAn, setZugewiesenAn] = useState('')
  const [suche, setSuche] = useState('')
  const [kommentar, setKommentar] = useState('')
  const [fehler, setFehler] = useState(null)
  const [ladenPersonen, setLadenPersonen] = useState(false)
  const erstesInputRef = useRef(null)

  const ladePersonen = useCallback(async (haus, search) => {
    if (avdsProp?.length) {
      const gefiltert = avdsProp.filter(a => !haus || a.abteilung === haus || a.station === haus)
      setPersonen(gefiltert.map(a => ({
        id: a.id,
        name: a.name,
        rolle: a.rolle,
        haus: a.abteilung || a.station,
      })))
      return
    }
    setLadenPersonen(true)
    try {
      const params = new URLSearchParams({ rolle: 'avd', limit: '50' })
      if (haus) params.set('haus', haus)
      if (search?.trim()) params.set('search', search.trim())
      const res = await apiRef.current.get(`/api/bedienstete?${params}`)
      const liste = (res.data || []).map(b => ({
        id: b.bediensteterID,
        name: b.bediensteterName,
        rolle: b.bediensteterRolle,
        haus: b.haus,
      }))
      setPersonen(liste)
    } catch {
      setPersonen([])
    } finally {
      setLadenPersonen(false)
    }
  }, [avdsProp])

  useEffect(() => {
    if (!offen) return
    setKommentar('')
    setFehler(null)
    setSuche('')
    setZugewiesenAn('')

    async function init() {
      if (avdsProp?.length) {
        const st = [...new Set(avdsProp.map(a => a.abteilung || a.station).filter(Boolean))]
        setStationen(st)
        const start = defaultStation && st.includes(defaultStation) ? defaultStation : (st[0] || '')
        setStation(start)
        await ladePersonen(start, '')
      } else {
        try {
          const res = await apiRef.current.get('/api/bedienstete/stationen/liste')
          const st = res.data || []
          setStationen(st)
          const start = defaultStation && st.includes(defaultStation) ? defaultStation : (st[0] || '')
          setStation(start)
          await ladePersonen(start, '')
        } catch {
          setStationen([])
        }
      }
      setTimeout(() => erstesInputRef.current?.focus(), 50)
    }
    init()
  }, [offen, defaultStation, avdsProp, ladePersonen])

  useEffect(() => {
    if (!offen || !station) return
    const t = setTimeout(() => ladePersonen(station, suche), suche ? 250 : 0)
    return () => clearTimeout(t)
  }, [offen, station, suche, ladePersonen])

  useEffect(() => {
    if (personen.length && !zugewiesenAn) {
      setZugewiesenAn(personen[0]?.id || '')
    } else if (personen.length && !personen.find(p => p.id === zugewiesenAn)) {
      setZugewiesenAn(personen[0]?.id || '')
    }
  }, [personen, zugewiesenAn])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && offen) onSchliessen()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [offen, onSchliessen])

  if (!offen) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!zugewiesenAn) {
      setFehler('Bitte wählen Sie einen Bearbeiter aus.')
      return
    }
    setFehler(null)
    onBestaetigen({ zugewiesenAn, kommentar: kommentar.trim() || undefined })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => { if (e.target === e.currentTarget) onSchliessen() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="zuweisen-titel"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 id="zuweisen-titel" className="text-lg font-bold text-jhh-primary mb-2">
              {titel}
            </h3>
            <p className="text-sm text-jhh-text mb-5">{beschreibung}</p>

            {fehler && (
              <p role="alert" className="text-sm text-jhh-danger mb-4">{fehler}</p>
            )}

            <div className="mb-4">
              <label htmlFor="zuweisen-station" className="form-label">
                Station <span className="text-jhh-danger">*</span>
              </label>
              <select
                id="zuweisen-station"
                ref={erstesInputRef}
                value={station}
                onChange={e => { setStation(e.target.value); setZugewiesenAn('') }}
                className="w-full border border-jhh-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
                required
              >
                {stationen.length === 0 ? (
                  <option value="">Keine Stationen verfügbar</option>
                ) : (
                  stationen.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))
                )}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="zuweisen-suche" className="form-label">
                Suche
              </label>
              <input
                id="zuweisen-suche"
                type="search"
                value={suche}
                onChange={e => setSuche(e.target.value)}
                placeholder="Name oder Kennung …"
                className="w-full border border-jhh-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="zuweisen-avd" className="form-label">
                {zielLabel} <span className="text-jhh-danger">*</span>
              </label>
              <select
                id="zuweisen-avd"
                value={zugewiesenAn}
                onChange={e => setZugewiesenAn(e.target.value)}
                className="w-full border border-jhh-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
                required
                disabled={ladenPersonen}
              >
                {ladenPersonen ? (
                  <option value="">Wird geladen …</option>
                ) : personen.length === 0 ? (
                  <option value="">Keine Bediensteten in dieser Station</option>
                ) : (
                  personen.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.rolle})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mb-2">
              <label htmlFor="zuweisen-kommentar" className="form-label">
                Kommentar (optional)
              </label>
              <textarea
                id="zuweisen-kommentar"
                value={kommentar}
                onChange={e => setKommentar(e.target.value)}
                rows={3}
                placeholder="z. B. Bitte bis morgen Zeugenaussage einholen"
                className="w-full border border-jhh-border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end px-6 pb-6 mt-2">
            <button type="button" className="btn-secondary" onClick={onSchliessen} disabled={laedt}>
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={laedt || !zugewiesenAn}
            >
              {laedt ? 'Wird zugewiesen …' : 'Zuweisen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
