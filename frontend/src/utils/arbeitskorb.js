/** Aufgaben-IDs für Arbeitskorb (Frontend, spiegelt Backend). */

export const AUFGABEN_TYPEN = {
  ZEUGENAUSSAGE_BESTAETIGEN: 'zeugenaussage_bestaetigen',
  ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN: 'zeugenaussage_inhaftierter_erfassen',
  FACHLICHE_PRUEFUNG: 'fachliche_pruefung',
  BEWEISMITTEL_NACHREICHEN: 'beweismittel_nachreichen',
  DGL_RUECKGABE: 'dgl_rueckgabe',
  FALL_PRUEFEN: 'fall_pruefen',
  FALL_WEITERLEITEN: 'fall_weiterleiten',
  FALL_ENTSCHEID: 'fall_entscheid',
  FALL_ERV: 'fall_erv',
  FALL_RUECKGABE: 'fall_rueckgabe',
  MELDUNG_BEPO: 'meldung_bepo',
  MELDUNG_EGPA: 'meldung_egpa',
  MELDUNG_ABSCHLUSS: 'meldung_abschluss',
}

export const AUFGABEN_TYP_LABEL = {
  [AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN]: 'Zeugenaussage bestätigen',
  [AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN]: 'Zeugenaussage (Inhaftierter)',
  [AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG]: 'Fachliche Prüfung',
  [AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN]: 'Beweismittel nachreichen',
  [AUFGABEN_TYPEN.DGL_RUECKGABE]: 'Meldung nach DGL-Rückgabe überarbeiten',
  [AUFGABEN_TYPEN.FALL_PRUEFEN]: 'Fall prüfen',
  [AUFGABEN_TYPEN.FALL_WEITERLEITEN]: 'Fall weiterleiten',
  [AUFGABEN_TYPEN.FALL_ENTSCHEID]: 'Meldepflicht entscheiden',
  [AUFGABEN_TYPEN.FALL_ERV]: 'ERV am Fall',
  [AUFGABEN_TYPEN.FALL_RUECKGABE]: 'Fall nach Rückgabe bearbeiten',
  [AUFGABEN_TYPEN.MELDUNG_BEPO]: 'Versand (beBPo)',
  [AUFGABEN_TYPEN.MELDUNG_EGPA]: 'eGPA-Veraktung',
  [AUFGABEN_TYPEN.MELDUNG_ABSCHLUSS]: 'Abschluss',
}

const FALL_AUFGABEN_TYPEN = new Set([
  AUFGABEN_TYPEN.FALL_PRUEFEN,
  AUFGABEN_TYPEN.FALL_WEITERLEITEN,
  AUFGABEN_TYPEN.FALL_ENTSCHEID,
  AUFGABEN_TYPEN.FALL_ERV,
  AUFGABEN_TYPEN.FALL_RUECKGABE,
])

export function istFallAufgabeId(aufgabeId) {
  const typ = String(aufgabeId || '').split('|')[1]
  return FALL_AUFGABEN_TYPEN.has(typ)
}

export function fallIdAusAufgabeId(aufgabeId) {
  if (!istFallAufgabeId(aufgabeId)) return null
  return String(aufgabeId).split('|')[0] || null
}

const MELDUNG_DIREKT_TYPEN = new Set([
  AUFGABEN_TYPEN.MELDUNG_BEPO,
  AUFGABEN_TYPEN.MELDUNG_EGPA,
  AUFGABEN_TYPEN.MELDUNG_ABSCHLUSS,
])

export function meldungDirektAusAufgabeId(aufgabeId) {
  const [id, typ] = String(aufgabeId || '').split('|')
  if (!id || !MELDUNG_DIREKT_TYPEN.has(typ)) return null
  return `/meldungen/${id}`
}

export const ZUWEISUNG = {
  PERSOENLICH: 'persoenlich',
  GRUPPE: 'gruppe',
}

export function encodeAufgabeId(meldungId, typ, zeugeId) {
  return `${meldungId}|${typ}|${zeugeId}`
}

export function arbeitskorbAufgabeHref(meldungId, typ, zeugeId) {
  return `/arbeitskorb/aufgabe/${encodeURIComponent(encodeAufgabeId(meldungId, typ, zeugeId))}`
}

/** Aufgabentypen, nach deren Abschluss zurück zum Arbeitskorb (AVD/Station). */
export const ARBEITSKORB_NACH_ABSCHLUSS_TYPEN = [
  AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN,
  AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN,
  AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN,
]

/**
 * Zielnavigation nach Abschluss einer Arbeitskorb-Aufgabe.
 * Zeugen/Beweismittel → Arbeitskorb; fachliche Prüfung → Meldungsdetail (VAL).
 */
export function getNavigationNachAufgabenAbschluss(typ, meldungId) {
  if (ARBEITSKORB_NACH_ABSCHLUSS_TYPEN.includes(typ)) {
    const label = AUFGABEN_TYP_LABEL[typ] || 'Aufgabe'
    return {
      path: '/arbeitskorb',
      state: { erfolgsMeldung: `Aufgabe „${label}" abgeschlossen.` },
    }
  }
  return {
    path: `/meldungen/${meldungId}`,
    state: { aufgabeAbgeschlossen: typ },
  }
}
