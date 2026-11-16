/**
 * Arbeitskorb – persönliche und Gruppenaufgaben (Prototyp).
 */
import { isRichTextEmpty } from '../utils/richText.js'
import {
  alleZeugenaussagenVollstaendig,
  zeugenAbschlussZeitpunkt,
} from './zeugenVollstaendigkeitService.js'
import {
  istBeweismittelNachreichungUeberfaellig,
  pruefeBeweismittelFristEskalationBatch,
} from './beweismittelEskalationService.js'
import { benachrichtigeZuweisung } from './benachrichtigungService.js'
import {
  setGruppenAufgabeZuweisung,
  setMeldungZuweisung,
} from './zuweisungMetaService.js'
import { validateZuweisungsZiel } from './zuweisungService.js'
import {
  einreichenNachBeweismittelNachreichung,
  validiereBeweismittelNachreichungAbschluss,
} from './beweismittelNachreichungService.js'

export const AUFGABEN_TYPEN = {
  ZEUGENAUSSAGE_BESTAETIGEN: 'zeugenaussage_bestaetigen',
  ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN: 'zeugenaussage_inhaftierter_erfassen',
  FACHLICHE_PRUEFUNG: 'fachliche_pruefung',
  BEWEISMITTEL_NACHREICHEN: 'beweismittel_nachreichen',
}

export const ZUWEISUNG = {
  PERSOENLICH: 'persoenlich',
  GRUPPE: 'gruppe',
}

const PRUEF_ZEUGE_ID = 'pruef'
export const BEWEISMITTEL_ZEUGE_ID = 'beweismittel'

const TYP_LABELS = {
  [AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN]: 'Zeugenaussage ausfüllen',
  [AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN]: 'Zeugenaussage Inhaftierte/r aufnehmen',
  [AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG]: 'Fachliche Prüfung',
  [AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN]: 'Beweismittel nachreichen',
}

export function istBeweismittelRueckgabeGrund(grund) {
  return grund === 'beweismittel' || grund === 'beides'
}

const ERFASSER_ROLLEN = new Set(['avd', 'stationsleitung'])

/** Ermittelt den zuständigen AVD/SL für Beweismittel-Nachreichung. */
export async function resolveBeweismittelEmpfaenger(prisma, meldung) {
  const meta = meldung.metadaten || {}
  const nachreichung = meta.beweismittelNachreichung || {}

  if (nachreichung.inGruppenpostfach || nachreichung.eskaliertAm) {
    return { id: null, name: null }
  }

  const ausMeta = async (id, name) => {
    if (!id) return null
    if (name) return { id, name }
    const bed = await prisma.bedienstete.findUnique({ where: { bediensteterID: id } })
    return { id, name: bed?.bediensteterName || id }
  }

  if (nachreichung.zugewiesenAn) {
    return ausMeta(nachreichung.zugewiesenAn, nachreichung.zugewiesenAnName)
  }
  if (meta.zugewiesenAn) {
    return ausMeta(meta.zugewiesenAn, meta.zugewiesenAnName)
  }
  if (nachreichung.erfassenderAn) {
    return ausMeta(nachreichung.erfassenderAn, nachreichung.erfassenderAnName)
  }

  const letzteEinreichung = await prisma.statusVerlauf.findFirst({
    where: { meldungId: meldung.id, status: 'SUBMITTED' },
    orderBy: { erstelltAm: 'desc' },
    include: { bedienstete: true },
  })
  if (letzteEinreichung?.bedienstete) {
    const b = letzteEinreichung.bedienstete
    if (ERFASSER_ROLLEN.has(b.bediensteterRolle)) {
      return { id: b.bediensteterID, name: b.bediensteterName }
    }
  }

  const betreuer = meldung.gefangene?.betreuenderBeamter
  if (betreuer) {
    const bed = await prisma.bedienstete.findUnique({ where: { bediensteterID: betreuer } })
    if (bed && ERFASSER_ROLLEN.has(bed.bediensteterRolle)) {
      return { id: betreuer, name: bed.bediensteterName }
    }
  }

  return { id: null, name: null }
}

export function encodeAufgabeId(meldungId, typ, zeugeId) {
  return `${meldungId}|${typ}|${zeugeId}`
}

export function decodeAufgabeId(aufgabeId) {
  const parts = String(aufgabeId || '').split('|')
  if (parts.length !== 3) return null
  const [meldungId, typ, zeugeId] = parts
  if (!meldungId || !typ || !zeugeId) return null
  if (!Object.values(AUFGABEN_TYPEN).includes(typ)) return null
  return { meldungId, typ, zeugeId }
}

export async function enrichMockNutzerStandort(prisma, mockNutzer) {
  const bed = await prisma.bedienstete.findUnique({
    where: { bediensteterID: mockNutzer.nutzerId },
  })
  return {
    ...mockNutzer,
    nutzerJva: bed?.bediensteterJVA || mockNutzer.jva,
    nutzerHaus: bed?.haus || mockNutzer.abteilung || null,
  }
}

function darfPruefAufgabenSehen(mockNutzer) {
  return mockNutzer.istVAL || mockNutzer.istAL
}

function findZeuge(metadaten, zeugeId) {
  const zeugen = metadaten?.zeugen
  if (!Array.isArray(zeugen)) return null
  return zeugen.find(z => z.id === zeugeId) || null
}

function passtNutzerZuGruppe(nutzer, ga) {
  if (!ga?.haus || !nutzer.nutzerHaus) return false
  return ga.jva === nutzer.nutzerJva && ga.haus === nutzer.nutzerHaus
}

