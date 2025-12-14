import * as FetchServices from '../services/fetch/index.js'
import merger from '../services/merge/mergeContent.js'
import chunkText from '../services/merge/chunkText.js'
import mapSummarize from '../services/llm/mapSummarize.service.js'
import reduceSummarize from '../services/llm/reduceSummarize.service.js'
import cache from '../config/redis.js'
import logger from '../utils/logger.js'

const ComposeController = {
  async compose(req, res, next) {
    try {
      const { title, maxScenes = 8 } = req.body
      if (!title || !title.trim()) return res.status(400).json({ error: 'title required' })

      const cacheKey = `book:merged:${title.toLowerCase().trim()}`
      // try cache
      const cached = cache ? await cache.get(cacheKey) : null
      let mergedText = cached

      // fetch sources parallel
      if (!mergedText) {
        const [g, gu, w] = await Promise.allSettled([
          FetchServices.google.fetchByTitle(title),
          FetchServices.gutenberg.fetchByTitle(title),
          FetchServices.wikipedia.fetchByTitle(title)
        ])
        const google = g.status === 'fulfilled' ? g.value : { found: false }
        const gutenberg = gu.status === 'fulfilled' ? gu.value : { found: false }
        const wiki = w.status === 'fulfilled' ? w.value : { found: false }

        mergedText = merger(google, gutenberg, wiki)

        if (mergedText && mergedText.length > 80 && cache) {
          await cache.set(cacheKey, mergedText, { EX: Number(process.env.CACHE_TTL_SECONDS || 86400) })
        }

        // If insufficient content, return sources info
        if (!mergedText || mergedText.length < 80) {
          return res.json({
            ok: false,
            message: 'Insufficient public content. Use upload for full text or pick a public-domain book.',
            sources: { google: google.found, gutenberg: gutenberg.found, wiki: wiki.found }
          })
        }
      }

      // chunk -> map -> reduce
      const chunks = chunkText(mergedText, 3000)
      const chunkSummaries = await mapSummarize(chunks)
      const script = await reduceSummarize(chunkSummaries, maxScenes)

      return res.json({ ok: true, title, script })
    } catch (err) {
      logger.error('compose controller error', err)
      next(err)
    }
  }
}

export default ComposeController
