import express from 'express'
import { 
  getOrCreateUser, 
  getUserProfile, 
  updateUserProfile,
  syncUserFromCallback
} from '../controllers/userController.js'
import { authMiddleware } from '../kindeAuth.js'

const router = express.Router()

router.post('/sync-user', syncUserFromCallback)

router.use(authMiddleware)

router.get('/profile', getOrCreateUser)
router.get('/profile/details', getUserProfile)
router.put('/profile', updateUserProfile)

export default router 