import { useEffect, useState } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import urlResolver from '../lib/urlResolver.js'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch.js'

export default function Callback() {
  const { user, isAuthenticated, isLoading } = useKindeAuth()
  const navigate = useNavigate()
  const authenticatedFetch = useAuthenticatedFetch()
  const [syncStatus, setSyncStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [hasSynced, setHasSynced] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShouldRedirect(true)
    }
  }, [isLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/dashboard')
    }
  }, [shouldRedirect, navigate])

  useEffect(() => {
    const syncUser = async () => {
      if (!isAuthenticated || !user) {
        return
      }

      try {
        const syncUrl = urlResolver.getSyncUserUrl()

        // Check if the backend is reachable first
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await authenticatedFetch(syncUrl, {
          method: 'POST',
          body: JSON.stringify({
            kindeId: user.id,
            email: user.email,
            givenName: user.givenName,
            familyName: user.familyName,
            picture: null,
            isEmailVerified: false
          }),
        })
        clearTimeout(timeoutId)
        const result = await response.json()
        
        if (result.success) {
          console.log('✅ User synced successfully')
          setSyncStatus('success')
          
          // Redirect to main app after a short delay
          setTimeout(() => {
            navigate('/')
          }, 1500)
        } else {
          console.error('❌ User sync failed:', result.error)
          setSyncStatus('error')
          setErrorMessage(result.error || 'Failed to sync user')
        }
      } catch (err) {
        console.error('❌ Network error during sync:', err)
        setSyncStatus('error')
        
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setErrorMessage('Request timed out. Please check if the backend server is running.')
          } else if (err.message.includes('CORS')) {
            setErrorMessage('CORS error. Please ensure the backend server is running and configured properly.')
          } else if (err.message.includes('Failed to fetch')) {
            setErrorMessage('Cannot connect to backend server. Please ensure it is running on port 8080.')
          } else {
            setErrorMessage('Network error. Please try again.')
          }
        } else {
          setErrorMessage('Unknown error occurred.')
        }
      }
    }

    // Only sync if we have user data and haven't synced yet
    if (isAuthenticated && user && !hasSynced) {
      setHasSynced(true)
      syncUser()
    }
  }, [isAuthenticated, user, navigate, hasSynced, authenticatedFetch])

  // Show loading while Kinde is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {syncStatus === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Setting up your account...
              </h2>
              <p className="text-gray-600">
                Syncing your profile with our system
              </p>
            </>
          )}

          {syncStatus === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome aboard!
              </h2>
              <p className="text-gray-600">
                Your account has been set up successfully. Redirecting...
              </p>
            </>
          )}

          {syncStatus === 'error' && (
            <>
              <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Setup Error
              </h2>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2 flex items-center justify-center w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center w-full"
                >
                  Continue Anyway
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 