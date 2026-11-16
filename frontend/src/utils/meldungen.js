// Hilfsfunktionen Meldewesen (SLA, Typen, Prozess)

import { alleZeugenaussagenVollstaendig } from './zeugenVollstaendigkeit.js'

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

export const MELDUNGSTYP_LABELS = {
  STRAFANZEIGE: 'Strafanzeige',
  VORFALL_INTERN: 'Interner Vorfall',
  MELDUNG_GERICHT: 'Meldung an Gericht',
  VORFALL_EXTERN: 'Externe Behördenmeldung',
  STATISTIK_MELDUNG: 'Statistikmeldung',
  SONSTIGE: 'Sonstige Meldung',
}

export const MELDUNGS_STATUS_LABELS = {
  DRAFT: 'Entwurf',
  SUBMITTED: 'Eingereicht',
  IN_PROGRESS: 'Fachliche Prüfung',
  FORWARDED: 'Weitergeleitet',
  ARCHIVED: 'Archiviert',
}

export function getMeldungsStatusLabel(status) {
  return MELDUNGS_STATUS_LABELS[status] || status || '–'
}

/** Bei Einreichung Strafanzeige: interne fachliche Prüfung (VAL), kein Formularfeld. */
export const STRAFANZEIGE_EMPFAENGER_PRUEFUNG = {
  empfaenger: 'Vollzugsabteilungsleitung (fachliche Prüfung)',
  empfaengerTyp: 'INTERN_LEITUNG',
}

export const EMPFAENGER_DEFAULTS = {
  STRAFANZEIGE: STRAFANZEIGE_EMPFAENGER_PRUEFUNG,
  MELDUNG_GERICHT: { empfaenger: '', empfaengerTyp: 'GERICHT' },
  VORFALL_INTERN: { empfaenger: 'Vollzugsabteilung', empfaengerTyp: 'INTERN_ABTEILUNG' },
}

export function getMeldungstypLabel(typ) {
  return MELDUNGSTYP_LABELS[typ] || typ
}

export { getStrafanzeigeUntertypLabel } from '../constants/strafanzeigeUntertypen'

export function formatGefangene(g) {
  if (!g) return '–'
  return `${g.nachname}, ${g.vorname} (${g.gefangenenNr})`
}

