// ============================================================
// RollenContext.jsx – HEUREKA 2.0 | A2 eMeldewesen
// NICHT VERÄNDERN ohne Abstimmung mit Lukas
//
// Rollenarchitektur:
// - Kanonische Rollennamen: LOWERCASE, keine Aliase
// - Hierarchie: anstaltsleitung > val > stationsleitung > avd
// - Neue Rollen hinzufügen: ROLLEN_CONFIG + BERECHTIGUNGEN + DEMO_NUTZER
//   + PrototypBanner.jsx ROLLEN_REIHENFOLGE
// - Fachdienste (sozialdienst, medizin, pforte etc.) – zurückgestellt,
//   Platzhalter unten vorhanden
// ============================================================

import { createContext, useContext, useState } from 'react'

// ============================================================
// ROLLEN-REGISTRY
// Um eine neue Rolle hinzuzufügen:
// 1. Eintrag in ROLLEN_CONFIG ergänzen
// 2. Eintrag in BERECHTIGUNGEN ergänzen
// 3. Demo-Nutzer in DEMO_NUTZER ergänzen
// 4. Rolle in PrototypBanner.jsx → ROLLEN_REIHENFOLGE aufnehmen
// 5. backend/src/middleware/mockAuth.js → GUELTIGE_ROLLEN
// 6. backend/prisma/schema.prisma → RolleTyp-Enum
// ============================================================
export const ROLLEN_CONFIG = {
  // ---- Leitungsebene ----
  anstaltsleitung: {
    label: 'Anstaltsleitung',
    abkuerzung: 'AL',
    beschreibung: 'Leitung der gesamten Anstalt',
    typ: 'leitung',
    aliases: [],
  },
  val: {
    label: 'Vollzugsabteilungsleitung',
    abkuerzung: 'VAL',
    beschreibung: 'Leitung einer Vollzugsabteilung',
    typ: 'leitung',
    aliases: [],
  },
  dienstgruppenleitung: {
    label: 'Dienstgruppenleitung',
    abkuerzung: 'DGL',
    beschreibung: 'Qualitätsprüfung gebündelter Meldungen vor Weiterleitung an Anstaltsleitung',
    typ: 'leitung',
    aliases: [],
  },
  // ---- Vollzugsdienst ----
  stationsleitung: {
    label: 'Stationsleitung',
    abkuerzung: 'SL',
    beschreibung: 'Stationsleitung / Wohngruppenleitung (JVA-abhängige Bezeichnung)',
    typ: 'vollzug',
    aliases: [],
  },
  avd: {
    label: 'Allgemeiner Vollzugsdienst',
    abkuerzung: 'aVD',
    beschreibung: 'Allgemeiner Vollzugsdienst',
    typ: 'vollzug',
    aliases: [],
  },
  sonderdienst: {
    label: 'Sonderdienst',
    abkuerzung: 'SD',
    beschreibung: 'Psychologie, Sozialdienst, Medizin, Seelsorge, Werkdienst',
    typ: 'sonderdienst',
    aliases: [],
  },
  // ---- Sonderdienste (Legacy-Prototyp) ----
  kammer: {
    label: 'Kammer',
    abkuerzung: '',
    beschreibung: 'Kammerdienst',
    typ: 'sonderdienst',
    aliases: [],
  },
  zahlstelle: {
    label: 'Zahlstelle',
    abkuerzung: '',
    beschreibung: 'Zahlstelle',
    typ: 'sonderdienst',
    aliases: [],
  },
  arbeitskoordination: {
    label: 'Arbeitskoordination (Zentrale)',
    abkuerzung: 'AK',
    beschreibung: 'Zentrale Meldewesen – Bündelung gleicher Fälle, Koordination vor DGL',
    typ: 'sonderdienst',
    aliases: [],
  },
  // ---- Fachdienste (zurückgestellt) ----
  // Platzhalter – bei Bedarf auskommentieren + BERECHTIGUNGEN ergänzen:
  // sozialdienst:   { label: 'Sozialdienst',         abkuerzung: '', typ: 'fachdienst', aliases: [] },
  // medizin:        { label: 'Medizinischer Dienst',  abkuerzung: '', typ: 'fachdienst', aliases: [] },
  // pforte:         { label: 'Pforte',                abkuerzung: '', typ: 'fachdienst', aliases: [] },
  // werkdienst:     { label: 'Werkdienst',            abkuerzung: '', typ: 'fachdienst', aliases: [] },
  // psychologie:    { label: 'Psychologischer Dienst',abkuerzung: '', typ: 'fachdienst', aliases: [] },
  // ---- Admin ----
  admin: {
    label: 'Admin',
    abkuerzung: 'Admin',
    beschreibung: 'IT-Administration (Prototyp: alle JVAs)',
    typ: 'admin',
    aliases: [],
  },
}

