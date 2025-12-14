// Very small in-memory rate limiter for demo purposes
const windowMs = 1000 * 10
const maxRequests = 40
const map = new Map()

export default function rateLimit(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'local'
  const now = Date.now()
  const entry = map.get(ip) || { ts: now, count: 0 }
  if (now - entry.ts > windowMs) {
    entry.ts = now
    entry.count = 1
    map.set(ip, entry)
    return next()
  }
  entry.count++
  map.set(ip, entry)
  if (entry.count > maxRequests) {
    return res.status(429).json({ error: 'rate_limited' })
  }
  next()
}
