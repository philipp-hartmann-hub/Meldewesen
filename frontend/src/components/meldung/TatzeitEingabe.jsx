import { useEffect, useId, useRef, useState } from 'react'
import { parseTatzeitParts, buildTatzeitFromParts } from '../../utils/meldungen'

const STUNDEN = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTEN = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const MONATE = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MONAT_LABELS = {
  '01': 'Januar', '02': 'Februar', '03': 'März', '04': 'April',
  '05': 'Mai', '06': 'Juni', '07': 'Juli', '08': 'August',
  '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Dezember',
}
const JAHRE = Array.from({ length: 16 }, (_, i) => String(2020 + i))

function KalenderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function UhrIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function usePickerPanel() {
  const [offen, setOffen] = useState(false)
  const wrapRef = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (!offen) return undefined
    function handleEscape(e) {
      if (e.key === 'Escape') setOffen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [offen])

  return {
    offen,
    setOffen,
    wrapRef,
    panelId,
    toggle: () => setOffen(v => !v),
    close: () => setOffen(false),
  }
}

function PickerFeld({
  id,
  label,
  value,
  placeholder,
  icon,
  disabled,
  required,
  panelLabel,
  offen,
  panelId,
  wrapRef,
  onToggle,
  onCommit,
  fehler,
  children,
}) {
  return (
    <div className="min-w-[180px] flex-1" ref={wrapRef}>
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="form-input-picker-wrap">
        <button
          type="button"
          id={id}
          className="form-input form-input-picker tatzeit-picker-trigger"
          onClick={onToggle}
          disabled={disabled}
          aria-expanded={offen}
          aria-haspopup="dialog"
          aria-controls={panelId}
          aria-required={required ? 'true' : undefined}
        >
          <span className={value ? 'text-jhh-text' : 'text-jhh-text-light'}>
            {value || placeholder}
          </span>
        </button>
        <span className="form-input-picker-icon" aria-hidden="true">
          {icon}
        </span>

        {offen && (
          <div
            id={panelId}
            role="dialog"
            aria-label={panelLabel}
            className="tatzeit-picker-panel"
            onMouseDown={e => e.stopPropagation()}
          >
            {children}
            {fehler && (
              <p role="alert" className="text-xs text-jhh-danger mt-2">{fehler}</p>
            )}
            <button
              type="button"
              className="btn-primary btn-sm w-full mt-3"
              onClick={onCommit}
            >
              Übernehmen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function parseDatum(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { day: '', month: '', year: '' }
  }
  const [year, month, day] = value.split('-')
  return { day, month, year }
}

function formatDatumAnzeige(value) {
  const { day, month, year } = parseDatum(value)
  if (!day || !month || !year) return ''
  return `${day}.${month}.${year}`
}

function tageImMonat(year, month) {
  if (!year || !month) return 31
  return new Date(Number(year), Number(month), 0).getDate()
}

function buildDatumParts(day, month, year) {
  if (!year || !month || !day) return ''
  return `${year}-${month}-${day}`
}

function clampTag(day, month, year) {
  if (!day) return ''
  const max = tageImMonat(year, month)
  return String(Math.min(Number(day), max)).padStart(2, '0')
}

function DatumPicker({ id, label, value, onChange, disabled, required }) {
  const { offen, wrapRef, panelId, toggle, close } = usePickerPanel()
  const [draft, setDraft] = useState(() => parseDatum(value))
  const [fehler, setFehler] = useState(null)

  useEffect(() => {
    if (offen) {
      setDraft(parseDatum(value))
      setFehler(null)
    }
  }, [offen, value])

  const maxTage = tageImMonat(draft.year, draft.month)
  const tage = Array.from({ length: maxTage }, (_, i) => String(i + 1).padStart(2, '0'))

  function updateDraft(parts) {
    setFehler(null)
    setDraft(prev => {
      const next = {
        day: parts.day ?? prev.day,
        month: parts.month ?? prev.month,
        year: parts.year ?? prev.year,
      }
      next.day = clampTag(next.day, next.month, next.year)
      return next
    })
  }

  function handleCommit() {
    const result = buildDatumParts(draft.day, draft.month, draft.year)
    if (!result) {
      setFehler('Bitte wählen Sie Tag, Monat und Jahr.')
      return
    }
    onChange(result)
    close()
  }

  return (
    <PickerFeld
      id={id}
      label={label}
      value={formatDatumAnzeige(value)}
      placeholder="Datum wählen …"
      icon={<KalenderIcon />}
      disabled={disabled}
      required={required}
      panelLabel="Datum auswählen"
      offen={offen}
      panelId={panelId}
      wrapRef={wrapRef}
      onToggle={() => !disabled && toggle()}
      onCommit={handleCommit}
      fehler={fehler}
    >
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <label htmlFor={`${id}-tag`} className="form-label text-xs">Tag</label>
          <select
            id={`${id}-tag`}
            className="form-input py-2 min-h-[44px]"
            value={draft.day}
            onChange={e => updateDraft({ day: e.target.value })}
          >
            <option value="">–</option>
            {tage.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-0">
          <label htmlFor={`${id}-monat`} className="form-label text-xs">Monat</label>
          <select
            id={`${id}-monat`}
            className="form-input py-2 min-h-[44px]"
            value={draft.month}
            onChange={e => updateDraft({ month: e.target.value })}
          >
            <option value="">–</option>
            {MONATE.map(m => (
              <option key={m} value={m}>{MONAT_LABELS[m]}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-0">
          <label htmlFor={`${id}-jahr`} className="form-label text-xs">Jahr</label>
          <select
            id={`${id}-jahr`}
            className="form-input py-2 min-h-[44px]"
            value={draft.year}
            onChange={e => updateDraft({ year: e.target.value })}
          >
            <option value="">–</option>
            {JAHRE.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>
      </div>
    </PickerFeld>
  )
}

function parseUhrzeit(value) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return { hour: '', minute: '' }
  }
  const [hour, minute] = value.split(':')
  return { hour, minute }
}

function UhrzeitPicker({ id, label, value, onChange, disabled, required }) {
  const { offen, wrapRef, panelId, toggle, close } = usePickerPanel()
  const [draft, setDraft] = useState(() => parseUhrzeit(value))
  const [fehler, setFehler] = useState(null)

  useEffect(() => {
    if (offen) {
      setDraft(parseUhrzeit(value))
      setFehler(null)
    }
  }, [offen, value])

  function handleCommit() {
    if (!draft.hour) {
      setFehler('Bitte wählen Sie eine Stunde.')
      return
    }
    onChange(`${draft.hour}:${draft.minute || '00'}`)
    close()
  }

  return (
    <PickerFeld
      id={id}
      label={label}
      value={value}
      placeholder="Uhrzeit wählen …"
      icon={<UhrIcon />}
      disabled={disabled}
      required={required}
      panelLabel="Uhrzeit auswählen"
      offen={offen}
      panelId={panelId}
      wrapRef={wrapRef}
      onToggle={() => !disabled && toggle()}
      onCommit={handleCommit}
      fehler={fehler}
    >
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <label htmlFor={`${id}-stunde`} className="form-label text-xs">Stunde</label>
          <select
            id={`${id}-stunde`}
            className="form-input py-2 min-h-[44px]"
            value={draft.hour}
            onChange={e => {
              setFehler(null)
              setDraft(prev => ({ ...prev, hour: e.target.value }))
            }}
          >
            <option value="">–</option>
            {STUNDEN.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-0">
          <label htmlFor={`${id}-minute`} className="form-label text-xs">Minute</label>
          <select
            id={`${id}-minute`}
            className="form-input py-2 min-h-[44px]"
            value={draft.minute}
            onChange={e => {
              setFehler(null)
              setDraft(prev => ({ ...prev, minute: e.target.value }))
            }}
          >
            <option value="">–</option>
            {MINUTEN.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
    </PickerFeld>
  )
}

export default function TatzeitEingabe({
  id = 'tatzeit',
  value,
  onChange,
  required = false,
  disabled = false,
}) {
  const { date: storedDate, time: storedTime } = parseTatzeitParts(value)
  const [datePart, setDatePart] = useState(storedDate)
  const [timePart, setTimePart] = useState(storedTime)

  useEffect(() => {
    const { date, time } = parseTatzeitParts(value)
    setDatePart(date)
    if (date || time) {
      setTimePart(time)
    }
  }, [value])

  function handleDateChange(nextDate) {
    setDatePart(nextDate)
    onChange(buildTatzeitFromParts(nextDate, timePart))
  }

  function handleTimeChange(nextTime) {
    setTimePart(nextTime)
    if (datePart) {
      onChange(buildTatzeitFromParts(datePart, nextTime))
    }
  }

  return (
    <fieldset className="border-0 p-0 m-0 min-w-0">
      <legend className={`form-label mb-2 ${required ? 'form-label-required' : ''}`}>
        Tatzeit
      </legend>
      <div className="flex flex-wrap gap-4">
        <DatumPicker
          id={`${id}-datum`}
          label="Datum"
          value={datePart}
          onChange={handleDateChange}
          disabled={disabled}
          required={required}
        />
        <UhrzeitPicker
          id={`${id}-uhrzeit`}
          label="Uhrzeit"
          value={timePart}
          onChange={handleTimeChange}
          disabled={disabled}
          required={required}
        />
      </div>
      <p className="text-xs text-jhh-text-light mt-1">
        Datum und Uhrzeit des Geschehens (Hamburg). Klick auf ein Feld öffnet die Auswahl.
      </p>
    </fieldset>
  )
}
