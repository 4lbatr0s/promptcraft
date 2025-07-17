import express from 'express'
import { convertPrompt, convertPromptStream, getHistory } from '../controllers/promptController.js'
import { authMiddleware } from '../kindeAuth.js'

const router = express.Router()

router.use(authMiddleware)

// Original non-streaming route
router.post('/convert-prompt', convertPrompt)

// New streaming route
router.post('/convert-prompt/stream', convertPromptStream)

// History route
router.get('/history', getHistory)

export default router