// SLA-Hilfsfunktionen (Prototyp, spiegelt frontend/src/utils/meldungen.js)

import { alleZeugenaussagenVollstaendig } from '../services/zeugenVollstaendigkeitService.js'

// SLA-Arbeitswerte – Prototyp-Annahmen für Workshop-Test
// ⚠ ALLE Werte müssen mit JVA-Mitarbeitenden verifiziert werden!

// 1. Telefonische Meldung nach AoV (2.1–2.8): "unverzüglich"
//    Arbeitswert: 2 Stunden
//    Quelle: AV 4400/73 Ziffer I.3 ("unverzüglich") – kein gesetzl. Stundenmaß
const MS_UNVERZUEGLICH = 2 * 60 * 60 * 1000

// 2. Interne Bearbeitungsaufnahme SUBMITTED → IN_PROGRESS
//    Arbeitswert: 24 Stunden (Kalenderstunden)
//    Quelle: Operative Praxis – kein Gesetz
const MS_24H = 24 * 60 * 60 * 1000

// 3. Schriftlicher Bericht
//    Wert: 3 Werktage (72h als Näherung)
//    Quelle: AV 4400/73 Ziffer I.4 – BESTÄTIGT
const MS_3WT = 3 * 24 * 60 * 60 * 1000

// 4. Externer Versand nach "versandfähig"
//    Arbeitswert: 3 Werktage
//    Quelle: Lastenheft-Beschluss – im Workshop verifizieren
const MS_VERSAND = 3 * 24 * 60 * 60 * 1000

// 5. Zeugenaussagen nachreichen
//    Arbeitswert: 5 Werktage
//    Quelle: Prototyp-Annahme – im Workshop verifizieren
const MS_ZEUGEN = 5 * 24 * 60 * 60 * 1000

// Wochenend-/Feiertagslogik: Arbeitswert = Kalendertage (läuft durch)
// ⚠ Im Workshop klären: soll Wochenende die Frist aussetzen?

const SLA_QUELLEN = {
  unverzueglich: 'AV 4400/73 Ziffer I.3 („unverzüglich") – kein gesetzl. Stundenmaß; Verifizierung ausstehend',
  bearbeitung24h: 'operativer Richtwert – Verifizierung ausstehend',
  schrift3wt: 'AV 4400/73 Ziffer I.4 – BESTÄTIGT',
  versand3wt: 'Lastenheft-Beschluss – im Workshop verifizieren',
  zeugen5wt: 'Prototyp-Annahme – im Workshop verifizieren',
}

function slaUeberfaellig(fristLabel, quelle, detail) {
  return {
    typ: 'danger',
    text: `Überfällig: Frist ${fristLabel} (${quelle}) – ${detail}`,
  }
}

function hatBepoVersand(meldung) {
  const meta = meldung.metadaten || {}
  if (meldung.xJustizVersand?.length > 0 || meldung.xjustizVersand?.length > 0) return true
  return Boolean(meta.bepoVersendet || meta.bepoVersendetAm)
}

function istSchriftlicherBericht(meta) {
  return meta.berichtsart === 'schriftlich' || meta.schriftlicherBericht === true
}

function istUnverzueglicheMeldung(meta) {
  return meta.meldungsweg === 'telefon' || meta.unverzueglich === true
}

function hatZeugenNachreichungOffen(meldung) {
  if (meldung.meldungsTyp !== 'STRAFANZEIGE') return false
  const meta = meldung.metadaten || {}
  const zeugen = Array.isArray(meta.zeugen) ? meta.zeugen : []
  if (!zeugen.length) return false
  return !alleZeugenaussagenVollstaendig(meta)
}

/** SLA-Hinweise mit benannter Quelle (Prototyp, Kalendertage) */
export function getSlaHinweise(meldung) {
  const hinweise = []
  const now = Date.now()
  const meta = meldung.metadaten || {}

  if (istUnverzueglicheMeldung(meta) && ['DRAFT', 'SUBMITTED'].includes(meldung.status)) {
    const seit = new Date(meldung.erstelltAm).getTime()
    if (now - seit > MS_UNVERZUEGLICH) {
      hinweise.push(slaUeberfaellig(
        '2 h unverzüglich',
        SLA_QUELLEN.unverzueglich,
        'telefonische Meldung nicht fristgerecht bearbeitet',
      ))
    }
  }

  if (meldung.status === 'SUBMITTED') {
    const seit = new Date(meldung.erstelltAm).getTime()
    if (now - seit > MS_24H) {
      hinweise.push(slaUeberfaellig(
        '24 h',
        SLA_QUELLEN.bearbeitung24h,
        'Fachliche Prüfung nicht aufgenommen',
      ))
    }
  }

  if (istSchriftlicherBericht(meta) && !['ARCHIVED'].includes(meldung.status)) {
    const seit = new Date(meldung.erstelltAm).getTime()
    if (now - seit > MS_3WT) {
      hinweise.push(slaUeberfaellig(
        '3 Werktage (schriftlicher Bericht)',
        SLA_QUELLEN.schrift3wt,
        'schriftlicher Bericht überfällig',
      ))
    }
  }

  const versandfaehigSeit = meta.versandfaehigAm || meta.versandfaehigMarkiertAm
  if (versandfaehigSeit && meldung.ervRelevant && !hatBepoVersand(meldung)) {
    const seit = new Date(versandfaehigSeit).getTime()
    if (now - seit > MS_VERSAND) {
      hinweise.push(slaUeberfaellig(
        '3 Werktage (externer Versand)',
        SLA_QUELLEN.versand3wt,
        'Versand nach „versandfähig“ ausstehend',
      ))
    }
  }

  if (meldung.status === 'IN_PROGRESS' && hatZeugenNachreichungOffen(meldung)) {
    const seit = new Date(meta.zeugenNachreichungSeit || meldung.erstelltAm).getTime()
    if (now - seit > MS_ZEUGEN) {
      hinweise.push(slaUeberfaellig(
        '5 Werktage (Zeugenaussagen)',
        SLA_QUELLEN.zeugen5wt,
        'Zeugenaussagen nicht vollständig nachgereicht',
      ))
    }
  }

  return hinweise
}

export function istUeberfaellig(meldung) {
  return getSlaHinweise(meldung).length > 0
}

/** Überfällig (SLA) oder manuell als dringend markiert (Dashboard-KPI H-P02) */
export function istDringendOderUeberfaellig(meldung) {
  return istUeberfaellig(meldung) || (meldung.prioritaet ?? 0) > 0
}