export function formatDatum(iso) {
  if (!iso) return '–'
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatDatumKurz(iso) {
  if (!iso) return '–'
  return new Date(iso).toLocaleDateString('de-DE')
}

/** Hamburg-Wandzeit ohne UTC-Verschiebung (Speicherformat: YYYY-MM-DDTHH:mm:00) */
export const HAMBURG_TIMEZONE = 'Europe/Berlin'

export function parseTatzeitParts(tatzeit) {
  if (!tatzeit) return { date: '', time: '' }
  const s = String(tatzeit).trim()
  const wall = s.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  if (wall) return { date: wall[1], time: wall[2] }

  // Legacy: UTC/Z oder Offset → nach Europe/Berlin für Anzeige/Eingabe
  if (/Z$|[+-]\d{2}:\d{2}$/.test(s)) {
    const d = new Date(s)
    if (!Number.isNaN(d.getTime())) {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: HAMBURG_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(d)
      const get = type => parts.find(p => p.type === type)?.value ?? ''
      return {
        date: `${get('year')}-${get('month')}-${get('day')}`,
        time: `${get('hour')}:${get('minute')}`,
      }
    }
  }
  return { date: '', time: '' }
}

export function buildTatzeitFromParts(date, time) {
  if (!date) return ''
  const t = time && /^\d{2}:\d{2}$/.test(time) ? time : '00:00'
  return `${date}T${t}:00`
}

/** Aktuelle Wandzeit Europe/Berlin für Tatzeit-Vorbelegung (kein UTC/toISOString). */
export function getDefaultTatzeitNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: HAMBURG_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const get = type => parts.find(p => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:00`
}

/** Wert aus getrennten date/time-Feldern oder datetime-local ohne toISOString. */
export function normalizeTatzeitFromInput(datetimeLocal) {
  if (!datetimeLocal) return ''
  const s = String(datetimeLocal).slice(0, 16)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return ''
  return `${s}:00`
}

export function formatTatzeit(tatzeit) {
  if (!tatzeit) return '–'
  const { date, time } = parseTatzeitParts(tatzeit)
  if (!date) return '–'
  const [y, m, d] = date.split('-')
  if (!time || time === '00:00') return `${d}.${m}.${y}`
  return `${d}.${m}.${y}, ${time} Uhr`
}

/** Gespeicherte Tatzeit für datetime-local (Legacy-UTC wird nach Europe/Berlin umgerechnet). */
export function tatzeitToDatetimeLocal(tatzeit) {
  const { date, time } = parseTatzeitParts(tatzeit)
  if (!date) return ''
  return `${date}T${time || '00:00'}`
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

/** ERV-pflichtig und nicht Entwurf/Archiviert (Dashboard-KPI H-P01) */
export function istErvOffen(meldung) {
  return meldung.ervRelevant === true && !['ARCHIVED', 'DRAFT'].includes(meldung.status)
}

/** Strafanzeige mit erfassten Zeugen → eigener Prozessschritt „Zeugenbefragung“ */
export function hatZeugenProzessschritt(meldung) {
  if (meldung?.meldungsTyp !== 'STRAFANZEIGE') return false
  const zeugen = meldung?.metadaten?.zeugen
  return Array.isArray(zeugen) && zeugen.length > 0
}

/** Prozessschritte laut Lastenheft / Prozesslandkarte */
export function getProzessSchritte(meldung) {
  const hatBepo = meldung.xJustizVersand?.some(v => v.status === 'VERSENDET' || v.status === 'BESTAETIGT')
  const hatEgpa = meldung.veraktungen?.some(v => v.status === 'UEBERMITTELT')
  const erv = meldung.ervRelevant
  const mitZeugen = hatZeugenProzessschritt(meldung)
  const zeugenVollstaendig = alleZeugenaussagenVollstaendig(meldung?.metadaten)

  const schritte = [
    { id: 'draft', label: 'Entwurf' },
    { id: 'submitted', label: 'Eingereicht' },
  ]

  if (mitZeugen) {
    schritte.push({ id: 'zeugen', label: 'Zeugenbefragung' })
  }

  schritte.push({ id: 'bearbeitung', label: 'Fachliche Prüfung', icon: '🔍' })

  if (erv) {
    schritte.push({ id: 'bepo', label: 'Versand (beBPo)' })
    schritte.push({ id: 'egpa', label: 'eGPA-Veraktung' })
  }

  schritte.push({ id: 'archiv', label: 'Abschluss' })

  const idx = id => schritte.findIndex(s => s.id === id)

  let aktiv = idx('draft')
  if (meldung.status === 'DRAFT') {
    aktiv = idx('draft')
  } else if (meldung.status === 'SUBMITTED') {
    if (mitZeugen && !zeugenVollstaendig) {
      aktiv = idx('zeugen')
    } else if (mitZeugen && zeugenVollstaendig) {
      aktiv = idx('bearbeitung')
    } else {
      aktiv = idx('submitted')
    }
  } else if (['IN_PROGRESS', 'FORWARDED'].includes(meldung.status)) {
    aktiv = idx('bearbeitung')
    if (erv) {
      if (hatEgpa) aktiv = idx('egpa')
      else if (hatBepo) aktiv = idx('bepo')
    }
  } else if (meldung.status === 'ARCHIVED') {
    aktiv = schritte.length - 1
  }

  return schritte.map((s, i) => ({
    ...s,
    erledigt: i < aktiv,
    aktiv: i === aktiv,
  }))
}
