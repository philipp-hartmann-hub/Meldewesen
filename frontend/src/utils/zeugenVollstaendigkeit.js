import { isRichTextEmpty } from './richText'

/** Spiegelt backend/src/services/zeugenVollstaendigkeitService.js */
export function alleZeugenaussagenVollstaendig(metadaten) {
  const zeugen = Array.isArray(metadaten?.zeugen) ? metadaten.zeugen : []
  if (!zeugen.length) return true

  const fa = metadaten?.zeugenFolgeaktionen || {}
  const benachr = fa.bediensteteBenachrichtigungen || []
  const gruppen = fa.gruppenAufgaben || []

  if (benachr.some(b => b.status === 'OFFEN')) return false
  if (gruppen.some(g => g.status === 'OFFEN')) return false

  for (const z of zeugen) {
    if (z.zeugenTyp === 'bediensteter') {
      const ben = benachr.find(b => b.zeugeId === z.id)
      if (ben) {
        if (ben.status !== 'ERLEDIGT') return false
        continue
      }
      if (!z.aussageBestaetigtAm && isRichTextEmpty(z.aussage)) return false
      continue
    }

    if (z.zeugenTyp === 'inhaftierter') {
      const ga = gruppen.find(g => g.zeugeId === z.id)
      if (ga) {
        if (ga.status !== 'ERLEDIGT') return false
        continue
      }
      if (isRichTextEmpty(z.aussage) && !z.aussageAufgenommenAm) return false
      continue
    }

    if (z.zeugenTyp === 'ohne_meldeberechtigung') {
      if (isRichTextEmpty(z.aussage)) return false
    }
  }

  return true
}

export function istStrafanzeigePruefbereit(meldung) {
  if (meldung?.meldungsTyp !== 'STRAFANZEIGE') return true
  return alleZeugenaussagenVollstaendig(meldung.metadaten)
}
