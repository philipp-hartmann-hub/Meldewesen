/**
 * Bedienstete-Stammdaten aus PostgreSQL (AD-Ersatz, nur lesend).
 */

export function bediensteteJvaFilter(mockNutzer) {
  if (mockNutzer.siehtAlleJVAs) return {}
  return { bediensteterJVA: mockNutzer.jva }
}

export function bediensteteSuchfilter(search) {
  const q = String(search || '').trim()
  if (!q) return {}
  return {
    OR: [
      { bediensteterName: { contains: q, mode: 'insensitive' } },
      { bediensteterID: { contains: q, mode: 'insensitive' } },
    ],
  }
}

export function bediensteteHausFilter(haus) {
  const h = String(haus || '').trim()
  if (!h) return {}
  return { haus: h }
}

export function bediensteteRollenFilter(rolle) {
  const r = String(rolle || '').trim().toLowerCase()
  if (!r) return {}
  if (r === 'avd') return { bediensteterRolle: { in: ['avd', 'stationsleitung'] } }
  return { bediensteterRolle: r }
}

export async function listBedienstete(prisma, mockNutzer, { search, haus, station, rolle, take = 50 } = {}) {
  const hausArg = haus || station
  const where = {
    ...bediensteteJvaFilter(mockNutzer),
    ...bediensteteHausFilter(hausArg),
    ...bediensteteRollenFilter(rolle),
    ...bediensteteSuchfilter(search),
  }
  return prisma.bedienstete.findMany({
    where,
    orderBy: [{ bediensteterName: 'asc' }],
    take: Math.min(Math.max(Number(take) || 50, 1), 100),
  })
}

export async function listVerfuegbareStationen(prisma, mockNutzer) {
  const where = {
    ...bediensteteJvaFilter(mockNutzer),
    bediensteterRolle: { in: ['avd', 'stationsleitung'] },
    haus: { not: null },
  }
  if (mockNutzer.istVAL && !mockNutzer.istAL) {
    where.haus = mockNutzer.abteilung
  }
  const rows = await prisma.bedienstete.findMany({
    where,
    select: { haus: true },
    distinct: ['haus'],
    orderBy: { haus: 'asc' },
  })
  return rows.map(r => r.haus).filter(Boolean)
}

export async function getBediensteteById(prisma, mockNutzer, id) {
  const row = await prisma.bedienstete.findUnique({ where: { id } })
  if (!row) return null
  if (!mockNutzer.siehtAlleJVAs && row.bediensteterJVA !== mockNutzer.jva) return null
  return row
}
