/**
 * Fall-Bündelung – Zentrale → DGL → SL → AL/VAL → ERV am Fall (Prototyp).
 */
import { getFallStatusLabel } from '../utils/fallStatusLabels.js'
import { istBereitFuerZentraleBuendelung } from './zeugenVollstaendigkeitService.js'
import {
  BENACHRICHTIGUNG_TYPEN,
  benachrichtigeNeueAufgabe,
  erstelleBenachrichtigungen,
} from './benachrichtigungService.js'
import {
  AUFGABEN_TYPEN,
  DGL_RUECKGABE_ZEUGE_ID,
  beschreibeOffeneFallAufgabe,
  encodeAufgabeId,
} from './arbeitskorbService.js'

const MELDUNG_INCLUDE = {
  gefangene: true,
  zustaendig: true,
}

const FALL_INCLUDE = {
  meldungen: { include: MELDUNG_INCLUDE, orderBy: { erstelltAm: 'asc' } },
  erstelltVon: true,
  entscheidVon: true,
  egpaVeraktetVon: true,
}

function assertAk(mockNutzer) {
  if (!mockNutzer.istArbeitskoordination) {
    const err = new Error('Nur die Zentrale (Arbeitskoordination) darf Fälle bündeln.')
    err.status = 403
    throw err
  }
}

function assertDgl(mockNutzer) {
  if (!mockNutzer.istDienstgruppenleitung) {
    const err = new Error('Nur die Dienstgruppenleitung darf gebündelte Fälle prüfen.')
    err.status = 403
    throw err
  }
}

function assertSl(mockNutzer) {
  if (!mockNutzer.istStationsleitung) {
    const err = new Error('Nur die Stationsleitung darf die Fallmeldung an die Anstaltsleitung weiterleiten.')
    err.status = 403
    throw err
  }
}

function assertAlOrVal(mockNutzer) {
  if (!mockNutzer.istAL && !mockNutzer.istVAL) {
    const err = new Error('Nur Anstaltsleitung oder VAL dürfen über die Meldepflicht entscheiden bzw. den ERV-Weg bearbeiten.')
    err.status = 403
    throw err
  }
}

function jvaWhere(mockNutzer) {
  if (mockNutzer.siehtAlleJVAs) return {}
  return { jva: mockNutzer.jva }
}

/** Nächste Nummer aus der höchsten vorhandenen fallNr, nicht aus der Anzahl. Eine Lücke in der Mitte wird nicht wieder vergeben. */
async function naechsteFallNr(prisma) {
  const faelle = await prisma.meldungsFall.findMany({ select: { fallNr: true } })
  let hoechste = 0
  for (const fall of faelle) {
    const treffer = /^FALL-(\d+)$/.exec(fall.fallNr || '')
    if (!treffer) continue
    const nummer = Number(treffer[1])
    if (nummer > hoechste) hoechste = nummer
  }
  return `FALL-${String(hoechste + 1).padStart(3, '0')}`
}

async function ladeFallOderFehler(prisma, fallId, mockNutzer) {
  const fall = await prisma.meldungsFall.findUnique({
    where: { id: fallId },
    include: FALL_INCLUDE,
  })
  if (!fall) {
    const err = new Error('Fall nicht gefunden.')
    err.status = 404
    throw err
  }
  if (!mockNutzer.siehtAlleJVAs && fall.jva !== mockNutzer.jva) {
    const err = new Error('Kein Zugriff auf diesen Fall.')
    err.status = 403
    throw err
  }
  return fall
}

function pruefeGleicherMeldungstyp(meldungen) {
  const typen = new Set(meldungen.map(m => m.meldungsTyp))
  if (typen.size > 1) {
    const err = new Error('Alle Meldungen im Fall müssen denselben Meldungstyp haben.')
    err.status = 400
    throw err
  }
}