function passtNutzerZuStation(meldung, nutzer) {
  const haus = meldung.gefangene?.haus
  const jva = meldung.gefangene?.jva
  if (!haus || !nutzer.nutzerHaus) return false
  return jva === nutzer.nutzerJva && haus === nutzer.nutzerHaus
}

function meldungsKontextAusMetadaten(metadaten, eigeneZeugeId) {
  const meta = metadaten || {}
  const zeugen = Array.isArray(meta.zeugen) ? meta.zeugen : []
  return {
    tatvorwurf: meta.tatvorwurf || meta.strafanzeigeUntertyp || null,
    tatzeit: meta.tatzeit || null,
    tatort: meta.tatort?.trim() || null,
    weitereZeugen: zeugen
      .filter(z => z.id !== eigeneZeugeId && z.name?.trim())
      .map(z => ({
        id: z.id,
        name: z.name.trim(),
        zeugenTyp: z.zeugenTyp || '',
        aussage: typeof z.aussage === 'string' ? z.aussage : '',
      })),
    zeugenVollstaendig: alleZeugenaussagenVollstaendig(meta),
    beweismittelGesichert: meta.beweismittelGesichert || null,
    beweismittelAngaben: meta.beweismittelAngaben || null,
  }
}

function aufgabeBasis(meldung, typ, zeugeId, folge, extra = {}) {
  return {
    id: encodeAufgabeId(meldung.id, typ, zeugeId),
    typ,
    titel: TYP_LABELS[typ] || typ,
    status: folge.status || 'OFFEN',
    meldungId: meldung.id,
    meldungsNr: meldung.meldungsNr,
    meldungsTyp: meldung.meldungsTyp,
    meldungsStatus: meldung.status,
    prioritaet: meldung.prioritaet ?? 0,
    dringend: (meldung.prioritaet ?? 0) > 0,
    zeugeId: zeugeId === PRUEF_ZEUGE_ID ? null : zeugeId,
    zeugeName: folge.zeugeName || extra.zeugeName || '',
    fristBis: folge.fristBis || null,
    gesendetAm: folge.gesendetAm || folge.ausgeloestAm || null,
    nachricht: folge.nachricht || '',
    sachverhalt: meldung.sachverhalt,
    meldungsKontext: meldungsKontextAusMetadaten(
      meldung.metadaten,
      zeugeId === PRUEF_ZEUGE_ID ? null : zeugeId,
    ),
    gefangene: meldung.gefangene
      ? {
        nachname: meldung.gefangene.nachname,
        vorname: meldung.gefangene.vorname,
        gefangenenNr: meldung.gefangene.gefangenenNr,
      }
      : null,
    zuweisung: extra.zuweisung || ZUWEISUNG.PERSOENLICH,
    ...extra,
  }
}

function istPruefbereit(meldung) {
  if (meldung.meldungsTyp === 'STRAFANZEIGE') {
    return alleZeugenaussagenVollstaendig(meldung.metadaten)
  }
  return true
}

function sammlePersoenlicheAufgabenAusMeldung(meldung, nutzer) {
  const fa = meldung.metadaten?.zeugenFolgeaktionen
  if (!fa) return []

  const aufgaben = []

  for (const b of fa.bediensteteBenachrichtigungen || []) {
    if (!b.bediensteterId || b.bediensteterId !== nutzer.nutzerId) continue
    aufgaben.push(aufgabeBasis(
      meldung,
      AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN,
      b.zeugeId,
      b,
      {
        zeuge: findZeuge(meldung.metadaten, b.zeugeId),
        zuweisung: ZUWEISUNG.PERSOENLICH,
      },
    ))
  }

  for (const g of fa.gruppenAufgaben || []) {
    if (g.uebernommenVon !== nutzer.nutzerId) continue
    aufgaben.push(aufgabeBasis(
      meldung,
      AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN,
      g.zeugeId,
      g,
      {
        zeuge: findZeuge(meldung.metadaten, g.zeugeId),
        zuweisung: ZUWEISUNG.PERSOENLICH,
        standort: [g.jva, g.haus, g.haftraum].filter(Boolean).join(' · '),
        uebernommen: {
          von: g.uebernommenVon,
          name: g.uebernommenVonName,
          am: g.uebernommenAm,
        },
        kannUebernehmen: false,
        uebernommenVonMir: true,
      },
    ))
  }

  return aufgaben
}

function sammleGruppenAufgabenAusMeldung(meldung, nutzer) {
  const fa = meldung.metadaten?.zeugenFolgeaktionen
  if (!fa) return []

  const aufgaben = []

  for (const g of fa.gruppenAufgaben || []) {
    if (g.uebernommenVon) continue
    if (g.status === 'ERLEDIGT') continue
    if (!passtNutzerZuGruppe(nutzer, g)) continue

    aufgaben.push(aufgabeBasis(
      meldung,
      AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN,
      g.zeugeId,
      g,
      {
        zeuge: findZeuge(meldung.metadaten, g.zeugeId),
        zuweisung: ZUWEISUNG.GRUPPE,
        standort: [g.jva, g.haus, g.haftraum].filter(Boolean).join(' · '),
        empfaengerAnzahl: g.empfaengerAnzahl ?? null,
        kannUebernehmen: true,
        uebernommenVonMir: false,
      },
    ))
  }

  return aufgaben
}

