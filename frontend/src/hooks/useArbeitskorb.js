import { useCallback, useEffect, useRef, useState } from 'react'
import { useApiClient } from '../api/client'
import { useRolle } from '../context/RollenContext'

/**
 * Arbeitskorb – Aufgabenliste laden und aktualisieren.
 */
export function useArbeitskorb({ status, bereich, enabled = true } = {}) {
  const api = useApiClient()
  const apiRef = useRef(api)
  apiRef.current = api

  const { aktiverNutzer } = useRolle()
  const nutzerId = aktiverNutzer.id

  const [aufgaben, setAufgaben] = useState([])
  const [offen, setOffen] = useState(0)
  const [offenPersoenlich, setOffenPersoenlich] = useState(0)
  const [offenGruppe, setOffenGruppe] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fehler, setFehler] = useState(null)

  const statusKey = status || ''
  const bereichKey = bereich || ''
  const fetchKey = `${nutzerId}|${statusKey}|${bereichKey}|${enabled !== false}`
  const prevFetchKeyRef = useRef('')

  async function fetchAufgaben() {
    const params = new URLSearchParams()
    if (statusKey) params.set('status', statusKey)
    if (bereichKey) params.set('bereich', bereichKey)
    const q = params.toString() ? `?${params.toString()}` : ''
    const res = await apiRef.current.get(`/api/arbeitskorb${q}`)
    setAufgaben(res.data || [])
    setOffen(res.offen ?? (res.data || []).filter(a => a.status === 'OFFEN').length)
    setOffenPersoenlich(res.offenPersoenlich ?? 0)
    setOffenGruppe(res.offenGruppe ?? 0)
  }

  useEffect(() => {
    if (!enabled) {
      setAufgaben([])
      setOffen(0)
      setOffenPersoenlich(0)
      setOffenGruppe(0)
      setLoading(false)
      return undefined
    }

    const kontextWechsel = prevFetchKeyRef.current !== fetchKey
    prevFetchKeyRef.current = fetchKey

    let cancelled = false
    if (kontextWechsel) setLoading(true)
    setFehler(null)

    fetchAufgaben()
      .catch(e => {
        if (cancelled) return
        setFehler(e.message || 'Aufgaben konnten nicht geladen werden.')
        setAufgaben([])
        setOffen(0)
        setOffenPersoenlich(0)
        setOffenGruppe(0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [fetchKey])

  const neuLaden = useCallback(async () => {
    if (!enabled) return
    setFehler(null)
    try {
      await fetchAufgaben()
    } catch (e) {
      setFehler(e.message || 'Aufgaben konnten nicht geladen werden.')
    }
  }, [enabled, statusKey, bereichKey])

  return {
    aufgaben,
    offen,
    offenPersoenlich,
    offenGruppe,
    loading,
    fehler,
    neuLaden,
  }
}
