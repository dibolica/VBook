import axios from 'axios'
import { clean } from '../merge/cleanText.js'

export default {
  async fetchByTitle(title) {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(title)}&limit=3&format=json`
      const s = await axios.get(searchUrl, { timeout: 8000 }).then(r => r.data).catch(() => null)
      if (!s || !s[1] || !s[1].length) return { found: false }
      const pageTitle = s[1][0]
      const extractUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
      const extractData = await axios.get(extractUrl, { timeout: 8000 }).then(r => r.data).catch(() => null)
      if (!extractData) return { found: false }
      return { found: true, title: pageTitle, extract: clean(extractData.extract || '') }
    } catch (err) {
      return { found: false }
    }
  }
}