async function validiereMeldungenFuerBuendelung(prisma, meldungIds, mockNutzer) {
  if (!Array.isArray(meldungIds) || meldungIds.length === 0) {
    const err = new Error('Bitte wählen Sie mindestens eine Meldung aus.')
    err.status = 400
    throw err
  }
  const meldungen = await prisma.meldung.findMany({
    where: { id: { in: meldungIds } },
    include: { gefangene: true },
  })
  if (meldungen.length !== meldungIds.length) {
    const err = new Error('Eine oder mehrere Meldungen wurden nicht gefunden.')
    err.status = 404
    throw err
  }
  for (const m of meldungen) {
    if (!istBereitFuerZentraleBuendelung(m)) {
      const wartetAufZeugen = m.meldungsTyp === 'STRAFANZEIGE' && !m.fallId
      const err = new Error(
        wartetAufZeugen
          ? `Meldung ${m.meldungsNr} wartet noch auf Zeugenaussagen und kann nicht gebündelt werden.`
          : `Meldung ${m.meldungsNr} ist nicht zur Bündelung freigegeben.`,
      )
      err.status = 400
      throw err
    }
    if (m.fallId) {
      const err = new Error(`Meldung ${m.meldungsNr} ist bereits einem Fall zugeordnet.`)
      err.status = 400
      throw err
    }
    const jva = m.gefangene?.jva
    if (!mockNutzer.siehtAlleJVAs && jva && jva !== mockNutzer.jva) {
      const err = new Error(`Meldung ${m.meldungsNr} liegt außerhalb Ihres Sichtbereichs.`)
      err.status = 403
      throw err
    }
  }
  pruefeGleicherMeldungstyp(meldungen)
  return meldungen
}

export async function listUngebundeneMeldungen(prisma, mockNutzer) {
  assertAk(mockNutzer)
  const where = {
    status: { in: ['SUBMITTED', 'FORWARDED'] },
    fallId: null,
    gefangene: mockNutzer.siehtAlleJVAs ? undefined : { jva: mockNutzer.jva },
  }
  const rows = await prisma.meldung.findMany({
    where,
    include: MELDUNG_INCLUDE,
    orderBy: { erstelltAm: 'desc' },
  })
  return { data: rows.filter(istBereitFuerZentraleBuendelung) }
}

/** Vorschläge: gleiche Tatzeit + Tatort → wahrscheinlich gleicher Vorfall (Assistenz, keine Auto-Bündelung). */
export async function listBuendlungsVorschlaege(prisma, mockNutzer) {
  const { data: meldungen } = await listUngebundeneMeldungen(prisma, mockNutzer)
  const gruppen = new Map()

  for (const m of meldungen) {
    const meta = m.metadaten && typeof m.metadaten === 'object' ? m.metadaten : {}
    const tatzeit = meta.tatzeit ? String(meta.tatzeit).slice(0, 16) : ''
    const tatort = (meta.tatort || '').trim().toLowerCase()
    if (!tatzeit && !tatort) continue

    const key = `${tatzeit}|${tatort}`
    if (!gruppen.has(key)) {
      gruppen.set(key, {
        tatzeit: meta.tatzeit || null,
        tatort: meta.tatort || null,
        meldungen: [],
      })
    }
    gruppen.get(key).meldungen.push({
      id: m.id,
      meldungsNr: m.meldungsNr,
      meldungsTyp: m.meldungsTyp,
      gefangene: m.gefangene,
      zustaendig: m.zustaendig,
      erstelltAm: m.erstelltAm,
    })
  }

  const data = [...gruppen.values()]
    .filter(g => g.meldungen.length >= 2)
    .sort((a, b) => b.meldungen.length - a.meldungen.length)

  return { data }
}

function defaultStatusFilter(mockNutzer) {
  if (mockNutzer.istArbeitskoordination) {
    return { in: ['SAMMELN', 'ZURUECK_AK', 'ZUR_DGL'] }
  }
  if (mockNutzer.istDienstgruppenleitung) return 'ZUR_DGL'
  if (mockNutzer.istStationsleitung) return 'ZUR_SL'
  if (mockNutzer.istAL || mockNutzer.istVAL) {
    return { in: ['ZUR_AL', 'EGPA_INTERN', 'ERV_WEG'] }
  }
  return null
}