function sammlePruefAufgabeAusMeldung(meldung, mockNutzer) {
  if (!darfPruefAufgabenSehen(mockNutzer)) return null
  if (meldung.status === 'DRAFT') return null

  const pruefbereit = istPruefbereit(meldung)

  if (meldung.status === 'SUBMITTED') {
    if (!pruefbereit) return null
    const gesendetAm = zeugenAbschlussZeitpunkt(meldung.metadaten)
      || meldung.erstelltAm
    return aufgabeBasis(
      meldung,
      AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG,
      PRUEF_ZEUGE_ID,
      {
        status: 'OFFEN',
        gesendetAm,
        nachricht:
          'Alle Zeugenaussagen liegen vor. Bitte nehmen Sie die fachliche Prüfung auf '
          + '(Übernahme in den Status „Fachliche Prüfung“ innerhalb von 24 Stunden, SLA-Prototyp).',
      },
      { zuweisung: ZUWEISUNG.PERSOENLICH },
    )
  }

  if (['IN_PROGRESS', 'FORWARDED', 'ARCHIVED'].includes(meldung.status) && pruefbereit) {
    return aufgabeBasis(
      meldung,
      AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG,
      PRUEF_ZEUGE_ID,
      {
        status: 'ERLEDIGT',
        gesendetAm: zeugenAbschlussZeitpunkt(meldung.metadaten) || meldung.erstelltAm,
        nachricht: 'Fachliche Prüfung wurde aufgenommen.',
      },
      { zuweisung: ZUWEISUNG.PERSOENLICH },
    )
  }

  return null
}

function sammleBeweismittelAufgabeAusMeldung(meldung, nutzer, beweismittelEmpfaengerId = null) {
  if (meldung.status !== 'DRAFT') return []

  const meta = meldung.metadaten || {}
  const rueckgabe = meta.rueckgabeErgaenzung
  const nachreichung = meta.beweismittelNachreichung
  if (!rueckgabe || !istBeweismittelRueckgabeGrund(rueckgabe.grund)) return []
  if (!nachreichung || nachreichung.status === 'ERLEDIGT') return []

  const station = meldung.gefangene?.haus || null
  const zugewiesenAn = beweismittelEmpfaengerId
    || nachreichung.zugewiesenAn
    || meta.zugewiesenAn
    || nachreichung.erfassenderAn
    || null

  if (zugewiesenAn) {
    if (zugewiesenAn !== nutzer.nutzerId) return []
    return [aufgabeBasis(
      meldung,
      AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN,
      BEWEISMITTEL_ZEUGE_ID,
      {
        status: nachreichung.status || 'OFFEN',
        fristBis: nachreichung.fristBis || rueckgabe.fristBis || null,
        gesendetAm: nachreichung.angefordertAm || rueckgabe.zurueckgegebenAm || meldung.erstelltAm,
        nachricht: nachreichung.kommentar || rueckgabe.kommentar || '',
      },
      {
        zuweisung: ZUWEISUNG.PERSOENLICH,
        rueckgabeGrund: rueckgabe.grund,
        standort: station,
        kannUebernehmen: false,
        uebernommenVonMir: true,
        eskaliert: !!(nachreichung.eskaliertAm || nachreichung.inGruppenpostfach),
      },
    )]
  }

  if (!passtNutzerZuStation(meldung, nutzer)) return []

  return [aufgabeBasis(
    meldung,
    AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN,
    BEWEISMITTEL_ZEUGE_ID,
    {
      status: nachreichung.status || 'OFFEN',
      fristBis: nachreichung.fristBis || rueckgabe.fristBis || null,
      gesendetAm: nachreichung.angefordertAm || rueckgabe.zurueckgegebenAm || meldung.erstelltAm,
      nachricht: nachreichung.kommentar || rueckgabe.kommentar || '',
    },
    {
      zuweisung: ZUWEISUNG.GRUPPE,
      rueckgabeGrund: rueckgabe.grund,
      standort: station,
      kannUebernehmen: true,
      kannZuweisen: true,
      uebernommenVonMir: false,
      eskaliert: !!(nachreichung.eskaliertAm || nachreichung.inGruppenpostfach),
    },
  )]
}

/** Für Team-Übersicht: alle offenen Beweismittel-Aufgaben (ohne Nutzerfilter). */
export function sammleBeweismittelDispositionAufgaben(meldung, beweismittelEmpfaenger = null) {
  if (meldung.status !== 'DRAFT') return []

  const meta = meldung.metadaten || {}
  const rueckgabe = meta.rueckgabeErgaenzung
  const nachreichung = meta.beweismittelNachreichung
  if (!rueckgabe || !istBeweismittelRueckgabeGrund(rueckgabe.grund)) return []
  if (!nachreichung || nachreichung.status === 'ERLEDIGT') return []

  const station = meldung.gefangene?.haus || null
  const zugewiesenAn = beweismittelEmpfaenger?.id
    || nachreichung.zugewiesenAn
    || meta.zugewiesenAn
    || nachreichung.erfassenderAn
    || null
  const zugewiesenAnName = beweismittelEmpfaenger?.name || nachreichung.zugewiesenAnName || null
  const istGruppe = !zugewiesenAn

  return [{
    id: encodeAufgabeId(meldung.id, AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN, BEWEISMITTEL_ZEUGE_ID),
    typ: AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN,
    titel: 'Beweismittel nachreichen',
    status: nachreichung.status || 'OFFEN',
    meldungId: meldung.id,
    meldungsNr: meldung.meldungsNr,
    meldungsStatus: meldung.status,
    zugewiesenAn,
    zugewiesenAnName,
    zuweisung: istGruppe ? ZUWEISUNG.GRUPPE : ZUWEISUNG.PERSOENLICH,
    station,
    rueckgabeGrund: rueckgabe.grund,
    kannZuweisen: true,
    eskaliert: !!(nachreichung.eskaliertAm || nachreichung.inGruppenpostfach),
    gesendetAm: nachreichung.angefordertAm || rueckgabe.zurueckgegebenAm || meldung.erstelltAm,
    ueberfaellig: istBeweismittelNachreichungUeberfaellig(meldung),
  }]
}

