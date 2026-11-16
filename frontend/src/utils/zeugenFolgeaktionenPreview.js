import { ZEUGE_BEDIENSTETER_FRIST_TAGE } from '../constants/zeugen'
import { isRichTextEmpty } from './richText'

function addCalendarDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function normalizeZeugenFuerPreview(zeugen) {
  return (zeugen || []).filter(z => {
    if (!z?.zeugenTyp || !z?.name?.trim()) return false
    if (z.zeugenTyp === 'bediensteter' || z.zeugenTyp === 'inhaftierter') return true
    return !isRichTextEmpty(z.aussage)
  })
}

/**
 * Client-Vorschau der Mock-Folgeaktionen nach Einreichung (ohne DB-Lookup).
 */
export function berechneZeugenFolgeaktionenPreview(zeugen) {
  const liste = normalizeZeugenFuerPreview(zeugen)
  const fristBis = addCalendarDays(new Date(), ZEUGE_BEDIENSTETER_FRIST_TAGE)
  const fristLabel = fristBis.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const bediensteteBenachrichtigungen = []
  const stationWeiterleitungen = []
  const gruppenAufgaben = []

  for (const z of liste) {
    if (z.zeugenTyp === 'bediensteter') {
      bediensteteBenachrichtigungen.push({
        zeugeId: z.id,
        zeugeName: z.name.trim(),
        fristLabel,
        nachricht:
          `${z.name.trim()} erhält im persönlichen Arbeitskorb die Aufgabe „Zeugenaussage ausfüllen“ `
          + `(Frist bis ${fristLabel}, ${ZEUGE_BEDIENSTETER_FRIST_TAGE} Kalendertage, Prototyp).`,
      })
    }
    if (z.zeugenTyp === 'inhaftierter') {
      const jva = z.benachrichtigungJva?.trim()
      const haus = z.benachrichtigungHaus?.trim()
      if (!jva || !haus) continue
      gruppenAufgaben.push({
        zeugeId: z.id,
        zeugeName: z.name.trim(),
        jva,
        haus,
        nachricht:
          `Alle Bediensteten der Abteilung „${haus}“ (${jva}) erhalten eine Gruppenaufgabe `
          + `zur Aufnahme der Zeugenaussage von ${z.name.trim()} (Pull-Prinzip, Prototyp).`,
      })
    }
    if (z.zeugenTyp === 'ohne_meldeberechtigung') {
      const jva = z.benachrichtigungJva?.trim()
      const haus = z.benachrichtigungHaus?.trim()
      if (!jva || !haus) continue
      stationWeiterleitungen.push({
        zeugeId: z.id,
        zeugeName: z.name.trim(),
        zielLabel: `${haus}`,
        jva,
        nachricht:
          `Für ${z.name.trim()} ist die mitgeteilte Aussage in der Meldung dokumentiert. `
          + `Abteilung „${haus}“ (${jva}) wird informiert.`,
      })
    }
  }

  return {
    bediensteteBenachrichtigungen,
    gruppenAufgaben,
    stationWeiterleitungen,
    anzahlZeugen: liste.length,
  }
}
