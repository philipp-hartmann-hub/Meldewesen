import { useLocation } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import ArbeitskorbPanel from '../components/emeldewesen/ArbeitskorbPanel'

const FACH = { label: 'eMeldewesen', href: '/emeldewesen' }

export default function Arbeitskorb() {
  const location = useLocation()
  const { erfolgsMeldung } = location.state || {}

  return (
    <PageLayout
      plattformTitel="eMeldewesen"
      fachverfahren={FACH}
      seiten={[{ label: 'Mein Arbeitskorb' }]}
    >
      {erfolgsMeldung && (
        <div
          role="status"
          className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-jhh-success text-sm flex items-start gap-2"
        >
          <span aria-hidden="true" className="mt-0.5 flex-shrink-0">✅</span>
          <span>{erfolgsMeldung}</span>
        </div>
      )}
      <ArbeitskorbPanel />
    </PageLayout>
  )
}
