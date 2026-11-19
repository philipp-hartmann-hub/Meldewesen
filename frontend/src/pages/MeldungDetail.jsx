import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import StatusBadge, { ERVBadge } from '../components/shared/StatusBadge'
import ProzessSchritte from '../components/meldung/ProzessSchritte'
import StatusVerlaufListe from '../components/meldung/StatusVerlaufListe'
import MeldungAktionen from '../components/meldung/MeldungAktionen'
import MeldungForm from '../components/meldung/MeldungForm'
import ZeugenAnzeige from '../components/meldung/ZeugenAnzeige'
import ZeugenFolgeaktionenAnzeige from '../components/meldung/ZeugenFolgeaktionenAnzeige'
import RichTextDisplay from '../components/shared/RichTextDisplay'
import MeldungAnhaengeListe from '../components/meldung/MeldungAnhaengeListe'
import DetailSeitenleiste from '../components/meldung/DetailSeitenleiste'
import ZuweisungSection from '../components/meldung/ZuweisungSection'
import MeldungFallBanner from '../components/meldung/MeldungFallBanner'
import { useApiClient } from '../api/client'
import { buildMockHeaders, uploadMeldungAnhaenge, updateMeldungAnhang, deleteMeldungAnhang } from '../api/meldungAnhaengeApi'
import { useRolle } from '../context/RollenContext'
import {
  formatGefangene,
  formatDatum,
  formatTatzeit,
  getMeldungstypLabel,
  getSlaHinweise,
  getStrafanzeigeUntertypLabel,
} from '../utils/meldungen'
import { AUFGABEN_TYPEN } from '../utils/arbeitskorb'

