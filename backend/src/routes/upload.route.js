import express from 'express'
import UploadController from '../controllers/upload.controller.js'
const router = express.Router()

// POST /api/upload
router.post('/', UploadController.upload)

export default router
