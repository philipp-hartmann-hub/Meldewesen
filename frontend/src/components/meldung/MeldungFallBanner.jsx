import { Link } from 'react-router-dom'
import FallStatusBadge from '../shared/FallStatusBadge'
import { istFallErvPfad } from '../../utils/faelle'

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
      </div>
    )
  }

  if (meldungStatus === 'SUBMITTED') {
    return (
      <div className="mb-4 p-4 rounded border border-jhh-border bg-jhh-bg text-sm" role="status">
        <p className="font-semibold text-jhh-primary m-0 mb-1">⏳ Wartet auf Fall-Bündelung</p>
        <p className="m-0 text-jhh-text-light">
          Die Zentrale (Arbeitskoordination) bündelt eingereichte Einzelmeldungen zum gleichen
          Vorfall, bevor die Dienstgruppenleitung prüft.
        </p>
      </div>
    )
  }

  if (meldungStatus === 'FORWARDED' && !fall) {
    return (
      <div className="mb-4 p-3 rounded border border-jhh-border bg-jhh-bg text-sm text-jhh-text-light" role="status">
        Status <strong>Weitergeleitet</strong> – Fall-Zuordnung wird geladen …
      </div>
    )
  }

  return null
}
