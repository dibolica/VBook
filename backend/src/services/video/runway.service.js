import axios from 'axios'
const RUNWAY_KEY = process.env.RUNWAY_API_KEY || ''
export default {
  async generate(scenePrompt, opts = {}) {
    // TODO: integrate Runway API
    throw new Error('Runway integration not implemented yet')
  }
}
