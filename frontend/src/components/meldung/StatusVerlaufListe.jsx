import StatusBadge from '../shared/StatusBadge'
import RichTextDisplay from '../shared/RichTextDisplay'
import { formatDatum } from '../../utils/meldungen'

export default function StatusVerlaufListe({ verlauf }) {
  if (!verlauf?.length) {
    return <p className="text-sm text-jhh-text-light">Noch keine Statusänderungen.</p>
  }

  return (
    <ol className="space-y-3 list-none p-0 m-0">
      {[...verlauf].reverse().map(e => (
        <li key={e.id} className="flex gap-3 text-sm border-l-2 border-jhh-border pl-4">
          <div className="flex-1">
            <StatusBadge status={e.status} />
            {e.kommentar && (
              <RichTextDisplay html={e.kommentar} className="mt-1 text-jhh-text" />
            )}
            <p className="text-xs text-jhh-text-light mt-1">
              {formatDatum(e.erstelltAm)}
              {e.bedienstete?.bediensteterName && ` · ${e.bedienstete.bediensteterName}`}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
