import { useEffect, useMemo, useRef, useState } from 'react'
import { filterTatortOptionen, istGueltigerTatort } from '../../constants/tatorte'

/**
 * Tatort-Auswahl aus Prototyp-Stammliste (Autocomplete, alphabetisch sortiert).
 */
export default function TatortAutocomplete({
  id = 'tatort',
  value = '',
  onChange,
  required = false,
  label = 'Tatort',
  placeholder = 'Tatort suchen oder aus Liste wählen …',
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const optionen = useMemo(
    () => filterTatortOptionen(open ? query : value),
    [open, query, value]
  )

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function waehle(option) {
    onChange(option)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className={required ? 'form-label form-label-required' : 'form-label'}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-required={required ? 'true' : undefined}
        className="form-input"
        value={open ? query : value}
        placeholder={placeholder}
        onChange={e => {
          const next = e.target.value
          setQuery(next)
          setOpen(true)
          if (!next.trim()) onChange('')
        }}
        onFocus={() => {
          setOpen(true)
          setQuery(value || '')
        }}
      />
      {open && (
        <ul
          className="absolute z-20 w-full mt-1 bg-white border border-jhh-border rounded shadow-lg max-h-48 overflow-auto"
          role="listbox"
        >
          {optionen.map(option => (
            <li key={option} role="option" aria-selected={value === option}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-jhh-hover min-h-[44px]"
                onClick={() => waehle(option)}
              >
                {option}
              </button>
            </li>
          ))}
          {!optionen.length && (
            <li className="px-3 py-2 text-sm text-jhh-text-light" role="status">
              Kein Treffer – bitte einen Tatort aus der Liste wählen.
            </li>
          )}
        </ul>
      )}
      <p className="text-xs text-jhh-text-light mt-1">
        Ort des Geschehens (Wo).
        {value && !istGueltigerTatort(value) && (
          <span className="text-jhh-warning"> Gespeicherter Wert liegt nicht in der aktuellen Stammliste.</span>
        )}
      </p>
    </div>
  )
}
