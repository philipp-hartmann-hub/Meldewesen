import { useState } from 'react'
import { useApiClient } from '../../api/client'
import { useRolle } from '../../context/RollenContext'
import { buildMockHeaders, uploadMeldungAnhaenge } from '../../api/meldungAnhaengeApi'
import MeldungAnhaengeListe from './MeldungAnhaengeListe'
import StatusVerlaufListe from './StatusVerlaufListe'
import { ERVBadge } from '../shared/StatusBadge'
import { formatDatum } from '../../utils/meldungen'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function DetailSeitenleiste({
  meldungId,
  meldung,
  versand = [],
  onAktualisiert,
}) {
  const api = useApiClient()
  const { aktiveRolle, aktiverNutzer } = useRolle()
  const [notizText, setNotizText] = useState('')
  const [notizen, setNotizen] = useState(meldung?.notizen || [])
  const [speichert, setSpeichert] = useState(false)
  const [uploadLaeuft, setUploadLaeuft] = useState(false)
  const [uploadFehler, setUploadFehler] = useState(null)

  async function handleNotizHinzufuegen() {
    if (!notizText.trim()) return
    setSpeichert(true)
    try {
      const res = await api.post(`/api/meldungen/${meldungId}/notizen`, { text: notizText })
      setNotizen(prev => [...prev, res.data])
      setNotizText('')
    } catch (e) {
      alert(e.message || 'Notiz konnte nicht gespeichert werden.')
    } finally {
      setSpeichert(false)
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadFehler(null)
    setUploadLaeuft(true)
    try {
      const headers = buildMockHeaders({ aktiveRolle, aktiverNutzer })
      await uploadMeldungAnhaenge(headers, meldungId, [{ file, beschreibung: '' }])
      onAktualisiert?.()
    } catch (err) {
      setUploadFehler(err.message || 'Upload fehlgeschlagen.')
    } finally {
      setUploadLaeuft(false)
    }
  }

  return (
    <aside className="space-y-6">

      {/* DOKUMENTE */}
      <section className="section-card">
        <h3 className="text-sm font-bold text-jhh-primary mb-3">Dokumente</h3>
        {meldung?.status === 'DRAFT' ? (
          <>
            <button
              type="button"
              className="btn-secondary w-full text-sm mb-3"
              disabled={uploadLaeuft}
              onClick={() => document.getElementById(`upload-sidebar-${meldungId}`)?.click()}
            >
              {uploadLaeuft ? 'Wird hochgeladen …' : '+ Datei hochladen'}
            </button>
            <input
              id={`upload-sidebar-${meldungId}`}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
              className="hidden"
              onChange={handleUpload}
            />
            {uploadFehler && (
              <p className="text-xs text-jhh-danger mb-2" role="alert">{uploadFehler}</p>
            )}
          </>
        ) : (
          <p className="text-xs text-jhh-text-light mb-3">
            Anhänge können nur im Status Entwurf ergänzt werden.
          </p>
        )}
        {(meldung?.anhaenge || []).length === 0 ? (
          <p className="text-xs text-jhh-text-light italic">Noch keine Dokumente.</p>
        ) : (
          <MeldungAnhaengeListe meldungId={meldungId} anhaenge={meldung.anhaenge} />
        )}
      </section>

      {/* ERV-STATUS (nur bei ERV-relevanten Meldungen) */}
      {meldung?.ervRelevant && (
        <section className="section-card">
          <h3 className="text-sm font-bold text-jhh-primary mb-3 flex items-center gap-2">
            <ERVBadge /> ERV-Status
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-jhh-text-light uppercase tracking-wide mb-1">
                beBPo-Versand
              </p>
              {versand.length > 0 ? (
                <ul className="text-xs space-y-1.5 list-none p-0">
                  {versand.map(v => (
                    <li key={v.id} className="flex flex-wrap gap-1.5 items-center">
                      <span className="font-semibold text-jhh-success">✅ {v.status}</span>
                      {v.empfaenger && <span className="text-jhh-text">{v.empfaenger}</span>}
                      {v.bepoNachrichtenId && (
                        <span className="text-jhh-text-light">({v.bepoNachrichtenId})</span>
                      )}
                      <span className="text-jhh-text-light">{formatDatum(v.erstelltAm)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-jhh-text-light">Noch kein beBPo-Versand.</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-jhh-text-light uppercase tracking-wide mb-1">
                eGPA-Veraktung
              </p>
              {meldung.veraktungen?.length > 0 ? (
                <ul className="text-xs space-y-1 list-none p-0">
                  {meldung.veraktungen.map(v => (
                    <li key={v.id}>
                      📁 {v.egpaAktenzeichen} · {v.status} · {formatDatum(v.erstelltAm)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-jhh-text-light">Noch keine eGPA-Veraktung.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* NOTIZEN */}
      <section className="section-card">
        <h3 className="text-sm font-bold text-jhh-primary mb-3">Notizen</h3>
        <textarea
          value={notizText}
          onChange={e => setNotizText(e.target.value)}
          placeholder="Interne Notiz hinzufügen …"
          rows={3}
          className="w-full border border-jhh-border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleNotizHinzufuegen()
          }}
        />
        <button
          type="button"
          className="btn-primary w-full mt-2 text-sm min-h-[44px]"
          disabled={speichert || !notizText.trim()}
          onClick={handleNotizHinzufuegen}
        >
          {speichert ? 'Wird gespeichert …' : 'Hinzufügen'}
        </button>
        {notizen.length === 0 ? (
          <p className="text-xs text-jhh-text-light italic mt-3">Noch keine Notizen.</p>
        ) : (
          <ul className="mt-3 space-y-2 list-none p-0">
            {notizen.map((n, i) => (
              <li key={n.id || i} className="text-xs border-t border-jhh-border pt-2">
                <span className="text-jhh-text-light block mb-0.5">
                  {new Date(n.erstelltAm).toLocaleString('de-DE')}
                  {n.erstelltVon ? ` · ${n.erstelltVon}` : ''}
                </span>
                <span className="text-jhh-primary whitespace-pre-wrap">{n.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* BEARBEITUNGSVERLAUF */}
      <section className="section-card">
        <h3 className="text-sm font-bold text-jhh-primary mb-3">Bearbeitungsverlauf</h3>
        <StatusVerlaufListe verlauf={meldung?.statusVerlauf} />
      </section>

    </aside>
  )
}