export async function listFaelle(prisma, mockNutzer, { status } = {}) {
  const where = { ...jvaWhere(mockNutzer) }
  const defaultFilter = defaultStatusFilter(mockNutzer)

  if (!defaultFilter && !mockNutzer.istAdmin) {
    const err = new Error('Kein Zugriff auf Fall-Bündelungen.')
    err.status = 403
    throw err
  }

  if (status) {
    where.status = status
  } else if (defaultFilter) {
    where.status = defaultFilter
  }

  const data = await prisma.meldungsFall.findMany({
    where,
    include: {
      meldungen: { include: { gefangene: true }, orderBy: { erstelltAm: 'asc' } },
      erstelltVon: true,
    },
    orderBy: { aktualisiertAm: 'desc' },
  })
  return { data }
}

function formatFallResponse(fall, mockNutzer) {
  const darfBearbeiten = mockNutzer.istArbeitskoordination
    && ['SAMMELN', 'ZURUECK_AK'].includes(fall.status)
  const darfPruefen = mockNutzer.istDienstgruppenleitung && fall.status === 'ZUR_DGL'
  const darfSlWeiterleiten = mockNutzer.istStationsleitung && fall.status === 'ZUR_SL'
  const darfMeldepflichtEntscheid = (mockNutzer.istAL || mockNutzer.istVAL) && fall.status === 'ZUR_AL'
  const darfVersandfaehig = (mockNutzer.istAL || mockNutzer.istVAL)
    && fall.status === 'ERV_WEG'
    && !fall.versandfaehigAm
  const darfBepo = (mockNutzer.istAL || mockNutzer.istVAL)
    && fall.status === 'ERV_WEG'
    && fall.versandfaehigAm
    && !fall.bepoVersendetAm
  const darfEgpaIntern = (mockNutzer.istAL || mockNutzer.istVAL)
    && fall.status === 'EGPA_INTERN'
    && !fall.egpaVeraktetAm
  const darfEgpaErv = (mockNutzer.istAL || mockNutzer.istVAL)
    && fall.status === 'ERV_WEG'
    && fall.bepoVersendetAm
    && !fall.egpaVeraktetAm
  const eigeneBeteiligung = Boolean(mockNutzer.nutzerId) && (
    fall.entscheidVon?.bediensteterID === mockNutzer.nutzerId
    || fall.egpaVeraktetVon?.bediensteterID === mockNutzer.nutzerId
  )
  const abschlussReif = (mockNutzer.istAL || mockNutzer.istVAL)
    && ['EGPA_INTERN', 'ERV_WEG'].includes(fall.status)
    && Boolean(fall.egpaVeraktetAm)
    && !fall.abgeschlossenAm
  const darfAbschliessen = abschlussReif && !eigeneBeteiligung
  const vierAugenGesperrt = abschlussReif && eigeneBeteiligung

  const istAbgeschlossen = fall.status === 'ABGESCHLOSSEN_INTERN'

  return {
    ...fall,
    statusLabel: getFallStatusLabel(fall.status),
    darfBearbeiten,
    darfPruefen,
    darfSlWeiterleiten,
    darfMeldepflichtEntscheid,
    darfAlEntscheid: darfMeldepflichtEntscheid,
    darfVersandfaehig,
    darfBepo,
    darfEgpaIntern,
    darfEgpaErv,
    darfAbschliessen,
    vierAugenGesperrt,
    istAbgeschlossen,
    hatVersandfaehig: Boolean(fall.versandfaehigAm),
    hatBepo: Boolean(fall.bepoVersendetAm),
    hatEgpa: Boolean(fall.egpaVeraktetAm),
  }
}

