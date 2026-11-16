import { isRichTextEmpty } from '../utils/richText.js'
import { aufloesenEmpfaengerStrafanzeige } from '../utils/meldungPflichtfelder.js'

export function istBeweismittelNachreichungOffen(meta) {
  const m = meta && typeof meta === 'object' ? meta : {}
  return m.beweismittelNachreichung?.status === 'OFFEN'
    && ['beweismittel', 'beides'].includes(m.rueckgabeErgaenzung?.grund)
}

/**
 * Pflichtprüfung nur für Beweismittel-Felder bei offener Nachreichung.
 */
export function validiereBeweismittelNachreichungAbschluss(meta) {
  const m = meta && typeof meta === 'object' ? meta : {}
  if (!istBeweismittelNachreichungOffen(m)) {
    return 'Keine offene Beweismittel-Nachreichung.'
  }
  if (m.beweismittelGesichert !== 'ja' && m.beweismittelGesichert !== 'nein') {
    return 'Bitte geben Sie an, ob Beweismittel gesichert wurden (Ja oder Nein).'
  }
  if (m.beweismittelGesichert === 'ja' && isRichTextEmpty(m.beweismittelAngaben)) {
    return 'Bitte beschreiben Sie kurz die gesicherten Beweismittel.'
  }
  if (m.beweismittelGesichert === 'nein' && isRichTextEmpty(m.beweismittelKeineBegruendung)) {
    return 'Bitte begründen Sie, warum nach Prüfung keine Beweismittel vorliegen (z. B. nur Zeugenaussagen).'
  }
  return null
}

/**
 * Setzt beweismittelNachreichung auf ERLEDIGT und entfernt rueckgabeErgaenzung.
 */
export function metaNachBeweismittelEinreichung(meta, nutzerId) {
  const m = meta && typeof meta === 'object' ? meta : {}
  const ergebnis = m.beweismittelGesichert === 'ja' ? 'nachgereicht' : 'keine'
  const begruendungKeine = m.beweismittelGesichert === 'nein'
    ? (m.beweismittelKeineBegruendung || '').trim()
    : null
  const jetzt = new Date().toISOString()
  const next = {
    ...m,
    beweismittelNachreichung: {
      ...m.beweismittelNachreichung,
      status: 'ERLEDIGT',
      ergebnis,
      begruendungKeine,
      erledigtAm: jetzt,
      erledigtVon: nutzerId,
    },
    rueckgabeErgaenzung: undefined,
  }
  delete next.rueckgabeErgaenzung
  return { meta: next, ergebnis, begruendungKeine }
}

/**
 * Meldung nach Beweismittel-Nachreichung einreichen (DRAFT → SUBMITTED).
 */
export async function einreichenNachBeweismittelNachreichung(prisma, {
  meldung,
  meta,
  nutzerId,
  bediensteteId = null,
  kommentar = 'Eingereicht nach Beweismittel-Nachreichung',
}) {
  const { meta: metaUpdate, ergebnis, begruendungKeine } = metaNachBeweismittelEinreichung(meta, nutzerId)

  let empfaengerUpdate = {}
  if (meldung.meldungsTyp === 'STRAFANZEIGE') {
    empfaengerUpdate = aufloesenEmpfaengerStrafanzeige(meldung.empfaenger, meldung.empfaengerTyp)
  }

  const ops = [
    prisma.meldung.update({
      where: { id: meldung.id },
      data: {
        status: 'SUBMITTED',
        metadaten: metaUpdate,
        ...empfaengerUpdate,
      },
    }),
    prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: 'SUBMITTED',
        kommentar,
        bediensteteId,
      },
    }),
  ]

  if (ergebnis === 'keine' && begruendungKeine) {
    const bed = await prisma.bedienstete.findUnique({ where: { bediensteterID: nutzerId } })
    const name = bed?.bediensteterName || nutzerId
    ops.push(prisma.notiz.create({
      data: {
        text: `Beweismittel-Nachreichung: Keine Beweismittel vorhanden (AVD ${name}). Begründung: ${begruendungKeine.replace(/<[^>]+>/g, '')}`,
        erstelltVon: nutzerId,
        meldungId: meldung.id,
      },
    }))
  }

  const [updated] = await prisma.$transaction(ops)
  return { meldung: updated, meta: metaUpdate }
}
