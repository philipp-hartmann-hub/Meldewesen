/**
 * Erlaubte Statuswechsel einer Einzelmeldung ohne Fall.
 * Es gibt keinen Einzelpfad ohne Fall: jede eingereichte Meldung läuft
 * über die Zentrale und wird einem Fall zugeordnet.
 * IN_PROGRESS und ARCHIVED setzt ausschließlich fallService.js.
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
    FORWARDED: WEITERLEITEN,
    DRAFT: LEITUNG,
  },
  IN_PROGRESS: {
    FORWARDED: WEITERLEITEN,
    DRAFT: LEITUNG,
  },
  FORWARDED: {
    FORWARDED: WEITERLEITEN,
    DRAFT: LEITUNG,
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