function darfFallLesen(fall, formatted, mockNutzer) {
  if (mockNutzer.istAdmin) return true
  if (formatted.darfBearbeiten || formatted.darfPruefen || formatted.darfSlWeiterleiten) return true
  if (formatted.darfMeldepflichtEntscheid) return true
  if (formatted.darfVersandfaehig || formatted.darfBepo || formatted.darfEgpaIntern || formatted.darfEgpaErv || formatted.darfAbschliessen) return true
  if (mockNutzer.istArbeitskoordination) return true
  if (mockNutzer.istAL || mockNutzer.istVAL) return true
  if (mockNutzer.istDienstgruppenleitung) return true
  if (mockNutzer.istStationsleitung) return true
  // Lesender Zugriff für alle Rollen im Sichtbereich (z. B. aVD mit Einzelmeldung im Fall)
  if (!mockNutzer.siehtAlleJVAs && fall.jva === mockNutzer.jva) return true
  return false
}

export async function getFall(prisma, mockNutzer, fallId) {
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  const formatted = formatFallResponse(fall, mockNutzer)

  if (!darfFallLesen(fall, formatted, mockNutzer)) {
    const err = new Error('Kein Zugriff auf diesen Fall.')
    err.status = 403
    throw err
  }

  return formatted
}

async function ladeFallNachAktion(prisma, fallId) {
  return prisma.meldungsFall.findUnique({
    where: { id: fallId },
    include: FALL_INCLUDE,
  })
}

async function schreibeMeldungenStatus(
  prisma,
  meldungIds,
  status,
  kommentar,
  bediensteteId,
  { nurVerlauf = false } = {},
) {
  if (!meldungIds?.length) return
  if (nurVerlauf) {
    const meldungen = await prisma.meldung.findMany({
      where: { id: { in: meldungIds } },
      select: { id: true, status: true },
    })
    if (!meldungen.length) return
    await prisma.statusVerlauf.createMany({
      data: meldungen.map(m => ({
        meldungId: m.id,
        status: m.status,
        kommentar: kommentar || null,
        bediensteteId: bediensteteId || null,
      })),
    })
    return
  }
  await prisma.meldung.updateMany({
    where: { id: { in: meldungIds } },
    data: { status },
  })
  await prisma.statusVerlauf.createMany({
    data: meldungIds.map(meldungId => ({
      meldungId,
      status,
      kommentar: kommentar || null,
      bediensteteId: bediensteteId || null,
    })),
  })
}

async function benachrichtigeFallSchritt(prisma, fall) {
  const aufgabe = beschreibeOffeneFallAufgabe(fall)
  if (!aufgabe) return
  const leute = await prisma.bedienstete.findMany({
    where: {
      bediensteterJVA: fall.jva,
      bediensteterRolle: { in: aufgabe.rollen },
    },
    select: { bediensteterID: true },
  })
  if (!leute.length) return
  await erstelleBenachrichtigungen(prisma, leute.map(b => ({
    empfaengerId: b.bediensteterID,
    typ: BENACHRICHTIGUNG_TYPEN.AUFGABE_NEU,
    text: `Neue Aufgabe: ${aufgabe.titel}`,
    aufgabeId: encodeAufgabeId(fall.id, aufgabe.typ, 'fall'),
  })))
}

async function ladeBedienstete(prisma, mockNutzer) {
  return prisma.bedienstete.findUnique({
    where: { bediensteterID: mockNutzer.nutzerId },
  })
}

export async function createFall(prisma, mockNutzer, { bezeichnung, meldungIds }) {
  assertAk(mockNutzer)
  await validiereMeldungenFuerBuendelung(prisma, meldungIds, mockNutzer)

  const erstelltVon = await ladeBedienstete(prisma, mockNutzer)

  const fallNr = await naechsteFallNr(prisma)
  const fall = await prisma.meldungsFall.create({
    data: {
      fallNr,
      bezeichnung: bezeichnung?.trim() || null,
      status: 'SAMMELN',
      jva: mockNutzer.jva,
      erstelltVonId: erstelltVon?.id || null,
      meldungen: { connect: meldungIds.map(id => ({ id })) },
    },
    include: FALL_INCLUDE,
  })
  return { data: fall, message: `Fall ${fallNr} angelegt.` }
}

