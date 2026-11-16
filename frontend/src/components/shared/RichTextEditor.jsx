import { useEffect, useRef } from 'react'
import { isRichTextEmpty, stripRichTextPlain } from '../../utils/richText'

function ToolbarButton({ label, title, onAction, children }) {
  return (
    <button
      type="button"
      className="rich-text-toolbar-btn"
      aria-label={label}
      title={title}
      onMouseDown={e => e.preventDefault()}
      onClick={onAction}
    >
      {children}
    </button>
  )
}

/**
 * Rich-Text-Eingabe: fett, kursiv, unterstrichen, Listen (Bullet / nummeriert).
 */
export default function RichTextEditor({
  id,
  label,
  value = '',
  onChange,
  required = false,
  placeholder = '',
  minHeight = '120px',
  maxPlainLength,
  describedBy,
  className = '',
}) {
  const editorRef = useRef(null)
  const skipSyncRef = useRef(false)
  const selectionRef = useRef(null)

  useEffect(() => {
    const el = editorRef.current
    if (!el || skipSyncRef.current) return
    if (document.activeElement === el) return
    const current = el.innerHTML
    const next = value || ''
    if (current !== next) {
      el.innerHTML = next
    }
  }, [value])

  useEffect(() => {
    function saveSelection() {
      const sel = window.getSelection()
      const el = editorRef.current
      if (!sel?.rangeCount || !el?.contains(sel.anchorNode)) return
      selectionRef.current = sel.getRangeAt(0).cloneRange()
    }
    document.addEventListener('selectionchange', saveSelection)
    return () => document.removeEventListener('selectionchange', saveSelection)
  }, [])

  function syncFromEditor() {
    const html = editorRef.current?.innerHTML || ''
    skipSyncRef.current = true
    onChange(html)
    requestAnimationFrame(() => {
      skipSyncRef.current = false
    })
  }

  function restoreSelection() {
    const el = editorRef.current
    const sel = window.getSelection()
    if (!el || !sel) return false

    if (selectionRef.current) {
      sel.removeAllRanges()
      sel.addRange(selectionRef.current)
      return true
    }

    if (sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
      return true
    }

    const range = document.createRange()
    if (el.childNodes.length === 0) {
      range.setStart(el, 0)
      range.collapse(true)
    } else {
      range.selectNodeContents(el)
      range.collapse(false)
    }
    sel.removeAllRanges()
    sel.addRange(range)
    selectionRef.current = range.cloneRange()
    return true
  }

  function exec(command) {
    const el = editorRef.current
    if (!el) return

    el.focus()
    restoreSelection()

    if (isRichTextEmpty(el.innerHTML)) {
      document.execCommand('insertParagraph', false, null)
    }

    document.execCommand(command, false, null)
    syncFromEditor()
  }

  function handleInput() {
    const html = editorRef.current?.innerHTML || ''
    if (maxPlainLength && stripRichTextPlain(html).length > maxPlainLength) {
      return
    }
    syncFromEditor()
  }

  const plainLen = stripRichTextPlain(value).length
  const empty = isRichTextEmpty(value)

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className={required ? 'form-label form-label-required' : 'form-label'}
        >
          {label}
        </label>
      )}
      <div className="rich-text-editor-wrap">
        <div className="rich-text-toolbar" role="toolbar" aria-label={`Formatierung: ${label || id}`}>
          <ToolbarButton label="Fett" title="Fett" onAction={() => exec('bold')}>
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton label="Kursiv" title="Kursiv" onAction={() => exec('italic')}>
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton label="Unterstrichen" title="Unterstrichen" onAction={() => exec('underline')}>
            <span className="underline">U</span>
          </ToolbarButton>
          <span className="rich-text-toolbar-sep" aria-hidden="true" />
          <ToolbarButton label="Aufzählung" title="Liste mit Bulletpoints" onAction={() => exec('insertUnorderedList')}>
            •≡
          </ToolbarButton>
          <ToolbarButton label="Nummerierte Liste" title="Nummerierte Liste" onAction={() => exec('insertOrderedList')}>
            1.
          </ToolbarButton>
        </div>
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          contentEditable
          suppressContentEditableWarning
          aria-multiline="true"
          aria-required={required ? 'true' : undefined}
          aria-describedby={describedBy}
          data-placeholder={placeholder}
          className={`rich-text-editor ${empty ? 'rich-text-editor-empty' : ''}`}
          style={{ minHeight }}
          onInput={handleInput}
          onBlur={syncFromEditor}
        />
      </div>
      {maxPlainLength != null && (
        <p className="text-xs text-jhh-text-light mt-1" id={describedBy}>
          {plainLen} / {maxPlainLength} Zeichen (ohne Formatierung)
        </p>
      )}
    </div>
  )
}
