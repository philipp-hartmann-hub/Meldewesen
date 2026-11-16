import { Link } from 'react-router-dom'
import { useRolle } from '../../context/RollenContext'
import { formatDatum } from '../../utils/meldungen'
import { arbeitskorbAufgabeHref, AUFGABEN_TYPEN } from '../../utils/arbeitskorb'

function StatusBadge({ status }) {
  const offen = status === 'OFFEN'
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded ${
        offen ? 'bg-orange-50 text-jhh-warning border border-orange-200' : 'bg-green-50 text-jhh-success border border-green-200'
      }`}
    >
      {offen ? '⏳ Offen' : '✅ Erledigt'}
    </span>
  )
}

export default function ZeugenFolgeaktionenAnzeige({ metadaten, meldungId }) {
  const { aktiverNutzer } = useRolle()
  const fa = metadaten?.zeugenFolgeaktionen
  if (!fa) return null

  const benachr = fa.bediensteteBenachrichtigungen || []
  const gruppen = fa.gruppenAufgaben || []
  const station = fa.stationWeiterleitungen || []
  if (!benachr.length && !gruppen.length && !station.length) return null

  return (
    <section className="section-card border-l-4 border-l-jhh-secondary">
      <h2 className="text-lg font-bold text-jhh-primary mb-2">Folgeaktionen Zeugen</h2>
      <p className="text-sm text-jhh-text-light mb-4">
        Ausgelöst bei Einreichung ({fa.ausgeloestAm ? formatDatum(fa.ausgeloestAm) : '–'}).
        Aufgaben erscheinen im{' '}
        <Link to="/arbeitskorb" className="text-jhh-secondary font-semibold hover:underline">
          Arbeitskorb
        </Link>{' '}
        (persönlich oder als Gruppenaufgabe).
      </p>

      {benachr.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-jhh-primary mb-2">Persönliche Aufgabe – Bedienstete/r als Zeuge</h3>
          <ul className="space-y-3 list-none p-0 m-0">
            {benachr.map(b => {
              const istMeine = b.bediensteterId === aktiverNutzer.id && b.status === 'OFFEN' && meldungId
              return (
              <li key={b.zeugeId} className="p-3 rounded border border-jhh-border bg-jhh-bg text-sm">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold">{b.bediensteterName || b.zeugeName}</span>
                  <StatusBadge status={b.status} />
                  {b.fristBis && b.status === 'OFFEN' && (
                    <span className="text-jhh-warning font-semibold text-xs">
                      Frist bis {formatDatum(b.fristBis)}
                    </span>
                  )}
                </div>
                <p className="m-0 text-jhh-text-light">{b.nachricht}</p>
                {istMeine && (
                  <Link
                    to={arbeitskorbAufgabeHref(meldungId, AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN, b.zeugeId)}
                    className="btn-primary btn-sm min-h-[44px] mt-3 inline-flex"
                  >
                    Zeugenaussage ausfüllen
                  </Link>
                )}
                {!b.bediensteterId && b.status === 'OFFEN' && (
                  <p className="text-xs text-jhh-warning mt-2 mb-0">
                    Kein Stammdaten-Treffer – keine Arbeitskorb-Aufgabe erzeugt.
                  </p>
                )}
              </li>
            )})}
          </ul>
        </div>
      )}

      {gruppen.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-jhh-primary mb-2">Gruppenaufgabe – Zeugenaussage Inhaftierte/r</h3>
          <ul className="space-y-3 list-none p-0 m-0">
            {gruppen.map(g => {
              const istMeine = g.uebernommenVon === aktiverNutzer.id && g.status === 'OFFEN' && meldungId
              const istGruppe = !g.uebernommenVon && g.status === 'OFFEN' && meldungId
              return (
                <li key={g.zeugeId} className="p-3 rounded border border-jhh-border bg-jhh-bg text-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold">{g.zeugeName}</span>
                    <StatusBadge status={g.status} />
                    {(g.haus || g.jva) && (
                      <span className="text-xs text-jhh-text-light">
                        {[g.jva, g.haus].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    {g.uebernommenVonName && (
                      <span className="text-xs text-jhh-text-light">
                        Übernommen von {g.uebernommenVonName}
                      </span>
                    )}
                  </div>
                  <p className="m-0 text-jhh-text-light mb-2">{g.nachricht}</p>
                  {istGruppe && (
                    <Link
                      to={`/arbeitskorb?bereich=gruppe`}
                      className="btn-secondary btn-sm min-h-[44px] mt-2 inline-flex"
                    >
                      Gruppenaufgabe im Arbeitskorb
                    </Link>
                  )}
                  {istMeine && (
                    <Link
                      to={arbeitskorbAufgabeHref(meldungId, AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN, g.zeugeId)}
                      className="btn-primary btn-sm min-h-[44px] mt-2 inline-flex"
                    >
                      Zeugenaussage aufnehmen
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {station.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-jhh-primary mb-2">Hinweis Abteilung (Person ohne Meldewesen)</h3>
          <ul className="space-y-3 list-none p-0 m-0">
            {station.map(s => (
              <li key={s.zeugeId} className="p-3 rounded border border-jhh-border bg-jhh-bg text-sm">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold">{s.zeugeName}</span>
                  <StatusBadge status={s.status} />
                  {(s.haus || s.jva) && (
                    <span className="text-xs text-jhh-text-light">
                      {[s.jva, s.haus].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
                <p className="m-0 text-jhh-text-light">{s.nachricht}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
