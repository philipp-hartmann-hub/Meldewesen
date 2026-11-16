import { looksLikeHtml, sanitizeRichTextHtml } from '../../utils/richText'

/**
 * Anzeige formatierter Texte (Sachverhalt, Zeugenaussagen, …).
 */
export default function RichTextDisplay({ html, className = '' }) {
  if (!html) return null

  if (!looksLikeHtml(html)) {
    return (
      <div className={`rich-text-display whitespace-pre-wrap ${className}`.trim()}>
        {html}
      </div>
    )
  }

  return (
    <div
      className={`rich-text-display ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(html) }}
    />
  )
}
