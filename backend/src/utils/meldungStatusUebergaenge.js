/**
 * Erlaubte Statuswechsel einer Einzelmeldung ohne Fall.
 * TODO Soll: Einzelpfad ohne Fall fachlich klären (PROZESS_SOLL_UND_STAND Kap. 9)
 *
 * Sobald eine Meldung einem Fall zugeordnet ist, setzt fallService.js
 * IN_PROGRESS, FORWARDED und ARCHIVED. Dieser Endpunkt darf das dann nicht mehr.
 */

const ALLE_ROLLEN = [
  'anstaltsleitung',
  'val',
  'dienstgruppenleitung',
  'stationsleitung',
  'avd',
  'sonderdienst',
  'kammer',
  'zahlstelle',
  'arbeitskoordination',
  'admin',
]

const LEITUNG = ['val', 'anstaltsleitung']
const ABSCHLUSS = ['val', 'anstaltsleitung', 'admin']
const WEITERLEITEN = ALLE_ROLLEN.filter(rolle => rolle !== 'sonderdienst')

const STATUS_LABEL = {
  DRAFT: 'Entwurf',
  SUBMITTED: 'Eingereicht',
  IN_PROGRESS: 'Fachliche Prüfung',
  FORWARDED: 'Weitergeleitet',
  ARCHIVED: 'Archiviert',
}

/** von Status → Zielstatus → Rollen, die den Wechsel ausführen dürfen. */
export const MELDUNG_STATUS_UEBERGAENGE = {
  DRAFT: {
    SUBMITTED: ALLE_ROLLEN,
  },
  SUBMITTED: {
    IN_PROGRESS: LEITUNG,
    FORWARDED: WEITERLEITEN,
    DRAFT: LEITUNG,
    ARCHIVED: ABSCHLUSS,
  },
  IN_PROGRESS: {
    FORWARDED: WEITERLEITEN,
    DRAFT: LEITUNG,
    ARCHIVED: ABSCHLUSS,
  },
  FORWARDED: {
    IN_PROGRESS: LEITUNG,
    FORWARDED: WEITERLEITEN,
    DRAFT: LEITUNG,
    ARCHIVED: ABSCHLUSS,
  },
  ARCHIVED: {},
}

export const FALL_GESPERRTE_EINZELSTATUS = ['IN_PROGRESS', 'FORWARDED', 'ARCHIVED']

export function pruefeStatusUebergang(von, nach, rolle) {
  const ziele = MELDUNG_STATUS_UEBERGAENGE[von]
  const erlaubt = ziele?.[nach]
  const vonLabel = STATUS_LABEL[von] || von || 'unbekannt'
  const nachLabel = STATUS_LABEL[nach] || nach || 'unbekannt'
  if (!erlaubt) {
    return `Der Statuswechsel von „${vonLabel}“ nach „${nachLabel}“ ist nicht zulässig.`
  }
  if (!erlaubt.includes(rolle)) {
    return `Ihre Rolle darf den Statuswechsel von „${vonLabel}“ nach „${nachLabel}“ nicht ausführen.`
  }
  return null
}

export function meldungWirdAmFallBearbeitet(meldung, zielStatus) {
  if (!meldung?.fallId) return null
  if (zielStatus && !FALL_GESPERRTE_EINZELSTATUS.includes(zielStatus)) return null
  const fallNr = meldung.fall?.fallNr || 'FALL'
  return `Diese Meldung ist Teil von Fall ${fallNr} und wird am Fall bearbeitet.`
}
