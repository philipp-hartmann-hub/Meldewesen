import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRolle } from '../../context/RollenContext'
import MeldungZieloptionenModal from './MeldungZieloptionenModal'
import RueckgabeDialog from './RueckgabeDialog'
import RichTextEditor from '../shared/RichTextEditor'
import { isRichTextEmpty } from '../../utils/richText'
import { getFallStatusLabel } from '../../utils/faelle'

function resolvePrimaerAktion({ meldung, kannMeldungBearbeiten }) {
  if (kannMeldungBearbeiten && meldung.status === 'DRAFT') {
    return { key: 'einreichen', label: '📤 Einreichen', status: 'SUBMITTED' }
  }

  return null
}

export default function MeldungAktionen({ meldung, onAktualisiert }) {
  const navigate = useNavigate()
  const {
    darfWeiterleiten,
    kannMeldungBearbeiten,
    istVAL,
    istAL,
    istAVD,
    istStationsleitung,
  } = useRolle()
  const [kommentar, setKommentar] = useState('')
  const [loading, setLoading] = useState(false)
  const [fehler, setFehler] = useState(null)
  const [zieloptionenOffen, setZieloptionenOffen] = useState(false)
  const [rueckgabeOffen, setRueckgabeOffen] = useState(false)
  const [rueckgabeGrund, setRueckgabeGrund] = useState('zeugen')

  const istArchiviert = meldung.status === 'ARCHIVED'
  const imFall = Boolean(meldung.fallId)
  const wartetAufBuendelung = !imFall && meldung.status !== 'DRAFT'

  const primaer = resolvePrimaerAktion({
    meldung,
    kannMeldungBearbeiten,
  })

  async function statusAendern(status) {
    setLoading(true)
    setFehler(null)
    try {
      await onAktualisiert('status', {
        status,
        kommentar: isRichTextEmpty(kommentar) ? undefined : kommentar,
      })
      setKommentar('')
    } catch (e) {
      setFehler(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePrimaer() {
    if (!primaer) return

    if (primaer.key === 'einreichen') {
      setLoading(true)
      setFehler(null)
      try {
        await onAktualisiert('status', {
          status: 'SUBMITTED',
          kommentar: isRichTextEmpty(kommentar) ? undefined : kommentar,
        })
        if (istAVD || istStationsleitung) {
          navigate('/dashboard', {
            state: {
              erfolgsMeldung: `Meldung ${meldung.meldungsNr} wurde erfolgreich eingereicht.`,
            },
          })
        }
      } catch (e) {
        setFehler(e.message)
      } finally {
        setLoading(false)
      }
      return
    }

    if (primaer.status) return statusAendern(primaer.status)
  }

  async function handleRueckgabe(rueckgabeErgaenzung) {
    setLoading(true)
    setFehler(null)
    try {
      await onAktualisiert('rueckgabe', { rueckgabeErgaenzung })
      setRueckgabeOffen(false)
    } catch (e) {
      setFehler(e.message)
    } finally {
      setLoading(false)
    }
  }

  const zeigtWeiterleiten = !imFall && darfWeiterleiten && !['DRAFT', 'ARCHIVED'].includes(meldung.status)
  const zeigtRueckgabe = !imFall && (istVAL || istAL)
    && ['SUBMITTED', 'IN_PROGRESS', 'FORWARDED'].includes(meldung.status)

  function oeffneRueckgabe(grund = 'zeugen') {
    setRueckgabeGrund(grund)
    setRueckgabeOffen(true)
  }
  if (istArchiviert) {
    return (
      <section className="section-card" aria-label="Aktionen">
        <p className="text-sm text-jhh-success font-semibold m-0" role="status">
          🗂️ Diese Meldung ist archiviert.
        </p>
      </section>
    )
  }

  return (
    <section className="section-card" aria-label="Aktionen">
      <h2 className="text-lg font-bold text-jhh-primary m-0 mb-4">Nächster Schritt</h2>

      {fehler && <p role="alert" className="text-sm text-jhh-danger mb-4">{fehler}</p>}

      {zeigtRueckgabe && meldung.metadaten?.beweismittelGesichert === 'nein' && (
        <p className="text-sm text-jhh-warning mb-4" role="status">
          Bei Ersterfassung wurden keine Beweismittel angegeben. Über „Beweismittel nachfordern“
          können Sie die Station zur Nachreichung auffordern.
        </p>
      )}

      {imFall && (
        <p className="text-sm text-jhh-secondary mb-4" role="status">
          Teil von Fall{' '}
          <Link to={`/faelle/${meldung.fall?.id}`} className="font-semibold hover:underline">
            {meldung.fall?.fallNr}
          </Link>
          , Bearbeitung am Fall (aktueller Schritt: {getFallStatusLabel(meldung.fall?.status)}).
        </p>
      )}

      {wartetAufBuendelung && (
        <p className="text-sm font-semibold text-jhh-primary mb-4" role="status">
          Wartet auf Bündelung durch die Zentrale
        </p>
      )}

      {(!imFall || primaer) && (
        <RichTextEditor
          id="aktion-kommentar"
          label="Kommentar (optional)"
          value={kommentar}
          onChange={setKommentar}
          minHeight="44px"
          placeholder="z. B. Übergabe an VAL"
          className="w-full"
        />
      )}

      <div className="mt-8 pt-4 border-t border-jhh-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {zeigtWeiterleiten && (
            <button
              type="button"
              className="btn-secondary min-h-[44px]"
              disabled={loading}
              onClick={() => statusAendern('FORWARDED')}
            >
              ↗️ Intern weiterleiten
            </button>
          )}
          {zeigtRueckgabe && (
            <>
              <button
                type="button"
                className="btn-secondary min-h-[44px]"
                disabled={loading}
                onClick={() => oeffneRueckgabe('zeugen')}
              >
                ↩ Zur Ergänzungserfassung
              </button>
              <button
                type="button"
                className="btn-secondary min-h-[44px]"
                disabled={loading}
                onClick={() => oeffneRueckgabe('beweismittel')}
              >
                📎 Beweismittel nachfordern
              </button>
            </>
          )}
          <button
            type="button"
            className="btn-secondary min-h-[44px]"
            onClick={() => setZieloptionenOffen(true)}
          >
            Zielprozess: weitere Optionen
          </button>
        </div>

        <div className="flex-shrink-0">
          {primaer ? (
            <button
              type="button"
              className="btn-primary text-base py-3 px-6 min-h-[52px] whitespace-nowrap"
              disabled={loading}
              onClick={handlePrimaer}
            >
              {primaer.label}
            </button>
          ) : null}
        </div>
      </div>

      <MeldungZieloptionenModal
        offen={zieloptionenOffen}
        onSchliessen={() => setZieloptionenOffen(false)}
        meldungsNr={meldung.meldungsNr}
      />

      <RueckgabeDialog
        offen={rueckgabeOffen}
        onSchliessen={() => setRueckgabeOffen(false)}
        onBestaetigen={handleRueckgabe}
        laedt={loading}
        initialGrund={rueckgabeGrund}
      />
    </section>
  )
}
