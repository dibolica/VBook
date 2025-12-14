import axios from 'axios'
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'

export default {
  async chat(model = 'llama2', input) {
    // Ollama local API (if installed). Example: POST /api/prompt
    // Adjust to your local ollama server routes.
    const url = `${OLLAMA_HOST}/api/generate`
    const r = await axios.post(url, { model, prompt: input }, { timeout: 30000 })
    return r.data
  }
}
