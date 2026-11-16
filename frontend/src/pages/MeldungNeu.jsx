import PageLayout from '../components/layout/PageLayout'
import MeldungNeuPanel from '../components/emeldewesen/MeldungNeuPanel'

const FACH = { label: 'eMeldewesen', href: '/emeldewesen' }

export default function MeldungNeu() {
  return (
    <PageLayout
      plattformTitel="eMeldewesen"
      fachverfahren={FACH}
      seiten={[
        { label: 'Alle Meldungen', href: '/meldungen' },
        { label: 'Neue Meldung' },
      ]}
    >
      <MeldungNeuPanel />
    </PageLayout>
  )
}
