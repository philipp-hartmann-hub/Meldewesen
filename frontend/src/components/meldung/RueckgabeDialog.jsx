import { useEffect, useRef, useState } from 'react'

const GRUND_OPTIONEN = [
  { value: 'zeugen',       label: 'Fehlende Zeugenaussagen' },
  { value: 'beweismittel', label: 'Fehlende Beweismittel' },
  { value: 'beides',       label: 'Zeugen & Beweismittel' },
  { value: 'sonstiges',    label: 'Sonstiges' },
]

function addWerktage(datum, werktage) {
  const d = new Date(datum)
  let hinzugefuegt = 0
  while (hinzugefuegt < werktage) {
    d.setDate(d.getDate() + 1)
    const wochentag = d.getDay()
    if (wochentag !== 0 && wochentag !== 6) hinzugefuegt++
  }
  return d.toISOString().slice(0, 10)
}

export default function RueckgabeDialog({
  offen,
  onSchliessen,
  onBestaetigen,
  laedt = false,
  initialGrund = 'zeugen',
}) {
  const [grund, setGrund] = useState(initialGrund)
  const [kommentar, setKommentar] = useState('')
  const [fristBis, setFristBis] = useState(() => addWerktage(new Date(), 5))
  const [fehler, setFehler] = useState(null)
  const dialogRef = useRef(null)
  const erstesInputRef = useRef(null)

  useEffect(() => {
    if (offen) {
      setGrund(initialGrund)
      setKommentar('')
      setFristBis(addWerktage(new Date(), 5))
      setFehler(null)
      setTimeout(() => erstesInputRef.current?.focus(), 50)
    }
  }, [offen, initialGrund])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && offen) onSchliessen()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [offen, onSchliessen])

  if (!offen) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!kommentar.trim()) {
      setFehler('Bitte geben Sie einen Kommentar ein.')
      return
    }
    setFehler(null)
    onBestaetigen({ grund, kommentar: kommentar.trim(), fristBis: fristBis || null })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => { if (e.target === e.currentTarget) onSchliessen() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rueckgabe-titel"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 id="rueckgabe-titel" className="text-lg font-bold text-jhh-primary mb-2">
              ↩ Zur Ergänzungserfassung zurückgeben
            </h3>
            <p className="text-sm text-jhh-text mb-5">
              Die Meldung wird in den Status „Entwurf" zurückgesetzt. Die meldende Stelle
              erhält einen Hinweis mit Ihrem Kommentar und der gesetzten Frist.
            </p>

            {fehler && (
              <p role="alert" className="text-sm text-jhh-danger mb-4">{fehler}</p>
            )}

            {/* Grund */}
            <div className="mb-4">
              <label htmlFor="rueckgabe-grund" className="form-label">
                Grund <span className="text-jhh-danger">*</span>
              </label>
              <select
                id="rueckgabe-grund"
                ref={erstesInputRef}
                value={grund}
                onChange={e => setGrund(e.target.value)}
                className="w-full border border-jhh-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
                required
              >
                {GRUND_OPTIONEN.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Kommentar */}
            <div className="mb-4">
              <label htmlFor="rueckgabe-kommentar" className="form-label">
                Kommentar an die Station <span className="text-jhh-danger">*</span>
              </label>
              <textarea
                id="rueckgabe-kommentar"
                value={kommentar}
                onChange={e => setKommentar(e.target.value)}
                rows={4}
                placeholder="Was muss ergänzt werden? z.B. Zeugenaussage von Beamtin Müller fehlt."
                className="w-full border border-jhh-border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
                required
              />
            </div>

            {/* Frist */}
            <div className="mb-2">
              <label htmlFor="rueckgabe-frist" className="form-label">
                Ergänzungsfrist
              </label>
              <input
                id="rueckgabe-frist"
                type="date"
                value={fristBis}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setFristBis(e.target.value)}
                className="w-full border border-jhh-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jhh-secondary"
              />
              <p className="text-xs text-jhh-text-light mt-1">
                Standard: 5 Werktage ab heute
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end px-6 pb-6 mt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={onSchliessen}
              disabled={laedt}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={laedt || !kommentar.trim()}
            >
              {laedt ? 'Wird zurückgegeben …' : '↩ Zurückgeben'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
