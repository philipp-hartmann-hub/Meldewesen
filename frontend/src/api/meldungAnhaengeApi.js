/**
 * Datei-Uploads für Meldungen (FormData) – getrennt von client.js (.cursorrules).
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function buildMockHeaders({ aktiveRolle, aktiverNutzer }) {
  return {
    'X-Mock-Rolle': aktiveRolle,
    'X-Mock-Nutzer-ID': aktiverNutzer.id,
    'X-Mock-JVA': aktiverNutzer.jva || '',
    'X-Mock-Haus': aktiverNutzer.haus || '',
    'X-Mock-Station': aktiverNutzer.station || '',
  }
}

/**
 * Mehrere Dateien mit Kurzbeschreibung (Feld „dateien“, „beschreibungen“ als JSON-Array).
 * @param {{ file: File, beschreibung: string }[]} eintraege
 */
export async function uploadMeldungAnhaenge(headers, meldungId, eintraege) {
  if (!eintraege?.length) return { data: [] }
  const fd = new FormData()
  const beschreibungen = []
  for (const e of eintraege) {
    fd.append('dateien', e.file)
    beschreibungen.push((e.beschreibung || '').trim())
  }
  fd.append('beschreibungen', JSON.stringify(beschreibungen))
  const res = await fetch(`${BASE_URL}/api/meldungen/${meldungId}/anhaenge`, {
    method: 'POST',
    headers: { ...headers },
    body: fd,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || `Upload fehlgeschlagen (${res.status})`)
  return body
}

export async function updateMeldungAnhang(headers, meldungId, anhangId, { beschreibung }) {
  const res = await fetch(
    `${BASE_URL}/api/meldungen/${meldungId}/anhaenge/${anhangId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ beschreibung }),
    },
  )
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || `Anhang konnte nicht aktualisiert werden (${res.status})`)
  return body
}

export async function deleteMeldungAnhang(headers, meldungId, anhangId) {
  const res = await fetch(
    `${BASE_URL}/api/meldungen/${meldungId}/anhaenge/${anhangId}`,
    { method: 'DELETE', headers: { ...headers } },
  )
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || `Anhang konnte nicht entfernt werden (${res.status})`)
  return body
}

export async function downloadMeldungAnhangBlob(headers, meldungId, anhangId) {
  const res = await fetch(
    `${BASE_URL}/api/meldungen/${meldungId}/anhaenge/${anhangId}/file`,
    { headers: { ...headers } },
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Download fehlgeschlagen (${res.status})`)
  }
  const cd = res.headers.get('content-disposition') || ''
  const m = cd.match(/filename\*=UTF-8''([^;]+)/i)
  const dateiname = m ? decodeURIComponent(m[1]) : 'download'
  const blob = await res.blob()
  return { blob, dateiname }
}
