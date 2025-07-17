import express from 'express'
import { handleWebhook } from '../controllers/webhookController.js'

const router = express.Router()

// Webhook endpoint - no authentication required
router.post('/webhook', handleWebhook)

export default router 