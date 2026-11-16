import { useState } from 'react'
import ZuweisenDialog from './ZuweisenDialog'
import { useApiClient } from '../../api/client'
import { useRolle } from '../../context/RollenContext'

export default function ZuweisungSection({ meldung, onAktualisiert }) {
  const api = useApiClient()
  const { istVAL, istAL, aktiverNutzer } = useRolle()
  const [dialogOffen, setDialogOffen] = useState(false)
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState(null)

  if (!istVAL && !istAL) return null

  const meta = meldung.metadaten || {}
  const zugewiesenAn = meldung.zugewiesenAn || meta.zugewiesenAn
    || meta.beweismittelNachreichung?.zugewiesenAn
  const zugewiesenAnName = meldung.zugewiesenAnName || meta.zugewiesenAnName
    || meta.beweismittelNachreichung?.zugewiesenAnName

  const gefangenenStation = meldung.gefangene?.haus || null
  const defaultStation = istAL
    ? (gefangenenStation || aktiverNutzer.abteilung)
    : aktiverNutzer.abteilung
  const fremdeStation = istVAL && !istAL && gefangenenStation
    && gefangenenStation !== aktiverNutzer.abteilung

  async function handleZuweisen({ zugewiesenAn, kommentar }) {
    setLaedt(true)
    setFehler(null)
    try {
      await api.patch(`/api/meldungen/${meldung.id}/zuweisen`, {
        zugewiesenAn,
        kommentar,
      })
      setDialogOffen(false)
      await onAktualisiert?.()
    } catch (e) {
      setFehler(e.message || 'Zuweisung fehlgeschlagen.')
    } finally {
      setLaedt(false)
    }
  }

  async function handleZurueckAnGruppe() {
    if (!window.confirm('Aufgabe wirklich zurück an die Gruppe geben?')) return
    setLaedt(true)
    setFehler(null)
    try {
      await api.patch(`/api/meldungen/${meldung.id}/zuweisen`, { zugewiesenAn: null })
      await onAktualisiert?.()
    } catch (e) {
      setFehler(e.message || 'Zurückgabe fehlgeschlagen.')
    } finally {
      setLaedt(false)
    }
  }

  return (
    <section className="section-card">
      <h2 className="text-lg font-bold text-jhh-primary mb-4">Zuweisung</h2>

      {fehler && (
        <p role="alert" className="text-sm text-jhh-danger mb-3">{fehler}</p>
      )}

      {fremdeStation && (
        <p className="text-sm text-jhh-text-light mb-3">
          Gefangene/r in <strong>{gefangenenStation}</strong> – Sie können nur Bedienstete
          Ihrer Abteilung ({aktiverNutzer.abteilung}) zuweisen. Für {gefangenenStation} ist
          die zuständige VAL oder die Anstaltsleitung zuständig.
        </p>
      )}

      {zugewiesenAn ? (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-jhh-bg border border-jhh-border text-sm">
            <span aria-hidden="true">👤</span>
            <span className="font-semibold text-jhh-primary">{zugewiesenAnName || zugewiesenAn}</span>
          </span>
          <button
            type="button"
            className="text-sm text-jhh-secondary hover:underline"
            onClick={handleZurueckAnGruppe}
            disabled={laedt}
          >
            Zurück an Gruppe
          </button>
        </div>
      ) : (
        <p className="text-sm text-jhh-text-light mb-4">
          Noch nicht zugewiesen – erscheint als Gruppenaufgabe für die Station.
        </p>
      )}

      <button
        type="button"
        className="btn-primary btn-sm"
        onClick={() => setDialogOffen(true)}
        disabled={laedt}
      >
        {zugewiesenAn ? 'Aufgabe ummelden' : 'Aufgabe zuweisen'}
      </button>

      <ZuweisenDialog
        offen={dialogOffen}
        onSchliessen={() => setDialogOffen(false)}
        onBestaetigen={handleZuweisen}
        laedt={laedt}
        titel={zugewiesenAn ? 'Aufgabe ummelden' : 'Aufgabe zuweisen'}
        beschreibung="Wählen Sie Station und Bearbeiter/in. Optional mit Kommentar."
        defaultStation={defaultStation}
      />
    </section>
  )
}