// Kanonischen Rollennamen ermitteln (keine Aliase mehr, aber Fallback bleibt)
export function normalisiereRolle(rolle) {
  if (!rolle) return 'avd'
  const r = String(rolle).toLowerCase().trim()
  // Keine Aliase mehr – direkt zurückgeben wenn bekannt
  if (ROLLEN_CONFIG[r]) return r
  return r
}

export function getRolleLabel(rolle) {
  const canonical = normalisiereRolle(rolle)
  return ROLLEN_CONFIG[canonical]?.label || rolle
}

export function getRolleAbkuerzung(rolle) {
  const canonical = normalisiereRolle(rolle)
  return ROLLEN_CONFIG[canonical]?.abkuerzung || rolle.toUpperCase()
}

export function istLeitung(rolle) {
  return ['anstaltsleitung', 'val'].includes(normalisiereRolle(rolle))
}

export function istSonderdienst(rolle) {
  return normalisiereRolle(rolle) === 'sonderdienst'
}

// ============================================================
// BERECHTIGUNGEN – pro Rolle
// Sichtbereich:
//   avd / stationsleitung → eigene Station
//   val                   → eigene Vollzugsabteilung
//   anstaltsleitung       → gesamte Anstalt (alle Abteilungen, aber nur eigene JVA)
//   admin                 → alle JVAs
// ============================================================
const BERECHTIGUNGEN = {
  anstaltsleitung: {
    kannMeldungErstellen:     true,
    kannMeldungBearbeiten:    true,
    siehtEigeneStation:       true,
    siehtEigeneAbteilung:     true,
    siehtGesamteAnstalt:      true,   // alle Abteilungen der eigenen JVA
    siehtAlleJVAs:            false,
    darfWeiterleiten:         true,
    darfVerakten:             true,
    darfXJustizSenden:        true,
    darfMeldungAbschliessen:  true,
  },
  val: {
    kannMeldungErstellen:     true,
    kannMeldungBearbeiten:    true,
    siehtEigeneStation:       true,
    siehtEigeneAbteilung:     true,
    siehtGesamteAnstalt:      false,
    siehtAlleJVAs:            false,
    darfWeiterleiten:         true,
    darfVerakten:             true,
    darfXJustizSenden:        true,
    darfMeldungAbschliessen:  true,
  },
  dienstgruppenleitung: {
    kannMeldungErstellen:     false,
    kannMeldungBearbeiten:    true,
    siehtEigeneStation:       false,
    siehtEigeneAbteilung:     false,
    siehtGesamteAnstalt:      true,
    siehtAlleJVAs:            false,
    darfWeiterleiten:         true,
    darfVerakten:             false,
    darfXJustizSenden:        false,
    darfMeldungAbschliessen:  false,
    darfBuendeln:             false,
    darfFallPruefen:          true,
  },
  stationsleitung: {
    kannMeldungErstellen:     true,
    kannMeldungBearbeiten:    true,
    siehtEigeneStation:       true,
    siehtEigeneAbteilung:     false,
    siehtGesamteAnstalt:      false,
    siehtAlleJVAs:            false,
    darfWeiterleiten:         true,
    darfVerakten:             false,
    darfXJustizSenden:        false,
    darfMeldungAbschliessen:  false,
  },
  avd: {
    kannMeldungErstellen:     true,
    kannMeldungBearbeiten:    true,
    siehtEigeneStation:       true,
    siehtEigeneAbteilung:     false,
    siehtGesamteAnstalt:      false,
    siehtAlleJVAs:            false,
    darfWeiterleiten:         true,
    darfVerakten:             false,
    darfXJustizSenden:        false,
    darfMeldungAbschliessen:  false,
  },
  sonderdienst: {
    kannMeldungErstellen:     false,
    kannMeldungBearbeiten:    true,
    siehtEigeneStation:       false,
    siehtEigeneAbteilung:     true,
    siehtGesamteAnstalt:      true,
    siehtAlleJVAs:            false,
    darfWeiterleiten:         false,
    darfVerakten:             false,
    darfXJustizSenden:        false,
    darfMeldungAbschliessen:  false,
  },
  kammer: {
    kannMeldungErstellen:     true,
    kannMeldungBearbeiten:    true,
    siehtEigeneStation:       false,
    siehtEigeneAbteilung:     false,
    siehtGesamteAnstalt:      false,
    siehtAlleJVAs:            false,
    darfWeiterleiten:         true,
    darfVerakten:             false,
    darfXJustizSenden:        false,
    darfMeldungAbschliessen:  false,
  },
  zahlstelle: {
    kannMeldungErstellen:     true,
    kannMeldungBearbeiten:    true,
    siehtEigeneStation:       false,
    siehtEigeneAbteilung:     false,
    siehtGesamteAnstalt:      false,
    siehtAlleJVAs:            false,
    darfWeiterleiten:         true,
    darfVerakten:             false,
    darfXJustizSenden:        false,
    darfMeldungAbschliessen:  false,
  },
  arbeitskoordination: {
    kannMeldungErstellen:     true,
    kannMeldungBearbeiten:    true,
    siehtEigeneStation:       false,
    siehtEigeneAbteilung:     false,
    siehtGesamteAnstalt:      false,
    siehtAlleJVAs:            false,
    darfWeiterleiten:         true,
    darfVerakten:             false,
    darfXJustizSenden:        false,
    darfMeldungAbschliessen:  false,
    darfBuendeln:             true,
    darfFallPruefen:          false,
  },
  admin: {
    kannMeldungErstellen:     true,
    kannMeldungBearbeiten:    true,
    siehtEigeneStation:       true,
    siehtEigeneAbteilung:     true,
    siehtGesamteAnstalt:      true,
    siehtAlleJVAs:            true,
    darfWeiterleiten:         true,
    darfVerakten:             true,
    darfXJustizSenden:        true,
    darfMeldungAbschliessen:  true,
  },
}

