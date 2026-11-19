// ============================================================
// PrototypBanner.jsx – HEUREKA 2.0 | A2 eMeldewesen
// ============================================================

import { useNavigate } from 'react-router-dom'
import { useRolle, DEMO_NUTZER, getRolleLabel, getRolleAbkuerzung } from '../../context/RollenContext'

const ROLLEN_REIHENFOLGE = [
  { code: 'arbeitskoordination',   gruppe: 'Koordination (Zentrale)' },
  { code: 'anstaltsleitung',       gruppe: 'Leitungsebene' },
  { code: 'val',                   gruppe: 'Leitungsebene' },
  { code: 'dienstgruppenleitung',  gruppe: 'Leitungsebene' },
  { code: 'stationsleitung',       gruppe: 'Vollzugsdienst' },
  { code: 'avd',             gruppe: 'Vollzugsdienst' },
  { code: 'sonderdienst',    gruppe: 'Sonderdienst' },
]

function formatNutzerOptionLabel(n, compact = false) {
  const rolle = getRolleAbkuerzung(n.rolle) || getRolleLabel(n.rolle)
  if (compact) {
    const ort = n.station ? `Stat. ${n.station}` : n.abteilung
    return [rolle, n.name, ort].filter(Boolean).join(' · ')
  }
  const parts = [rolle, n.name, n.jva || null, n.abteilung || null, n.station ? `Stat. ${n.station}` : null]
  return parts.filter(Boolean).join(' · ')
}

export default function PrototypBanner() {
  const { aktiverNutzer, setAktiverNutzerId } = useRolle()
  const navigate = useNavigate()

  function handleNutzerWechsel(event) {
    const naechsteId = event.target.value
    if (naechsteId === aktiverNutzer.id) return
    setAktiverNutzerId(naechsteId)
    navigate('/dashboard')
  }

  const gruppen = {}
  for (const { code, gruppe } of ROLLEN_REIHENFOLGE) {
    const nutzer = DEMO_NUTZER.filter(n => n.rolle === code)
    if (nutzer.length === 0) continue
    if (!gruppen[gruppe]) gruppen[gruppe] = []
    gruppen[gruppe].push(...nutzer)
  }

  const bekannteRollen = new Set(ROLLEN_REIHENFOLGE.map(r => r.code))
  const weitereNutzer = DEMO_NUTZER.filter(n => !bekannteRollen.has(n.rolle))

  return (
    <div className="prototype-banner" role="banner" aria-label="Prototyp-Testmodus">
      <div className="page-container prototype-banner__row">
        <span className="prototype-banner__label font-bold">🔧 Prototyp</span>
        <label htmlFor="prototyp-nutzer-select" className="prototype-banner__label text-yellow-900">
          als
        </label>

        <select
          id="prototyp-nutzer-select"
          value={aktiverNutzer.id}
          onChange={handleNutzerWechsel}
          className="prototype-banner__select"
          aria-label="Testnutzer auswählen"
        >
          {Object.entries(gruppen).map(([gruppe, nutzer]) => (
            <optgroup key={gruppe} label={gruppe}>
              {nutzer.map(n => (
                <option key={n.id} value={n.id}>
                  {formatNutzerOptionLabel(n, true)}
                </option>
              ))}
            </optgroup>
          ))}
          {weitereNutzer.length > 0 && (
            <optgroup label="Weitere">
              {weitereNutzer.map(n => (
                <option key={n.id} value={n.id}>{formatNutzerOptionLabel(n, true)}</option>
              ))}
            </optgroup>
          )}
        </select>

        <span className="ml-auto prototype-banner__label text-yellow-800 hidden lg:inline truncate max-w-[12rem]">
          {getRolleLabel(aktiverNutzer.rolle)}
        </span>
      </div>
    </div>
  )
}
