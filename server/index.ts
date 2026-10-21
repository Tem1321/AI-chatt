import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const app = express()
const port = Number(process.env.PORT) || 3001

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('KEY saknas i server/.env')
}

const openai = new OpenAI({ apiKey })

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '20kb' }))

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'AI-servern körs.' })
})

app.post('/api/chat', async (req, res) => {
  try {
    const message = req.body?.message

    if (typeof message !== 'string' || !message.trim()) {
      res.status(400).json({
        error: 'Skriv ett meddelande.',
      })
      return
    }

    if (message.length > 10000) {
      res.status(400).json({
        error: 'Meddelandet är för långt.',
      })
      return
    }

    const response = await openai.responses.create({
      model: 'gpt-6-luna',
      instructions: 'Du är en hjälpsam AI-assistent. Svara på svenska när användaren skriver på svenska.',
      input: message.trim(),
    })

    res.json({
      reply: response.output_text || 'AI-modellen gav inget textbaserat svar.',
    })
  } catch (error) {
    console.error('AI-anrop misslyckades:')

    if (error instanceof OpenAI.APIError) {
      console.error('HTTP-status:', error.status)
      console.error('Felkod:', error.code)
      console.error('Typ:', error.type)
      console.error('Meddelande:', error.message)

      res.status(500).json({
        error: `OpenAI API-fel (${error.status ?? 'okänd status'}): ${error.message}`,
      })
      return
    }

    console.error(error)

    res.status(500).json({
      error: 'Ett oväntat serverfel inträffade. Kontrollera backend-terminalen.',
    })
  }
})

app.listen(port, () => {
  console.log(`AI-servern körs på http://localhost:${port}`)
})