const STANDARD_BERECHTIGUNGEN = {
  kannMeldungErstellen:     false,
  kannMeldungBearbeiten:    false,
  siehtEigeneStation:       true,
  siehtEigeneAbteilung:     false,
  siehtGesamteAnstalt:      false,
  siehtAlleJVAs:            false,
  darfWeiterleiten:         false,
  darfVerakten:             false,
  darfXJustizSenden:        false,
  darfMeldungAbschliessen:  false,
  darfBuendeln:             false,
  darfFallPruefen:          false,
}

// ============================================================
// DEMO-NUTZER für Prototyp-Banner-Schnellwechsel (20 Nutzer, JVA Billwerder)
// ============================================================
function initialsFromName(name) {
  const clean = String(name).replace(/^(Dr\.|Pfarrerin)\s+/i, '').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return (parts[0]?.slice(0, 2) || '??').toUpperCase()
}

const DEMO_NUTZER_RAW = [
  // Leitungsebene
  { id: 'AL-01',  name: 'Dr. Christine Möller', rolle: 'anstaltsleitung', jva: 'JVA Billwerder', abteilung: 'Leitung',      station: null },
  { id: 'AL-02',  name: 'Thomas Brandt',         rolle: 'anstaltsleitung', jva: 'JVA Billwerder', abteilung: 'Leitung',      station: null, stellvertretend: true },
  { id: 'VAL-01', name: 'Sabine Werner',          rolle: 'val',             jva: 'JVA Billwerder', abteilung: 'Abteilung 1',  station: null },
  { id: 'VAL-02', name: 'Ralf Hoffmann',          rolle: 'val',             jva: 'JVA Billwerder', abteilung: 'Abteilung 2',  station: null },
  { id: 'VAL-03', name: 'Maria Kovacs',           rolle: 'val',             jva: 'JVA Billwerder', abteilung: 'Abteilung 3',  station: null },
  { id: 'DGL-01', name: 'Andrea Schmitz',         rolle: 'dienstgruppenleitung', jva: 'JVA Billwerder', abteilung: 'Leitung', station: null },
  { id: 'AK-01',  name: 'Stefan Lindemann',       rolle: 'arbeitskoordination', jva: 'JVA Billwerder', abteilung: 'Zentrale Meldewesen', station: null },
  // Vollzugsdienst
  { id: 'SL-01',  name: 'Pedro Guerrero',   rolle: 'stationsleitung', jva: 'JVA Billwerder', abteilung: 'Abteilung 1', station: 'A1' },
  { id: 'SL-02',  name: 'Katrin Hofer',     rolle: 'stationsleitung', jva: 'JVA Billwerder', abteilung: 'Abteilung 1', station: 'A2' },
  { id: 'SL-03',  name: 'Frank Bauer',      rolle: 'stationsleitung', jva: 'JVA Billwerder', abteilung: 'Abteilung 2', station: 'B1' },
  { id: 'AVD-01', name: 'Yasmin Özdemir',   rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 1', station: 'A1' },
  { id: 'AVD-02', name: 'Tobias Klein',     rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 1', station: 'A1' },
  { id: 'AVD-03', name: 'Sandra Meier',     rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 1', station: 'A2' },
  { id: 'AVD-04', name: 'Kevin Schulz',     rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 2', station: 'B1' },
  { id: 'AVD-05', name: 'Nina Bergmann',    rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 2', station: 'B2' },
  { id: 'AVD-06', name: 'Marcus Petric',    rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Aufnahme',    station: 'Aufnahme' },
  { id: 'AVD-07', name: 'Jana Fischer',     rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 3', station: 'C1' },
  // Sonderdienst
  { id: 'SD-01',  name: 'Dr. Lena Richter',      rolle: 'sonderdienst', jva: 'JVA Billwerder', abteilung: 'Psychologischer Dienst', station: null },
  { id: 'SD-02',  name: 'Klaus Weber',           rolle: 'sonderdienst', jva: 'JVA Billwerder', abteilung: 'Sozialdienst',           station: null },
  { id: 'SD-03',  name: 'Dr. Ahmad Karimi',      rolle: 'sonderdienst', jva: 'JVA Billwerder', abteilung: 'Medizinischer Dienst',   station: null },
  { id: 'SD-04',  name: 'Pfarrerin E. Krause',   rolle: 'sonderdienst', jva: 'JVA Billwerder', abteilung: 'Seelsorge',              station: null },
  { id: 'SD-05',  name: 'Gunnar Svensson',       rolle: 'sonderdienst', jva: 'JVA Billwerder', abteilung: 'Werkdienst',             station: null },
]

export const DEMO_NUTZER = DEMO_NUTZER_RAW.map(n => ({
  ...n,
  initials: initialsFromName(n.name),
}))

// ============================================================
// CONTEXT
// ============================================================
const RollenContext = createContext(null)

export function RollenProvider({ children }) {
  const [aktiverNutzerId, setAktiverNutzerId] = useState('AVD-01')

  const aktiverNutzer   = DEMO_NUTZER.find(n => n.id === aktiverNutzerId) || DEMO_NUTZER[0]
  const aktiveRolle     = normalisiereRolle(aktiverNutzer.rolle)
  const berechtigungen  = BERECHTIGUNGEN[aktiveRolle] || STANDARD_BERECHTIGUNGEN

  return (
    <RollenContext.Provider value={{
      aktiverNutzer,
      aktiveRolle,
      rolleLabel:       getRolleLabel(aktiveRolle),
      rolleAbkuerzung:  getRolleAbkuerzung(aktiveRolle),
      setAktiverNutzerId,
      demoNutzer:       DEMO_NUTZER,
      ...berechtigungen,
      istLeitung:       istLeitung(aktiveRolle),
      istAL:              aktiveRolle === 'anstaltsleitung',
      istVAL:             aktiveRolle === 'val',
      istDienstgruppenleitung: aktiveRolle === 'dienstgruppenleitung',
      istArbeitskoordination:  aktiveRolle === 'arbeitskoordination',
      istAVD:             aktiveRolle === 'avd',
      istStationsleitung: aktiveRolle === 'stationsleitung',
      istSonderdienst:    istSonderdienst(aktiveRolle),
      istAdmin:         aktiveRolle === 'admin',
      rolleConfig:      ROLLEN_CONFIG[aktiveRolle] || {},
    }}>
      {children}
    </RollenContext.Provider>
  )
}

export function useRolle() {
  const ctx = useContext(RollenContext)
  if (!ctx) throw new Error('useRolle muss innerhalb von RollenProvider verwendet werden')
  return ctx
}
