/**
 * ERV-Aktionen am gebündelten Fall (versandfähig → beBPo → eGPA → Vier-Augen).
 */
export default function FallErvPanel({ fall, aktionLaden, onAktion }) {
  if (!fall || fall.istAbgeschlossen) return null

  const schritte = []

  if (fall.status === 'ERV_WEG') {
    schritte.push({
      key: 'versandfaehig',
      label: 'Als versandfähig markieren',
      done: fall.hatVersandfaehig,
      aktiv: fall.darfVersandfaehig,
      icon: '✅',
    })
    schritte.push({
      key: 'bepo',
      label: 'Per beBPo versenden',
      done: fall.hatBepo,
      aktiv: fall.darfBepo,
      icon: '⚖️',
      detail: fall.bepoNachrichtenId,
    })
    schritte.push({
      key: 'egpa',
      label: 'In eGPA verakten',
      done: fall.hatEgpa,
      aktiv: fall.darfEgpaErv,
      icon: '📁',
      detail: fall.egpaAktenzeichen,
    })
  }

  if (fall.status === 'EGPA_INTERN') {
    schritte.push({
      key: 'egpa',
      label: 'In eGPA verakten (ohne beBPo)',
      done: fall.hatEgpa,
      aktiv: fall.darfEgpaIntern,
      icon: '📁',
      detail: fall.egpaAktenzeichen,
    })
  }

  if (['EGPA_INTERN', 'ERV_WEG'].includes(fall.status) && fall.hatEgpa) {
    schritte.push({
      key: 'abschliessen',
      label: 'Fall abschließen (Vier-Augen)',
      done: false,
      aktiv: fall.darfAbschliessen,
      icon: '🗂️',
      detail: fall.vierAugenGesperrt
        ? 'Abschluss durch eine zweite Person (AL oder VAL) erforderlich'
        : undefined,
    })
  }

  if (schritte.length === 0) return null

  return (
    <section className="section-card mb-6 border-l-4 border-jhh-secondary" aria-labelledby="fall-erv-kopf">
      <h2 id="fall-erv-kopf" className="text-lg font-bold text-jhh-primary m-0 mb-3">
        {fall.status === 'EGPA_INTERN' ? 'Interner Abschluss am Fall' : 'ERV-Weg am Fall'}
      </h2>
      <p className="text-sm text-jhh-text m-0 mb-4">
        {fall.status === 'EGPA_INTERN'
          ? 'Nicht meldepflichtig – direkt eGPA am Fall (kein beBPo).'
          : 'Meldepflichtig – versandfähig → beBPo → eGPA am gebündelten Fall.'}
      </p>
      <ol className="space-y-3 list-none p-0 m-0 mb-4">
        {schritte.map(s => (
          <li
            key={s.key}
            className={`flex items-center gap-3 p-3 rounded border ${
              s.done ? 'border-jhh-success bg-green-50' : s.aktiv ? 'border-jhh-secondary bg-blue-50' : 'border-jhh-border bg-jhh-bg'
            }`}
          >
            <span className="text-xl" aria-hidden="true">{s.done ? '✓' : s.icon}</span>
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-semibold ${s.done ? 'text-jhh-success' : 'text-jhh-primary'}`}>
                {s.label}
              </span>
              {s.detail && (
                <span className="block text-xs text-jhh-text-light mt-0.5">{s.detail}</span>
              )}
            </div>
            {s.aktiv && (
              <button
                type="button"
                onClick={() => onAktion(s.key)}
                disabled={aktionLaden}
                className="btn-primary btn-sm min-h-[44px] flex-shrink-0"
              >
                {s.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
