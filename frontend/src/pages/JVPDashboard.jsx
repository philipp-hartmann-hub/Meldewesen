// JVPDashboard.jsx – HEUREKA 2.0 | A2
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRolle } from '../context/RollenContext'
import PageLayout from '../components/layout/PageLayout'
import MeldungPruefHinweisModal from '../components/meldung/MeldungPruefHinweisModal'
import { useApiClient } from '../api/client'
import { useMeldungPruefPopup } from '../hooks/useMeldungPruefPopup'
import { useArbeitskorb } from '../hooks/useArbeitskorb'
import { istDringendOderUeberfaellig, istErvOffen } from '../utils/meldungen'
import { zaehleNeueAufgaben } from '../utils/arbeitskorbGelesen'

const A1_URL = import.meta.env.VITE_A1_URL || '#'

const JVP_FACHVERFAHREN = [
  {
    id: 'meldungen',
    titel: 'eMeldewesen',
    beschreibung: 'Digitales Meldewesen: Strafanzeigen, interne Vorfälle und externe Berichte.',
    icon: '📨',
    url: '/emeldewesen',
    aktiv: true,
  },
  {
    id: 'antraege',
    titel: 'eGefangenenanträge',
    beschreibung: 'Anträge, Bearbeitungen und Freigaben im Antragswesen.',
    icon: '📋',
    url: A1_URL,
    aktiv: false,
  },
  {
    id: 'statistik',
    titel: 'Statistik & Auswertungen',
    beschreibung: 'Übergreifende Berichte und Kennzahlen.',
    icon: '📈',
    url: '#',
    aktiv: false,
  },
  {
    id: 'urlaub',
    titel: 'Urlaubsanträge (Bedienstete)',
    beschreibung: 'Digitale Beantragung und Genehmigung von Urlaub.',
    icon: '🏖️',
    url: '#',
    aktiv: false,
  },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Guten Morgen'
  if (h < 18) return 'Guten Tag'
  return 'Guten Abend'
}

