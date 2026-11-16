/**
 * Validierung von Zuweisungszielen (VAL/AL → AVD/SL).
 */

const ZUWEISBARE_ROLLEN = new Set(['avd', 'stationsleitung'])

export async function validateZuweisungsZiel(prisma, mockNutzer, zielNutzerId) {
  if (!zielNutzerId || !String(zielNutzerId).trim()) {
    const err = new Error('Zielnutzer fehlt.')
    err.status = 400
    throw err
  }

  const ziel = await prisma.bedienstete.findUnique({
    where: { bediensteterID: String(zielNutzerId).trim() },
  })
  if (!ziel) {
    const err = new Error('Zielnutzer nicht gefunden.')
    err.status = 404
    throw err
  }
  if (!ZUWEISBARE_ROLLEN.has(ziel.bediensteterRolle)) {
    const err = new Error('Nur AVD oder Stationsleitung können zugewiesen werden.')
    err.status = 400
    throw err
  }
  if (ziel.bediensteterJVA !== mockNutzer.jva) {
    const err = new Error('Zielnutzer gehört nicht zur gleichen JVA.')
    err.status = 403
    throw err
  }
  if (mockNutzer.istVAL && !mockNutzer.istAL && ziel.haus !== mockNutzer.abteilung) {
    const err = new Error('Zielnutzer gehört nicht zu Ihrer Abteilung.')
    err.status = 403
    throw err
  }
  return ziel
}

export function darfFremdeZuweisung(mockNutzer) {
  return mockNutzer.istVAL || mockNutzer.istAL
}