function sammleAlleAufgabenAusMeldung(meldung, nutzer, beweismittelEmpfaengerId = null) {
  const persoenlich = sammlePersoenlicheAufgabenAusMeldung(meldung, nutzer)
  const gruppe = sammleGruppenAufgabenAusMeldung(meldung, nutzer)
  const beweismittel = sammleBeweismittelAufgabeAusMeldung(meldung, nutzer, beweismittelEmpfaengerId)
  const pruefAufgabe = sammlePruefAufgabeAusMeldung(meldung, nutzer)
  const basis = [...persoenlich, ...gruppe, ...beweismittel]
  return pruefAufgabe ? [...basis, pruefAufgabe] : basis
}

async function sammleAufgabenFuerMeldung(prisma, meldung, nutzer) {
  const emp = await resolveBeweismittelEmpfaenger(prisma, meldung)
  return sammleAlleAufgabenAusMeldung(meldung, nutzer, emp.id)
}

function filterNachBereich(aufgaben, bereich) {
  if (bereich === ZUWEISUNG.PERSOENLICH) {
    return aufgaben.filter(a => a.zuweisung === ZUWEISUNG.PERSOENLICH)
  }
  if (bereich === ZUWEISUNG.GRUPPE) {
    return aufgaben.filter(a => a.zuweisung === ZUWEISUNG.GRUPPE)
  }
  return aufgaben
}

function sortArbeitskorbAufgaben(aufgaben) {
  return aufgaben.sort((a, b) => {
    const statusOffenZuerst = a.status === 'OFFEN' ? 0 : 1
    const statusOffenZuerstB = b.status === 'OFFEN' ? 0 : 1
    if (statusOffenZuerst !== statusOffenZuerstB) {
      return statusOffenZuerst - statusOffenZuerstB
    }

    const dringendZuerst = a.dringend ? 0 : 1
    const dringendZuerstB = b.dringend ? 0 : 1
    if (dringendZuerst !== dringendZuerstB) {
      return dringendZuerst - dringendZuerstB
    }

    return new Date(b.gesendetAm || 0) - new Date(a.gesendetAm || 0)
  })
}

export async function listArbeitskorbAufgaben(prisma, mockNutzer, { status, bereich } = {}) {
  const nutzer = await enrichMockNutzerStandort(prisma, mockNutzer)
  const { siehtAlleJVAs } = nutzer

  const where = {
    status: { not: 'ARCHIVED' },
  }
  if (!siehtAlleJVAs) where.gefangene = { jva: nutzer.nutzerJva }

  let meldungen = await prisma.meldung.findMany({
    where,
    include: { gefangene: true },
    orderBy: { erstelltAm: 'desc' },
  })

  meldungen = await pruefeBeweismittelFristEskalationBatch(prisma, meldungen)

  const aufgabenNested = await Promise.all(
    meldungen.map(async (m) => {
      const emp = await resolveBeweismittelEmpfaenger(prisma, m)
      return sammleAlleAufgabenAusMeldung(m, nutzer, emp.id)
    }),
  )
  let aufgaben = aufgabenNested.flat()

  if (status === 'OFFEN') aufgaben = aufgaben.filter(a => a.status === 'OFFEN')
  else if (status === 'ERLEDIGT') aufgaben = aufgaben.filter(a => a.status === 'ERLEDIGT')

  const offenPersoenlich = aufgaben.filter(
    a => a.status === 'OFFEN' && a.zuweisung === ZUWEISUNG.PERSOENLICH,
  ).length
  const offenGruppe = aufgaben.filter(
    a => a.status === 'OFFEN' && a.zuweisung === ZUWEISUNG.GRUPPE,
  ).length

  aufgaben = filterNachBereich(aufgaben, bereich)

  sortArbeitskorbAufgaben(aufgaben)

  const offen = aufgaben.filter(a => a.status === 'OFFEN').length

  return {
    data: aufgaben,
    total: aufgaben.length,
    offen,
    offenPersoenlich,
    offenGruppe,
  }
}

export async function getArbeitskorbAufgabe(prisma, mockNutzer, aufgabeId) {
  const nutzer = await enrichMockNutzerStandort(prisma, mockNutzer)
  const parsed = decodeAufgabeId(aufgabeId)
  if (!parsed) {
    const err = new Error('Ungültige Aufgaben-ID.')
    err.status = 400
    throw err
  }

  const meldung = await prisma.meldung.findUnique({
    where: { id: parsed.meldungId },
    include: { gefangene: true, statusVerlauf: { orderBy: { erstelltAm: 'asc' } } },
  })
  if (!meldung) {
    const err = new Error('Meldung nicht gefunden.')
    err.status = 404
    throw err
  }

  const alle = await sammleAufgabenFuerMeldung(prisma, meldung, nutzer)
  const aufgabe = alle.find(a => a.id === aufgabeId)
  if (!aufgabe) {
    const err = new Error('Aufgabe nicht gefunden oder nicht für Sie bestimmt.')
    err.status = 404
    throw err
  }

  return { data: aufgabe }
}

