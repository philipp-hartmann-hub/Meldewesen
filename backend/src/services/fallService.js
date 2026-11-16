/**
 * Fall-Bündelung – Zentrale → DGL → SL → AL/VAL → ERV am Fall (Prototyp).
 */
import { getFallStatusLabel } from '../utils/fallStatusLabels.js'

const MELDUNG_INCLUDE = {
  gefangene: true,
  zustaendig: true,
}

const FALL_INCLUDE = {
  meldungen: { include: MELDUNG_INCLUDE, orderBy: { erstelltAm: 'asc' } },
  erstelltVon: true,
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

async function naechsteFallNr(prisma) {
  const count = await prisma.meldungsFall.count()
  return `FALL-${String(count + 1).padStart(3, '0')}`
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
    if (m.status !== 'SUBMITTED') {
      const err = new Error(`Meldung ${m.meldungsNr} ist nicht eingereicht und kann nicht gebündelt werden.`)
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
    status: 'SUBMITTED',
    fallId: null,
    gefangene: mockNutzer.siehtAlleJVAs ? undefined : { jva: mockNutzer.jva },
  }
  const data = await prisma.meldung.findMany({
    where,
    include: MELDUNG_INCLUDE,
    orderBy: { erstelltAm: 'desc' },
  })
  return { data }
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
  const darfAbschliessen = (mockNutzer.istAL || mockNutzer.istVAL)
    && ['EGPA_INTERN', 'ERV_WEG'].includes(fall.status)
    && fall.egpaVeraktetAm
    && !fall.abgeschlossenAm

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
) {
  if (!meldungIds?.length) return
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
  await prisma.meldung.update({
    where: { id: meldungId },
    data: { fallId: null },
  })
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
  return formatFallResponse(updated, mockNutzer)
}

export async function rueckgabeAnAk(prisma, mockNutzer, fallId, { kommentar }) {
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
  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: { status: 'ZURUECK_AK', rueckgabeGrund: kommentar.trim() },
  })
  const updated = await ladeFallNachAktion(prisma, fallId)
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
  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: { status: 'ZUR_SL', rueckgabeGrund: null },
  })
  const updated = await ladeFallNachAktion(prisma, fallId)
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
  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: { status: 'ZUR_AL', rueckgabeGrund: null },
  })
  const updated = await ladeFallNachAktion(prisma, fallId)
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

  const aktenzeichen = `EGPA-${fall.fallNr}-${Date.now()}`
  await prisma.meldungsFall.update({
    where: { id: fallId },
    data: {
      egpaVeraktetAm: new Date(),
      egpaAktenzeichen: aktenzeichen,
    },
  })
  const updated = await ladeFallNachAktion(prisma, fallId)
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
