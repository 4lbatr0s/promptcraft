import User from '../models/User.js'

// Create or update user with eventual consistency
export async function createOrUpdateUser(userData) {
  try {
    const { kindeId, email, givenName, familyName, picture, isEmailVerified } = userData
    
    // Try to find existing user
    let user = await User.findOne({ 
      $or: [{ kindeId }, { email }] 
    })
    
    if (user) {
      user.email = email
      user.givenName = givenName
      user.familyName = familyName
      user.picture = picture
      user.isEmailVerified = isEmailVerified
      user.lastLoginAt = new Date()
      user.kindeId = kindeId 
      
      await user.save()
    } else {
      user = new User({
        kindeId,
        email,
        givenName,
        familyName,
        picture,
        isEmailVerified,
        lastLoginAt: new Date()
      })
      
      await user.save()
    }
    
    return user
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error)
    throw error
  }
}

export async function findUserByKindeId(kindeId) {
  try {
    return await User.findOne({ kindeId })
  } catch (error) {
    throw error
  }
}

export async function findUserByEmail(email) {
  try {
    return await User.findOne({ email })
  } catch (error) {
    throw error
  }
}

export async function updateLastLogin(kindeId) {
  try {
    await User.findOneAndUpdate(
      { kindeId },
      { lastLoginAt: new Date() },
      { new: true }
    )
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

// Get user profile
export async function getUserProfile(kindeId) {
  try {
    const user = await User.findOne({ kindeId })
    if (!user) {
      throw new Error('User not found')
    }
    return user
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw error
  }
} 