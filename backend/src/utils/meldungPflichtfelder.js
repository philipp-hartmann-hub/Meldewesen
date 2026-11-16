/** Strafanzeige: bei Einreichung Zuständigkeit fachliche Prüfung (VAL), kein Formularfeld Empfänger. */
import { istGueltigerTatvorwurf } from '../constants/strafanzeigeUntertypen.js'
import { isRichTextEmpty, stripRichTextPlain } from './richText.js'
export const STRAFANZEIGE_EMPFAENGER_PRUEFUNG = {
  empfaenger: 'Vollzugsabteilungsleitung (fachliche Prüfung)',
  empfaengerTyp: 'INTERN_LEITUNG',
}

export function aufloesenEmpfaengerStrafanzeige(empfaenger, empfaengerTyp) {
  const text = empfaenger && String(empfaenger).trim()
  return {
    empfaenger: text || STRAFANZEIGE_EMPFAENGER_PRUEFUNG.empfaenger,
    empfaengerTyp: empfaengerTyp || STRAFANZEIGE_EMPFAENGER_PRUEFUNG.empfaengerTyp,
  }
}

/**
 * Pflichtprüfung bei Einreichung (SUBMITTED) – abgestimmt mit Lastenheft Anhang B Querschnitt.
 * Rückgabe: Fehlermeldung (DE) oder null.
 */
export function validiereMeldungEinreichung(body) {
  const {
    meldungsTyp, sachverhalt, gefangeneId, metadaten = {},
    empfaenger, empfaengerTyp,
  } = body

  const aktiv = ['STRAFANZEIGE', 'VORFALL_INTERN', 'MELDUNG_GERICHT'].includes(meldungsTyp)
  if (!aktiv) return null

  if (!gefangeneId) return 'Bitte wählen Sie einen Gefangenen.'
  if (isRichTextEmpty(sachverhalt)) return 'Bitte geben Sie einen Sachverhalt ein.'

  const m = metadaten && typeof metadaten === 'object' ? metadaten : {}
  if (!m.tatzeit) return 'Bitte geben Sie die Tatzeit an.'
  if (!m.tatort || !String(m.tatort).trim()) return 'Bitte geben Sie den Tatort an.'

  if (m.beweismittelGesichert !== 'ja' && m.beweismittelGesichert !== 'nein') {
    return 'Bitte geben Sie an, ob Beweismittel gesichert wurden (Ja oder Nein).'
  }
  if (m.beweismittelGesichert === 'ja' && isRichTextEmpty(m.beweismittelAngaben)) {
    return 'Bitte beschreiben Sie kurz die gesicherten Beweismittel.'
  }

  const beweismittelNachreichungOffen = m.beweismittelNachreichung?.status === 'OFFEN'
    && ['beweismittel', 'beides'].includes(m.rueckgabeErgaenzung?.grund)
  if (beweismittelNachreichungOffen && m.beweismittelGesichert === 'nein') {
    if (isRichTextEmpty(m.beweismittelKeineBegruendung)) {
      return 'Bitte begründen Sie, warum nach Prüfung keine Beweismittel vorliegen (z. B. nur Zeugenaussagen).'
    }
  }

  if (meldungsTyp === 'STRAFANZEIGE') {
    const tatvorwurf = m.tatvorwurf || m.strafanzeigeUntertyp
    if (!tatvorwurf) return 'Bitte wählen Sie einen Tatvorwurf aus der Liste (Az. 4400/73).'
    if (!istGueltigerTatvorwurf(tatvorwurf)) return 'Bitte wählen Sie einen gültigen Tatvorwurf aus der Liste.'
    // Empfänger: bei Einreichung automatisch Vollzugsabteilungsleitung (fachliche Prüfung) – kein Formularfeld
  }
  if (meldungsTyp === 'MELDUNG_GERICHT') {
    if (isRichTextEmpty(empfaenger)) return 'Bitte geben Sie den Empfänger (Gericht) an.'
  }
  if (meldungsTyp === 'VORFALL_INTERN') {
    if (!empfaengerTyp || !['INTERN_ABTEILUNG', 'INTERN_LEITUNG'].includes(empfaengerTyp)) {
      return 'Bitte wählen Sie einen internen Empfänger.'
    }
  }

  return null
}
