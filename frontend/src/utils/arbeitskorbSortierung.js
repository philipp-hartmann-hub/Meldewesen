/**
 * Fünfstufiges Prioritäts-Tier-Modell für Arbeitskorb-Aufgaben.
 * Tier 1 = höchste Priorität.
 */
export function berechneTier(aufgabe) {
  const jetzt = Date.now()
  const fristMs = aufgabe.fristBis ? new Date(aufgabe.fristBis).getTime() : null
  const slaMs = aufgabe.slaFaelligAm ? new Date(aufgabe.slaFaelligAm).getTime() : null
  const deadline = fristMs || slaMs

  if (deadline) {
    const verbleibend = deadline - jetzt
    const gesamtdauer = deadline - new Date(aufgabe.erstelltAm).getTime()
    const anteil = gesamtdauer > 0 ? verbleibend / gesamtdauer : verbleibend > 0 ? 1 : 0

    // Tier 1: SLA/Frist bereits überschritten
    if (verbleibend <= 0) return 1

    // Tier 2: SLA läuft kritisch ab (< 25 % verbleibend)
    if (anteil < 0.25) return 2
  }

  // Tier 3: Manuell dringend markiert, SLA noch unkritisch
  if (aufgabe.dringend || (aufgabe.prioritaet ?? 0) > 0) return 3

  if (deadline) {
    const verbleibend = deadline - jetzt
    const gesamtdauer = deadline - new Date(aufgabe.erstelltAm).getTime()
    const anteil = gesamtdauer > 0 ? verbleibend / gesamtdauer : 1

    // Tier 4: SLA läuft ab (25–50 % verbleibend)
    if (anteil < 0.5) return 4
  }

  // Tier 5: Normal
  return 5
}

export function sortiereAufgaben(aufgaben, kriterium) {
  const kopie = [...aufgaben]
  switch (kriterium) {
    case 'dringlichkeit':
      return kopie.sort((a, b) => {
        const tierDiff = berechneTier(a) - berechneTier(b)
        if (tierDiff !== 0) return tierDiff
        // Innerhalb desselben Tiers: älteste zuerst (FIFO)
        return new Date(a.erstelltAm) - new Date(b.erstelltAm)
      })
    case 'frist_aufsteigend':
      return kopie.sort((a, b) => {
        const fa = a.fristBis || a.slaFaelligAm || '9999'
        const fb = b.fristBis || b.slaFaelligAm || '9999'
        return new Date(fa) - new Date(fb)
      })
    case 'eingang_neu':
      return kopie.sort((a, b) => new Date(b.erstelltAm) - new Date(a.erstelltAm))
    case 'eingang_alt':
      return kopie.sort((a, b) => new Date(a.erstelltAm) - new Date(b.erstelltAm))
    case 'typ':
      return kopie.sort((a, b) => (a.typ || '').localeCompare(b.typ || '', 'de'))
    case 'prozessschritt':
      return kopie.sort((a, b) =>
        (a.meldungStatus || '').localeCompare(b.meldungStatus || '', 'de'),
      )
    default:
      return kopie
  }
}

export function getTierInfo(tier) {
  switch (tier) {
    case 1: return { label: 'Frist überschritten', farbe: 'text-jhh-danger', icon: '🔴' }
    case 2: return { label: 'Frist kritisch', farbe: 'text-orange-600', icon: '🟠' }
    case 3: return { label: 'Dringend', farbe: 'text-yellow-600', icon: '🟡' }
    case 4: return { label: 'Frist läuft ab', farbe: 'text-blue-600', icon: '🔵' }
    default: return { label: '', farbe: '', icon: '' }
  }
}