export default function JVPDashboard() {
  const location = useLocation()
  const { erfolgsMeldung } = location.state || {}
  const { aktiverNutzer, rolleLabel, kannMeldungBearbeiten, istVAL, istAL } = useRolle()
  const api = useApiClient()
  const istPruefer = istVAL || istAL
  const { anzahlEingereicht, modalOffen, schliessenModal } = useMeldungPruefPopup({
    aktiverNutzerId: aktiverNutzer.id,
    kannMeldungBearbeiten,
    istPruefer,
  })
  const { offen: arbeitskorbOffen, aufgaben: arbeitskorbAufgaben } = useArbeitskorb({ status: 'OFFEN' })
  const arbeitskorbNeu = zaehleNeueAufgaben(arbeitskorbAufgaben, aktiverNutzer.id)
  const [stats, setStats] = useState({
    alle: 0, meldungen: 0, erv: 0, urgent: 0, meine: 0, gruppe: 0,
    stationAufgaben: 0, gruppeUnzugewiesen: 0, teamUeberfaellig: 0,
  })
  const [postfachOffen, setPostfachOffen] = useState(true)

  useEffect(() => {
    let cancelled = false
    const meldungenPromise = api.get('/api/meldungen?limit=100')
    const teamPromise = istPruefer
      ? api.get('/api/disposition/team-uebersicht')
      : Promise.resolve(null)

    Promise.all([meldungenPromise, teamPromise])
      .then(([meldRes, teamRes]) => {
        if (cancelled) return
        const list = meldRes.data || []
        const inFachlicherPruefung = list.filter(m => m.status === 'IN_PROGRESS')
        const teamKpis = teamRes?.data?.kpis
        setStats({
          alle: list.length,
          meldungen: inFachlicherPruefung.length,
          erv: list.filter(m => istErvOffen(m)).length,
          urgent: list.filter(m => istDringendOderUeberfaellig(m)).length,
          meine: list.filter(m => m.metadaten?.zugewiesenAn === aktiverNutzer.id).length,
          gruppe: list.filter(m =>
            ['SUBMITTED', 'IN_PROGRESS'].includes(m.status) && !m.metadaten?.zugewiesenAn,
          ).length,
          stationAufgaben: teamKpis?.stationAufgabenOffen ?? 0,
          gruppeUnzugewiesen: teamKpis?.gruppeUnzugewiesen ?? 0,
          teamUeberfaellig: teamKpis?.ueberfaellig ?? 0,
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [aktiverNutzer.id, istPruefer])

  return (
    <>
    <PageLayout plattformTitel="" fachverfahren={null}>
      {erfolgsMeldung && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-jhh-success flex items-start gap-3">
          <span className="text-xl" aria-hidden="true">✅</span>
          <div>
            <p className="font-bold">{erfolgsMeldung}</p>
            <p className="text-sm mt-1 text-jhh-success/80">
              Ihre nächsten offenen Aufgaben finden Sie unten.
            </p>
          </div>
        </div>
      )}
      <section
        className="rounded px-4 sm:px-6 lg:px-8 py-5 lg:py-6 mb-6 lg:mb-7 flex flex-wrap items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #003d7a 0%, var(--jhh-primary) 50%, var(--hamburg-tuerkis) 100%)',
          color: '#fff',
        }}
      >
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Willkommen zurück
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">
            {getGreeting()}, {aktiverNutzer.name}!
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Angemeldet als <strong className="text-white">{rolleLabel}</strong>
            {aktiverNutzer.jva ? ` · ${aktiverNutzer.jva}` : ''}
          </p>
        </div>
        <div className="text-right">
          <div className="text-white text-base font-bold">
            {new Date().toLocaleDateString('de-DE', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Hamburgischer Justizvollzug
          </div>
        </div>
      </section>

      <div
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 lg:mb-7"
        aria-label="Kennzahlenübersicht"
      >
        <Link to="/arbeitskorb" className="stat-card border-jhh-secondary hover:-translate-y-px transition-transform block relative">
          <div className="stat-value" style={{ color: 'var(--jhh-secondary)' }}>{arbeitskorbOffen}</div>
          <div className="stat-label">Mein Arbeitskorb</div>
          {arbeitskorbNeu > 0 && (
            <span
              className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--jhh-accent)' }}
            >
              {arbeitskorbNeu} neu
            </span>
          )}
        </Link>
        <Link
          to={istPruefer ? '/emeldewesen?bereich=team' : '/meldungen?sichtbereich=gruppe'}
          className="stat-card border-jhh-primary hover:-translate-y-px transition-transform block"
        >
          <div className="stat-value">{istPruefer ? stats.stationAufgaben : stats.gruppe}</div>
          <div className="stat-label">{istPruefer ? 'Team-Übersicht' : 'Eingereichte Meldungen'}</div>
        </Link>
        <Link
          to={istPruefer ? '/emeldewesen?bereich=team&filter=gruppeUnzugewiesen' : '/meldungen?sichtbereich=meine'}
          className="stat-card border-jhh-primary hover:-translate-y-px transition-transform block"
        >
          <div className="stat-value">{istPruefer ? stats.gruppeUnzugewiesen : stats.meine}</div>
          <div className="stat-label">{istPruefer ? 'Gruppe unzugewiesen' : 'Meine Aufgaben'}</div>
        </Link>
        <Link to="/meldungen?ervRelevant=offen" className="stat-card block" style={{ borderLeftColor: 'var(--jhh-secondary)' }}>
          <div className="stat-value" style={{ color: 'var(--jhh-secondary)' }}>{stats.erv}</div>
          <div className="stat-label">ERV-pflichtig &amp; offen</div>
        </Link>
        <Link
          to={istPruefer ? '/emeldewesen?bereich=team&filter=ueberfaellig' : '/meldungen?dringend=1'}
          className="stat-card block"
          style={{ borderLeftColor: 'var(--jhh-danger)' }}
        >
          <div className="stat-value" style={{ color: 'var(--jhh-danger)' }}>
            {istPruefer ? stats.teamUeberfaellig : stats.urgent}
          </div>
          <div className="stat-label">Überfällig / dringend</div>
        </Link>
      </div>

      <h2 className="text-base font-bold text-jhh-primary mb-4 flex items-center gap-2">
        <span
          className="w-7 h-7 rounded flex items-center justify-center text-sm"
          style={{ background: 'rgba(0,48,99,0.1)' }}
          aria-hidden="true"
        >🗂️</span>
        Fachverfahren
      </h2>

      <div
        className="gap-4"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))' }}
        role="list"
      >
        {JVP_FACHVERFAHREN.map(fv => (
          <Kachel key={fv.id} fv={fv} offenCount={fv.id === 'meldungen' ? arbeitskorbOffen : null} />
        ))}
      </div>

      <section className="mt-6 lg:mt-7 card p-0 overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-jhh-bg transition-colors"
          onClick={() => setPostfachOffen(v => !v)}
          aria-expanded={postfachOffen}
        >
          <span className="flex items-center gap-2 font-bold text-jhh-primary text-base">
            <span aria-hidden="true">📬</span>
            Postfach &amp; Hinweise
            {(stats.urgent > 0 || stats.erv > 0) && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: 'var(--jhh-danger)' }}
              >
                {stats.urgent + stats.erv}
              </span>
            )}
          </span>
          <span className="text-jhh-text-light text-sm">{postfachOffen ? '▲' : '▼'}</span>
        </button>

        {postfachOffen && (
          <div className="border-t border-jhh-border divide-y divide-jhh-border">
            {stats.urgent === 0 && stats.erv === 0 ? (
              <p className="px-5 py-4 text-sm text-jhh-text-light">Keine offenen Systemhinweise.</p>
            ) : (
              <>
                {stats.urgent > 0 && (
                  <Link
                    to="/meldungen?dringend=1"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-jhh-bg transition-colors group"
                  >
                    <span className="text-base" aria-hidden="true">⚠️</span>
                    <span className="flex-1 text-sm">
                      <span className="font-semibold text-jhh-danger">{stats.urgent} {stats.urgent === 1 ? 'Meldung überfällig' : 'Meldungen überfällig'}</span>
                      <span className="block text-jhh-text-light text-xs">SLA-Frist überschritten – sofortige Bearbeitung erforderlich</span>
                    </span>
                    <span className="text-jhh-secondary text-xs font-medium group-hover:underline">→ Anzeigen</span>
                  </Link>
                )}
                {stats.erv > 0 && (
                  <Link
                    to="/meldungen?ervRelevant=offen"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-jhh-bg transition-colors group"
                  >
                    <span className="text-base" aria-hidden="true">📮</span>
                    <span className="flex-1 text-sm">
                      <span className="font-semibold text-jhh-primary">{stats.erv} {stats.erv === 1 ? 'Meldung wartet' : 'Meldungen warten'} auf beBPo-/eGPA-Versand</span>
                      <span className="block text-jhh-text-light text-xs">ERV-pflichtige Meldungen ohne abgeschlossenen Versand</span>
                    </span>
                    <span className="text-jhh-secondary text-xs font-medium group-hover:underline">→ Anzeigen</span>
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </PageLayout>
    <MeldungPruefHinweisModal
      anzahlEingereicht={anzahlEingereicht}
      offen={modalOffen}
      onSchliessen={schliessenModal}
      linkEingereichtFilter={istPruefer ? '/arbeitskorb?status=OFFEN' : '/meldungen?status=SUBMITTED'}
    />
    </>
  )
}

function Kachel({ fv, offenCount }) {
  const isDisabled = !fv.aktiv

  const inner = (
    <>
      {offenCount !== null && !isDisabled && offenCount > 0 && (
        <span
          className="absolute top-2.5 right-2.5 text-white text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--jhh-danger)' }}
        >
          {offenCount}
        </span>
      )}
      {isDisabled && (
        <span
          className="absolute top-2.5 right-2.5 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--jhh-inactive)', color: '#fff' }}
        >
          Demnächst
        </span>
      )}
      <div
        className="w-10 h-10 rounded flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: isDisabled ? 'rgba(80,90,100,0.12)' : 'rgba(0,92,169,0.12)' }}
        aria-hidden="true"
      >
        {fv.icon}
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <div className="font-bold text-sm leading-snug" style={{ color: isDisabled ? '#5a6169' : 'var(--jhh-primary)' }}>
          {fv.titel}
        </div>
        <div className="text-xs leading-relaxed flex-1" style={{ color: isDisabled ? '#6f7780' : 'var(--jhh-text-light)' }}>
          {fv.beschreibung}
        </div>
        {!isDisabled && (
          <div
            className="flex items-center justify-between pt-2 mt-1 text-xs border-t"
            style={{ borderColor: 'var(--jhh-border)', color: 'var(--jhh-secondary)' }}
          >
            {offenCount !== null ? (
              <span className="font-bold">
                {offenCount} offene {offenCount === 1 ? 'Aufgabe' : 'Aufgaben'}
              </span>
            ) : <span />}
            <span className="font-medium">→</span>
          </div>
        )}
      </div>
    </>
  )

  if (isDisabled) {
    return (
      <div className="jvp-kachel jvp-kachel-disabled relative" aria-disabled="true" role="listitem">
        {inner}
      </div>
    )
  }

  return (
    <Link to={fv.url} className="jvp-kachel relative" role="listitem">
      {inner}
    </Link>
  )
}
