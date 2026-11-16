/**
 * Gefangenen-Stammdaten aus PostgreSQL (BASIS-Web-Ersatz, nur lesend).
 */
import { getNutzerHafthaus } from '../utils/hafthaus.js'

export function gefangeneJvaFilter(mockNutzer) {
  if (mockNutzer.siehtAlleJVAs) return {}
  return { jva: mockNutzer.jva }
}

export function gefangeneSuchfilter(search) {
  const q = String(search || '').trim()
  if (!q) return {}
  return {
    OR: [
      { nachname: { contains: q, mode: 'insensitive' } },
      { vorname: { contains: q, mode: 'insensitive' } },
      { gefangenenNr: { contains: q, mode: 'insensitive' } },
    ],
  }
}

/** Optional: JVA + Haus/Station (z. B. Zeugen-Inhaftierte nach Benachrichtigungsstandort) */
export function gefangeneStandortFilter({ jva, haus } = {}) {
  const filter = {}
  const j = String(jva || '').trim()
  const h = String(haus || '').trim()
  if (j) filter.jva = j
  if (h) filter.haus = h
  return filter
}

function buildGefangeneScopeFilter(mockNutzer, { jva, haus } = {}) {
  const standort = gefangeneStandortFilter({ jva, haus })
  if (standort.jva && standort.haus) return standort
  return { ...gefangeneJvaFilter(mockNutzer), ...standort }
}

/**
 * Liste für Autocomplete (Mock-Nutzer-JVA oder expliziter Standort, max. take).
 */
export async function listGefangene(prisma, mockNutzer, { search, take = 50, jva, haus } = {}) {
  const where = {
    ...buildGefangeneScopeFilter(mockNutzer, { jva, haus }),
    ...gefangeneSuchfilter(search),
  }
  return prisma.gefangene.findMany({
    where,
    orderBy: [{ nachname: 'asc' }, { vorname: 'asc' }],
    take: Math.min(Math.max(Number(take) || 50, 1), 100),
  })
}

export async function getGefangeneById(prisma, mockNutzer, id) {
  const row = await prisma.gefangene.findUnique({ where: { id } })
  if (!row) return null
  if (!mockNutzer.siehtAlleJVAs && row.jva !== mockNutzer.jva) return null
  return row
}

/**
 * Prüft, ob gefangeneId existiert und für den Mock-Nutzer sichtbar ist.
 * @returns {string|null} Fehlermeldung oder null
 */
export async function validiereGefangeneId(prisma, mockNutzer, gefangeneId) {
  if (!gefangeneId) return 'Bitte wählen Sie einen Gefangenen.'
  const g = await getGefangeneById(prisma, mockNutzer, gefangeneId)
  if (!g) {
    return 'Der gewählte Gefangene ist nicht in der Stammdatenbank vorhanden oder für Ihre JVA nicht sichtbar.'
  }
  const { haus } = getNutzerHafthaus(mockNutzer)
  if (haus && g.haus !== haus) {
    return `Der gewählte Gefangene gehört nicht zu Ihrem Hafthaus (${haus}).`
  }
  return null
}
