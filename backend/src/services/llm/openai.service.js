import axios from 'axios'
const OPENAI_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

export default {
  async chat(messages = [], maxTokens = 800, temperature = 0.2) {
    if (!OPENAI_KEY) throw new Error('OpenAI key not configured')
    const url = 'https://api.openai.com/v1/chat/completions'
    const r = await axios.post(url, {
      model: OPENAI_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature
    }, {
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      timeout: 30000
    })
    return r.data
  }
}
