/** Aufgaben-IDs für Arbeitskorb (Frontend, spiegelt Backend). */

export const AUFGABEN_TYPEN = {
  ZEUGENAUSSAGE_BESTAETIGEN: 'zeugenaussage_bestaetigen',
  ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN: 'zeugenaussage_inhaftierter_erfassen',
  FACHLICHE_PRUEFUNG: 'fachliche_pruefung',
  BEWEISMITTEL_NACHREICHEN: 'beweismittel_nachreichen',
}

export const AUFGABEN_TYP_LABEL = {
  [AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN]: 'Zeugenaussage bestätigen',
  [AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN]: 'Zeugenaussage (Inhaftierter)',
  [AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG]: 'Fachliche Prüfung',
  [AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN]: 'Beweismittel nachreichen',
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
