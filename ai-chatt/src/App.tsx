
import './App.css'
import { useLayoutEffect, useRef, useState } from 'react'

function App() {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Återställ höjden innan vi mäter innehållet.
    textarea.style.height = '0px'

    const maxHeight = 160
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)

    textarea.style.height = `${Math.max(newHeight, 40)}px`
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [message])

  function handleSubmit() {
    if (!message.trim()) return

    console.log(message)
    setMessage('')
    textareaRef.current?.focus()
  }

  return (
    <main className="min-h-screen">
      <div className="fixed bottom-0 left-0 z-10 w-full p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-slate-700 bg-slate-800 p-3 shadow-lg">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Skriv ett meddelande..."
            rows={1}
            className="block min-h-10 max-h-40 flex-1 resize-none overflow-y-hidden bg-transparent px-2 py-2 leading-6 text-white outline-none placeholder:text-slate-400"
          />

          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Skicka
          </button>
        </div>
      </div>
    </main>
  )
}

export default App
