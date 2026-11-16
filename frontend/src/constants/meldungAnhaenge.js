/** Erlaubte Dateianhänge (Prototyp) – abgestimmt mit backend/src/routes/meldungAnhaenge.js */
export const ANHAENGE_MAX_ANZAHL = 20
export const ANHAENGE_MAX_MB = 15

export const ANHAENGE_ACCEPT =
  'image/*,.pdf,.txt,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export const ERLAUBTE_DATEIFORMATE_HINWEIS = [
  'Bilder (z. B. JPEG, PNG)',
  'PDF',
  'Textdateien (.txt)',
  'Word (.doc, .docx)',
]

export const ANLAGE_TYPEN_HINWEIS = [
  'Einsatzprotokoll',
  'Fotodokumentation',
  'Ärztlicher Bericht',
  'Zeugenaussage',
  'Sonstiges',
]

export const BESCHREIBUNG_MAX_LAENGE = 200
