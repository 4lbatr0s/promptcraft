import urlResolver from '../lib/urlResolver.js'

export class User {
  static async me() {
    try {
      const response = await fetch(urlResolver.getProfileUrl(), {
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      
      const data = await response.json()
      return data.success ? data.data : null
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  static async updateMyUserData(userData) {
    try {
      const response = await fetch(urlResolver.getProfileUrl(), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update user data')
      }
      
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('Error updating user data:', error)
      return false
    }
  }

  static async loginWithRedirect(redirectUrl) {
    // This will be handled by Kinde auth
    window.location.href = redirectUrl
  }

  static async logout() {
    // This will be handled by Kinde auth
    localStorage.removeItem('auth_token')
    window.location.href = '/'
  }

  static async getToken() {
    // This will be handled by the authenticated fetch hook in components
    return localStorage.getItem('auth_token') || ''
  }
} 