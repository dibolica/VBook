import axios from 'axios'
import { clean } from '../merge/cleanText.js'

export default {
  async fetchByTitle(title) {
    try {
      const q = encodeURIComponent(title)
      const url = `https://gutendex.com/books?search=${q}`
      const r = await axios.get(url, { timeout: 8000 })
      const results = (r.data && r.data.results) || []
      if (!results.length) return { found: false }
      const book = results[0]
      const plain = book.formats && (book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'])
      if (!plain) return { found: true, meta: book, text: null }
      const txt = await axios.get(plain, { timeout: 15000 }).then(r => r.data).catch(() => null)
      return { found: true, meta: book, text: txt ? clean(txt) : null }
    } catch (err) {
      return { found: false }
    }
  }
}
