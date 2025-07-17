import crypto from 'crypto'
import { createOrUpdateUser, findUserByKindeId } from '../services/userService.js'
import pino from "pino";
const logger = pino();

// Verify Kinde webhook signature
function verifyWebhookSignature(payload, signature, secret) {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    logger.error('Webhook signature verification error:', error)
    return false
  }
}

export const handleUserCreated = async (req, res) => {
  try {
    const { user } = req.body
    
    if (!user || !user.id || !user.email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user data in webhook' 
      })
    }
    
    const userData = {
      kindeId: user.id,
      email: user.email,
      givenName: user.given_name,
      familyName: user.family_name,
      picture: user.picture,
      isEmailVerified: user.email_verified || false
    }
    
    await createOrUpdateUser(userData)
    
    res.json({ success: true, message: 'User created/updated successfully' })
  } catch (error) {
    logger.error('Error handling user.created webhook:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process user creation' 
    })
  }
}

export const handleUserUpdated = async (req, res) => {
  try {
    const { user } = req.body
    
    if (!user || !user.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user data in webhook' 
      })
    }
    
    const userData = {
      kindeId: user.id,
      email: user.email,
      givenName: user.given_name,
      familyName: user.family_name,
      picture: user.picture,
      isEmailVerified: user.email_verified || false
    }
    
    await createOrUpdateUser(userData)
    
    res.json({ success: true, message: 'User updated successfully' })
  } catch (error) {
    logger.error('Error handling user.updated webhook:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process user update' 
    })
  }
}

// Handle user.deleted webhook
export const handleUserDeleted = async (req, res) => {
  try {
    const { user } = req.body
    
    if (!user || !user.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user data in webhook' 
      })
    }
    
    // For now, we'll just log the deletion
    // In production, you might want to soft delete or archive the user
    logger.info(`User deleted: ${user.id}`)
    
    res.json({ success: true, message: 'User deletion logged' })
  } catch (error) {
    logger.error('Error handling user.deleted webhook:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process user deletion' 
    })
  }
}

// Main webhook handler
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-kinde-signature']
    const webhookSecret = process.env.KINDE_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      logger.error('KINDE_WEBHOOK_SECRET not configured')
      return res.status(500).json({ 
        success: false, 
        error: 'Webhook secret not configured' 
      })
    }
    
    const payload = JSON.stringify(req.body)
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      logger.error('Invalid webhook signature')
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid signature' 
      })
    }
    
    const { type } = req.body
    
    switch (type) {
      case 'user.created':
        return await handleUserCreated(req, res)
      case 'user.updated':
        return await handleUserUpdated(req, res)
      case 'user.deleted':
        return await handleUserDeleted(req, res)
      default:
        logger.info(`Unhandled webhook type: ${type}`)
        return res.status(200).json({ 
          success: true, 
          message: 'Webhook received but not handled' 
        })
    }
  } catch (error) {
    logger.error('Error handling webhook:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
} 