import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useCallback } from 'react'

export const useAuthenticatedFetch = () => {
  const { getToken, isAuthenticated } = useKindeAuth()
  
  const authenticatedFetch = useCallback(async (url, options = {}) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }
    
    try {
      const token = await getToken()
      
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Error getting token:', error)
      throw new Error('Failed to authenticate request')
    }
  }, [getToken, isAuthenticated])
  
  return authenticatedFetch
} 