function findGruppenAufgabeMeta(metadaten, zeugeId) {
  const fa = metadaten?.zeugenFolgeaktionen
  const gruppen = fa?.gruppenAufgaben || []
  const idx = gruppen.findIndex(g => g.zeugeId === zeugeId)
  if (idx < 0) return { idx: -1, gruppen, fa: fa || {} }
  return { idx, gruppen: [...gruppen], fa: { ...(fa || {}) } }
}

async function uebernehmenBeweismittelAufgabe(prisma, nutzer, meldung, parsed) {
  const meta = { ...(meldung.metadaten || {}) }
  const nachreichung = meta.beweismittelNachreichung
  if (!nachreichung || nachreichung.status === 'ERLEDIGT') {
    const err = new Error('Beweismittel-Aufgabe nicht gefunden.')
    err.status = 404
    throw err
  }
  if (nachreichung.zugewiesenAn && nachreichung.zugewiesenAn !== nutzer.nutzerId) {
    const err = new Error('Diese Aufgabe wurde bereits zugewiesen.')
    err.status = 409
    throw err
  }
  if (!passtNutzerZuStation(meldung, nutzer)) {
    const err = new Error('Sie gehören nicht zur zuständigen Station für diese Aufgabe.')
    err.status = 403
    throw err
  }

  const bedienstete = await prisma.bedienstete.findUnique({
    where: { bediensteterID: nutzer.nutzerId },
  })
  const jetzt = new Date().toISOString()

  meta.beweismittelNachreichung = {
    ...nachreichung,
    zugewiesenAn: nutzer.nutzerId,
    zugewiesenAnName: bedienstete?.bediensteterName || nutzer.nutzerId,
    uebernommenAm: jetzt,
  }

  const [updated] = await prisma.$transaction([
    prisma.meldung.update({
      where: { id: meldung.id },
      data: { metadaten: meta },
    }),
    prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: meldung.status,
        kommentar: `Arbeitskorb: Beweismittel-Nachreichung übernommen (${nutzer.nutzerId}).`,
        bediensteteId: bedienstete?.id || null,
      },
    }),
  ])

  const aufgabeId = encodeAufgabeId(parsed.meldungId, parsed.typ, parsed.zeugeId)
  const neu = sammleBeweismittelAufgabeAusMeldung(
    { ...updated, gefangene: meldung.gefangene },
    nutzer,
  ).find(a => a.id === aufgabeId)

  return { data: neu, message: 'Aufgabe übernommen.' }
}

export async function uebernehmenArbeitskorbAufgabe(prisma, mockNutzer, aufgabeId) {
  const nutzer = await enrichMockNutzerStandort(prisma, mockNutzer)
  const parsed = decodeAufgabeId(aufgabeId)
  if (!parsed) {
    const err = new Error('Diese Aufgabe kann nicht übernommen werden.')
    err.status = 400
    throw err
  }

  if (parsed.typ === AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN) {
    const meldung = await prisma.meldung.findUnique({
      where: { id: parsed.meldungId },
      include: { gefangene: true },
    })
    if (!meldung) {
      const err = new Error('Meldung nicht gefunden.')
      err.status = 404
      throw err
    }
    return uebernehmenBeweismittelAufgabe(prisma, nutzer, meldung, parsed)
  }

  if (parsed.typ !== AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN) {
    const err = new Error('Diese Aufgabe kann nicht übernommen werden.')
    err.status = 400
    throw err
  }

  const meldung = await prisma.meldung.findUnique({
    where: { id: parsed.meldungId },
    include: { gefangene: true },
  })
  if (!meldung) {
    const err = new Error('Meldung nicht gefunden.')
    err.status = 404
    throw err
  }

  const meta = { ...(meldung.metadaten || {}) }
  const { idx, gruppen, fa } = findGruppenAufgabeMeta(meta, parsed.zeugeId)
  if (idx < 0) {
    const err = new Error('Gruppenaufgabe nicht gefunden.')
    err.status = 404
    throw err
  }

  const ga = gruppen[idx]
  if (ga.status === 'ERLEDIGT') {
    const err = new Error('Diese Aufgabe ist bereits abgeschlossen.')
    err.status = 409
    throw err
  }
  if (ga.uebernommenVon && ga.uebernommenVon !== nutzer.nutzerId) {
    const err = new Error('Diese Aufgabe wurde bereits von einer anderen Person übernommen.')
    err.status = 409
    throw err
  }
  if (!passtNutzerZuGruppe(nutzer, ga)) {
    const err = new Error('Sie gehören nicht zur zuständigen Abteilung für diese Aufgabe.')
    err.status = 403
    throw err
  }

  const bedienstete = await prisma.bedienstete.findUnique({
    where: { bediensteterID: nutzer.nutzerId },
  })
  const jetzt = new Date().toISOString()

  gruppen[idx] = {
    ...ga,
    uebernommenVon: nutzer.nutzerId,
    uebernommenVonName: bedienstete?.bediensteterName || nutzer.nutzerId,
    uebernommenAm: jetzt,
  }
  meta.zeugenFolgeaktionen = { ...fa, gruppenAufgaben: gruppen }

  const [updated] = await prisma.$transaction([
    prisma.meldung.update({
      where: { id: meldung.id },
      data: { metadaten: meta },
    }),
    prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: meldung.status,
        kommentar: `Arbeitskorb: Gruppenaufgabe Zeugenaussage übernommen (${nutzer.nutzerId}).`,
        bediensteteId: bedienstete?.id || null,
      },
    }),
  ])

  const neu = (await sammleAufgabenFuerMeldung(
    prisma,
    { ...updated, gefangene: meldung.gefangene },
    nutzer,
  )).find(a => a.id === aufgabeId && a.zuweisung === ZUWEISUNG.PERSOENLICH)

  return { data: neu, message: 'Aufgabe übernommen.' }
}

