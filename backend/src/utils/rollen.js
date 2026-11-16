export function normalisiereRolle(rolle) {
  if (!rolle) return 'mitarbeiter'
  const r = String(rolle).toLowerCase().trim()
  const ALIASE = { 'haus-leitung':'hausleitung','jva-leitung':'hausleitung','administrator':'admin','itadmin':'admin' }
  return ALIASE[r] || r
}
export function istVAL(rolle) {
  const r = normalisiereRolle(rolle)
  return r === 'val' || r === 'anstaltsleitung'
}

export function istSonderdienst(rolle) {
  return normalisiereRolle(rolle) === 'sonderdienst'
}
