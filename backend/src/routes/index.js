import express from 'express'
import composeBookRoute from './composeBook.route.js'
import uploadRoute from './upload.route.js'
const router = express.Router()

router.use('/compose-book', composeBookRoute)
router.use('/upload', uploadRoute)

export default router
