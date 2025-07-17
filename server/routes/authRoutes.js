import express from 'express'
import { protectedRoute } from '../controllers/authController.js'
import { authMiddleware } from '../kindeAuth.js'

const router = express.Router()

router.get('/protected', authMiddleware, protectedRoute)

export default router 