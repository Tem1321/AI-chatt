
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const app = express()
const port = Number(process.env.PORT) || 3001

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY saknas i server/.env')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '20kb' }))

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

    const response = await openai.responses.create({
      model: 'gpt-6-luna',
      instructions: 'Du är en hjälpsam AI-assistent.',
      input: message.trim(),
    })

    res.json({ reply: response.output_text })
  } catch (error) {
    console.error('AI-anrop misslyckades:', error)
    res.status(500).json({
      error: 'Kunde inte få svar från AI-modellen. Försök igen.',
    })
  }
})

app.listen(port, () => {
  console.log(`AI-servern körs på http://localhost:${port}`)
})
