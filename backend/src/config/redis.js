import { createClient } from 'redis'
import logger from '../utils/logger.js'

const REDIS_URL = process.env.REDIS_URL || ''
let client = null
if (REDIS_URL) {
  client = createClient({ url: REDIS_URL })
  client.on('error', (err) => logger.error('Redis error', err))
  client.connect().catch(e => logger.error('Redis connect failed', e))
}

export default {
  async get(k) {
    if (!client) return null
    return client.get(k)
  },
  async set(k, v, opts = {}) {
    if (!client) return null
    if (opts.EX) return client.set(k, v, { EX: opts.EX })
    return client.set(k, v)
  }
}
