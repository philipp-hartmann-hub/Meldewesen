// Deutsche Anzeigenamen – parallel zu frontend/src/utils/meldungen.js

export const MELDUNGSTYP_LABELS = {
  STRAFANZEIGE: 'Strafanzeige',
  VORFALL_INTERN: 'Interner Vorfall',
  MELDUNG_GERICHT: 'Meldung an Gericht',
  VORFALL_EXTERN: 'Externe Behördenmeldung',
  STATISTIK_MELDUNG: 'Statistikmeldung',
  SONSTIGE: 'Sonstige Meldung',
}

export function getMeldungstypLabel(typ) {
  return MELDUNGSTYP_LABELS[typ] || typ || ''
}

export function compareMeldungstypByLabel(typA, typB, dir = 'asc') {
  const cmp = getMeldungstypLabel(typA).localeCompare(getMeldungstypLabel(typB), 'de')
  return dir === 'desc' ? -cmp : cmp
}
