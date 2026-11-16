import { useEffect, useRef, useState } from 'react'
import RichTextDisplay from '../shared/RichTextDisplay'
import AnhangVorschauModal from './AnhangVorschauModal'
import { buildMockHeaders, downloadMeldungAnhangBlob } from '../../api/meldungAnhaengeApi'
import { useRolle } from '../../context/RollenContext'
import { istBildDatei } from '../../utils/anhangVorschau'

/**
 * Gespeicherte Dateianhänge einer Meldung (Vorschau, Download).
 */
export default function MeldungAnhaengeListe({ meldungId, anhaenge }) {
  const { aktiveRolle, aktiverNutzer } = useRolle()
  const [fehler, setFehler] = useState(null)
  const [vorschau, setVorschau] = useState(null)
  const [vorschauLaedt, setVorschauLaedt] = useState(false)
  const vorschauUrlRef = useRef(null)

  useEffect(() => () => {
    if (vorschauUrlRef.current) {
      URL.revokeObjectURL(vorschauUrlRef.current)
    }
  }, [])

  function schliesseVorschau() {
    if (vorschauUrlRef.current) {
      URL.revokeObjectURL(vorschauUrlRef.current)
      vorschauUrlRef.current = null
    }
    setVorschau(null)
  }

  async function onVorschau(anhang) {
    if (!istBildDatei(anhang.dateityp, anhang.dateiname)) return
    setFehler(null)
    setVorschauLaedt(true)
    try {
      const { blob } = await downloadMeldungAnhangBlob(
        buildMockHeaders({ aktiveRolle, aktiverNutzer }),
        meldungId,
        anhang.id,
      )
      schliesseVorschau()
      const url = URL.createObjectURL(blob)
      vorschauUrlRef.current = url
      setVorschau({ url, titel: anhang.dateiname })
    } catch (e) {
      setFehler(e.message || 'Vorschau konnte nicht geladen werden.')
    } finally {
      setVorschauLaedt(false)
    }
  }

  async function onDownload(anhangId) {
    setFehler(null)
    try {
      const { blob, dateiname } = await downloadMeldungAnhangBlob(
        buildMockHeaders({ aktiveRolle, aktiverNutzer }),
        meldungId,
        anhangId,
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = dateiname
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setFehler(e.message || 'Download fehlgeschlagen.')
    }
  }

  if (!anhaenge?.length) return null

  return (
    <>
      {fehler && (
        <p role="alert" className="text-sm text-jhh-danger mb-3">{fehler}</p>
      )}
      <ul className="text-sm space-y-3 list-none p-0 m-0">
        {anhaenge.map(a => {
          const istBild = istBildDatei(a.dateityp, a.dateiname)
          return (
          <li key={a.id} className="flex flex-wrap items-center gap-3 min-h-[44px]">
            <span className="flex-1 min-w-0 break-words">
              {istBild ? (
                <button
                  type="button"
                  className="font-medium text-jhh-secondary underline text-left break-all min-h-[44px] px-0"
                  onClick={() => onVorschau(a)}
                  disabled={vorschauLaedt}
                  title="Bildvorschau anzeigen"
                >
                  {a.dateiname}
                </button>
              ) : (
                a.dateiname
              )}
              {a.beschreibung && (
                <RichTextDisplay html={a.beschreibung} className="text-jhh-text-light font-normal mt-0.5" />
              )}
            </span>
            <button
              type="button"
              className="btn-secondary btn-sm min-h-[44px] shrink-0"
              onClick={() => onDownload(a.id)}
            >
              Herunterladen
            </button>
          </li>
          )
        })}
      </ul>

      <AnhangVorschauModal
        offen={Boolean(vorschau)}
        titel={vorschau?.titel}
        bildUrl={vorschau?.url}
        onSchliessen={schliesseVorschau}
      />
    </>
  )
}
