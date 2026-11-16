// Deutsche Anzeigenamen – parallel zu frontend/src/components/shared/StatusBadge.jsx

export const MELDUNGS_STATUS_LABELS = {
  DRAFT: 'Entwurf',
  SUBMITTED: 'Eingereicht',
  IN_PROGRESS: 'Fachliche Prüfung',
  FORWARDED: 'Weitergeleitet',
  ARCHIVED: 'Archiviert',
}

export function getMeldungsStatusLabel(status) {
  return MELDUNGS_STATUS_LABELS[status] || status || ''
}

export function compareMeldungsStatusByLabel(statusA, statusB, dir = 'asc') {
  const cmp = getMeldungsStatusLabel(statusA).localeCompare(getMeldungsStatusLabel(statusB), 'de')
  return dir === 'desc' ? -cmp : cmp
}