export default function MeldungDetail({ editMode: editModeProp }) {
  const { id } = useParams()
  const location = useLocation()
  const editMode = editModeProp ?? location.pathname.endsWith('/bearbeiten')
  const api = useApiClient()
  const { aktiveRolle, aktiverNutzer } = useRolle()
  const navigate = useNavigate()
  const [meldung, setMeldung] = useState(null)
  const [typen, setTypen] = useState([])
  const [versand, setVersand] = useState([])
  const [loading, setLoading] = useState(true)
  const [fehler, setFehler] = useState(null)

  const loadMeldung = useCallback(async () => {
    setLoading(true)
    setFehler(null)
    try {
      const [detail, typRes, versandRes] = await Promise.all([
        api.get(`/api/meldungen/${id}`),
        api.get('/api/meldungstypen'),
        api.get(`/api/meldungen/${id}/xjustiz-versand`),
      ])
      setMeldung(detail.data)
      setTypen(typRes.data || [])
      setVersand(versandRes.data || [])
    } catch (e) {
      setFehler(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadMeldung() }, [loadMeldung])

  async function handleAktion(typ, payload) {
    if (typ === 'status') {
      await api.patch(`/api/meldungen/${id}/status`, payload)
      const neuerStatus = payload.status
      if (neuerStatus === 'ARCHIVED') {
        navigate('/dashboard', {
          state: { erfolgsMeldung: `Meldung ${meldung.meldungsNr} erfolgreich archiviert.` },
        })
      } else {
        await loadMeldung()
      }
      return
    }
    if (typ === 'rueckgabe') {
      await api.patch(`/api/meldungen/${id}/status`, {
        status: 'DRAFT',
        rueckgabeErgaenzung: payload.rueckgabeErgaenzung,
      })
      await loadMeldung()
      return
    }
    if (typ === 'bepo') {
      const res = await api.post(`/api/meldungen/${id}/xjustiz-versand`)
      await loadMeldung()
      return res
    }
    if (typ === 'verakten') {
      await api.post(`/api/meldungen/${id}/verakten`)
      await loadMeldung()
    }
  }

  async function handleUpdate(payload, { anhaengeEintraege = [], entfernen = [], aktualisierungen = [] } = {}) {
    const { alsEntwurf, ...data } = payload
    await api.patch(`/api/meldungen/${id}`, data)
    const headers = buildMockHeaders({ aktiveRolle, aktiverNutzer })
    for (const anhangId of entfernen) {
      await deleteMeldungAnhang(headers, id, anhangId)
    }
    for (const u of aktualisierungen) {
      await updateMeldungAnhang(headers, id, u.id, { beschreibung: u.beschreibung })
    }
    if (anhaengeEintraege.length > 0) {
      await uploadMeldungAnhaenge(headers, id, anhaengeEintraege)
    }
    if (alsEntwurf === false) {
      await api.patch(`/api/meldungen/${id}/status`, { status: 'SUBMITTED', kommentar: 'Eingereicht' })
    }
    navigate(`/meldungen/${id}`)
  }

  const seiten = [
    { label: 'eMeldewesen', href: '/emeldewesen' },
    { label: meldung?.meldungsNr || (editMode ? 'Bearbeiten' : 'Detail') },
  ]

  if (loading) {
    return (
      <PageLayout plattformTitel="eMeldewesen" seiten={seiten}>
        <p className="text-jhh-text-light">Meldung wird geladen …</p>
      </PageLayout>
    )
  }

  if (fehler || !meldung) {
    return (
      <PageLayout plattformTitel="eMeldewesen" seiten={seiten}>
        <p role="alert" className="text-jhh-danger">{fehler || 'Meldung nicht gefunden.'}</p>
        <Link to="/meldungen" className="btn-secondary mt-4 inline-flex">Zurück zur Liste</Link>
      </PageLayout>
    )
  }

  const meldungMitVersand = {
    ...meldung,
    xJustizVersand: versand.length ? versand : meldung.xJustizVersand,
  }

  if (editMode) {
    if (meldung.status !== 'DRAFT') {
      return (
        <PageLayout plattformTitel="eMeldewesen" seiten={seiten}>
          <p className="text-jhh-warning">Nur Entwürfe können bearbeitet werden.</p>
          <Link to={`/meldungen/${id}`} className="btn-secondary mt-4 inline-flex">Zur Detailansicht</Link>
        </PageLayout>
      )
    }
    return (
      <PageLayout plattformTitel="eMeldewesen" seiten={seiten}>
        <ProzessStepperBlock meldung={meldungMitVersand} />
        <h1 className="text-2xl font-bold text-jhh-primary mb-2">{meldung.meldungsNr} bearbeiten</h1>
        {meldung.metadaten?.rueckgabeDgl && (
          <p className="text-sm mb-4 border-l-4 border-jhh-warning pl-3">
            Die Dienstgruppenleitung hat diese Meldung zur Nachbesserung zurückgegeben.
            {meldung.metadaten.rueckgabeDgl.kommentar ? ` ${meldung.metadaten.rueckgabeDgl.kommentar}` : ''}
            {' '}Nach dem erneuten Einreichen bleibt die Meldung im Fall.
          </p>
        )}
        <MeldungForm
          meldungstypen={typen}
          initialValues={meldung}
          onSubmit={handleUpdate}
          onCancel={() => navigate(`/meldungen/${id}`)}
          submitLabel="Entwurf speichern"
        />
      </PageLayout>
    )
  }

  const meta = meldung.metadaten || {}
  const sla = getSlaHinweise(meldung)
  const istEntwurf = meldung.status === 'DRAFT'
  const aufgabeAbgeschlossen = location.state?.aufgabeAbgeschlossen ?? null
  const hatBePo = meldungMitVersand.xJustizVersand?.some(
    v => ['VERSENDET', 'BESTAETIGT'].includes(v.status),
  )
  const hatEgpa = meldung.veraktungen?.some(v => v.status === 'UEBERMITTELT')

  return (
    <PageLayout plattformTitel="eMeldewesen" seiten={seiten}>
      <ProzessStepperBlock meldung={meldungMitVersand} />
      <MeldungFallBanner meldung={meldung} />
      <DetailHeader meldung={meldung} id={id} />

      {aufgabeAbgeschlossen && (
        <AufgabeAbgeschlossenBanner typ={aufgabeAbgeschlossen} meldung={meldungMitVersand} hatBePo={hatBePo} hatEgpa={hatEgpa} />
      )}

      {sla.map((h, i) => (
        <div
          key={i}
          role="alert"
          className="mb-4 p-3 rounded border border-jhh-danger bg-red-50 text-jhh-danger text-sm flex items-center gap-2"
        >
          <span aria-hidden="true">⚠️</span> {h.text}
        </div>
      ))}

      {meta.rueckgabeDgl && (
        <div role="status" className="mb-4 p-4 rounded border border-jhh-warning bg-yellow-50 text-sm">
          <p className="font-semibold text-jhh-warning mb-1">Zurückgegeben durch die Dienstgruppenleitung</p>
          <p className="text-jhh-text m-0">{meta.rueckgabeDgl.kommentar}</p>
        </div>
      )}

      {meta.rueckgabeErgaenzung && (
        <div
          role="alert"
          className="mb-4 p-4 rounded border border-jhh-warning bg-yellow-50 text-sm"
        >
          <p className="font-semibold text-jhh-warning mb-1">
            ↩ Zurückgegeben zur Ergänzungserfassung
            {meta.rueckgabeErgaenzung.grund === 'beweismittel' && ' – Beweismittel nachreichen'}
            {meta.rueckgabeErgaenzung.grund === 'beides' && ' – Zeugen & Beweismittel'}
            {meta.rueckgabeErgaenzung.grund === 'zeugen' && ' – Zeugenaussagen'}
          </p>
          <p className="text-jhh-text mb-1">{meta.rueckgabeErgaenzung.kommentar}</p>
          {(meta.rueckgabeErgaenzung.grund === 'beweismittel' || meta.rueckgabeErgaenzung.grund === 'beides') && (
            <p className="text-jhh-text text-xs mb-1">
              Bitte prüfen Sie erneut, ob Beweismittel vorliegen: bei Ja Anhänge hochladen, bei Nein
              eine Begründung im Formular angeben (z. B. nur Zeugenaussagen).
            </p>
          )}
          {meta.rueckgabeErgaenzung.fristBis && (
            <p className="text-jhh-text-light text-xs">
              Bitte ergänzen und erneut einreichen bis:{' '}
              <span className="font-semibold text-jhh-warning">
                {new Date(meta.rueckgabeErgaenzung.fristBis).toLocaleDateString('de-DE', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                })}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Zweispalten-Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

        {/* Linke Hauptspalte: Stammdaten, Sachverhalt, Zeugen, Aktionen */}
        <div className="lg:col-span-2 space-y-6">
          <section className="section-card">
            <h2 className="text-lg font-bold text-jhh-primary mb-4">Stammdaten</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-jhh-text-light">Gefangene/r</dt>
                <dd className="font-semibold">{formatGefangene(meldung.gefangene)}</dd>
              </div>
              <DetailField label="Empfänger" value={meldung.empfaenger || '–'} />
              {meldung.meldungsTyp === 'STRAFANZEIGE' && (meta.tatvorwurf || meta.strafanzeigeUntertyp) && (
                <DetailField
                  label="Tatvorwurf"
                  value={getStrafanzeigeUntertypLabel(meta.tatvorwurf || meta.strafanzeigeUntertyp)}
                />
              )}
              <DetailField label="Erstellt" value={formatDatum(meldung.erstelltAm)} />
              {meta.tatzeit && <DetailField label="Tatzeit" value={formatTatzeit(meta.tatzeit)} />}
              {meta.tatort && <DetailField label="Tatort" value={meta.tatort} />}
              {meta.fundort && <DetailField label="Zusätzlicher Fundort" value={meta.fundort} rich />}
              {(meta.beweismittelGesichert === 'ja' || meta.beweismittelGesichert === 'nein') && (
                <div>
                  <dt className="text-jhh-text-light">Beweismittel gesichert</dt>
                  <dd className="font-semibold">
                    {meta.beweismittelGesichert === 'ja' ? 'Ja' : 'Nein'}
                    {meta.beweismittelGesichert === 'ja' && meta.beweismittelAngaben && (
                      <RichTextDisplay html={meta.beweismittelAngaben} className="font-normal mt-1" />
                    )}
                    {meta.beweismittelGesichert === 'nein' && meta.beweismittelKeineBegruendung && (
                      <div className="font-normal mt-1">
                        <span className="text-xs text-jhh-text-light block">Begründung (keine Beweismittel):</span>
                        <RichTextDisplay html={meta.beweismittelKeineBegruendung} />
                      </div>
                    )}
                  </dd>
                </div>
              )}
              {meta.aktenzeichen && (
                <div>
                  <dt className="text-jhh-text-light">Aktenzeichen</dt>
                  <dd className="font-semibold font-mono text-sm">{meta.aktenzeichen}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4">
              <dt className="text-jhh-text-light text-sm mb-1">Sachverhalt</dt>
              <dd className="text-sm">
                <RichTextDisplay html={meldung.sachverhalt} />
              </dd>
            </div>
          </section>

          <ZuweisungSection meldung={meldung} onAktualisiert={loadMeldung} />

          {meldung.meldungsTyp === 'STRAFANZEIGE' && (
            <ZeugenAnzeige metadaten={meta} />
          )}

          {meldung.meldungsTyp === 'STRAFANZEIGE' && meldung.status !== 'DRAFT' && (
            <ZeugenFolgeaktionenAnzeige metadaten={meta} meldungId={meldung.id} />
          )}

          {/* ERV-Prozesshinweise direkt über dem Aktionsblock */}
          {hatBePo && !hatEgpa && meldung.ervRelevant && (
            <div className="p-3 rounded bg-blue-50 border border-blue-200 text-sm text-blue-800 flex items-start gap-2">
              <span aria-hidden="true">✅</span>
              <span>beBPo erfolgreich versendet. <strong>Nächster Schritt:</strong> In eGPA verakten.</span>
            </div>
          )}
          {hatBePo && hatEgpa && meldung.status !== 'ARCHIVED' && (
            <div className="p-3 rounded bg-green-50 border border-green-200 text-sm text-jhh-success flex items-start gap-2">
              <span aria-hidden="true">✅</span>
              <span>eGPA-Veraktung dokumentiert. <strong>Nächster Schritt:</strong> Meldung abschließen (Vier-Augen).</span>
            </div>
          )}

          {/* Aktionsblock – ganz unten in der linken Spalte */}
          <MeldungAktionen meldung={meldungMitVersand} onAktualisiert={handleAktion} />
        </div>

        {/* Rechte Seitenleiste */}
        <div className="lg:col-span-1">
          <DetailSeitenleiste
            meldungId={id}
            meldung={meldung}
            versand={meldung.xJustizVersand || []}
            onAktualisiert={handleAktion}
          />

        </div>

      </div>
    </PageLayout>
  )
}

const AUFGABE_TYP_LABEL = {
  [AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG]: 'Fachliche Prüfung',
  [AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN]: 'Zeugenaussage bestätigt',
  [AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN]: 'Zeugenaussage (Inhaftierter) erfasst',
  [AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN]: 'Beweismittel nachreichen',
}

function AufgabeAbgeschlossenBanner({ typ, meldung, hatBePo, hatEgpa }) {
  const { istVAL, istAL } = useRolle()
  const typLabel = AUFGABE_TYP_LABEL[typ] || typ
  let naechsterHinweis = null
  if (typ === AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG && (istVAL || istAL)) {
    if (meldung.ervRelevant) {
      if (!hatBePo) naechsterHinweis = 'Per beBPo versenden.'
      else if (!hatEgpa) naechsterHinweis = 'In eGPA verakten.'
      else naechsterHinweis = 'Meldung abschließen (Vier-Augen).'
    } else if (meldung.status === 'IN_PROGRESS') {
      naechsterHinweis = 'Meldung prüfen und abschließen.'
    }
  }

  return (
    <div
      role="status"
      className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-jhh-success text-sm flex items-start gap-2"
    >
      <span aria-hidden="true" className="mt-0.5 flex-shrink-0">✅</span>
      <span>
        <strong>Aufgabe „{typLabel}" abgeschlossen</strong>
        {naechsterHinweis && (
          <> – <span className="font-medium">Nächster Schritt:</span> {naechsterHinweis}</>
        )}
      </span>
    </div>
  )
}

function ProzessStepperBlock({ meldung }) {
  return (
    <div className="page-bleed-x -mt-5 lg:-mt-6 mb-4">
      <ProzessSchritte meldung={meldung} sticky />
    </div>
  )
}

function DetailHeader({ meldung, id }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-jhh-primary m-0 flex flex-wrap items-center gap-2">
          {meldung.meldungsNr}
          <StatusBadge status={meldung.status} />
          {meldung.ervRelevant && <ERVBadge />}
          {meldung.prioritaet > 0 && (
            <span className="text-sm text-jhh-danger font-bold">Dringend</span>
          )}
        </h1>
        <p className="text-sm text-jhh-text-light mt-1">
          {getMeldungstypLabel(meldung.meldungsTyp)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {meldung.status === 'DRAFT' && (
          <Link to={`/meldungen/${id}/bearbeiten`} className="btn-secondary">
            ✏️ Bearbeiten
          </Link>
        )}
        <a
          href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/meldungen/${id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary text-sm inline-flex items-center gap-1"
          title="PDF herunterladen"
        >
          📄 Druckansicht / PDF
        </a>
      </div>
    </div>
  )
}

function DetailField({ label, value, rich = false }) {
  return (
    <div>
      <dt className="text-jhh-text-light">{label}</dt>
      <dd className={rich ? 'text-sm' : 'font-semibold'}>
        {rich ? <RichTextDisplay html={value} className="font-semibold" /> : value}
      </dd>
    </div>
  )
}
