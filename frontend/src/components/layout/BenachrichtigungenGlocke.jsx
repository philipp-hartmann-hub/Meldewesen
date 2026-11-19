import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBenachrichtigungen } from '../../hooks/useBenachrichtigungen'
import { fallIdAusAufgabeId, meldungDirektAusAufgabeId } from '../../utils/arbeitskorb'

function formatZeit(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function linkFuerBenachrichtigung(n) {
  const meldungDirekt = meldungDirektAusAufgabeId(n.aufgabeId)
  if (meldungDirekt) return meldungDirekt
  const fallId = fallIdAusAufgabeId(n.aufgabeId)
  if (fallId) return `/faelle/${fallId}`
  if (n.aufgabeId) return `/arbeitskorb/aufgabe/${encodeURIComponent(n.aufgabeId)}`
  if (n.meldungId) return `/meldungen/${n.meldungId}`
  return null
}

export default function BenachrichtigungenGlocke() {
  const { data, ungelesen, alsGelesenMarkieren } = useBenachrichtigungen()
  const [offen, setOffen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOffen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleToggle() {
    const wirdOffen = !offen
    setOffen(wirdOffen)
    if (wirdOffen && ungelesen > 0) {
      await alsGelesenMarkieren()
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/10"
        style={{ color: '#fff' }}
        aria-label={`Benachrichtigungen${ungelesen ? `, ${ungelesen} ungelesen` : ''}`}
        aria-expanded={offen}
      >
        <span aria-hidden="true" className="text-lg leading-none">🔔</span>
        {ungelesen > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: '#dc2626', color: '#fff' }}
          >
            {ungelesen > 9 ? '9+' : ungelesen}
          </span>
        )}
      </button>

      {offen && (
        <div
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-jhh-border z-50 overflow-hidden"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-jhh-border bg-jhh-bg">
            <p className="text-sm font-semibold text-jhh-primary m-0">Benachrichtigungen</p>
          </div>
          {data.length === 0 ? (
            <p className="text-sm text-jhh-text-light px-4 py-6 m-0 text-center">
              Keine Benachrichtigungen.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto m-0 p-0 list-none">
              {data.map(n => {
                const href = linkFuerBenachrichtigung(n)
                const inhalt = (
                  <>
                    <p className="text-sm text-jhh-text m-0 leading-snug">{n.text}</p>
                    <p className="text-xs text-jhh-text-light m-0 mt-1">{formatZeit(n.erstelltAm)}</p>
                  </>
                )
                return (
                  <li key={n.id} className="border-b border-jhh-border last:border-0">
                    {href ? (
                      <Link
                        to={href}
                        className="block px-4 py-3 hover:bg-jhh-bg no-underline"
                        onClick={() => setOffen(false)}
                        role="menuitem"
                      >
                        {inhalt}
                      </Link>
                    ) : (
                      <div className="px-4 py-3" role="menuitem">{inhalt}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
