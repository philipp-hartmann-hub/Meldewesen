import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MeldungForm from '../meldung/MeldungForm'
import { useApiClient } from '../../api/client'
import { buildMockHeaders, uploadMeldungAnhaenge } from '../../api/meldungAnhaengeApi'
import { useRolle } from '../../context/RollenContext'

/**
 * Vollständiges Formular „Neue Meldung“ – standalone oder eingebettet im eMeldewesen-Hub.
 */
export default function MeldungNeuPanel({ embedded = false, onCancel }) {
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api
  const { aktiveRolle, aktiverNutzer, istAVD, istStationsleitung } = useRolle()
  const navigate = useNavigate()
  const [typen, setTypen] = useState([])

  useEffect(() => {
    apiRef.current.get('/api/meldungstypen').then(r => setTypen(r.data || [])).catch(() => {})
  }, [])

  async function handleSubmit(payload, { anhaengeEintraege = [] } = {}) {
    const headers = buildMockHeaders({ aktiveRolle, aktiverNutzer })
    let res
    if (anhaengeEintraege.length > 0 && payload.alsEntwurf === false) {
      res = await apiRef.current.post('/api/meldungen', { ...payload, alsEntwurf: true })
      await uploadMeldungAnhaenge(headers, res.data.id, anhaengeEintraege)
      await apiRef.current.patch(`/api/meldungen/${res.data.id}/status`, { status: 'SUBMITTED', kommentar: 'Eingereicht' })
    } else {
      res = await apiRef.current.post('/api/meldungen', payload)
      if (anhaengeEintraege.length > 0) {
        await uploadMeldungAnhaenge(headers, res.data.id, anhaengeEintraege)
      }
    }

    const meldungsNr = res.data?.meldungsNr || res.data?.id
    if (payload.alsEntwurf === false && (istAVD || istStationsleitung)) {
      navigate('/dashboard', {
        state: { erfolgsMeldung: `Meldung ${meldungsNr} wurde erfolgreich eingereicht.` },
      })
    } else {
      navigate(`/meldungen/${res.data.id}`)
    }
  }

  function handleCancel() {
    if (onCancel) {
      onCancel()
    } else {
      navigate('/meldungen')
    }
  }

  return (
    <>
      {!embedded && (
        <h1 className="text-2xl font-bold text-jhh-primary mb-6">Neue Meldung</h1>
      )}
      <MeldungForm
        meldungstypen={typen}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        fullWidth={embedded}
      />
    </>
  )
}
