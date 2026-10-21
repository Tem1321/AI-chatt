
import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const port = Number(process.env.PORT) || 3001


const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat'
const MODEL = 'gemma4:e2b'

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '20kb' }))

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'AI-servern körs med Ollama.',
  })
})

app.post('/api/chat', async (req, res) => {
  try {
    const message = req.body?.message

    if (typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Skriv ett meddelande.' })
      return
    }

    if (message.length > 10000) {
      res.status(400).json({ error: 'Meddelandet är för långt.' })
      return
    }

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Du är en hjälpsam AI-assistent.',
          },
          {
            role: 'user',
            content: message.trim(),
          },
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorDetails = await response.text()
      console.error('Ollama API-fel:', response.status, errorDetails)

      res.status(502).json({
        error:
          'Kunde inte få svar från Ollama. Kontrollera att Ollama körs och att modellen är installerad.',
      })
      return
    }

    const data = (await response.json()) as {
      message?: { content?: string }
    }

    const reply = data.message?.content

    if (!reply) {
      res.status(502).json({
        error: 'Ollama returnerade inget textsvar.',
      })
      return
    }

    res.json({ reply })
  } catch (error) {
    console.error('Anrop till Ollama misslyckades:', error)

    res.status(500).json({
      error:
        'Kunde inte ansluta till Ollama. Kontrollera att Ollama är installerat och körs.',
    })
  }
})

app.listen(port, () => {
  console.log(`AI-servern körs på http://localhost:${port}`)
  console.log(`AI-modell: ${MODEL}`)
})
