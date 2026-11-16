/**
 * Mock-Folgeaktionen nach Einreichung einer Strafanzeige mit Zeugen.
 * Zielsystem: E-Mail/Benachrichtigungsdienst; hier nur metadaten.zeugenFolgeaktionen.
 */

const BEDIENSTETER_FRIST_TAGE = 5

function normalizeZeugen(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(z => z?.zeugenTyp && z?.name?.trim())
  return []
}

function addCalendarDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function nameSuchbegriff(name) {
  const teil = String(name).split(',')[0].trim()
  return teil.length >= 2 ? teil : String(name).trim()
}

export async function berechneZeugenFolgeaktionen(prisma, { meldungsTyp, metadaten, gefangeneId }) {
  if (meldungsTyp !== 'STRAFANZEIGE') return metadaten || {}

  const basis = { ...(metadaten || {}) }
  const zeugen = normalizeZeugen(basis.zeugen)

  if (!zeugen.length) {
    const { zeugenFolgeaktionen, ...rest } = basis
    return rest
  }

  const fristBis = addCalendarDays(new Date(), BEDIENSTETER_FRIST_TAGE)
  const fristLabel = fristBis.toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const bediensteteBenachrichtigungen = []
  const stationWeiterleitungen = []
  const gruppenAufgaben = []

  for (const z of zeugen) {
    if (z.zeugenTyp === 'bediensteter') {
      let match = null
      if (z.bediensteterId?.trim()) {
        match = await prisma.bedienstete.findUnique({
          where: { bediensteterID: z.bediensteterId.trim() },
        })
      }
      if (!match) {
        const such = nameSuchbegriff(z.name)
        match = such
          ? await prisma.bedienstete.findFirst({
            where: { bediensteterName: { contains: such, mode: 'insensitive' } },
          })
          : null
      }
      if (!match) continue

      bediensteteBenachrichtigungen.push({
        zeugeId: z.id,
        zeugeName: z.name.trim(),
        bediensteterId: match.bediensteterID,
        bediensteterName: match.bediensteterName,
        fristBis: fristBis.toISOString(),
        fristTage: BEDIENSTETER_FRIST_TAGE,
        nachricht:
          `Sie wurden in einer Strafanzeige als Zeuge/Zeugin benannt. `
          + `Sie erhalten diese Mitteilung im System und werden aufgefordert, Ihre Zeugenaussage zu prüfen und bis zum ${fristLabel} `
          + `zu bestätigen oder zu ergänzen (Frist: ${BEDIENSTETER_FRIST_TAGE} Kalendertage, Prototyp).`,
        status: 'OFFEN',
        gesendetAm: new Date().toISOString(),
        kanal: 'MOCK_PORTAL',
      })
    }

    if (z.zeugenTyp === 'inhaftierter') {
      let jvaZiel = z.benachrichtigungJva?.trim() || ''
      let hausZiel = z.benachrichtigungHaus?.trim() || ''
      let gef = null

      if (z.gefangenenNr) {
        gef = await prisma.gefangene.findUnique({ where: { gefangenenNr: z.gefangenenNr } })
      }
      if (!gef && gefangeneId) {
        gef = await prisma.gefangene.findUnique({ where: { id: gefangeneId } })
      }
      if (!jvaZiel) jvaZiel = gef?.jva || ''
      if (!hausZiel) hausZiel = gef?.haus || ''

      if (!jvaZiel || !hausZiel) continue

      const empfaenger = await prisma.bedienstete.findMany({
        where: {
          bediensteterJVA: jvaZiel,
          haus: hausZiel,
        },
        orderBy: { bediensteterName: 'asc' },
      })

      const zielLabel = [hausZiel, gef?.haftraum].filter(Boolean).join(', ') || hausZiel

      gruppenAufgaben.push({
        zeugeId: z.id,
        zeugeName: z.name.trim(),
        zeugenTyp: 'inhaftierter',
        gefangenenNr: z.gefangenenNr || gef?.gefangenenNr || null,
        jva: jvaZiel,
        haus: hausZiel,
        haftraum: gef?.haftraum || null,
        empfaengerAnzahl: empfaenger.length,
        nachricht:
          `In der Strafanzeige wurde ${z.name.trim()} (Inhaftierte/r) als Zeuge/Zeugin benannt. `
          + `Alle Bediensteten der Abteilung „${hausZiel}“ (${jvaZiel}) erhalten eine Gruppenaufgabe im Arbeitskorb, `
          + `die Zeugenaussage aufzunehmen (Pull-Prinzip: eine Person übernimmt die Aufgabe, Prototyp).`,
        status: 'OFFEN',
        uebernommenVon: null,
        uebernommenVonName: null,
        uebernommenAm: null,
        gesendetAm: new Date().toISOString(),
        kanal: 'MOCK_PORTAL',
      })
    }

    if (z.zeugenTyp === 'ohne_meldeberechtigung') {
      let jvaZiel = z.benachrichtigungJva?.trim() || ''
      let hausZiel = z.benachrichtigungHaus?.trim() || ''

      if (!jvaZiel || !hausZiel) continue

      const empfaenger = await prisma.bedienstete.findMany({
        where: {
          bediensteterJVA: jvaZiel,
          haus: hausZiel,
          bediensteterRolle: { in: ['stationsleitung', 'avd'] },
        },
        orderBy: { bediensteterName: 'asc' },
      })

      const rollenHinweis = `${z.name.trim()} (Person ohne Zugriff auf das Meldewesen)`
      const zielLabel = hausZiel

      stationWeiterleitungen.push({
        zeugeId: z.id,
        zeugeName: z.name.trim(),
        zeugenTyp: z.zeugenTyp,
        jva: jvaZiel,
        haus: hausZiel,
        empfaenger: empfaenger.map(b => ({
          bediensteterId: b.bediensteterID,
          name: b.bediensteterName,
          rolle: b.bediensteterRolle,
          haus: b.haus,
          station: b.station,
        })),
        nachricht:
          `In der Strafanzeige wurde ${rollenHinweis} als Zeuge/Zeugin benannt. `
          + `Die mitgeteilte Zeugenaussage ist in der Meldung dokumentiert; `
          + `eine formale Aufnahme vor Ort koordiniert die zuständige Abteilung „${zielLabel}“ (${jvaZiel}, Prototyp).`,
        status: 'OFFEN',
        gesendetAm: new Date().toISOString(),
        kanal: 'MOCK_PORTAL',
      })
    }
  }

  return {
    ...basis,
    zeugenFolgeaktionen: {
      ausgeloestAm: new Date().toISOString(),
      hinweis: 'Einzelfall: Zeugen nur erfassen, wenn es welche gab. Folgeaktionen nur bei Einreichung.',
      bediensteteBenachrichtigungen,
      gruppenAufgaben,
      stationWeiterleitungen,
    },
  }
}

export function folgeaktionenKommentar(metadaten) {
  const fa = metadaten?.zeugenFolgeaktionen
  if (!fa) return null
  const n1 = fa.bediensteteBenachrichtigungen?.length || 0
  const n2 = fa.gruppenAufgaben?.length || 0
  const n3 = fa.stationWeiterleitungen?.length || 0
  if (!n1 && !n2 && !n3) return null
  const teile = []
  if (n1) teile.push(`${n1} Zeugen-Benachrichtigung(en) an Bedienstete`)
  if (n2) teile.push(`${n2} Gruppenaufgabe(n) Inhaftierte Zeugen`)
  if (n3) teile.push(`${n3} Weiterleitung(en) an Abteilung`)
  return `Folgeaktionen Zeugen: ${teile.join('; ')} (Mock).`
}
