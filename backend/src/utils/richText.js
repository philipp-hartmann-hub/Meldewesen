/** Plaintext aus HTML (Node, Validierung). */
export function stripRichTextPlain(html) {
  if (!html) return ''
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isRichTextEmpty(html) {
  return !stripRichTextPlain(html)
}
