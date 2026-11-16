/**
 * Pflicht-Tatvorwurf bei Strafanzeige (Auswahl, kein Freitext).
 * Technisch: metadaten.tatvorwurf + metadaten.strafanzeigeUntertyp (gleicher Wert).
 * Basis: Berichts- und Anzeigenpflichten JVA (Az. 4400/73 vom 28.05.2020).
 */

export const TATVORWURF_OPTIONEN = [
  // AV 4400/73 Ziffer 2.1
  { value: 'todesfall', label: 'Todesfall' },
  // AV Ziffer 2.2
  { value: 'geiselnahme', label: 'Geiselnahme / Meuterei' },
  // AV Ziffer 2.3
  { value: 'schusswaffe', label: 'Schusswaffengebrauch' },
  // AV Ziffer 2.5
  { value: 'brand', label: 'Brand mit Verletzten / Sachschaden' },
  // AV Ziffer 2.6
  { value: 'bombendrohung', label: 'Bombendrohung' },
  // AV Ziffer 2.7
  { value: 'entweichung', label: 'Entweichung / Entweichungsversuch' },
  // AV Ziffer 2.9 – körperlich
  { value: 'koerperverletzung', label: 'Körperverletzung gegen Bedienstete' },
  { value: 'kv_gefangene', label: 'Körperverletzung zwischen Gefangenen' },
  // AV Ziffer 2.9 – weitere
  { value: 'sexualstraftat', label: 'Sexualstraftat' },
  // AV Ziffer 2.10
  { value: 'btm', label: 'BTM-Delikt' },
  { value: 'diebstahl', label: 'Diebstahl / Unterschlagung' },
  // AV Ziffer 2.11
  { value: 'suizidversuch', label: 'Suizidversuch' },
  // AV Ziffer 2.14
  { value: 'bediensteter_strafbar', label: 'Verdacht strafbarer Handlung durch Bedienstete/n' },
  // Sonstige
  { value: 'sonstige', label: 'Sonstige (im Sachverhalt beschreiben)' },
]

/** Hinweis unter dem Tatvorwurf-Dropdown im Formular */
export const TATVORWURF_HINWEIS =
  'Diese Liste basiert auf Berichts- und Anzeigenpflichten der Justizvollzugsanstalten (Az. 4400/73 vom 28.05.2020). '
  + 'Vollständigkeit wird im Workshop mit den JVAs verifiziert.'

/** Demo-/Legacy-Werte aus früherer Kurzliste */
const LEGACY_TATVORWURF_LABELS = {
  aov: 'Körperverletzung gegen Bedienstete (Legacy: aoV)',
  aav: 'Angriff auf Vollzugsbedienstete (Legacy)',
}

export const TATVORWURF_WERTE = new Set(TATVORWURF_OPTIONEN.map(o => o.value))

/** @deprecated Alias – weiterhin für Listen/Detail */
export const STRAFANZEIGE_UNTERTYPEN = TATVORWURF_OPTIONEN

export function getTatvorwurfLabel(value) {
  if (!value) return '–'
  const opt = TATVORWURF_OPTIONEN.find(u => u.value === value)
  if (opt) return opt.label
  return LEGACY_TATVORWURF_LABELS[value] || value
}

export function getStrafanzeigeUntertypLabel(value) {
  return getTatvorwurfLabel(value)
}

export function istGueltigerTatvorwurf(value) {
  if (!value) return false
  return TATVORWURF_WERTE.has(value) || Boolean(LEGACY_TATVORWURF_LABELS[value])
}

/** Wert aus metadaten (tatvorwurf oder Legacy strafanzeigeUntertyp) */
export function getTatvorwurfFromMeta(metadaten) {
  if (!metadaten) return ''
  return metadaten.tatvorwurf || metadaten.strafanzeigeUntertyp || ''
}
