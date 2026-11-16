/**
 * Team-Übersicht für VAL/AL – Disposition über Stationstasks (AVD/Stationsleitung).
 */
import { pruefeBeweismittelFristEskalationBatch } from './beweismittelEskalationService.js'
import {
  AUFGABEN_TYPEN,
  ZUWEISUNG,
  encodeAufgabeId,
  resolveBeweismittelEmpfaenger,
  sammleBeweismittelDispositionAufgaben,
} from './arbeitskorbService.js'
import { istDringendOderUeberfaellig } from '../utils/meldungenSla.js'

function getZugewiesenAn(meldung) {
  const meta = meldung.metadaten
  if (meta && typeof meta === 'object' && meta.zugewiesenAn) {
    return String(meta.zugewiesenAn)
  }
  return null
}

function meldungInAbteilung(meldung, abteilung) {
  if (!abteilung) return true
  if (meldung.gefangene?.haus === abteilung) return true
  const gruppen = meldung.metadaten?.zeugenFolgeaktionen?.gruppenAufgaben || []
  return gruppen.some(g => g.haus === abteilung)
}

/** Nur Ergänzungs-Meldungen (Rückgabe an Station) – keine SUBMITTED/IN_PROGRESS (VAL fachliche Prüfung). */
function istErgaenzungsMeldung(meldung) {
  return meldung.status === 'DRAFT' && !!meldung.metadaten?.rueckgabeErgaenzung
}

async function sammleDispositionAufgabenAusMeldung(prisma, meldung) {
  const fa = meldung.metadaten?.zeugenFolgeaktionen
  const aufgaben = []
  const station = meldung.gefangene?.haus || null
  const meldungUeberfaellig = istDringendOderUeberfaellig(meldung)

  for (const b of fa?.bediensteteBenachrichtigungen || []) {
    if (b.status === 'ERLEDIGT') continue
    aufgaben.push({
      id: encodeAufgabeId(meldung.id, AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN, b.zeugeId),
      typ: AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN,
      titel: 'Zeugenaussage ausfüllen',
      status: b.status || 'OFFEN',
      meldungId: meldung.id,
      meldungsNr: meldung.meldungsNr,
      meldungsStatus: meldung.status,
      zugewiesenAn: b.bediensteterId || null,
      zuweisung: ZUWEISUNG.PERSOENLICH,
      station,
      kannZuweisen: false,
      ueberfaellig: meldungUeberfaellig,
      gesendetAm: b.gesendetAm || b.ausgeloestAm || meldung.erstelltAm,
    })
  }

  for (const g of fa?.gruppenAufgaben || []) {
    if (g.status === 'ERLEDIGT') continue
    const istGruppe = !g.uebernommenVon
    aufgaben.push({
      id: encodeAufgabeId(meldung.id, AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN, g.zeugeId),
      typ: AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN,
      titel: 'Zeugenaussage Inhaftierte/r aufnehmen',
      status: g.status || 'OFFEN',
      meldungId: meldung.id,
      meldungsNr: meldung.meldungsNr,
      meldungsStatus: meldung.status,
      zugewiesenAn: g.uebernommenVon || null,
      zugewiesenAnName: g.uebernommenVonName || null,
      zuweisung: istGruppe ? ZUWEISUNG.GRUPPE : ZUWEISUNG.PERSOENLICH,
      station: g.haus || station,
      kannZuweisen: istGruppe,
      ueberfaellig: meldungUeberfaellig,
      gesendetAm: g.gesendetAm || g.ausgeloestAm || meldung.erstelltAm,
    })
  }

  const emp = await resolveBeweismittelEmpfaenger(prisma, meldung)
  return [...aufgaben, ...sammleBeweismittelDispositionAufgaben(meldung, emp)]
}

