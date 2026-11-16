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
  return FALL_STATUS_LABELS[status] || status || ''
}
