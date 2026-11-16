/**
 * Frist-Eskalation für Beweismittel-Nachreichung (persönlich → Gruppenpostfach).
 */
import {
  AUFGABEN_TYPEN,
  BEWEISMITTEL_ZEUGE_ID,
  encodeAufgabeId,
} from './arbeitskorbService.js'
import { benachrichtigeEskalation } from './benachrichtigungService.js'

function istFristAbgelaufen(fristBis) {
  if (!fristBis) return false
  const ende = new Date(fristBis)
  if (Number.isNaN(ende.getTime())) return false
  const heute = new Date()
  heute.setHours(23, 59, 59, 999)
  return ende < heute
}

export function istBeweismittelNachreichungUeberfaellig(meldung) {
  const nachreichung = meldung.metadaten?.beweismittelNachreichung
  if (!nachreichung || nachreichung.status !== 'OFFEN') return false
  if (nachreichung.inGruppenpostfach || nachreichung.eskaliertAm) return true
  const frist = nachreichung.fristBis || meldung.metadaten?.rueckgabeErgaenzung?.fristBis
  return istFristAbgelaufen(frist)
}

async function findeEskalationsEmpfaenger(prisma, meldung) {
  const station = meldung.gefangene?.haus
  const jva = meldung.gefangene?.jva
  if (!station || !jva) return []

  const bedienstete = await prisma.bedienstete.findMany({
    where: {
      bediensteterJVA: jva,
      haus: station,
      bediensteterRolle: { in: ['val', 'stationsleitung'] },
    },
  })
  return bedienstete.map(b => b.bediensteterID)
}

export async function pruefeBeweismittelFristEskalation(prisma, meldung) {
  if (meldung.status !== 'DRAFT') return meldung

  const meta = meldung.metadaten || {}
  const nachreichung = meta.beweismittelNachreichung
  if (!nachreichung || nachreichung.status !== 'OFFEN') return meldung
  if (nachreichung.inGruppenpostfach || nachreichung.eskaliertAm) return meldung
  if (!nachreichung.zugewiesenAn && !nachreichung.erfassenderAn) return meldung

  const frist = nachreichung.fristBis || meta.rueckgabeErgaenzung?.fristBis
  if (!istFristAbgelaufen(frist)) return meldung

  const jetzt = new Date().toISOString()
  const alterEmpfaenger = nachreichung.zugewiesenAn || nachreichung.erfassenderAn
  const neuesMeta = {
    ...meta,
    zugewiesenAn: null,
    zugewiesenAnName: null,
    beweismittelNachreichung: {
      ...nachreichung,
      zugewiesenAn: null,
      zugewiesenAnName: null,
      erfassenderAn: null,
      erfassenderAnName: null,
      inGruppenpostfach: true,
      eskaliertAm: jetzt,
      eskaliertGrund: 'frist_abgelaufen',
      urspruenglicherEmpfaenger: alterEmpfaenger,
    },
  }

  const [updated] = await prisma.$transaction([
    prisma.meldung.update({
      where: { id: meldung.id },
      data: { metadaten: neuesMeta },
    }),
    prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: meldung.status,
        kommentar: `Beweismittel-Nachreichung: Frist abgelaufen – Aufgabe an Station ${meldung.gefangene?.haus || 'Gruppe'} eskaliert.`,
        bediensteteId: null,
      },
    }),
  ])

  const aufgabeId = encodeAufgabeId(
    meldung.id,
    AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN,
    BEWEISMITTEL_ZEUGE_ID,
  )
  const empfaengerIds = await findeEskalationsEmpfaenger(prisma, meldung)
  await benachrichtigeEskalation(prisma, {
    meldung,
    station: meldung.gefangene?.haus,
    empfaengerIds,
    aufgabeId,
  })

  return { ...updated, gefangene: meldung.gefangene }
}

export async function pruefeBeweismittelFristEskalationBatch(prisma, meldungen) {
  const results = []
  for (const m of meldungen) {
    results.push(await pruefeBeweismittelFristEskalation(prisma, m))
  }
  return results
}
