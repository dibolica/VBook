import express from 'express'
import dotenv from 'dotenv'
import createApp from './app.js'
dotenv.config()

const PORT = process.env.PORT || 3000
const app = createApp()

app.listen(PORT, () => {
  console.log(`vbook-backend listening on port ${PORT}`)
})
