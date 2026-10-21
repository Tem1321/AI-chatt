
import './App.css'
import { useLayoutEffect, useRef, useState } from 'react'

type ChatMessage = {
  id: number
  text: string
}

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const maxHeight = 160

    textarea.style.height = 'auto'

    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, 40),
      maxHeight
    )

    textarea.style.height = `${nextHeight}px`
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [message])

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages, isLoading])

  async function handleSubmit() {
    const text = message.trim()

    if (!text || isLoading) return

    setMessages((previous) => [
      ...previous,
      { id: Date.now(), text },
    ])

    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(
        'http://localhost:3001/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: text }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel.')
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          text: data.reply,
        },
      ])
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Kunde inte kontakta AI-servern.'

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          text: `Fel: ${errorMessage}`,
        },
      ])
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-white">
      <section
        aria-label="Meddelandekonversation"
        className="flex-1 overflow-y-auto px-4 pt-4 pb-4"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {messages.map((item) => (
            <div
              key={item.id}
              className="flex justify-end"
            >
              <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl bg-emerald-600 px-4 py-3 text-white">
                {item.text}
              </p>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <p className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">
                Tänker...
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      <div className="shrink-0 px-4 pt-3 pb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit()
          }}
          className="mx-auto flex w-full max-w-3xl items-end gap-3 rounded-2xl border border-slate-700 bg-slate-800 p-3 shadow-lg"
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSubmit()
              }
            }}
            placeholder="Skriv ett meddelande..."
            rows={1}
            aria-label="Skriv ett meddelande"
            className="box-border block min-h-10 max-h-40 min-w-0 flex-1 resize-none overflow-y-hidden rounded-lg border-0 bg-transparent px-2 py-2 text-base leading-6 text-white outline-none placeholder:text-slate-400 focus:ring-0"
          />

          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="mb-0 shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Tänker...' : 'Skicka'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default App
