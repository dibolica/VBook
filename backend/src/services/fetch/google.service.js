import axios from 'axios'
import { clean } from '../../services/merge/cleanText.js'

const GOOGLE_KEY = process.env.GOOGLE_BOOKS_KEY || ''

export default {
  async fetchByTitle(title) {
    try {
      const q = encodeURIComponent(`intitle:${title}`)
      const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5${GOOGLE_KEY ? `&key=${GOOGLE_KEY}` : ''}`
      const r = await axios.get(url, { timeout: 8000 })
      const items = (r.data && r.data.items) || []
      if (!items.length) return { found: false }
      const best = items[0]
      return {
        found: true,
        metadata: {
          title: best.volumeInfo.title,
          authors: best.volumeInfo.authors || [],
          publisher: best.volumeInfo.publisher,
          publishedDate: best.volumeInfo.publishedDate,
          pageCount: best.volumeInfo.pageCount,
          identifiers: best.volumeInfo.industryIdentifiers || []
        },
        snippet: clean((best.searchInfo && best.searchInfo.textSnippet) || '')
      }
    } catch (err) {
      return { found: false }
    }
  }
}
