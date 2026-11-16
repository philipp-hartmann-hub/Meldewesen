// ============================================================
// StatusBadge.jsx – HEUREKA 2.0 | A2 eMeldewesen
// Status immer: Text + Farbe + Icon (WCAG – nie nur Farbe)
// ============================================================

import { MELDUNGS_STATUS_LABELS } from '../../utils/meldungen'

const STATUS_CONFIG = {
  DRAFT:        { label: MELDUNGS_STATUS_LABELS.DRAFT,        css: 'status-draft',     icon: '✏️' },
  SUBMITTED:    { label: MELDUNGS_STATUS_LABELS.SUBMITTED,    css: 'status-submitted', icon: '📤' },
  IN_PROGRESS:  { label: MELDUNGS_STATUS_LABELS.IN_PROGRESS,  css: 'status-progress',  icon: '🔍' },
  FORWARDED:    { label: MELDUNGS_STATUS_LABELS.FORWARDED,    css: 'status-forwarded', icon: '↗️' },
  ARCHIVED:     { label: MELDUNGS_STATUS_LABELS.ARCHIVED,     css: 'status-archived',  icon: '🗂️' },
  // A2-Status-Aliases für die API-Responses
  offen:            { label: 'Offen',             css: 'status-submitted', icon: '📥' },
  'in-bearbeitung': { label: MELDUNGS_STATUS_LABELS.IN_PROGRESS, css: 'status-progress',  icon: '🔍' },
  weitergeleitet:   { label: MELDUNGS_STATUS_LABELS.FORWARDED,   css: 'status-forwarded', icon: '↗️' },
  archiviert:       { label: MELDUNGS_STATUS_LABELS.ARCHIVED,    css: 'status-archived',  icon: '🗂️' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status || '–',
    css: 'status-draft',
    icon: '•',
  }
  return (
    <span className={cfg.css} role="status" aria-label={`Status: ${cfg.label}`}>
      <span aria-hidden="true">{cfg.icon}</span> {cfg.label}
    </span>
  )
}

// ---- ERV-Badge (A2-spezifisch) ----
export function ERVBadge() {
  return (
    <span className="erv-badge" title="ERV-pflichtige Meldung – Versand über beBPo/xJustiz">
      ⚖️ ERV-pflichtig
    </span>
  )
}

export { STATUS_CONFIG }
