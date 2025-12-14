import express from 'express'
import routes from './routes/index.js'
import errorHandler from './middleware/errorHandler.js'
import rateLimitMiddleware from './middleware/rateLimit.js'
import './config/env.js' // loads env

export default function createApp() {
  const app = express()
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))

  // basic rate limiting middleware
  app.use(rateLimitMiddleware)

  // mount routes
  app.use('/api', routes)

  // health
  app.get('/health', (req, res) => res.json({ ok: true }))

  // error handler
  app.use(errorHandler)

  return app
}
