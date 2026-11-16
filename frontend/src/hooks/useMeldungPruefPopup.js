import { useState, useEffect, useCallback } from 'react'
import { useApiClient } from '../api/client'
import { AUFGABEN_TYPEN } from '../utils/arbeitskorb'

const storageKey = nutzerId => `a2_pruefmitteilung_modal_${nutzerId}`

/**
 * Lädt die Anzahl prüfbereiter Meldungen und steuert ein einmal pro Session
 * anzeigbares Hinweisfenster (Prototyp).
 * Für VAL/AL: nur Meldungen, deren Zeugenaussagen vollständig sind (Arbeitskorb).
 */
export function useMeldungPruefPopup({
  aktiverNutzerId,
  kannMeldungBearbeiten,
  istPruefer = false,
  enabled = true,
}) {
  const api = useApiClient()
  const [anzahlEingereicht, setAnzahlEingereicht] = useState(0)
  const [modalOffen, setModalOffen] = useState(false)

  useEffect(() => {
    if (!enabled || !kannMeldungBearbeiten || !istPruefer || !aktiverNutzerId) {
      setAnzahlEingereicht(0)
      setModalOffen(false)
      return
    }
    let cancelled = false

    const url = istPruefer
      ? '/api/arbeitskorb?status=OFFEN'
      : '/api/meldungen?status=SUBMITTED&limit=100'

    api
      .get(url)
      .then(res => {
        if (cancelled) return
        const n = istPruefer
          ? (res.data || []).filter(a => a.typ === AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG).length
          : (res.data || []).length
        setAnzahlEingereicht(n)
        const key = storageKey(aktiverNutzerId)
        if (n > 0 && !sessionStorage.getItem(key)) setModalOffen(true)
        else setModalOffen(false)
      })
      .catch(() => {
        if (!cancelled) {
          setAnzahlEingereicht(0)
          setModalOffen(false)
        }
      })
    return () => { cancelled = true }
  }, [aktiverNutzerId, kannMeldungBearbeiten, enabled, istPruefer])

  const schliessenModal = useCallback(() => {
    sessionStorage.setItem(storageKey(aktiverNutzerId), '1')
    setModalOffen(false)
  }, [aktiverNutzerId])

  return { anzahlEingereicht, modalOffen, schliessenModal }
}
