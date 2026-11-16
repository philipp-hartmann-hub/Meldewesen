import { FALL_PROZESS_SCHRITTE, getFallProzessSchrittIndex } from '../../utils/faelle'

/**
 * Horizontale Prozessleiste: Einzelmeldungen → Zentrale → DGL → AL → Abschluss.
 */
export default function FallProzessLeiste({ status }) {
  const aktivIndex = getFallProzessSchrittIndex(status)

  return (
    <nav aria-label="Fall-Prozess" className="mb-6 overflow-x-auto">
      <ol className="flex items-center gap-1 sm:gap-2 list-none p-0 m-0 min-w-[520px]">
        {FALL_PROZESS_SCHRITTE.map((schritt, index) => {
          const erledigt = index < aktivIndex
          const aktiv = index === aktivIndex
          return (
            <li key={schritt.id} className="flex items-center flex-1 min-w-0">
              <div
                className={`flex flex-col items-center text-center flex-1 px-1 ${
                  aktiv ? 'font-bold text-jhh-primary' : erledigt ? 'text-jhh-success' : 'text-jhh-text-light'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    aktiv
                      ? 'bg-jhh-primary text-white'
                      : erledigt
                        ? 'bg-jhh-success text-white'
                        : 'bg-jhh-bg border border-jhh-border text-jhh-text-light'
                  }`}
                  aria-hidden="true"
                >
                  {erledigt ? '✓' : index + 1}
                </span>
                <span className="text-[10px] sm:text-xs leading-tight">{schritt.label}</span>
              </div>
              {index < FALL_PROZESS_SCHRITTE.length - 1 && (
                <span
                  className={`h-0.5 w-4 sm:w-6 flex-shrink-0 ${erledigt ? 'bg-jhh-success' : 'bg-jhh-border'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
