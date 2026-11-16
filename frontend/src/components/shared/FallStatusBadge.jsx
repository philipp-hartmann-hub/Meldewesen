import { FALL_STATUS_ICONS, getFallStatusLabel } from '../../utils/faelle'

const STATUS_CSS = {
  SAMMELN: 'status-submitted',
  ZUR_DGL: 'status-progress',
  ZURUECK_AK: 'status-forwarded',
  ZUR_SL: 'status-forwarded',
  ZUR_AL: 'status-archived',
  EGPA_INTERN: 'status-progress',
  ABGESCHLOSSEN_INTERN: 'status-archived',
  ERV_WEG: 'status-progress',
}

export default function FallStatusBadge({ status }) {
  const label = getFallStatusLabel(status)
  const icon = FALL_STATUS_ICONS[status] || '•'
  const css = STATUS_CSS[status] || 'status-draft'
  return (
    <span className={css} role="status" aria-label={`Fallstatus: ${label}`}>
      <span aria-hidden="true">{icon}</span> {label}
    </span>
  )
}