export async function zuweisenArbeitskorbAufgabe(prisma, mockNutzer, aufgabeId, { zugewiesenAn, kommentar } = {}) {
  if (!mockNutzer.istVAL && !mockNutzer.istAL) {
    const err = new Error('Nur VAL/AL dürfen Arbeitskorb-Aufgaben zuweisen.')
    err.status = 403
    throw err
  }

  const zurueckAnGruppe = zugewiesenAn === null || zugewiesenAn === ''
  let zielBedienstete = null
  if (!zurueckAnGruppe) {
    zielBedienstete = await validateZuweisungsZiel(prisma, mockNutzer, zugewiesenAn)
  }

  const parsed = decodeAufgabeId(aufgabeId)
  if (!parsed) {
    const err = new Error('Diese Aufgabe kann nicht zugewiesen werden.')
    err.status = 400
    throw err
  }

  const meldung = await prisma.meldung.findUnique({
    where: { id: parsed.meldungId },
    include: { gefangene: true },
  })
  if (!meldung) {
    const err = new Error('Meldung nicht gefunden.')
    err.status = 404
    throw err
  }

  const zuweiser = await prisma.bedienstete.findUnique({
    where: { bediensteterID: mockNutzer.nutzerId },
  })
  const jetzt = new Date().toISOString()
  let meta = { ...(meldung.metadaten || {}) }
  let alterEmpfaengerId = null
  let zuweisungText = ''

  if (parsed.typ === AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN) {
    const nachreichung = meta.beweismittelNachreichung
    if (!nachreichung || nachreichung.status === 'ERLEDIGT') {
      const err = new Error('Beweismittel-Aufgabe nicht gefunden.')
      err.status = 404
      throw err
    }
    alterEmpfaengerId = nachreichung.zugewiesenAn || meta.zugewiesenAn || null
    if (zurueckAnGruppe) {
      meta = setMeldungZuweisung(meta, {
        zielId: null,
        vonId: mockNutzer.nutzerId,
        vonName: zuweiser?.bediensteterName,
        jetzt,
        inGruppenpostfach: true,
      })
      zuweisungText = 'Arbeitskorb: Beweismittel-Nachreichung zurück an Gruppe gegeben'
    } else {
      meta = setMeldungZuweisung(meta, {
        zielId: zielBedienstete.bediensteterID,
        zielName: zielBedienstete.bediensteterName,
        vonId: mockNutzer.nutzerId,
        vonName: zuweiser?.bediensteterName,
        jetzt,
      })
      zuweisungText = `Arbeitskorb: Beweismittel-Nachreichung zugewiesen an ${zielBedienstete.bediensteterName} (${zielBedienstete.bediensteterID})`
    }
  } else if (parsed.typ === AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN) {
    const { idx, gruppen } = findGruppenAufgabeMeta(meta, parsed.zeugeId)
    if (idx < 0) {
      const err = new Error('Gruppenaufgabe nicht gefunden.')
      err.status = 404
      throw err
    }
    const ga = gruppen[idx]
    if (ga.status === 'ERLEDIGT') {
      const err = new Error('Diese Aufgabe ist bereits abgeschlossen.')
      err.status = 409
      throw err
    }
    alterEmpfaengerId = ga.uebernommenVon || null
    if (zurueckAnGruppe) {
      const res = setGruppenAufgabeZuweisung(meta, parsed.zeugeId, {
        vonId: mockNutzer.nutzerId,
        jetzt,
        freigeben: true,
      })
      meta = res.meta
      zuweisungText = 'Arbeitskorb: Zeugenaussage-Aufgabe zurück an Gruppe gegeben'
    } else {
      const res = setGruppenAufgabeZuweisung(meta, parsed.zeugeId, {
        zielId: zielBedienstete.bediensteterID,
        zielName: zielBedienstete.bediensteterName,
        vonId: mockNutzer.nutzerId,
        vonName: zuweiser?.bediensteterName,
        jetzt,
      })
      meta = res.meta
      zuweisungText = `Arbeitskorb: Zeugenaussage-Aufgabe zugewiesen an ${zielBedienstete.bediensteterName} (${zielBedienstete.bediensteterID})`
    }
  } else {
    const err = new Error('Diese Aufgabe kann nicht zugewiesen werden.')
    err.status = 400
    throw err
  }

  const [updated] = await prisma.$transaction([
    prisma.meldung.update({
      where: { id: meldung.id },
      data: { metadaten: meta },
    }),
    prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: meldung.status,
        kommentar: [zuweisungText, kommentar?.trim()].filter(Boolean).join(' – '),
        bediensteteId: zuweiser?.id || null,
      },
    }),
  ])

  await benachrichtigeZuweisung(prisma, {
    meldung,
    zielId: zurueckAnGruppe ? null : zielBedienstete.bediensteterID,
    zielName: zurueckAnGruppe ? null : zielBedienstete.bediensteterName,
    alterEmpfaengerId,
    kommentar: kommentar?.trim(),
    aufgabeId,
    vonNutzerId: mockNutzer.nutzerId,
  })

  const zielNutzer = zurueckAnGruppe
    ? mockNutzer
    : {
      ...mockNutzer,
      nutzerId: zielBedienstete.bediensteterID,
      nutzerHaus: zielBedienstete.haus,
      nutzerJva: zielBedienstete.bediensteterJVA,
    }
  const angereichert = await enrichMockNutzerStandort(prisma, zielNutzer)
  const neu = (await sammleAufgabenFuerMeldung(
    prisma,
    { ...updated, gefangene: meldung.gefangene },
    angereichert,
  )).find(a => a.id === aufgabeId)

  return {
    data: neu || null,
    message: zurueckAnGruppe ? 'Aufgabe an Gruppe zurückgegeben.' : 'Aufgabe zugewiesen.',
  }
}

