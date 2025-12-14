import axios from 'axios'
const COQUI_URL = process.env.COQUI_API_URL || 'http://localhost:5002'
const VOICE = process.env.COQUI_VOICE || 'alloy'

export default {
  async synthesize(text, outPath = './tmp/tts.wav') {
    // simple REST call for Coqui TTS (local server)
    const url = `${COQUI_URL}/api/tts`
    const r = await axios.post(url, { text, voice: VOICE }, { responseType: 'arraybuffer', timeout: 60000 })
    await import('fs').then(fs => fs.writeFileSync(outPath, Buffer.from(r.data)))
    return outPath
  }
}