export async function addMeldungenToFall(prisma, mockNutzer, fallId, meldungIds) {
  assertAk(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  if (!['SAMMELN', 'ZURUECK_AK'].includes(fall.status)) {
    const err = new Error('Dieser Fall kann nicht mehr bearbeitet werden.')
    err.status = 400
    throw err
  }
  const neueMeldungen = await validiereMeldungenFuerBuendelung(prisma, meldungIds, mockNutzer)
  const bestehendTyp = fall.meldungen[0]?.meldungsTyp
  if (bestehendTyp && neueMeldungen.some(m => m.meldungsTyp !== bestehendTyp)) {
    const err = new Error('Alle Meldungen im Fall müssen denselben Meldungstyp haben.')
    err.status = 400
    throw err
  }
  await prisma.meldung.updateMany({
    where: { id: { in: meldungIds } },
    data: { fallId },
  })
  if (fall.status === 'ZURUECK_AK') {
    await prisma.meldungsFall.update({
      where: { id: fallId },
      data: { status: 'SAMMELN', rueckgabeGrund: null },
    })
  }
  return getFall(prisma, mockNutzer, fallId)
}

export async function removeMeldungFromFall(prisma, mockNutzer, fallId, meldungId) {
  assertAk(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  if (!['SAMMELN', 'ZURUECK_AK'].includes(fall.status)) {
    const err = new Error('Dieser Fall kann nicht mehr bearbeitet werden.')
    err.status = 400
    throw err
  }
  const meldung = fall.meldungen.find(m => m.id === meldungId)
  if (!meldung) {
    const err = new Error('Meldung gehört nicht zu diesem Fall.')
    err.status = 404
    throw err
  }
  const bedienstete = await ladeBedienstete(prisma, mockNutzer)
  if (meldung.status === 'FORWARDED') {
    await prisma.$transaction([
      prisma.meldung.update({
        where: { id: meldungId },
        data: { fallId: null, status: 'SUBMITTED' },
      }),
      prisma.statusVerlauf.create({
        data: {
          meldungId,
          status: 'SUBMITTED',
          kommentar: 'Aus dem Fall entfernt – wieder zur Bündelung freigegeben.',
          bediensteteId: bedienstete?.id || null,
        },
      }),
    ])
  } else {
    await prisma.meldung.update({
      where: { id: meldungId },
      data: { fallId: null },
    })
  }
  const verbleibend = fall.meldungen.filter(m => m.id !== meldungId)
  if (verbleibend.length === 0) {
    await prisma.meldungsFall.delete({ where: { id: fallId } })
    return { geloescht: true, message: 'Fall wurde aufgelöst, da keine Meldungen mehr zugeordnet sind.' }
  }
  return getFall(prisma, mockNutzer, fallId)
}

export async function weiterleitenAnDgl(prisma, mockNutzer, fallId) {
  assertAk(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  if (!['SAMMELN', 'ZURUECK_AK'].includes(fall.status)) {
    const err = new Error('Dieser Fall wurde bereits weitergeleitet.')
    err.status = 400
    throw err
  }
  if (fall.meldungen.length < 1) {
    const err = new Error('Bitte ordnen Sie mindestens eine Meldung zu, bevor Sie weiterleiten.')
    err.status = 400
    throw err
  }
  pruefeGleicherMeldungstyp(fall.meldungen)

  const offeneNachbesserung = fall.meldungen.filter(m => m.status === 'DRAFT')
  if (offeneNachbesserung.length) {
    const nummern = offeneNachbesserung.map(m => m.meldungsNr).join(', ')
    const err = new Error(`Diese Meldungen sind noch in Überarbeitung bei der aVD: ${nummern}.`)
    err.status = 409
    throw err
  }

  const bedienstete = await ladeBedienstete(prisma, mockNutzer)

  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: { status: 'ZUR_DGL', rueckgabeGrund: null },
  })

  const meldungIds = fall.meldungen.map(m => m.id)
  await schreibeMeldungenStatus(
    prisma,
    meldungIds,
    'FORWARDED',
    'Gebündelt – Fall an Dienstgruppenleitung weitergeleitet',
    bedienstete?.id,
  )

  const updated = await ladeFallNachAktion(prisma, fallId)
  await benachrichtigeFallSchritt(prisma, updated)
  return formatFallResponse(updated, mockNutzer)
}

export async function rueckgabeAnAk(prisma, mockNutzer, fallId, { kommentar, meldungIds } = {}) {
  assertDgl(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  if (fall.status !== 'ZUR_DGL') {
    const err = new Error('Dieser Fall liegt nicht zur Prüfung vor.')
    err.status = 400
    throw err
  }
  if (!kommentar?.trim()) {
    const err = new Error('Bitte geben Sie einen Rückgabegrund an.')
    err.status = 400
    throw err
  }
  let ausgewaehlt = fall.meldungen
  if (Array.isArray(meldungIds)) {
    if (!meldungIds.length) {
      const err = new Error('Bitte wählen Sie mindestens eine Meldung für die Nachbesserung.')
      err.status = 400
      throw err
    }
    ausgewaehlt = fall.meldungen.filter(m => meldungIds.includes(m.id))
    if (ausgewaehlt.length !== meldungIds.length) {
      const err = new Error('Eine der ausgewählten Meldungen gehört nicht zu diesem Fall.')
      err.status = 400
      throw err
    }
  }
  if (!ausgewaehlt.length) {
    const err = new Error('Diesem Fall sind keine Meldungen zugeordnet.')
    err.status = 400
    throw err
  }

  const grund = kommentar.trim()
  const jetzt = new Date().toISOString()
  const bedienstete = await ladeBedienstete(prisma, mockNutzer)
  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: { status: 'ZURUECK_AK', rueckgabeGrund: grund },
  })

  await schreibeMeldungenStatus(
    prisma,
    fall.meldungen.map(m => m.id),
    null,
    `DGL: Qualität nicht ausreichend, an aVD und Zentrale zurückgegeben. ${grund}`,
    bedienstete?.id,
    { nurVerlauf: true },
  )

  for (const meldung of ausgewaehlt) {
    const meta = meldung.metadaten && typeof meldung.metadaten === 'object' ? { ...meldung.metadaten } : {}
    meta.rueckgabeDgl = {
      kommentar: grund,
      zurueckgegebenAm: jetzt,
      zurueckgegebenVon: mockNutzer.nutzerId,
    }
    await prisma.meldung.update({
      where: { id: meldung.id },
      data: { status: 'DRAFT', metadaten: meta },
    })
    await prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: 'DRAFT',
        kommentar: `Dienstgruppenleitung: zur Nachbesserung an aVD zurückgegeben. ${grund}`,
        bediensteteId: bedienstete?.id || null,
      },
    })
    const empfaengerId = meldung.zustaendig?.bediensteterID
    if (empfaengerId) {
      await benachrichtigeNeueAufgabe(prisma, {
        empfaengerId,
        meldung,
        aufgabeId: encodeAufgabeId(meldung.id, AUFGABEN_TYPEN.DGL_RUECKGABE, DGL_RUECKGABE_ZEUGE_ID),
        titel: 'Meldung nach DGL-Rückgabe überarbeiten',
      })
    }
  }

  const updated = await ladeFallNachAktion(prisma, fallId)
  await benachrichtigeFallSchritt(prisma, updated)
  return formatFallResponse(updated, mockNutzer)
}

