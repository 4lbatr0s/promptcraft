import { 
  findUserByKindeId, 
  createOrUpdateUser, 
  updateLastLogin
} from '../services/userService.js'

export const syncUserFromCallback = async (req, res) => {
  try {
    const { kindeId, email, givenName, familyName, picture, isEmailVerified } = req.body
    
    if (!kindeId || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'kindeId and email are required' 
      })
    }
    
    const user = await createOrUpdateUser({
      kindeId,
      email,
      givenName,
      familyName,
      picture,
      isEmailVerified: isEmailVerified || false
    })
    
    console.log(`User synced via callback: ${email}`)
    
    res.json({ 
      success: true, 
      data: user,
      message: 'User synchronized successfully'
    })
  } catch (error) {
    console.error('Error in syncUserFromCallback:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync user from callback' 
    })
  }
}

// Get or create user profile (fallback for eventual consistency)
export const getOrCreateUser = async (req, res) => {
  try {
    const { kindeId, email, givenName, familyName, picture, isEmailVerified } = req.user
    
    // Try to find user in our database
    let user = await findUserByKindeId(kindeId)
    
    if (!user) {
      // User doesn't exist in our database - create them
      // This handles the case where webhook failed or user registered before webhook was set up
      const userData = {
        kindeId,
        email,
        givenName,
        familyName,
        picture,
        isEmailVerified: isEmailVerified || false
      }
      
      user = await createOrUpdateUser(userData)
      console.log(`Created user via fallback: ${email}`)
    } else {
      // Update last login time
      await updateLastLogin(kindeId)
    }
    
    res.json({ 
      success: true, 
      data: user 
    })
  } catch (error) {
    console.error('Error in getOrCreateUser:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get or create user' 
    })
  }
}

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { kindeId } = req.user
    
    const user = await findUserByKindeId(kindeId)
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      })
    }
    
    res.json({ 
      success: true, 
      data: user 
    })
  } catch (error) {
    console.error('Error getting user profile:', error)
    res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    })
  }
}

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { kindeId } = req.user
    const { givenName, familyName, picture } = req.body
    
    const user = await findUserByKindeId(kindeId)
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      })
    }
    
    // Update only allowed fields
    if (givenName !== undefined) user.givenName = givenName
    if (familyName !== undefined) user.familyName = familyName
    if (picture !== undefined) user.picture = picture
    
    await user.save()
    
    res.json({ 
      success: true, 
      data: user 
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user profile' 
    })
  }
} 