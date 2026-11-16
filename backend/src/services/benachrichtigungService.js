/**
 * In-App-Benachrichtigungen (Prototyp-Glocke).
 */

export const BENACHRICHTIGUNG_TYPEN = {
  AUFGABE_ZUGEWIESEN: 'AUFGABE_ZUGEWIESEN',
  AUFGABE_ZURUECKGEZOGEN: 'AUFGABE_ZURUECKGEZOGEN',
  AUFGABE_NEU: 'AUFGABE_NEU',
  AUFGABE_ESKALIERT: 'AUFGABE_ESKALIERT',
}

/** Prisma-Delegate – fehlt, wenn Backend ohne Neustart nach Schema-Änderung läuft. */
function benachrichtigungDb(prisma) {
  return prisma?.benachrichtigung ?? null
}

function warnFehlendesModel(kontext) {
  console.warn(
    `[benachrichtigung] Model nicht verfügbar (${kontext}) – bitte Backend neu starten nach „npm run db:generate“.`,
  )
}

export async function erstelleBenachrichtigung(prisma, {
  empfaengerId,
  typ,
  text,
  meldungId = null,
  aufgabeId = null,
}) {
  if (!empfaengerId || !typ || !text) return null
  const db = benachrichtigungDb(prisma)
  if (!db) {
    warnFehlendesModel('create')
    return null
  }
  return db.create({
    data: {
      empfaengerId: String(empfaengerId),
      typ,
      text: String(text).trim(),
      meldungId: meldungId || null,
      aufgabeId: aufgabeId || null,
    },
  })
}

export async function erstelleBenachrichtigungen(prisma, eintraege) {
  const gueltig = (eintraege || []).filter(e => e?.empfaengerId && e?.typ && e?.text)
  if (!gueltig.length) return []
  const db = benachrichtigungDb(prisma)
  if (!db) {
    warnFehlendesModel('create batch')
    return []
  }
  return prisma.$transaction(
    gueltig.map(e => db.create({
      data: {
        empfaengerId: String(e.empfaengerId),
        typ: e.typ,
        text: String(e.text).trim(),
        meldungId: e.meldungId || null,
        aufgabeId: e.aufgabeId || null,
      },
    })),
  )
}

export async function listBenachrichtigungen(prisma, nutzerId, { limit = 10 } = {}) {
  const db = benachrichtigungDb(prisma)
  if (!db) {
    warnFehlendesModel('list')
    return { data: [], ungelesen: 0, total: 0 }
  }
  const take = Math.min(Math.max(Number(limit) || 10, 1), 50)
  const [eintraege, ungelesen] = await Promise.all([
    db.findMany({
      where: { empfaengerId: nutzerId },
      orderBy: { erstelltAm: 'desc' },
      take,
    }),
    db.count({
      where: { empfaengerId: nutzerId, gelesen: false },
    }),
  ])
  return { data: eintraege, ungelesen, total: eintraege.length }
}

export async function markiereBenachrichtigungenGelesen(prisma, nutzerId, { ids } = {}) {
  const db = benachrichtigungDb(prisma)
  if (!db) return { aktualisiert: 0 }
  const where = { empfaengerId: nutzerId, gelesen: false }
  if (ids?.length) where.id = { in: ids }
  const result = await db.updateMany({
    where,
    data: { gelesen: true },
  })
  return { aktualisiert: result.count }
}

export async function benachrichtigeZuweisung(prisma, {
  meldung,
  zielId,
  zielName,
  alterEmpfaengerId,
  kommentar,
  aufgabeId = null,
  vonNutzerId,
}) {
  const eintraege = []
  const nr = meldung.meldungsNr || meldung.id

  if (alterEmpfaengerId && alterEmpfaengerId !== zielId) {
    eintraege.push({
      empfaengerId: alterEmpfaengerId,
      typ: BENACHRICHTIGUNG_TYPEN.AUFGABE_ZURUECKGEZOGEN,
      text: `Eine Ihnen zugewiesene Aufgabe (${nr}) wurde zurückgezogen.`,
      meldungId: meldung.id,
      aufgabeId,
    })
  }

  if (zielId) {
    const kommentarTeil = kommentar ? ` ${kommentar}` : ''
    eintraege.push({
      empfaengerId: zielId,
      typ: BENACHRICHTIGUNG_TYPEN.AUFGABE_ZUGEWIESEN,
      text: `Ihnen wurde die Aufgabe ${nr} zugewiesen.${kommentarTeil}`,
      meldungId: meldung.id,
      aufgabeId,
    })
  }

  return erstelleBenachrichtigungen(prisma, eintraege)
}

export async function benachrichtigeNeueAufgabe(prisma, {
  empfaengerId,
  meldung,
  aufgabeId,
  titel,
}) {
  if (!empfaengerId) return null
  return erstelleBenachrichtigung(prisma, {
    empfaengerId,
    typ: BENACHRICHTIGUNG_TYPEN.AUFGABE_NEU,
    text: `Neue Aufgabe: ${titel || 'Bearbeitung'} (${meldung.meldungsNr})`,
    meldungId: meldung.id,
    aufgabeId,
  })
}

export async function benachrichtigeEskalation(prisma, {
  meldung,
  station,
  empfaengerIds,
  aufgabeId,
}) {
  const text = `Beweismittel-Nachreichung ${meldung.meldungsNr} überfällig – Aufgabe an Station ${station || 'Gruppe'} eskaliert.`
  return erstelleBenachrichtigungen(
    prisma,
    (empfaengerIds || []).map(id => ({
      empfaengerId: id,
      typ: BENACHRICHTIGUNG_TYPEN.AUFGABE_ESKALIERT,
      text,
      meldungId: meldung.id,
      aufgabeId,
    })),
  )
}
