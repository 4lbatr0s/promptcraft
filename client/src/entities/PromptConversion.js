import urlResolver from '../lib/urlResolver.js'

export class PromptConversion {
  static async list(sortBy = "-created_date", limit = 50) {
    try {
      const response = await fetch(`${urlResolver.getHistoryUrl()}?sort=${sortBy}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversions')
      }
      
      const data = await response.json()
      return data.success ? data.data : []
    } catch (error) {
      console.error('Error fetching conversions:', error)
      return []
    }
  }

  static async delete(id) {
    try {
      const response = await fetch(`${urlResolver.getHistoryUrl()}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json'
        }
      })
      
      return response.ok
    } catch (error) {
      console.error('Error deleting conversion:', error)
      return false
    }
  }

  static async getToken() {
    // This will be handled by the authenticated fetch hook in components
    // For static methods, we'll need to get the token from the auth context
    return localStorage.getItem('auth_token') || ''
  }
} 