/** DGL: Qualität ok → Stationsleitung (Fallmeldung). */
export async function weiterleitenAnSl(prisma, mockNutzer, fallId) {
  assertDgl(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  if (fall.status !== 'ZUR_DGL') {
    const err = new Error('Dieser Fall liegt nicht zur Prüfung vor.')
    err.status = 400
    throw err
  }
  const bedienstete = await ladeBedienstete(prisma, mockNutzer)
  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: { status: 'ZUR_SL', rueckgabeGrund: null },
  })
  await schreibeMeldungenStatus(
    prisma,
    fall.meldungen.map(m => m.id),
    null,
    'DGL: Qualität ausreichend, an Stationsleitung',
    bedienstete?.id,
    { nurVerlauf: true },
  )
  const updated = await ladeFallNachAktion(prisma, fallId)
  await benachrichtigeFallSchritt(prisma, updated)
  return formatFallResponse(updated, mockNutzer)
}

/** SL: Fallmeldung an AL/VAL zur Meldepflicht-Entscheid. */
export async function weiterleitenAnAl(prisma, mockNutzer, fallId) {
  assertSl(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  if (fall.status !== 'ZUR_SL') {
    const err = new Error('Dieser Fall liegt nicht bei der Stationsleitung vor.')
    err.status = 400
    throw err
  }
  const bedienstete = await ladeBedienstete(prisma, mockNutzer)
  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: { status: 'ZUR_AL', rueckgabeGrund: null },
  })
  await schreibeMeldungenStatus(
    prisma,
    fall.meldungen.map(m => m.id),
    null,
    'Stationsleitung: Fallmeldung an Anstaltsleitung und VAL weitergeleitet',
    bedienstete?.id,
    { nurVerlauf: true },
  )
  const updated = await ladeFallNachAktion(prisma, fallId)
  await benachrichtigeFallSchritt(prisma, updated)
  return formatFallResponse(updated, mockNutzer)
}

