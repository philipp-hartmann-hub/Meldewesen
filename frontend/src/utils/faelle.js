export const FALL_STATUS_LABELS = {
  SAMMELN: 'In Sammlung',
  ZUR_DGL: 'Zur Dienstgruppenleitung',
  ZURUECK_AK: 'Zurück an Zentrale',
  ZUR_SL: 'Zur Stationsleitung',
  ZUR_AL: 'Zur Meldepflicht-Entscheid',
  EGPA_INTERN: 'eGPA (intern)',
  ERV_WEG: 'ERV-Weg (meldepflichtig)',
  ABGESCHLOSSEN_INTERN: 'Abgeschlossen',
}

export function getFallStatusLabel(status) {
  return FALL_STATUS_LABELS[status] || status || '–'
}

export const FALL_STATUS_ICONS = {
  SAMMELN: '📦',
  ZUR_DGL: '🔍',
  ZURUECK_AK: '↩️',
  ZUR_SL: '🏠',
  ZUR_AL: '⚖️',
  EGPA_INTERN: '📁',
  ERV_WEG: '📤',
  ABGESCHLOSSEN_INTERN: '✅',
}

/** Prozessschritte am Fall: aVD → Zentrale → DGL → SL → AL/VAL → ERV. */
export const FALL_PROZESS_SCHRITTE = [
  { id: 'erfassung', label: 'Einzelmeldungen (aVD)' },
  { id: 'buendeln', label: 'Zentrale bündelt' },
  { id: 'dgl', label: 'DGL prüft' },
  { id: 'sl', label: 'SL (Fallmeldung)' },
  { id: 'al', label: 'AL/VAL entscheidet' },
  { id: 'abschluss', label: 'eGPA / ERV' },
]

/**
 * Dieselbe Schrittfolge und dieselben Bezeichnungen in Schrittleiste,
 * Meldungs-Banner und Einreichungsdialog.
 */
export const MELDUNG_PROZESS_SCHRITTE = [
  { id: 'draft', label: 'Entwurf' },
  { id: 'submitted', label: 'Eingereicht' },
  { id: 'buendeln', label: 'Zentrale bündelt' },
  { id: 'dgl', label: 'DGL prüft' },
  { id: 'sl', label: 'SL' },
  { id: 'al', label: 'AL/VAL entscheidet' },
  { id: 'erv', label: 'eGPA/ERV' },
  { id: 'abschluss', label: 'Abschluss' },
]

export function getFallProzessSchrittIndex(status) {
  const map = {
    SAMMELN: 1,
    ZURUECK_AK: 1,
    ZUR_DGL: 2,
    ZUR_SL: 3,
    ZUR_AL: 4,
    EGPA_INTERN: 5,
    ERV_WEG: 5,
    ABGESCHLOSSEN_INTERN: 5,
  }
  return map[status] ?? 0
}

/** Aktiver Schritt der Meldungsleiste aus Meldungs- und Fallstatus. */
export function aktiverMeldungsSchrittId(meldung) {
  if (!meldung) return 'draft'
  if (meldung.status === 'ARCHIVED' || meldung.fall?.status === 'ABGESCHLOSSEN_INTERN') {
    return 'abschluss'
  }
  if (meldung.status === 'DRAFT' && meldung.metadaten?.rueckgabeDgl) return 'dgl'
  if (meldung.fall?.status) {
    const fallSchritt = FALL_PROZESS_SCHRITTE[getFallProzessSchrittIndex(meldung.fall.status)]
    if (fallSchritt?.id === 'abschluss') return 'erv'
    if (fallSchritt?.id === 'erfassung') return 'submitted'
    return fallSchritt?.id || 'buendeln'
  }
  if (meldung.status === 'DRAFT') return 'draft'
  return 'buendeln'
}

/** ERV wird am Fall bearbeitet (nicht je Einzelmeldung). */
export function istFallErvPfad(fall) {
  if (!fall) return false
  return ['EGPA_INTERN', 'ERV_WEG'].includes(fall.status)
    || (fall.status === 'ABGESCHLOSSEN_INTERN' && fall.meldepflichtig !== null)
}
