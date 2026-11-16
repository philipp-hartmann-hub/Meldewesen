/**
 * Tatort-Vorgaben für Strafanzeige / aktive Meldungstypen (Prototyp-Stammliste).
 * Alphabetisch sortiert (de-DE).
 */

const TATORT_RAW = [
  'Anstaltsküche',
  'Freiluftbereich',
  'Haftraum B2-14',
  'Hof JVA Billwerder',
  'JVA Billwerder',
  'Kantine',
  'Zelle A2-11',
]

export const TATORT_OPTIONEN = [...TATORT_RAW].sort((a, b) =>
  a.localeCompare(b, 'de-DE', { sensitivity: 'base' })
)

export function filterTatortOptionen(search) {
  const q = String(search || '').trim().toLowerCase()
  if (!q) return TATORT_OPTIONEN
  return TATORT_OPTIONEN.filter(o => o.toLowerCase().includes(q))
}

export function istGueltigerTatort(value) {
  return TATORT_OPTIONEN.includes(String(value || '').trim())
}