function mapTeamMeldung(meldung, avdNamen) {
  const meta = meldung.metadaten || {}
  const zugewiesenAn = getZugewiesenAn(meldung)
  return {
    id: meldung.id,
    meldungsNr: meldung.meldungsNr,
    meldungsTyp: meldung.meldungsTyp,
    status: meldung.status,
    ervRelevant: meldung.ervRelevant,
    prioritaet: meldung.prioritaet ?? 0,
    erstelltAm: meldung.erstelltAm,
    zugewiesenAn,
    zugewiesenAnName: zugewiesenAn ? (avdNamen[zugewiesenAn] || zugewiesenAn) : null,
    rueckgabeErgaenzung: meta.rueckgabeErgaenzung || null,
    rueckgabeGrund: meta.rueckgabeErgaenzung?.grund || null,
    station: meldung.gefangene?.haus || null,
    haftraum: meldung.gefangene?.haftraum || null,
    gefangene: meldung.gefangene
      ? { nachname: meldung.gefangene.nachname, vorname: meldung.gefangene.vorname }
      : null,
    ueberfaellig: istDringendOderUeberfaellig(meldung),
    kannZuweisen: true,
  }
}

export async function getTeamUebersicht(prisma, mockNutzer) {
  if (!mockNutzer.istVAL && !mockNutzer.istAL) {
    const err = new Error('Nur VAL/AL haben Zugriff auf die Team-Übersicht.')
    err.status = 403
    throw err
  }

  const abteilung = mockNutzer.istAL ? null : mockNutzer.abteilung

  const where = { status: { not: 'ARCHIVED' } }
  if (!mockNutzer.siehtAlleJVAs) {
    where.gefangene = { jva: mockNutzer.jva }
  }

  const meldungenRaw = await prisma.meldung.findMany({
    where,
    include: { gefangene: true },
    orderBy: { erstelltAm: 'desc' },
  })

  const avdWhere = {
    bediensteterRolle: { in: ['avd', 'stationsleitung'] },
    bediensteterJVA: mockNutzer.jva,
  }
  if (abteilung) avdWhere.haus = abteilung

  const avds = await prisma.bedienstete.findMany({
    where: avdWhere,
    orderBy: { bediensteterName: 'asc' },
  })

  const avdNamen = Object.fromEntries(avds.map(a => [a.bediensteterID, a.bediensteterName]))

  let meldungenInScope = meldungenRaw.filter(m => meldungInAbteilung(m, abteilung))
  meldungenInScope = await pruefeBeweismittelFristEskalationBatch(prisma, meldungenInScope)

  const ergaenzungsMeldungen = meldungenInScope
    .filter(m => istErgaenzungsMeldung(m))
    .map(m => mapTeamMeldung(m, avdNamen))

  const aufgabenNested = await Promise.all(
    meldungenInScope.map(m => sammleDispositionAufgabenAusMeldung(prisma, m)),
  )
  let aufgaben = aufgabenNested.flat()
  if (abteilung) {
    aufgaben = aufgaben.filter(a => !a.station || a.station === abteilung)
  }
  aufgaben = aufgaben
    .filter(a => a.status === 'OFFEN')
    .map(a => ({
      ...a,
      zugewiesenAnName: a.zugewiesenAnName || (a.zugewiesenAn ? avdNamen[a.zugewiesenAn] : null),
    }))

  const beweismittelAufgaben = aufgaben.filter(
    a => a.typ === AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN,
  )

  const kpis = {
    stationAufgabenOffen: aufgaben.length,
    gruppeUnzugewiesen: aufgaben.filter(a => a.zuweisung === ZUWEISUNG.GRUPPE && a.kannZuweisen).length,
    beiStation: aufgaben.filter(a => !!a.zugewiesenAn).length,
    ergaenzungOffen: ergaenzungsMeldungen.length,
    beweismittelOffen: beweismittelAufgaben.length,
    ueberfaellig:
      ergaenzungsMeldungen.filter(m => m.ueberfaellig).length
      + aufgaben.filter(a => a.ueberfaellig).length,
  }

  return {
    data: {
      kpis,
      meldungen: ergaenzungsMeldungen,
      aufgaben,
      avds: avds.map(a => ({
        id: a.bediensteterID,
        name: a.bediensteterName,
        rolle: a.bediensteterRolle,
        abteilung: a.haus,
        station: a.station,
      })),
      sichtbereich: {
        rolle: mockNutzer.rolle,
        abteilung: abteilung || 'Alle Abteilungen',
        jva: mockNutzer.jva,
      },
    },
  }
}
