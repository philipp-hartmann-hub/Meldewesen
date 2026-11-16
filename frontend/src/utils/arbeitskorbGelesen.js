/** Kennzeichnung gelesener/neuer Aufgaben im Arbeitskorb (Prototyp, localStorage). */

function keyLetzterBesuch(nutzerId) {
  return `a2-arbeitskorb-besuch-${nutzerId}`
}

function keyGeleseneAufgaben(nutzerId) {
  return `a2-arbeitskorb-gelesen-${nutzerId}`
}

export function getLetzterBesuch(nutzerId) {
  try {
    return localStorage.getItem(keyLetzterBesuch(nutzerId)) || null
  } catch {
    return null
  }
}

export function setLetzterBesuch(nutzerId, iso = new Date().toISOString()) {
  try {
    localStorage.setItem(keyLetzterBesuch(nutzerId), iso)
  } catch { /* ignore */ }
}

function getGeleseneSet(nutzerId) {
  try {
    const raw = localStorage.getItem(keyGeleseneAufgaben(nutzerId))
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function markiereAufgabeGelesen(nutzerId, aufgabeId) {
  if (!aufgabeId) return
  try {
    const set = getGeleseneSet(nutzerId)
    set.add(aufgabeId)
    localStorage.setItem(keyGeleseneAufgaben(nutzerId), JSON.stringify([...set]))
  } catch { /* ignore */ }
}

export function istAufgabeNeu(aufgabe, nutzerId) {
  if (!aufgabe || aufgabe.status !== 'OFFEN') return false
  if (getGeleseneSet(nutzerId).has(aufgabe.id)) return false
  const besuch = getLetzterBesuch(nutzerId)
  if (!besuch) return true
  const gesendet = aufgabe.gesendetAm
  if (!gesendet) return true
  return new Date(gesendet) > new Date(besuch)
}

export function zaehleNeueAufgaben(aufgaben, nutzerId) {
  return (aufgaben || []).filter(a => istAufgabeNeu(a, nutzerId)).length
}
