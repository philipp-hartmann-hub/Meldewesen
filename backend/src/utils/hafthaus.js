/** Hafthaus aus Mock-Nutzer-Kontext (E-03 / B5). */
export function istHafthausBezeichnung(abteilung) {
  const a = String(abteilung || '').trim()
  return /^Abteilung\s+\d+/i.test(a) || a === 'Aufnahme'
}

export function getNutzerHafthaus(mockNutzer) {
  const jva = String(mockNutzer?.jva || '').trim()
  const abteilung = String(mockNutzer?.abteilung || '').trim()
  if (!jva || !istHafthausBezeichnung(abteilung)) {
    return { jva, haus: '' }
  }
  return { jva, haus: abteilung }
}
