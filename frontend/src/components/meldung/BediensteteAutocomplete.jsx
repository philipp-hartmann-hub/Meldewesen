import { useState, useEffect, useRef, useCallback } from 'react'
import { useApiClient } from '../../api/client'
import { getRolleLabel } from '../../context/RollenContext'

/**
 * Auswahl Bedienstete/r aus PostgreSQL-Stammdaten (GET /api/bedienstete), AD-Ersatz.
 */
export default function BediensteteAutocomplete({
  value,
  onChange,
  required,
  id = 'bediensteter',
  label = 'Bedienstete/r',
  showHint = true,
  placeholder = 'Name oder Personal-ID – Klick zeigt Liste Ihrer JVA',
  className = '',
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
  const optionsRef = useRef([])

  const formatLabel = useCallback(
    b => (b ? `${b.bediensteterName} (${b.bediensteterID})` : ''),
    [],
  )

  const ladeAusDb = useCallback(
    async ({ search, list }) => {
      const fetchKey = JSON.stringify({
        search: search?.trim() || '',
        list: Boolean(list),
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
        const res = await apiRef.current.get(`/api/bedienstete?${params.toString()}`)
        const rows = res.data || []
        optionsRef.current = rows
        setOptions(rows)
        if (!rows.length) {
          setHinweis(
            list
              ? 'Keine Bediensteten in der Stammdatenbank für Ihre JVA. Bitte Seed ausführen (npm run seed).'
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
    [],
  )

  useEffect(() => {
    if (!value?.id) {
      setDisplayLabel(value?.bediensteterName || '')
      return
    }
    if (value.bediensteterName && value.bediensteterID) {
      setDisplayLabel(formatLabel(value))
      return
    }
    let cancelled = false
    apiRef.current.get(`/api/bedienstete/${value.id}`)
      .then(res => {
        if (cancelled || !res.data) return
        setDisplayLabel(formatLabel(res.data))
      })
      .catch(() => {
        if (!cancelled && value.bediensteterName) setDisplayLabel(value.bediensteterName)
      })
    return () => { cancelled = true }
  }, [value?.id, value?.bediensteterName, value?.bediensteterID, formatLabel])

  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (q.length === 0) {
      ladeAusDb({ list: true })
      return
    }
    const t = setTimeout(() => ladeAusDb({ search: q }), 300)
    return () => clearTimeout(t)
  }, [query, open, ladeAusDb])

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const showLoading = loading && options.length === 0

  return (
    <div ref={wrapRef} className={`relative ${className}`.trim()}>
      <label htmlFor={id} className={required ? 'form-label form-label-required' : 'form-label'}>
        {label}
      </label>
      {showHint && (
        <p className="text-xs text-jhh-text-light mb-1" id={`${id}-hint`}>
          Auswahl aus der Prototyp-Stammdatenbank (Demo-Bedienstete, Mock Active Directory).
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
        value={open ? query : displayLabel}
        placeholder={placeholder}
        className="form-input"
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
          setOpen(true)
          const startText = displayLabel || (value ? formatLabel(value) : '')
          setQuery(startText)
          if (!startText.trim()) ladeAusDb({ list: true })
        }}
      />
      {open && (
        <ul
          className="absolute z-20 w-full mt-1 bg-white border border-jhh-border rounded shadow-lg max-h-48 overflow-auto"
          role="listbox"
        >
          {showLoading && (
            <li className="px-3 py-2 text-sm text-jhh-text-light">Lade Stammdaten …</li>
          )}
          {options.map(b => (
            <li key={b.id} role="option">
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-jhh-hover min-h-[44px]"
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  onChange(b)
                  setDisplayLabel(formatLabel(b))
                  setQuery('')
                  setOpen(false)
                  setHinweis(null)
                  lastFetchKeyRef.current = ''
                }}
              >
                <span className="font-semibold">{b.bediensteterName}</span>
                <span className="text-jhh-text-light">
                  {' '}· {b.bediensteterID} · {getRolleLabel(b.bediensteterRolle)} · {b.bediensteterJVA}
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
