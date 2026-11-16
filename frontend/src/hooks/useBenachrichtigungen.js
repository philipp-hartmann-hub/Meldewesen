import { useCallback, useEffect, useRef, useState } from 'react'
import { useApiClient } from '../api/client'

const POLL_MS = 30_000

export function useBenachrichtigungen({ aktiv = true } = {}) {
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api

  const [daten, setDaten] = useState({ data: [], ungelesen: 0 })
  const [loading, setLoading] = useState(false)

  const laden = useCallback(async () => {
    if (!aktiv) return
    setLoading(true)
    try {
      const res = await apiRef.current.get('/api/benachrichtigungen?limit=10')
      setDaten({
        data: res.data || [],
        ungelesen: res.ungelesen ?? 0,
      })
    } catch {
      /* stiller Fehler – Glocke optional */
    } finally {
      setLoading(false)
    }
  }, [aktiv])

  useEffect(() => {
    laden()
    if (!aktiv) return undefined
    const id = setInterval(laden, POLL_MS)
    return () => clearInterval(id)
  }, [laden, aktiv])

  const alsGelesenMarkieren = useCallback(async () => {
    try {
      await apiRef.current.patch('/api/benachrichtigungen/gelesen', {})
      setDaten(prev => ({
        data: prev.data.map(n => ({ ...n, gelesen: true })),
        ungelesen: 0,
      }))
    } catch {
      /* ignore */
    }
  }, [])

  return { ...daten, loading, laden, alsGelesenMarkieren }
}
