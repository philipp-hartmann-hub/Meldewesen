import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRolle } from '../../context/RollenContext'
import MeldungZieloptionenModal from './MeldungZieloptionenModal'
import RueckgabeDialog from './RueckgabeDialog'
import RichTextEditor from '../shared/RichTextEditor'
import { isRichTextEmpty } from '../../utils/richText'
import { istStrafanzeigePruefbereit } from '../../utils/zeugenVollstaendigkeit'
import { istFallErvPfad } from '../../utils/faelle'

function resolvePrimaerAktion({
  meldung,
  hatBepo,
  hatEgpa,
  pruefbereit,
  kannMeldungBearbeiten,
  istVAL,
  istAL,
  darfXJustizSenden,
  darfVerakten,
  darfMeldungAbschliessen,
  darfFachlichPruefen,
  ervAmFall,
}) {
  if (kannMeldungBearbeiten && meldung.status === 'DRAFT') {
    return { key: 'einreichen', label: '📤 Einreichen', status: 'SUBMITTED' }
  }

  const kannPruefen = darfFachlichPruefen
    && kannMeldungBearbeiten
    && ['SUBMITTED', 'FORWARDED'].includes(meldung.status)
    && pruefbereit

  if (kannPruefen) {
    return { key: 'pruefung', label: '🔍 Fachliche Prüfung aufnehmen', status: 'IN_PROGRESS' }
  }

  if (!ervAmFall) {
    if (
      meldung.status === 'IN_PROGRESS'
      && (istVAL || istAL)
      && meldung.ervRelevant
      && darfXJustizSenden
      && !hatBepo
    ) {
      return { key: 'bepo', label: '⚖️ Per beBPo versenden', action: 'bepo' }
    }

    if (meldung.ervRelevant && hatBepo && !hatEgpa && darfVerakten) {
      return { key: 'egpa', label: '📁 In eGPA verakten', action: 'verakten' }
    }

    if (
      hatBepo
      && hatEgpa
      && darfMeldungAbschliessen
      && meldung.status !== 'DRAFT'
      && meldung.status !== 'ARCHIVED'
    ) {
      return { key: 'archiv', label: '🗂️ Meldung abschließen', action: 'archiv' }
    }
  }

  return null
}

