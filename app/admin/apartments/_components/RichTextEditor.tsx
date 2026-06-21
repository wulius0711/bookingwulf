'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

export default function RichTextEditor({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue || '',
    immediatelyRender: false,
  })

  useEffect(() => {
    return () => { editor?.destroy() }
  }, [editor])

  const html = editor?.getHTML() ?? defaultValue ?? ''

  return (
    <div>
      <input type="hidden" name={name} value={html} />

      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 4, padding: '6px 8px',
        border: '1px solid var(--border)', borderBottom: 'none',
        borderRadius: '8px 8px 0 0', background: 'var(--surface-3)',
      }}>
        {[
          { label: 'B', title: 'Fett', action: () => editor?.chain().focus().toggleBold().run(), active: () => !!editor?.isActive('bold') },
          { label: 'I', title: 'Kursiv', action: () => editor?.chain().focus().toggleItalic().run(), active: () => !!editor?.isActive('italic') },
          { label: '≡', title: 'Aufzählung', action: () => editor?.chain().focus().toggleBulletList().run(), active: () => !!editor?.isActive('bulletList') },
        ].map(btn => (
          <button
            key={btn.label}
            type="button"
            title={btn.title}
            onMouseDown={e => { e.preventDefault(); btn.action(); }}
            style={{
              width: 28, height: 28, borderRadius: 4, border: '1px solid var(--border)',
              background: btn.active() ? 'var(--accent)' : 'transparent',
              color: btn.active() ? '#fff' : 'var(--text-primary)',
              fontWeight: 700, fontSize: btn.label === '≡' ? 16 : 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="rte-wrap" style={{
        border: '1px solid var(--border)', borderRadius: '0 0 8px 8px',
        background: 'var(--surface-2)',
      }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
