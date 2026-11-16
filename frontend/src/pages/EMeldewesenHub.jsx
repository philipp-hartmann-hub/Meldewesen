import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import ArbeitskorbPanel from '../components/emeldewesen/ArbeitskorbPanel'
import MeldungNeuPanel from '../components/emeldewesen/MeldungNeuPanel'
import MeldungenListe from './MeldungenListe'
import TeamUebersichtPanel from '../components/emeldewesen/TeamUebersichtPanel'
import FallBuendelungPanel from '../components/emeldewesen/FallBuendelungPanel'
import { useArbeitskorb } from '../hooks/useArbeitskorb'
import { useApiClient } from '../api/client'
import { useRolle } from '../context/RollenContext'

function basisBereiche(istLeitung) {
  return [
    {
      id: 'arbeitskorb',
      titel: 'Mein Arbeitskorb',
      icon: '📥',
      beschreibung: istLeitung
        ? 'Persönliche und Gruppenaufgaben, z. B. Zeugenaussagen oder fachliche Prüfung (VAL).'
        : 'Persönliche und Gruppenaufgaben, z. B. Zeugenaussagen oder Beweismittel-Nachreichung.',
    },
    {
      id: 'neu',
      titel: 'Neue Meldung',
      icon: '➕',
      beschreibung: 'Strafanzeige, interner Vorfall oder externe Meldung an Gerichte erfassen.',
    },
    {
      id: 'liste',
      titel: 'Alle Meldungen',
      icon: '📋',
      beschreibung: 'Übersicht aller Meldungen in Ihrem Sichtbereich mit Filtern und Status.',
    },
  ]
}

const TEAM_BEREICH = {
  id: 'team',
  titel: 'Team-Übersicht',
  icon: '👥',
  beschreibung: 'Disposition über Stationstasks: Zeugenaussagen zuweisen und Ergänzungs-Meldungen steuern.',
}

function faelleBereich(istArbeitskoordination, istDienstgruppenleitung, istStationsleitung, istAL, istVAL) {
  if (istArbeitskoordination) {
    return {
      id: 'faelle',
      titel: 'Fall-Bündelung',
      icon: '📦',
      beschreibung: 'Einzelmeldungen zum gleichen Vorfall bündeln und an die Dienstgruppenleitung weiterleiten.',
    }
  }
  if (istDienstgruppenleitung) {
    return {
      id: 'faelle',
      titel: 'Fall-Prüfung',
      icon: '🔍',
      beschreibung: 'Gebündelte Fälle prüfen, zurückgeben oder an die Stationsleitung weiterleiten.',
    }
  }
  if (istStationsleitung) {
    return {
      id: 'faelle',
      titel: 'Fallmeldungen',
      icon: '🏠',
      beschreibung: 'Gebündelte Fallmeldungen an AL/VAL zur Meldepflicht-Entscheidung weiterleiten.',
    }
  }
  if (istAL || istVAL) {
    return {
      id: 'faelle',
      titel: 'Fälle & ERV',
      icon: '⚖️',
      beschreibung: 'Meldepflicht entscheiden sowie versandfähig, beBPo und eGPA am Fall bearbeiten.',
    }
  }
  return null
}

