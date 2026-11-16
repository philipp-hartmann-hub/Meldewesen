import { useState, useEffect, useRef, useCallback } from 'react'
import { useApiClient } from '../../api/client'

/**
 * Auswahl Gefangene/r aus PostgreSQL-Stammdaten (GET /api/gefangene), BASIS-Web-Ersatz.
 * Optional standortJva/standortHaus – nur Inhaftierte dieses Hafthauses (alle Stationen).
 * hafthausModus: Hinweistexte für Hauptbeteiligten-Auswahl (E-03).
 */
export default function GefangeneAutocomplete({
  value,
  onChange,
  required,
  id = 'gefangene',
  label = 'Gefangene/r',
  showHint = true,
  placeholder = '',
  className = '',
  standortJva = '',
  standortHaus = '',
  standortErforderlich = false,
  hafthausModus = false,
  disabled = false,
}) {
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api

  const [query, setQuery] = useState('')
  const [options, setOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [displayLabel, setDisplayLabel] = useState('')
  const [hinweis, setHinweis] = useState(null)
  const wrapRef = useRef(null)
  const lastFetchKeyRef = useRef('')
  const prevStandortKeyRef = useRef('')
  const optionsRef = useRef([])

  const jva = String(standortJva || '').trim()
  const haus = String(standortHaus || '').trim()
  const standortAktiv = Boolean(jva && haus)
  const istDeaktiviert = disabled || (standortErforderlich && !standortAktiv)

  const formatLabel = useCallback(
    g => (g ? `${g.nachname}, ${g.vorname} (${g.gefangenenNr})` : ''),
    [],
  )

  const ladeAusDb = useCallback(
    async ({ search, list }) => {
      if (standortErforderlich && !standortAktiv) return

      const fetchKey = JSON.stringify({
        search: search?.trim() || '',
        list: Boolean(list),
        jva: standortAktiv ? jva : '',
        haus: standortAktiv ? haus : '',
      })
      if (fetchKey === lastFetchKeyRef.current) return
      lastFetchKeyRef.current = fetchKey

      const ersteLadung = optionsRef.current.length === 0
      if (ersteLadung) setLoading(true)
      setHinweis(null)
      try {
        const params = new URLSearchParams()
        if (list) params.set('list', '1')
        else if (search?.trim()) params.set('search', search.trim())
        if (standortAktiv) {
          params.set('jva', jva)
          params.set('haus', haus)
        }
        const res = await apiRef.current.get(`/api/gefangene?${params.toString()}`)
        const rows = res.data || []
        optionsRef.current = rows
        setOptions(rows)
        if (!rows.length) {
          setHinweis(
            standortAktiv
              ? `Keine Gefangenen für „${jva} · ${haus}“ in der Stammdatenbank.`
              : list
                ? 'Keine Gefangenen in der Stammdatenbank für Ihre JVA. Bitte Seed ausführen (npm run seed).'
                : 'Kein Treffer in der Stammdatenbank. Mindestens 1 Zeichen oder Liste beim Fokus nutzen.',
          )
        }
      } catch (err) {
        optionsRef.current = []
        setOptions([])
        setHinweis(
          err.message?.includes('fetch')
            ? 'Stammdaten nicht erreichbar. Läuft das Backend (Port 3001)?'
            : err.message || 'Stammdaten konnten nicht geladen werden.',
        )
      } finally {
        setLoading(false)
      }
    },
    [standortErforderlich, standortAktiv, jva, haus],
  )

  useEffect(() => {
    if (!value?.id) {
      if (value?.nachname && value?.vorname && value?.gefangenenNr) {
        setDisplayLabel(formatLabel(value))
      } else if (value?.gefangenenNr || value?.nachname) {
        setDisplayLabel(formatLabel({
          nachname: value.nachname || '–',
          vorname: value.vorname || '',
          gefangenenNr: value.gefangenenNr || '',
        }))
      } else {
        setDisplayLabel('')
      }
      return
    }
    if (value.nachname && value.vorname && value.gefangenenNr) {
      setDisplayLabel(formatLabel(value))
      return
    }
    let cancelled = false
    apiRef.current.get(`/api/gefangene/${value.id}`)
      .then(res => {
        if (cancelled || !res.data) return
        setDisplayLabel(formatLabel(res.data))
      })
      .catch(() => {
        if (!cancelled && value.gefangenenNr) setDisplayLabel(value.gefangenenNr)
      })
    return () => { cancelled = true }
  }, [value?.id, value?.nachname, value?.vorname, value?.gefangenenNr, formatLabel])

  useEffect(() => {
    if (!open || istDeaktiviert) return
    const q = query.trim()
    if (q.length === 0) {
      ladeAusDb({ list: true })
      return
    }
    const t = setTimeout(() => ladeAusDb({ search: q }), 300)
    return () => clearTimeout(t)
  }, [query, open, ladeAusDb, istDeaktiviert])

  useEffect(() => {
    if (!standortErforderlich) return
    const key = standortAktiv ? `${jva}|||${haus}` : ''
    if (prevStandortKeyRef.current && prevStandortKeyRef.current !== key) {
      lastFetchKeyRef.current = ''
      optionsRef.current = []
      setOptions([])
      setOpen(false)
      setQuery('')
      setHinweis(null)
    }
    prevStandortKeyRef.current = key
  }, [standortErforderlich, standortAktiv, jva, haus])

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const defaultPlaceholder = standortAktiv
    ? (hafthausModus
      ? `Name oder Gefangenen-Nr. – gesamtes Hafthaus ${haus}`
      : 'Name oder Gefangenen-Nr. – gewähltes Hafthaus')
    : (hafthausModus
      ? 'Name oder Gefangenen-Nr. – kein Hafthaus zugeordnet (gesamte JVA)'
      : 'Name oder Gefangenen-Nr. – Klick zeigt Liste Ihrer JVA')

  const hintText = standortAktiv
    ? (hafthausModus
      ? `Alle Inhaftierten Ihres Hafthauses (${haus}) – alle Stationen, nicht nur Ihre Station.`
      : `Nur Inhaftierte des Hafthauses ${jva} · ${haus}.`)
    : (hafthausModus
      ? 'Ihrem Nutzer ist kein Hafthaus zugeordnet – Auswahl über die gesamte JVA (Prototyp-Ausnahme).'
      : 'Auswahl aus der Prototyp-Stammdatenbank (30 Demo-Datensätze, Mock BASIS-Web).')

  const eingabePlaceholder = placeholder || defaultPlaceholder
  const showLoading = loading && options.length === 0

  return (
    <div ref={wrapRef} className={`relative ${className}`.trim()}>
      <label htmlFor={id} className={required ? 'form-label form-label-required' : 'form-label'}>
        {label}
      </label>
      {showHint && (
        <p className="text-xs text-jhh-text-light mb-1" id={`${id}-hint`}>
          {hintText}
        </p>
      )}
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-describedby={showHint ? `${id}-hint` : undefined}
        aria-required={required ? 'true' : undefined}
        disabled={istDeaktiviert}
        value={open ? query : displayLabel}
        placeholder={
          istDeaktiviert && standortErforderlich && !standortAktiv
            ? 'Bitte wählen Sie zuerst Station bzw. Hafthaus.'
            : eingabePlaceholder
        }
        className={`form-input${istDeaktiviert ? ' opacity-60' : ''}`}
        onChange={e => {
          const next = e.target.value
          lastFetchKeyRef.current = ''
          setQuery(next)
          setOpen(true)
          if (!next.trim()) {
            setDisplayLabel('')
            onChange(null)
          }
        }}
        onFocus={() => {
          if (istDeaktiviert) return
          setOpen(true)
          const startText = displayLabel || (value ? formatLabel(value) : '')
          setQuery(startText)
          if (!startText.trim()) ladeAusDb({ list: true })
        }}
      />
      {open && !istDeaktiviert && (
        <ul
          className="absolute z-20 w-full mt-1 bg-white border border-jhh-border rounded shadow-lg max-h-48 overflow-auto"
          role="listbox"
        >
          {showLoading && (
            <li className="px-3 py-2 text-sm text-jhh-text-light">Lade Stammdaten …</li>
          )}
          {options.map(g => (
            <li key={g.id} role="option">
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-jhh-hover min-h-[44px]"
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  onChange(g)
                  setDisplayLabel(formatLabel(g))
                  setQuery('')
                  setOpen(false)
                  setHinweis(null)
                  lastFetchKeyRef.current = ''
                }}
              >
                <span className="font-semibold">{g.nachname}, {g.vorname}</span>
                <span className="text-jhh-text-light">
                  {' '}· {g.gefangenenNr} · {g.haus || g.jva}
                </span>
              </button>
            </li>
          ))}
          {!showLoading && loading && options.length > 0 && (
            <li className="px-3 py-2 text-sm text-jhh-text-light" aria-hidden="true">…</li>
          )}
          {!loading && hinweis && (
            <li className="px-3 py-2 text-sm text-jhh-warning" role="status">{hinweis}</li>
          )}
        </ul>
      )}
    </div>
  )
}
