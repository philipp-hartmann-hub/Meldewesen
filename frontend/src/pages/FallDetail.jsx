import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import FallProzessLeiste from '../components/emeldewesen/FallProzessLeiste'
import FallErvPanel from '../components/emeldewesen/FallErvPanel'
import FallStatusBadge from '../components/shared/FallStatusBadge'
import StatusBadge, { ERVBadge } from '../components/shared/StatusBadge'
import { useApiClient } from '../api/client'
import { useRolle } from '../context/RollenContext'
import { formatDatumKurz, formatGefangene, getMeldungstypLabel } from '../utils/meldungen'
import { stripRichTextPlain } from '../utils/richText'

const ERV_BESTAETIGUNG = {
  versandfaehig: 'Fall als versandfähig markieren?',
  bepo: 'Gebündelten Fall per beBPo (Mock) versenden?',
  egpa: 'Gebündelten Fall in eGPA verakten?',
  abschliessen: 'Fall mit Vier-Augen abschließen? Alle Einzelmeldungen werden archiviert.',
}

export default function FallDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const api = useApiClient()
  const { darfBuendeln, darfFallPruefen, istAL, istVAL, istStationsleitung } = useRolle()

  const [fall, setFall] = useState(null)
  const [ungebundene, setUngebundene] = useState([])
  const [laden, setLaden] = useState(true)
  const [fehler, setFehler] = useState('')
  const [meldung, setMeldung] = useState('')
  const [rueckgabeText, setRueckgabeText] = useState('')
  const [aktionLaden, setAktionLaden] = useState(false)
  const [hinzufuegenAuswahl, setHinzufuegenAuswahl] = useState(new Set())
  const [entscheidKommentar, setEntscheidKommentar] = useState('')

  const ladenFall = useCallback(async () => {
    setLaden(true)
    setFehler('')
    try {
      const res = await api.get(`/api/faelle/${id}`)
      setFall(res.data)
      if (darfBuendeln && res.data?.darfBearbeiten) {
        const u = await api.get('/api/faelle/ungebundene-meldungen')
        setUngebundene(u.data || [])
      }
    } catch (e) {
      setFehler(e.message || 'Fall konnte nicht geladen werden.')
    } finally {
      setLaden(false)
    }
  }, [api, id, darfBuendeln])

  useEffect(() => { ladenFall() }, [ladenFall])

  async function runAktion(fn, okMsg) {
    setAktionLaden(true)
    setFehler('')
    setMeldung('')
    try {
      const res = await fn()
      setMeldung(res.message || okMsg)
      if (res.geloescht) {
        navigate('/emeldewesen?bereich=faelle')
        return
      }
      await ladenFall()
    } catch (e) {
      setFehler(e.message || 'Aktion fehlgeschlagen.')
    } finally {
      setAktionLaden(false)
    }
  }

  async function handleWeiterleitenDgl() {
    if (!window.confirm('Fall gebündelt an die Dienstgruppenleitung weiterleiten?')) return
    await runAktion(
      () => api.post(`/api/faelle/${id}/weiterleiten-dgl`),
      'Weitergeleitet.',
    )
  }

  async function handleRueckgabe(e) {
    e.preventDefault()
    await runAktion(
      () => api.post(`/api/faelle/${id}/rueckgabe`, { kommentar: rueckgabeText }),
      'Zurückgegeben.',
    )
    setRueckgabeText('')
  }

  async function handleWeiterleitenSl() {
    if (!window.confirm('Qualität ok – Fall als Fallmeldung an die Stationsleitung weiterleiten?')) return
    await runAktion(
      () => api.post(`/api/faelle/${id}/weiterleiten-sl`),
      'An Stationsleitung weitergeleitet.',
    )
  }

  async function handleWeiterleitenAl() {
    if (!window.confirm('Fallmeldung an AL/VAL zur Meldepflicht-Entscheidung weiterleiten?')) return
    await runAktion(
      () => api.post(`/api/faelle/${id}/weiterleiten-al`),
      'Zur Meldepflicht-Entscheidung weitergeleitet.',
    )
  }

  async function handleMeldepflichtEntscheid(meldepflichtig) {
    const label = meldepflichtig
      ? 'meldepflichtig (ERV-Weg am Fall)'
      : 'nicht meldepflichtig (eGPA am Fall, ohne beBPo)'
    if (!window.confirm(`Fall als ${label} entscheiden?`)) return
    await runAktion(
      () => api.post(`/api/faelle/${id}/entscheid-meldepflicht`, {
        meldepflichtig,
        kommentar: entscheidKommentar.trim() || undefined,
      }),
      'Entscheidung gespeichert.',
    )
    setEntscheidKommentar('')
  }

  async function handleErvAktion(key) {
    const bestaetigung = ERV_BESTAETIGUNG[key]
    if (bestaetigung && !window.confirm(bestaetigung)) return

    const routes = {
      versandfaehig: () => api.post(`/api/faelle/${id}/versandfaehig`),
      bepo: () => api.post(`/api/faelle/${id}/xjustiz-versand`),
      egpa: () => api.post(`/api/faelle/${id}/verakten`),
      abschliessen: () => api.post(`/api/faelle/${id}/abschliessen`),
    }
    if (!routes[key]) return
    await runAktion(routes[key], 'Erledigt.')
  }

  async function handleEntfernen(meldungId) {
    if (!window.confirm('Meldung aus diesem Fall entfernen?')) return
    await runAktion(
      () => api.delete(`/api/faelle/${id}/meldungen/${meldungId}`),
      'Entfernt.',
    )
  }

  async function handleHinzufuegen(e) {
    e.preventDefault()
    if (hinzufuegenAuswahl.size === 0) {
      setFehler('Bitte wählen Sie mindestens eine Meldung aus.')
      return
    }
    await runAktion(
      () => api.post(`/api/faelle/${id}/meldungen`, { meldungIds: [...hinzufuegenAuswahl] }),
      'Meldungen hinzugefügt.',
    )
    setHinzufuegenAuswahl(new Set())
  }

  if (laden) {
    return (
      <PageLayout plattformTitel="eMeldewesen" fachverfahren={{ label: 'eMeldewesen', href: '/emeldewesen' }} seiten={[{ label: 'Fall' }]}>
        <p className="text-jhh-text-light">Lade Fall …</p>
      </PageLayout>
    )
  }

  if (fehler && !fall) {
    return (
      <PageLayout plattformTitel="eMeldewesen" fachverfahren={{ label: 'eMeldewesen', href: '/emeldewesen' }} seiten={[{ label: 'Fall' }]}>
        <p className="text-jhh-danger" role="alert">{fehler}</p>
        <Link to="/emeldewesen?bereich=faelle" className="text-jhh-secondary font-semibold hover:underline">← Zurück</Link>
      </PageLayout>
    )
  }

  const entscheidLabel = fall.entscheidVonRolle === 'val' ? 'VAL' : 'Anstaltsleitung'

  return (
    <PageLayout
      plattformTitel="eMeldewesen"
      fachverfahren={{ label: 'eMeldewesen', href: '/emeldewesen' }}
      seiten={[{ label: fall?.fallNr || 'Fall' }]}
    >
      <div className="mb-4">
        <Link to="/emeldewesen?bereich=faelle" className="text-sm text-jhh-secondary font-semibold hover:underline">
          ← Zurück zur Fall-Bündelung
        </Link>
      </div>

      <header className="mb-6 flex flex-wrap items-start gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-jhh-primary m-0 mb-1">{fall.fallNr}</h1>
          {fall.bezeichnung && (
            <p className="text-base text-jhh-text-light m-0">{fall.bezeichnung}</p>
          )}
        </div>
        <FallStatusBadge status={fall.status} />
      </header>

      <FallProzessLeiste status={fall.status} />

      {fall.meldepflichtig !== null && fall.alEntscheidAm && (
        <div className={`section-card mb-6 border-l-4 ${fall.meldepflichtig ? 'border-jhh-secondary' : 'border-jhh-success'}`}>
          <h2 className="text-sm font-bold text-jhh-primary m-0 mb-1">Entscheidung {entscheidLabel}</h2>
          <p className="text-sm m-0">
            {fall.meldepflichtig
              ? 'Meldepflichtig – ERV-Weg am Fall (versandfähig → beBPo → eGPA).'
              : 'Nicht meldepflichtig – eGPA am Fall ohne beBPo.'}
          </p>
          {fall.alEntscheidKommentar && (
            <p className="text-sm text-jhh-text-light mt-2 m-0">{fall.alEntscheidKommentar}</p>
          )}
        </div>
      )}

      {fall.istAbgeschlossen && (
        <div className="section-card mb-6 border-l-4 border-jhh-success">
          <h2 className="text-sm font-bold text-jhh-success m-0 mb-1">Fall abgeschlossen</h2>
          <p className="text-sm m-0">
            Alle Einzelmeldungen wurden archiviert.
            {fall.egpaAktenzeichen && ` eGPA: ${fall.egpaAktenzeichen}.`}
            {fall.bepoNachrichtenId && ` beBPo: ${fall.bepoNachrichtenId}.`}
          </p>
        </div>
      )}

      <FallErvPanel fall={fall} aktionLaden={aktionLaden} onAktion={handleErvAktion} />

      {fehler && <p className="text-jhh-danger text-sm mb-3" role="alert">{fehler}</p>}
      {meldung && <p className="text-jhh-success text-sm mb-3" role="status">{meldung}</p>}

      {fall.rueckgabeGrund && (
        <div className="section-card mb-6 border-l-4 border-jhh-warning">
          <h2 className="text-sm font-bold text-jhh-warning m-0 mb-1">Rückgabe durch Dienstgruppenleitung</h2>
          <p className="text-sm m-0">{fall.rueckgabeGrund}</p>
        </div>
      )}

      <section className="section-card mb-6" aria-labelledby="meldungen-kopf">
        <h2 id="meldungen-kopf" className="text-lg font-bold text-jhh-primary mb-3">
          Gebündelte Meldungen ({fall.meldungen?.length || 0})
        </h2>
        <div className="overflow-x-auto">
          <table className="data-table w-full text-sm">
            <thead>
              <tr>
                <th>Nr.</th>
                <th>Typ</th>
                <th>Meldende/r (aVD)</th>
                <th>Gefangene/r</th>
                <th>Sachverhalt</th>
                <th>Status</th>
                {fall.darfBearbeiten && <th><span className="sr-only">Entfernen</span></th>}
              </tr>
            </thead>
            <tbody>
              {(fall.meldungen || []).map(m => (
                <tr key={m.id}>
                  <td>
                    <Link to={`/meldungen/${m.id}`} className="text-jhh-secondary font-semibold hover:underline">
                      {m.meldungsNr}
                    </Link>
                  </td>
                  <td>
                    {getMeldungstypLabel(m.meldungsTyp)}
                    {m.ervRelevant && <span className="ml-1"><ERVBadge /></span>}
                  </td>
                  <td>{m.zustaendig?.bediensteterName || '–'}</td>
                  <td>{formatGefangene(m.gefangene)}</td>
                  <td className="max-w-xs truncate">{stripRichTextPlain(m.sachverhalt) || '–'}</td>
                  <td><StatusBadge status={m.status} /></td>
                  {fall.darfBearbeiten && (
                    <td>
                      <button
                        type="button"
                        onClick={() => handleEntfernen(m.id)}
                        disabled={aktionLaden}
                        className="text-jhh-danger text-sm font-semibold hover:underline min-h-[44px]"
                      >
                        Entfernen
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {fall.darfBearbeiten && ungebundene.length > 0 && (
        <section className="section-card mb-6" aria-labelledby="hinzufuegen-kopf">
          <h2 id="hinzufuegen-kopf" className="text-lg font-bold text-jhh-primary mb-3">
            Weitere Meldungen hinzufügen
          </h2>
          <form onSubmit={handleHinzufuegen}>
            <ul className="space-y-2 mb-4">
              {ungebundene.map(m => (
                <li key={m.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`add-${m.id}`}
                    checked={hinzufuegenAuswahl.has(m.id)}
                    onChange={() => {
                      setHinzufuegenAuswahl(prev => {
                        const next = new Set(prev)
                        if (next.has(m.id)) next.delete(m.id)
                        else next.add(m.id)
                        return next
                      })
                    }}
                    className="w-5 h-5"
                  />
                  <label htmlFor={`add-${m.id}`} className="text-sm cursor-pointer">
                    {m.meldungsNr} · {getMeldungstypLabel(m.meldungsTyp)} · {formatGefangene(m.gefangene)}
                  </label>
                </li>
              ))}
            </ul>
            <button type="submit" disabled={aktionLaden || hinzufuegenAuswahl.size === 0} className="btn-secondary btn-sm">
              Auswahl hinzufügen
            </button>
          </form>
        </section>
      )}

      <footer className="flex flex-wrap gap-3">
        {fall.darfBearbeiten && darfBuendeln && (
          <button
            type="button"
            onClick={handleWeiterleitenDgl}
            disabled={aktionLaden || !fall.meldungen?.length}
            className="btn-primary min-h-[44px]"
          >
            📤 Gebündelt an Dienstgruppenleitung
          </button>
        )}

        {fall.darfPruefen && darfFallPruefen && (
          <>
            <button
              type="button"
              onClick={handleWeiterleitenSl}
              disabled={aktionLaden}
              className="btn-primary min-h-[44px]"
            >
              ✅ Qualität ok – an Stationsleitung
            </button>
            <form onSubmit={handleRueckgabe} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-end">
              <div>
                <label htmlFor="rueckgabe-kommentar" className="block text-sm font-semibold mb-1">
                  Rückgabegrund <span className="text-jhh-danger">*</span>
                </label>
                <input
                  id="rueckgabe-kommentar"
                  type="text"
                  value={rueckgabeText}
                  onChange={e => setRueckgabeText(e.target.value)}
                  required
                  aria-required="true"
                  placeholder="Was fehlt zur Qualitätsprüfung?"
                  className="input-field w-full sm:min-w-[280px]"
                />
              </div>
              <button type="submit" disabled={aktionLaden || !rueckgabeText.trim()} className="btn-secondary min-h-[44px]">
                ↩️ An Zentrale zurückgeben
              </button>
            </form>
          </>
        )}

        {fall.darfSlWeiterleiten && istStationsleitung && (
          <button
            type="button"
            onClick={handleWeiterleitenAl}
            disabled={aktionLaden}
            className="btn-primary min-h-[44px]"
          >
            📤 Fallmeldung an AL/VAL weiterleiten
          </button>
        )}

        {fall.darfMeldepflichtEntscheid && (istAL || istVAL) && (
          <div className="w-full space-y-3">
            <p className="text-sm text-jhh-text m-0">
              Entscheiden Sie auf Basis des <strong>gebündelten Falls</strong> (alle aVD-Perspektiven):
            </p>
            <div>
              <label htmlFor="entscheid-kommentar" className="block text-sm font-semibold mb-1">
                Kommentar (optional)
              </label>
              <input
                id="entscheid-kommentar"
                type="text"
                value={entscheidKommentar}
                onChange={e => setEntscheidKommentar(e.target.value)}
                placeholder="Begründung der Entscheidung"
                className="input-field w-full max-w-xl"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleMeldepflichtEntscheid(true)}
                disabled={aktionLaden}
                className="btn-primary min-h-[44px]"
              >
                ✅ Meldepflichtig (ERV)
              </button>
              <button
                type="button"
                onClick={() => handleMeldepflichtEntscheid(false)}
                disabled={aktionLaden}
                className="btn-secondary min-h-[44px]"
              >
                Intern (eGPA, ohne beBPo)
              </button>
            </div>
          </div>
        )}
      </footer>

      <p className="text-xs text-jhh-text-light mt-6">
        Erstellt am {formatDatumKurz(fall.erstelltAm)}
        {fall.erstelltVon?.bediensteterName && ` · ${fall.erstelltVon.bediensteterName}`}
      </p>
    </PageLayout>
  )
}