/** AL oder VAL: Meldepflicht ja/nein. */
export async function entscheidMeldepflicht(prisma, mockNutzer, fallId, { meldepflichtig, kommentar }) {
  assertAlOrVal(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  if (fall.status !== 'ZUR_AL') {
    const err = new Error('Dieser Fall liegt nicht zur Entscheidung vor.')
    err.status = 400
    throw err
  }
  if (typeof meldepflichtig !== 'boolean') {
    const err = new Error('Bitte treffen Sie eine Entscheidung (meldepflichtig ja/nein).')
    err.status = 400
    throw err
  }

  const bedienstete = await ladeBedienstete(prisma, mockNutzer)
  const meldungIds = fall.meldungen.map(m => m.id)
  const neuerFallStatus = meldepflichtig ? 'ERV_WEG' : 'EGPA_INTERN'
  const rolleLabel = mockNutzer.istAL ? 'Anstaltsleitung' : 'VAL'

  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: {
      status: neuerFallStatus,
      meldepflichtig,
      alEntscheidKommentar: kommentar?.trim() || null,
      alEntscheidAm: new Date(),
      entscheidVonRolle: mockNutzer.rolle,
      entscheidVonId: bedienstete?.id ?? null,
      rueckgabeGrund: null,
    },
  })

  if (meldepflichtig) {
    await prisma.meldung.updateMany({
      where: { id: { in: meldungIds } },
      data: { ervRelevant: true },
    })
    await schreibeMeldungenStatus(
      prisma,
      meldungIds,
      'IN_PROGRESS',
      kommentar?.trim()
        || `${rolleLabel}: meldepflichtig – ERV-Weg am Fall (versandfähig → beBPo → eGPA)`,
      bedienstete?.id,
    )
  } else {
    await schreibeMeldungenStatus(
      prisma,
      meldungIds,
      'IN_PROGRESS',
      kommentar?.trim()
        || `${rolleLabel}: nicht meldepflichtig – eGPA am Fall (ohne beBPo)`,
      bedienstete?.id,
    )
  }

  const updated = await ladeFallNachAktion(prisma, fallId)
  await benachrichtigeFallSchritt(prisma, updated)
  return formatFallResponse(updated, mockNutzer)
}

export const entscheidAl = entscheidMeldepflicht

export async function markVersandfaehig(prisma, mockNutzer, fallId) {
  assertAlOrVal(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  if (fall.status !== 'ERV_WEG' || fall.versandfaehigAm) {
    const err = new Error('Fall ist nicht für „versandfähig“ vorgesehen.')
    err.status = 400
    throw err
  }
  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: { versandfaehigAm: new Date() },
  })
  const updated = await ladeFallNachAktion(prisma, fallId)
  await benachrichtigeFallSchritt(prisma, updated)
  return formatFallResponse(updated, mockNutzer)
}

