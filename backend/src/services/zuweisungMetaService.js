/**
 * Gemeinsame Metadaten-Logik für Zuweisungen (Meldung + Arbeitskorb).
 */

export function getAktuellerEmpfaengerId(meta) {
  if (!meta || typeof meta !== 'object') return null
  if (meta.beweismittelNachreichung?.status === 'OFFEN' && meta.beweismittelNachreichung.zugewiesenAn) {
    return meta.beweismittelNachreichung.zugewiesenAn
  }
  return meta.zugewiesenAn || null
}

export function setMeldungZuweisung(meta, {
  zielId,
  zielName,
  vonId,
  vonName,
  jetzt,
  inGruppenpostfach = false,
}) {
  const next = { ...meta }
  const nachreichung = next.beweismittelNachreichung

  if (nachreichung?.status === 'OFFEN') {
    if (zielId) {
      next.beweismittelNachreichung = {
        ...nachreichung,
        zugewiesenAn: zielId,
        zugewiesenAnName: zielName || zielId,
        zugewiesenVon: vonId,
        zugewiesenVonName: vonName,
        zugewiesenAm: jetzt,
        inGruppenpostfach: false,
      }
    } else {
      next.beweismittelNachreichung = {
        ...nachreichung,
        zugewiesenAn: null,
        zugewiesenAnName: null,
        inGruppenpostfach: inGruppenpostfach || true,
        zurueckgegebenAnGruppeAm: jetzt,
        zurueckgegebenAnGruppeVon: vonId,
      }
    }
  }

  if (zielId) {
    next.zugewiesenAn = zielId
    next.zugewiesenAnName = zielName || zielId
    next.zugewiesenVon = vonId
    next.zugewiesenAm = jetzt
  } else {
    next.zugewiesenAn = null
    next.zugewiesenAnName = null
    next.zurueckgegebenAnGruppeAm = jetzt
    next.zurueckgegebenAnGruppeVon = vonId
  }

  return next
}

export function setGruppenAufgabeZuweisung(meta, zeugeId, {
  zielId,
  zielName,
  vonId,
  vonName,
  jetzt,
  freigeben = false,
}) {
  const next = { ...meta }
  const fa = next.zeugenFolgeaktionen || {}
  const gruppen = [...(fa.gruppenAufgaben || [])]
  const idx = gruppen.findIndex(g => g.zeugeId === zeugeId)
  if (idx < 0) return { meta: next, idx: -1, gruppen, fa }

  const ga = gruppen[idx]
  if (freigeben) {
    gruppen[idx] = {
      ...ga,
      uebernommenVon: null,
      uebernommenVonName: null,
      zurueckgegebenAnGruppeAm: jetzt,
      zurueckgegebenAnGruppeVon: vonId,
    }
  } else {
    gruppen[idx] = {
      ...ga,
      uebernommenVon: zielId,
      uebernommenVonName: zielName || zielId,
      uebernommenAm: jetzt,
      zugewiesenVon: vonId,
      zugewiesenVonName: vonName,
    }
  }

  next.zeugenFolgeaktionen = { ...fa, gruppenAufgaben: gruppen }
  return { meta: next, idx, gruppen, fa }
}

export async function enrichMeldungenMitZuweisungNamen(prisma, meldungen) {
  const ids = new Set()
  for (const m of meldungen) {
    const meta = m.metadaten || {}
    const zid = getAktuellerEmpfaengerId(meta) || meta.zugewiesenAn
    if (zid) ids.add(zid)
  }
  if (!ids.size) return meldungen

  const bedienstete = await prisma.bedienstete.findMany({
    where: { bediensteterID: { in: [...ids] } },
  })
  const namen = Object.fromEntries(bedienstete.map(b => [b.bediensteterID, b.bediensteterName]))

  return meldungen.map(m => {
    const meta = m.metadaten || {}
    const zid = getAktuellerEmpfaengerId(meta) || meta.zugewiesenAn
    const name = meta.zugewiesenAnName || meta.beweismittelNachreichung?.zugewiesenAnName
      || (zid ? namen[zid] : null)
    return {
      ...m,
      zugewiesenAn: zid || null,
      zugewiesenAnName: name || null,
    }
  })
}
