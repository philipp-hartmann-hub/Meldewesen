/** Prüft, ob eine Datei als Bild in der Vorschau angezeigt werden kann. */
export function istBildDatei(mimeType, dateiname = '') {
  const mime = String(mimeType || '').toLowerCase()
  if (mime.startsWith('image/')) return true
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(String(dateiname))
}