export async function abschliessenArbeitskorbAufgabe(prisma, mockNutzer, aufgabeId, body) {
  const nutzer = await enrichMockNutzerStandort(prisma, mockNutzer)
  const parsed = decodeAufgabeId(aufgabeId)
  if (!parsed) {
    const err = new Error('Ungültige Aufgaben-ID.')
    err.status = 400
    throw err
  }

  const meldung = await prisma.meldung.findUnique({
    where: { id: parsed.meldungId },
    include: { gefangene: true },
  })
  if (!meldung) {
    const err = new Error('Meldung nicht gefunden.')
    err.status = 404
    throw err
  }

  const alle = await sammleAufgabenFuerMeldung(prisma, meldung, nutzer)
  const aufgabe = alle.find(a => a.id === aufgabeId)
  if (!aufgabe) {
    const err = new Error('Aufgabe nicht gefunden oder nicht für Sie bestimmt.')
    err.status = 404
    throw err
  }
  if (aufgabe.status === 'ERLEDIGT') {
    const err = new Error('Diese Aufgabe ist bereits abgeschlossen.')
    err.status = 409
    throw err
  }

  const bedienstete = await prisma.bedienstete.findUnique({
    where: { bediensteterID: nutzer.nutzerId },
  })

  if (parsed.typ === AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG) {
    if (!darfPruefAufgabenSehen(nutzer)) {
      const err = new Error('Keine Berechtigung für fachliche Prüfung.')
      err.status = 403
      throw err
    }
    if (meldung.status !== 'SUBMITTED') {
      const err = new Error('Die Meldung ist nicht mehr zur Prüfung vorgemerkt.')
      err.status = 409
      throw err
    }
    if (!istPruefbereit(meldung)) {
      const err = new Error('Es liegen noch nicht alle Zeugenaussagen vor.')
      err.status = 409
      throw err
    }

    const kommentar = body?.kommentar?.trim()
      || `Arbeitskorb: Fachliche Prüfung aufgenommen (${nutzer.nutzerId}).`

    const [updated] = await prisma.$transaction([
      prisma.meldung.update({
        where: { id: meldung.id },
        data: { status: 'IN_PROGRESS' },
      }),
      prisma.statusVerlauf.create({
        data: {
          meldungId: meldung.id,
          status: 'IN_PROGRESS',
          kommentar,
          bediensteteId: bedienstete?.id || null,
        },
      }),
    ])

    const neu = (await sammleAufgabenFuerMeldung(
      prisma,
      { ...updated, gefangene: meldung.gefangene, metadaten: meldung.metadaten },
      nutzer,
    )).find(a => a.id === aufgabeId)

    return {
      data: neu ? { ...neu, status: 'ERLEDIGT', meldungsStatus: 'IN_PROGRESS' } : null,
      message: 'Fachliche Prüfung aufgenommen.',
    }
  }

  if (parsed.typ === AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN) {
    if (meldung.status !== 'DRAFT') {
      const err = new Error('Die Meldung ist nicht mehr im Entwurfsstatus.')
      err.status = 409
      throw err
    }

    const meta = { ...(meldung.metadaten || {}) }
    const nachreichung = meta.beweismittelNachreichung
    if (!nachreichung || nachreichung.status === 'ERLEDIGT') {
      const err = new Error('Beweismittel-Aufgabe nicht gefunden.')
      err.status = 404
      throw err
    }

    const zustaendig = nachreichung.zugewiesenAn || nachreichung.erfassenderAn
    if (zustaendig && zustaendig !== nutzer.nutzerId) {
      const err = new Error('Diese Aufgabe ist einer anderen Person zugewiesen.')
      err.status = 403
      throw err
    }
    if (!zustaendig && !passtNutzerZuStation(meldung, nutzer)) {
      const err = new Error('Sie gehören nicht zur zuständigen Station für diese Aufgabe.')
      err.status = 403
      throw err
    }

    const {
      beweismittelGesichert,
      beweismittelAngaben,
      beweismittelKeineBegruendung,
    } = body || {}

    const metaUpdate = {
      ...meta,
      beweismittelGesichert: beweismittelGesichert || meta.beweismittelGesichert,
      beweismittelAngaben: beweismittelAngaben ?? meta.beweismittelAngaben,
      beweismittelKeineBegruendung: beweismittelKeineBegruendung ?? meta.beweismittelKeineBegruendung,
    }

    const validierungsFehler = validiereBeweismittelNachreichungAbschluss(metaUpdate)
    if (validierungsFehler) {
      const err = new Error(validierungsFehler)
      err.status = 400
      throw err
    }

    const { meldung: updated } = await einreichenNachBeweismittelNachreichung(prisma, {
      meldung,
      meta: metaUpdate,
      nutzerId: nutzer.nutzerId,
      bediensteteId: bedienstete?.id || null,
      kommentar: `Arbeitskorb: Beweismittel-Nachreichung abgeschlossen (${nutzer.nutzerId}).`,
    })

    const neu = (await sammleAufgabenFuerMeldung(
      prisma,
      { ...updated, gefangene: meldung.gefangene },
      nutzer,
    )).find(a => a.id === aufgabeId)

    return {
      data: neu ? { ...neu, status: 'ERLEDIGT', meldungsStatus: 'SUBMITTED' } : null,
      message: 'Beweismittel-Nachreichung abgeschlossen und Meldung eingereicht.',
    }
  }

  if (parsed.typ === AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN) {
    const { aussage } = body || {}
    if (isRichTextEmpty(aussage)) {
      const err = new Error('Bitte halten Sie die Zeugenaussage fest.')
      err.status = 400
      throw err
    }

    const meta = { ...(meldung.metadaten || {}) }
    const { idx, gruppen, fa } = findGruppenAufgabeMeta(meta, parsed.zeugeId)
    if (idx < 0) {
      const err = new Error('Gruppenaufgabe nicht gefunden.')
      err.status = 404
      throw err
    }

    const ga = gruppen[idx]
    if (!ga.uebernommenVon || ga.uebernommenVon !== nutzer.nutzerId) {
      const err = new Error('Bitte übernehmen Sie die Aufgabe zuerst.')
      err.status = 409
      throw err
    }

    const zeugen = Array.isArray(meta.zeugen) ? [...meta.zeugen] : []
    const zIdx = zeugen.findIndex(z => z.id === parsed.zeugeId)
    if (zIdx < 0) {
      const err = new Error('Zeuge nicht in der Meldung gefunden.')
      err.status = 404
      throw err
    }

    const jetzt = new Date().toISOString()
    zeugen[zIdx] = {
      ...zeugen[zIdx],
      aussage: String(aussage).trim(),
      aussageAufgenommenAm: jetzt,
      aussageAufgenommenVon: nutzer.nutzerId,
    }

    gruppen[idx] = {
      ...ga,
      status: 'ERLEDIGT',
      erledigtAm: jetzt,
      erledigtVon: nutzer.nutzerId,
    }
    meta.zeugen = zeugen
    meta.zeugenFolgeaktionen = { ...fa, gruppenAufgaben: gruppen }

    const [updated] = await prisma.$transaction([
      prisma.meldung.update({
        where: { id: meldung.id },
        data: { metadaten: meta },
      }),
      prisma.statusVerlauf.create({
        data: {
          meldungId: meldung.id,
          status: meldung.status,
          kommentar: `Arbeitskorb: Zeugenaussage Inhaftierte/r aufgenommen (${nutzer.nutzerId}).`,
          bediensteteId: bedienstete?.id || null,
        },
      }),
    ])

    const neu = sammlePersoenlicheAufgabenAusMeldung(
      { ...updated, gefangene: meldung.gefangene },
      nutzer,
    ).find(a => a.id === aufgabeId)

    return { data: neu ? { ...neu, status: 'ERLEDIGT' } : null, message: 'Aufgabe abgeschlossen.' }
  }

  if (parsed.typ !== AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN) {
    const err = new Error('Dieser Aufgabentyp ist nicht mehr verfügbar.')
    err.status = 410
    throw err
  }

  const { aussage, bestaetigt } = body || {}
  if (isRichTextEmpty(aussage)) {
    const err = new Error('Bitte halten Sie die Zeugenaussage fest.')
    err.status = 400
    throw err
  }

  const meta = { ...(meldung.metadaten || {}) }
  const zeugen = Array.isArray(meta.zeugen) ? [...meta.zeugen] : []
  const zIdx = zeugen.findIndex(z => z.id === parsed.zeugeId)
  if (zIdx < 0) {
    const err = new Error('Zeuge nicht in der Meldung gefunden.')
    err.status = 404
    throw err
  }

  const jetzt = new Date().toISOString()
  const fa = { ...(meta.zeugenFolgeaktionen || {}) }

  if (bestaetigt !== true) {
    const err = new Error('Bitte bestätigen Sie die Richtigkeit Ihrer Zeugenaussage.')
    err.status = 400
    throw err
  }

  zeugen[zIdx] = {
    ...zeugen[zIdx],
    aussage: String(aussage).trim(),
    aussageBestaetigtAm: jetzt,
    aussageBestaetigtVon: nutzer.nutzerId,
  }

  const benachr = (fa.bediensteteBenachrichtigungen || []).map(b => {
    if (b.zeugeId !== parsed.zeugeId) return b
    return {
      ...b,
      status: 'ERLEDIGT',
      erledigtAm: jetzt,
      erledigtVon: nutzer.nutzerId,
    }
  })
  fa.bediensteteBenachrichtigungen = benachr

  meta.zeugen = zeugen
  meta.zeugenFolgeaktionen = fa

  const kommentar = `Arbeitskorb: Zeugenaussage bestätigt (${nutzer.nutzerId}).`

  const [updated] = await prisma.$transaction([
    prisma.meldung.update({
      where: { id: meldung.id },
      data: { metadaten: meta },
    }),
    prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: meldung.status,
        kommentar,
        bediensteteId: bedienstete?.id || null,
      },
    }),
  ])

  const neu = sammlePersoenlicheAufgabenAusMeldung(
    { ...updated, gefangene: meldung.gefangene },
    nutzer,
  ).find(a => a.id === aufgabeId)

  return { data: neu, message: 'Aufgabe abgeschlossen.' }
}
