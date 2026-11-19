import { Link } from 'react-router-dom'
import FallStatusBadge from '../shared/FallStatusBadge'
import { istFallErvPfad, MELDUNG_PROZESS_SCHRITTE } from '../../utils/faelle'

function Prozessfolge() {
  return (
    <p className="text-xs text-jhh-text-light mt-2 m-0">
      {MELDUNG_PROZESS_SCHRITTE.map(s => s.label).join(' → ')}
    </p>
  )
}

/**
 * Hinweis zur Fall-Bündelung auf der Meldungsdetailseite.
 */
export default function MeldungFallBanner({ meldung }) {
  if (!meldung) return null

  const { status: meldungStatus, fall } = meldung

  if (fall) {
    const ervAmFall = istFallErvPfad(fall)
    return (
      <div className="mb-4 p-4 rounded border border-jhh-secondary bg-blue-50 text-sm" role="status">
        <p className="font-semibold text-jhh-primary m-0 mb-2">
          📦 Teil eines gebündelten Falls
        </p>
        <p className="m-0 mb-2 text-jhh-text">
          Diese Einzelmeldung ist dem Fall{' '}
          <Link to={`/faelle/${fall.id}`} className="text-jhh-secondary font-semibold hover:underline">
            {fall.fallNr}
          </Link>
          {fall.bezeichnung ? ` (${fall.bezeichnung})` : ''} zugeordnet.
        </p>
        <FallStatusBadge status={fall.status} />
        {ervAmFall && !fall.abgeschlossenAm && (
          <p className="text-xs text-jhh-text-light mt-2 m-0">
            ERV und eGPA werden <strong>am Fall</strong> bearbeitet – bitte Fall-Detail öffnen.
            {fall.meldepflichtig === true && ' (versandfähig → beBPo → eGPA)'}
            {fall.meldepflichtig === false && ' (direkt eGPA, ohne beBPo)'}
          </p>
        )}
        {fall.status === 'ABGESCHLOSSEN_INTERN' && (
          <p className="text-xs text-jhh-success mt-2 m-0">
            Fall abgeschlossen – diese Meldung ist archiviert.
          </p>
        )}
        <Prozessfolge />
      </div>
    )
  }

  if (['SUBMITTED', 'FORWARDED', 'IN_PROGRESS'].includes(meldungStatus)) {
    return (
      <div className="mb-4 p-4 rounded border border-jhh-border bg-jhh-bg text-sm" role="status">
        <p className="font-semibold text-jhh-primary m-0 mb-1">Wartet auf Bündelung durch die Zentrale</p>
        <p className="m-0 text-jhh-text-light">
          Die Zentrale bündelt diese Einzelmeldung, danach folgen DGL prüft, SL und AL/VAL entscheidet.
        </p>
        <Prozessfolge />
      </div>
    )
  }

  return null
}
