import axios from 'axios'
const GEMINI_KEY = process.env.GOOGLE_GEMINI_API_KEY
const GEMINI_ENDPOINT = process.env.GOOGLE_GEMINI_ENDPOINT || ''

export default {
  async chat(prompt) {
    // This is a placeholder - depending on your Gemini access path you may use
    // Google Cloud's generative API (requires service account/endpoint).
    // Here we implement a simple POST wrapper. Configure GEMINI_ENDPOINT in .env.
    if (!GEMINI_ENDPOINT || !GEMINI_KEY) throw new Error('Gemini not configured')
    const r = await axios.post(GEMINI_ENDPOINT, { prompt }, {
      headers: { Authorization: `Bearer ${GEMINI_KEY}` },
      timeout: 30000
    })
    return r.data
  }
}
