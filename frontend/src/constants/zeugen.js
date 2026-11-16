/** Zeugen bei Strafanzeige – Benennung und Zeugenaussage */

import { isRichTextEmpty } from '../utils/richText'

/** Frist Benachrichtigung Bedienstete als Zeuge (Prototyp, Kalendertage) */
export const ZEUGE_BEDIENSTETER_FRIST_TAGE = 5

/** JVA + Haus/Station für Benachrichtigung aVD/SL (Prototyp-Daten wie Seed) */
export const BENACHRICHTIGUNG_STANDORTE = [
  { jva: 'JVA Billwerder', haus: 'Abteilung 1', label: 'JVA Billwerder · Abteilung 1' },
  { jva: 'JVA Billwerder', haus: 'Abteilung 2', label: 'JVA Billwerder · Abteilung 2' },
  { jva: 'JVA Fuhlsbüttel', haus: 'Abteilung 2', label: 'JVA Fuhlsbüttel · Abteilung 2' },
]

export function zeugeBrauchtBenachrichtigungsStandort(zeugenTyp) {
  return zeugenTyp === 'inhaftierter' || zeugenTyp === 'ohne_meldeberechtigung'
}

export const ZEUGEN_TYPEN = [
  {
    value: 'bediensteter',
    label: 'Bedienstete/r',
    beschreibung: 'Benannte/r Bedienstete/r erhält nach Einreichung eine Aufgabe im persönlichen Arbeitskorb zur Abgabe der Zeugenaussage (Frist im Prototyp).',
    nameLabel: 'Name der/des Zeugin/Zeugen (Bedienstete/r)',
    eigeneAussage: false,
  },
  {
    value: 'inhaftierter',
    label: 'Inhaftierte Person',
    beschreibung: 'Nach Einreichung erhalten alle Bediensteten der gewählten Abteilung eine Gruppenaufgabe im Arbeitskorb (Pull-Prinzip: eine Person übernimmt und nimmt die Zeugenaussage auf).',
    aussageLabel: 'Mitgeteilte Zeugenaussage',
    nameLabel: 'Name der/des Inhaftierten (Zeuge/Zeugin)',
    eigeneAussage: false,
  },
  {
    value: 'ohne_meldeberechtigung',
    label: 'Person ohne Zugriff auf das Meldewesen',
    beschreibung: 'z. B. Externe oder sonstige Personen ohne Meldeberechtigung. Wählen Sie Station/Hafthaus für die Benachrichtigung der Bediensteten (Zeugenaufnahme).',
    aussageLabel: 'Mitgeteilte Zeugenaussage',
    nameLabel: 'Name der/des Zeugin/Zeugen',
    eigeneAussage: false,
  },
]

export function getZeugenTyp(value) {
  return ZEUGEN_TYPEN.find(z => z.value === value)
}

export function getZeugenTypLabel(value) {
  return getZeugenTyp(value)?.label || value || '–'
}

function neueZeugenId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `z-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyZeuge() {
  return {
    id: neueZeugenId(),
    zeugenTyp: '',
    name: '',
    gefangenenNr: '',
    benachrichtigungJva: '',
    benachrichtigungHaus: '',
    aussage: '',
  }
}

/** metadaten.zeugen → einheitliches Array (Legacy-String) */
export function normalizeZeugen(metadaten) {
  const raw = metadaten?.zeugen
  if (!raw) return []
  if (typeof raw === 'string' && raw.trim()) {
    return [{
      id: 'legacy',
      zeugenTyp: 'bediensteter',
      gefangenenNr: '',
      benachrichtigungJva: '',
      benachrichtigungHaus: '',
      aussage: '',
    }]
  }
  if (!Array.isArray(raw)) return []
  return raw.map(z => ({
    id: z.id || neueZeugenId(),
    zeugenTyp: z.zeugenTyp || '',
    name: z.name || '',
    gefangenenNr: z.gefangenenNr || '',
    benachrichtigungJva: z.benachrichtigungJva || '',
    benachrichtigungHaus: z.benachrichtigungHaus || '',
    bediensteterId: z.bediensteterId || '',
    _bediensteterId: z.bediensteterId || z._bediensteterId || '',
    aussage: z.aussage || '',
  }))
}

/** Leere Liste ist zulässig (keine Zeugen). Begonnene, unvollständige Zeilen werden abgelehnt. */
export function validateZeugenListe(zeugen) {
  const liste = zeugen || []
  for (let i = 0; i < liste.length; i++) {
    const z = liste[i]
    const nr = i + 1
    const teilweise = z.zeugenTyp || z.name?.trim() || !isRichTextEmpty(z.aussage) || z.gefangenenNr?.trim()
      || z.benachrichtigungJva?.trim() || z.benachrichtigungHaus?.trim()
    if (!teilweise) continue
    if (!z.zeugenTyp) return `Zeuge ${nr}: Bitte wählen Sie, ob es sich um eine Bedienstete/n, eine Inhaftierte/n oder eine Person ohne Zugriff auf das Meldewesen handelt.`
    if (!z.name?.trim()) return `Zeuge ${nr}: Bitte benennen Sie den Zeugen.`
    if (z.zeugenTyp !== 'bediensteter' && z.zeugenTyp !== 'inhaftierter' && isRichTextEmpty(z.aussage)) {
      return `Zeuge ${nr}: Bitte halten Sie die Zeugenaussage fest.`
    }
    if (zeugeBrauchtBenachrichtigungsStandort(z.zeugenTyp)) {
      if (!z.benachrichtigungJva?.trim() || !z.benachrichtigungHaus?.trim()) {
        return `Zeuge ${nr}: Bitte wählen Sie JVA und Station bzw. Hafthaus für die Benachrichtigung der Bediensteten.`
      }
    }
  }
  return null
}
