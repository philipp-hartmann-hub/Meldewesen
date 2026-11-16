// ============================================================
// api/client.js – HEUREKA 2.0 | A2 | NICHT VERÄNDERN
// Zentraler Fetch-Client – überträgt Rolle via X-Mock-* Header
// ============================================================

import { useRolle } from '../context/RollenContext'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function useApiClient() {
  const { aktiverNutzer, aktiveRolle } = useRolle()

  async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        // Kanonische Rollennamen (lowercase) an Backend
        'X-Mock-Rolle':     aktiveRolle,
        'X-Mock-Nutzer-ID': aktiverNutzer.id,
        'X-Mock-JVA':       aktiverNutzer.jva || '',
        'X-Mock-Abteilung': aktiverNutzer.abteilung || '',
        'X-Mock-Station':   aktiverNutzer.station == null ? '' : String(aktiverNutzer.station),
        ...options.headers,
      },
      ...options,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `API Fehler ${res.status}` }))
      throw new Error(err.message || `API Fehler: ${res.status}`)
    }

    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/pdf')) return res.blob()
    return res.json()
  }

  return {
    get:    path         => apiFetch(path),
    post:   (path, data) => apiFetch(path, { method: 'POST',  body: JSON.stringify(data) }),
    put:    (path, data) => apiFetch(path, { method: 'PUT',   body: JSON.stringify(data) }),
    patch:  (path, data) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: path         => apiFetch(path, { method: 'DELETE' }),
  }
}