function BereichKopf({ bereich, offen, onToggle, badge }) {
  const panelId = `bereich-panel-${bereich.id}`
  return (
    <button
      type="button"
      id={`bereich-kopf-${bereich.id}`}
      className="flex w-full items-center gap-3 text-left bg-transparent border-0 p-0 cursor-pointer min-h-[44px]"
      onClick={onToggle}
      aria-expanded={offen}
      aria-controls={panelId}
    >
      <span
        className="w-10 h-10 rounded flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: 'rgba(0,92,169,0.12)' }}
        aria-hidden="true"
      >
        {bereich.icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-bold text-base text-jhh-primary">{bereich.titel}</span>
        {!offen && (
          <span className="block text-sm xl:text-base text-jhh-text-light mt-0.5">{bereich.beschreibung}</span>
        )}
      </span>
      {badge}
      <span className="text-jhh-secondary font-medium flex-shrink-0" aria-hidden="true">
        {offen ? '▲' : '▼'}
      </span>
    </button>
  )
}

export default function EMeldewesenHub() {
  const [searchParams] = useSearchParams()
  const { istVAL, istAL, istArbeitskoordination, istDienstgruppenleitung, istStationsleitung } = useRolle()
  const istLeitung = istVAL || istAL
  const faellePanel = faelleBereich(istArbeitskoordination, istDienstgruppenleitung, istStationsleitung, istAL, istVAL)
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api

  const { offen: arbeitskorbOffen } = useArbeitskorb({ status: 'OFFEN' })
  const [teamOffen, setTeamOffen] = useState(0)
  const [offenIds, setOffenIds] = useState(() => {
    const initial = new Set()
    const bereich = searchParams.get('bereich')
    if (bereich && ['arbeitskorb', 'neu', 'liste', 'team', 'faelle'].includes(bereich)) {
      initial.add(bereich)
    }
    return initial
  })
  const [neuFormKey, setNeuFormKey] = useState(0)

  const bereiche = [
    ...(faellePanel ? [faellePanel] : []),
    ...(istLeitung ? [...basisBereiche(true), TEAM_BEREICH] : basisBereiche(false)),
  ]

  useEffect(() => {
    if (!istLeitung) return
    let cancelled = false
    apiRef.current.get('/api/disposition/team-uebersicht')
      .then(res => {
        if (!cancelled) {
          const k = res.data?.kpis
          setTeamOffen((k?.gruppeUnzugewiesen || 0) + (k?.beweismittelOffen || 0) + (k?.ergaenzungOffen || 0))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [istLeitung])

  function toggleBereich(id) {
    setOffenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function bereichBadge(id) {
    if (id === 'arbeitskorb' && arbeitskorbOffen > 0) {
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: 'var(--jhh-warning)' }}>
          {arbeitskorbOffen} offen
        </span>
      )
    }
    if (id === 'team' && teamOffen > 0) {
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: 'var(--jhh-secondary)' }}>
          {teamOffen} offen
        </span>
      )
    }
    return null
  }

  function renderBereichInhalt(id) {
    switch (id) {
      case 'arbeitskorb':
        return <ArbeitskorbPanel embedded />
      case 'neu':
        return (
          <MeldungNeuPanel
            key={neuFormKey}
            embedded
            onCancel={() => {
              setNeuFormKey(k => k + 1)
              setOffenIds(prev => {
                const next = new Set(prev)
                next.delete('neu')
                return next
              })
            }}
          />
        )
      case 'liste':
        return <MeldungenListe embedded />
      case 'team': {
        const filter = searchParams.get('filter')
        return <TeamUebersichtPanel embedded initialFilter={filter || 'alle'} />
      }
      case 'faelle':
        return <FallBuendelungPanel embedded />
      default:
        return null
    }
  }

  return (
    <PageLayout
      plattformTitel="eMeldewesen"
      fachverfahren={{ label: 'eMeldewesen' }}
      seiten={[]}
    >
      <div className="mb-6">
        <Link to="/dashboard" className="text-sm text-jhh-secondary font-semibold hover:underline">
          ← Zurück zum Dashboard
        </Link>
      </div>

      <header className="mb-8 w-full">
        <h1 className="text-2xl xl:text-3xl font-bold text-jhh-primary m-0 mb-2">eMeldewesen</h1>
        <p className="text-base text-jhh-text-light m-0 max-w-3xl">
          Klappen Sie einen Bereich auf – Sie finden dieselbe Funktion wie auf der jeweiligen Einzelseite.
        </p>
      </header>

      <div className="space-y-4 w-full" role="presentation">
        {bereiche.map(bereich => {
          const offen = offenIds.has(bereich.id)
          const panelId = `bereich-panel-${bereich.id}`
          return (
            <section
              key={bereich.id}
              className={`section-card ${offen ? 'border-jhh-secondary' : ''}`}
              aria-labelledby={`bereich-kopf-${bereich.id}`}
            >
              <BereichKopf
                bereich={bereich}
                offen={offen}
                onToggle={() => toggleBereich(bereich.id)}
                badge={bereichBadge(bereich.id)}
              />

              {offen && (
                <div
                  id={panelId}
                  role="region"
                  aria-label={bereich.titel}
                  className="mt-4 pt-4 border-t border-jhh-border"
                >
                  {renderBereichInhalt(bereich.id)}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </PageLayout>
  )
}
