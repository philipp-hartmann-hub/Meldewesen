/** Tatvorwurf-Werte Strafanzeige – spiegelt frontend/src/constants/strafanzeigeUntertypen.js */

export const TATVORWURF_WERTE = new Set([
  'todesfall',
  'geiselnahme',
  'schusswaffe',
  'brand',
  'bombendrohung',
  'entweichung',
  'koerperverletzung',
  'kv_gefangene',
  'sexualstraftat',
  'btm',
  'diebstahl',
  'suizidversuch',
  'bediensteter_strafbar',
  'sonstige',
])

const LEGACY_TATVORWURF = new Set(['aov', 'aav'])

export function istGueltigerTatvorwurf(value) {
  if (!value) return false
  return TATVORWURF_WERTE.has(value) || LEGACY_TATVORWURF.has(value)
}
