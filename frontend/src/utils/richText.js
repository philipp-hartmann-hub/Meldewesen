/** Erlaubte HTML-Tags für Rich-Text (Prototyp). */
const ALLOWED_TAGS = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'DIV'])

export function looksLikeHtml(value) {
  return /<[a-z][\s\S]*>/i.test(String(value || ''))
}

/** Plaintext aus HTML (Validierung, Längenlimits). */
export function stripRichTextPlain(html) {
  if (!html) return ''
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div')
    tmp.innerHTML = String(html)
    return (tmp.textContent || tmp.innerText || '').replace(/\u00a0/g, ' ').trim()
  }
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isRichTextEmpty(html) {
  return !stripRichTextPlain(html)
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName
  if (!ALLOWED_TAGS.has(tag)) {
    return Array.from(node.childNodes).map(sanitizeNode).join('')
  }

  const inner = Array.from(node.childNodes).map(sanitizeNode).join('')
  if (tag === 'BR') return '<br>'
  return `<${tag.toLowerCase()}>${inner}</${tag.toLowerCase()}>`
}

/** Whitelist-Sanitizer für Anzeige (Browser). */
export function sanitizeRichTextHtml(html) {
  if (!html) return ''
  if (!looksLikeHtml(html)) return escapeHtml(String(html))

  const tmp = document.createElement('div')
  tmp.innerHTML = String(html)
  return Array.from(tmp.childNodes).map(sanitizeNode).join('')
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