export default function MeldungAktionen({ meldung, onAktualisiert }) {
  const navigate = useNavigate()
  const {
    darfWeiterleiten,
    darfVerakten,
    darfXJustizSenden,
    darfMeldungAbschliessen,
    kannMeldungBearbeiten,
    istVAL,
    istAL,
    istAVD,
    istStationsleitung,
  } = useRolle()
  const [kommentar, setKommentar] = useState('')
  const [loading, setLoading] = useState(false)
  const [fehler, setFehler] = useState(null)
  const [bepoOk, setBepoOk] = useState(null)
  const [zieloptionenOffen, setZieloptionenOffen] = useState(false)
  const [rueckgabeOffen, setRueckgabeOffen] = useState(false)
  const [rueckgabeGrund, setRueckgabeGrund] = useState('zeugen')

  const istArchiviert = meldung.status === 'ARCHIVED'
  const ervAmFall = istFallErvPfad(meldung.fall)
  const hatBepo = meldung.xJustizVersand?.some(v => v.status === 'VERSENDET' || v.status === 'BESTAETIGT')
  const hatEgpa = meldung.veraktungen?.some(v => v.status === 'UEBERMITTELT')
  const pruefbereit = istStrafanzeigePruefbereit(meldung)

  const primaer = resolvePrimaerAktion({
    meldung,
    hatBepo,
    hatEgpa,
    pruefbereit,
    kannMeldungBearbeiten,
    istVAL,
    istAL,
    darfXJustizSenden,
    darfVerakten,
    darfMeldungAbschliessen,
    darfFachlichPruefen: istVAL || istAL,
    ervAmFall,
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

  async function bepoSenden() {
    if (!window.confirm('Möchten Sie diese Meldung per beBPo (Mock) versenden?')) return
    setLoading(true)
    setFehler(null)
    try {
      const res = await onAktualisiert('bepo')
      setBepoOk(res?.data?.bepoNachrichtenId)
    } catch (e) {
      setFehler(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function verakten() {
    setLoading(true)
    setFehler(null)
    try {
      await onAktualisiert('verakten')
    } catch (e) {
      setFehler(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePrimaer() {
    if (!primaer) return
    if (primaer.action === 'bepo') return bepoSenden()
    if (primaer.action === 'verakten') return verakten()
    if (primaer.action === 'archiv') return archivieren()

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

  const egpaDisabled = meldung.ervRelevant && !hatBepo
  const archivDisabled = meldung.ervRelevant && (!hatBepo || !hatEgpa)
  const primaerDisabled = loading
    || (primaer?.key === 'egpa' && egpaDisabled)
    || (primaer?.key === 'archiv' && archivDisabled)

  function primaerTooltip() {
    if (primaer?.key === 'egpa' && egpaDisabled) return 'Bitte zuerst per beBPo versenden.'
    if (primaer?.key === 'archiv' && archivDisabled) return 'Bitte zuerst beBPo und eGPA abschließen.'
    return undefined
  }

  async function archivieren() {
    if (!window.confirm('Meldung archivieren? Bei ERV: Vier-Augen (VAL ↔ AL).')) return
    return statusAendern('ARCHIVED')
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

  const zeigtWeiterleiten = darfWeiterleiten && !['DRAFT', 'ARCHIVED'].includes(meldung.status)
  const zeigtErvSekundaer = meldung.ervRelevant && !istArchiviert && !ervAmFall
  const zeigtRueckgabe = (istVAL || istAL)
    && ['SUBMITTED', 'IN_PROGRESS', 'FORWARDED'].includes(meldung.status)

  function oeffneRueckgabe(grund = 'zeugen') {
    setRueckgabeGrund(grund)
    setRueckgabeOffen(true)
  }
  const zeigtPruefHinweis = (istVAL || istAL)
    && kannMeldungBearbeiten
    && meldung.meldungsTyp === 'STRAFANZEIGE'
    && ['SUBMITTED', 'FORWARDED'].includes(meldung.status)
    && !pruefbereit

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

      {bepoOk && (
        <p className="text-sm text-jhh-success mb-4" role="status">
          ✅ Per beBPo versendet ({bepoOk})
        </p>
      )}

      {zeigtPruefHinweis && (
        <p className="text-sm text-jhh-warning mb-4" role="status">
          Fachliche Prüfung erst möglich, wenn alle Zeugenaussagen eingeholt bzw. bestätigt wurden.
          Offene Aufgaben finden Sie im Arbeitskorb der benannten Zeugen.
        </p>
      )}

      {zeigtRueckgabe && meldung.metadaten?.beweismittelGesichert === 'nein' && (
        <p className="text-sm text-jhh-warning mb-4" role="status">
          Bei Ersterfassung wurden keine Beweismittel angegeben. Über „Beweismittel nachfordern“
          können Sie die Station zur Nachreichung auffordern.
        </p>
      )}

      {ervAmFall && (
        <p className="text-sm text-jhh-secondary mb-4" role="status">
          ERV und eGPA erfolgen am <strong>gebündelten Fall</strong> – bitte Fall-Detail öffnen.
        </p>
      )}

      {meldung.ervRelevant && !ervAmFall && darfMeldungAbschliessen && (!hatBepo || !hatEgpa) && (
        <p className="text-xs text-jhh-text-light mb-4">
          ERV-Ablauf: zuerst beBPo, dann eGPA, danach Abschluss mit Vier-Augen (VAL ↔ AL).
        </p>
      )}

      <RichTextEditor
        id="aktion-kommentar"
        label="Kommentar (optional)"
        value={kommentar}
        onChange={setKommentar}
        minHeight="44px"
        placeholder="z. B. Übergabe an VAL"
        className="w-full"
      />

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
          {zeigtErvSekundaer && darfVerakten && primaer?.key !== 'egpa' && (
            <button
              type="button"
              className="btn-secondary min-h-[44px]"
              disabled={loading || egpaDisabled}
              title={egpaDisabled ? 'Bitte zuerst per beBPo versenden.' : undefined}
              onClick={verakten}
            >
              📁 In eGPA verakten
            </button>
          )}
          {zeigtErvSekundaer && darfMeldungAbschliessen && primaer?.key !== 'archiv' && (
            <button
              type="button"
              className="btn-secondary min-h-[44px]"
              disabled={loading || archivDisabled}
              title={archivDisabled ? 'Bitte zuerst beBPo und eGPA abschließen.' : undefined}
              onClick={archivieren}
            >
              🗂️ Meldung abschließen
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
              disabled={primaerDisabled}
              title={primaerTooltip()}
              onClick={handlePrimaer}
            >
              {primaer.label}
            </button>
          ) : (
            <p className="text-sm text-jhh-text-light m-0">
              {istAVD || istStationsleitung
                ? 'Fachliche Prüfung obliegt der VAL. Offene Aufgaben finden Sie im Arbeitskorb.'
                : 'Keine Primäraktion für Ihre Rolle.'}
            </p>
          )}
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