export async function fallBepoVersand(prisma, mockNutzer, fallId) {
  assertAlOrVal(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  if (fall.status !== 'ERV_WEG' || !fall.versandfaehigAm || fall.bepoVersendetAm) {
    const err = new Error('beBPo-Versand erst nach Markierung als versandfähig möglich.')
    err.status = 400
    throw err
  }
  const bepoId = `BEPO-FALL-${Date.now()}`
  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: {
      bepoVersendetAm: new Date(),
      bepoNachrichtenId: bepoId,
    },
  })
  const updated = await ladeFallNachAktion(prisma, fallId)
  await benachrichtigeFallSchritt(prisma, updated)
  return { ...formatFallResponse(updated, mockNutzer), bepoNachrichtenId: bepoId }
}

export async function fallEgpaVerakten(prisma, mockNutzer, fallId) {
  assertAlOrVal(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)

  if (fall.status === 'EGPA_INTERN') {
    if (fall.egpaVeraktetAm) {
      const err = new Error('eGPA-Veraktung für diesen Fall bereits dokumentiert.')
      err.status = 400
      throw err
    }
  } else if (fall.status === 'ERV_WEG') {
    if (!fall.bepoVersendetAm) {
      const err = new Error('beBPo-Versand muss vor eGPA-Veraktung erfolgen.')
      err.status = 409
      throw err
    }
    if (fall.egpaVeraktetAm) {
      const err = new Error('eGPA-Veraktung für diesen Fall bereits dokumentiert.')
      err.status = 400
      throw err
    }
  } else {
    const err = new Error('Fall ist nicht für eGPA-Veraktung vorgesehen.')
    err.status = 400
    throw err
  }

  const bedienstete = await ladeBedienstete(prisma, mockNutzer)
  const aktenzeichen = `EGPA-${fall.fallNr}-${Date.now()}`
  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: {
      egpaVeraktetAm: new Date(),
      egpaVeraktetVonId: bedienstete?.id ?? null,
      egpaAktenzeichen: aktenzeichen,
    },
  })
  const updated = await ladeFallNachAktion(prisma, fallId)
  await benachrichtigeFallSchritt(prisma, updated)
  return { ...formatFallResponse(updated, mockNutzer), egpaAktenzeichen: aktenzeichen }
}

export async function fallAbschliessen(prisma, mockNutzer, fallId, { kommentar } = {}) {
  assertAlOrVal(mockNutzer)
  const fall = await ladeFallOderFehler(prisma, fallId, mockNutzer)
  if (!['EGPA_INTERN', 'ERV_WEG'].includes(fall.status) || !fall.egpaVeraktetAm || fall.abgeschlossenAm) {
    const err = new Error('Fall kann erst nach eGPA-Veraktung mit Vier-Augen abgeschlossen werden.')
    err.status = 400
    throw err
  }

  const bedienstete = await ladeBedienstete(prisma, mockNutzer)
  if (
    bedienstete?.id
    && (bedienstete.id === fall.entscheidVonId || bedienstete.id === fall.egpaVeraktetVonId)
  ) {
    const err = new Error('Vier-Augen-Prinzip: Der Abschluss muss durch eine zweite Person erfolgen.')
    err.status = 409
    throw err
  }
  const meldungIds = fall.meldungen.map(m => m.id)
  const rolleLabel = mockNutzer.istAL ? 'Anstaltsleitung' : 'VAL'

  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: {
      status: 'ABGESCHLOSSEN_INTERN',
      abgeschlossenAm: new Date(),
    },
  })

  await schreibeMeldungenStatus(
    prisma,
    meldungIds,
    'ARCHIVED',
    kommentar?.trim()
      || `${rolleLabel}: Fall abgeschlossen (Vier-Augen) – alle Einzelmeldungen archiviert`,
    bedienstete?.id,
  )

  const updated = await ladeFallNachAktion(prisma, fallId)
  return formatFallResponse(updated, mockNutzer)
}
