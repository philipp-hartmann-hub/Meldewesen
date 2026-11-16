import { useMemo, useCallback } from 'react'
import GefangeneAutocomplete from './GefangeneAutocomplete'
import BediensteteAutocomplete from './BediensteteAutocomplete'

function formatGefangeneName(g) {
  if (!g) return ''
  return `${g.nachname || ''}, ${g.vorname || ''}`.replace(/^, |, $/g, '').trim()
}

/**
 * Name-Feld für Zeugen – Autocomplete abhängig von zeugenTyp.
 */
export default function ZeugenNameFeld({ zeuge, zeugenTyp, typConfig, onChange, idPrefix }) {
  const label = typConfig?.nameLabel || 'Name der/des Zeugin/Zeugen'
  const id = `${idPrefix}-name-${zeuge.id}`

  const bediensteterValue = useMemo(() => {
    const bid = zeuge._bediensteterId || zeuge.bediensteterId
    if (bid) {
      return { id: bid, bediensteterName: zeuge.name }
    }
    if (zeuge.name) return { bediensteterName: zeuge.name }
    return null
  }, [zeuge._bediensteterId, zeuge.bediensteterId, zeuge.name])

  const gefangeneValue = useMemo(() => {
    if (!zeuge._gefangeneId && !zeuge.gefangenenNr && !zeuge.name) return null
    const parts = (zeuge.name || '').split(',').map(s => s.trim())
    return {
      id: zeuge._gefangeneId,
      gefangenenNr: zeuge.gefangenenNr,
      nachname: parts[0] || '',
      vorname: parts[1] || '',
    }
  }, [zeuge._gefangeneId, zeuge.gefangenenNr, zeuge.name])

  const handleBediensteterChange = useCallback(b => {
    onChange({
      _bediensteterId: b?.id,
      name: b?.bediensteterName || '',
      gefangenenNr: '',
      _gefangeneId: undefined,
    })
  }, [onChange])

  const handleGefangeneChange = useCallback(g => {
    onChange({
      _gefangeneId: g?.id,
      gefangenenNr: g?.gefangenenNr || '',
      name: g ? formatGefangeneName(g) : '',
      _bediensteterId: undefined,
    })
  }, [onChange])

  if (!zeugenTyp) {
    return (
      <div>
        <label htmlFor={id} className="form-label form-label-required">
          {label}
        </label>
        <input
          id={id}
          type="text"
          className="form-input opacity-60"
          disabled
          placeholder="Bitte wählen Sie zuerst die Art des Zeugen."
          aria-required="true"
        />
      </div>
    )
  }

  if (zeugenTyp === 'bediensteter') {
    return (
      <BediensteteAutocomplete
        id={id}
        label={label}
        required
        showHint
        value={bediensteterValue}
        onChange={handleBediensteterChange}
      />
    )
  }

  if (zeugenTyp === 'inhaftierter') {
    return (
      <GefangeneAutocomplete
        id={id}
        label={label}
        required
        showHint
        standortErforderlich
        standortJva={zeuge.benachrichtigungJva || ''}
        standortHaus={zeuge.benachrichtigungHaus || ''}
        placeholder="Name oder Gefangenen-Nr. – nur Inhaftierte der gewählten Station"
        value={gefangeneValue}
        onChange={handleGefangeneChange}
      />
    )
  }

  return (
    <div>
      <label htmlFor={id} className="form-label form-label-required">
        {label}
      </label>
      <p className="text-xs text-jhh-text-light mb-1" id={`${id}-hint`}>
        Freitext – für Personen ohne Stammdaten im Meldewesen (z. B. Externe).
      </p>
      <input
        id={id}
        type="text"
        className="form-input"
        value={zeuge.name || ''}
        onChange={e => onChange({
          name: e.target.value,
          gefangenenNr: '',
          _gefangeneId: undefined,
          _bediensteterId: undefined,
        })}
        aria-required="true"
        aria-describedby={`${id}-hint`}
      />
    </div>
  )
}
