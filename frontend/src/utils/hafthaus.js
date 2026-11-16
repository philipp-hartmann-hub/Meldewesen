/**
 * Hafthaus-Zuordnung des aktiven Nutzers (E-03 / B5).
 * Im Prototyp entspricht das Hafthaus der Vollzugsabteilung (`abteilung` am Demo-Nutzer).
 */
export function getNutzerHafthaus(aktiverNutzer) {
  const jva = String(aktiverNutzer?.jva || '').trim()
  const abteilung = String(aktiverNutzer?.abteilung || '').trim()
  if (!jva || !istHafthausBezeichnung(abteilung)) {
    return { jva, haus: '' }
  }
  return { jva, haus: abteilung }
}

export function istHafthausBezeichnung(abteilung) {
  const a = String(abteilung || '').trim()
  return /^Abteilung\s+\d+/i.test(a) || a === 'Aufnahme'
}

export function hatNutzerHafthaus(aktiverNutzer) {
  return Boolean(getNutzerHafthaus(aktiverNutzer).haus)
}
