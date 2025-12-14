import express from 'express'
import ComposeController from '../controllers/composeBook.controller.js'
const router = express.Router()

// POST /api/compose-book
router.post('/', ComposeController.compose)

export default router
