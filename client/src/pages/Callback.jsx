import { useEffect, useState } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import urlResolver from '../lib/urlResolver.js'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch.js'

export default function Callback() {
  const { user, isAuthenticated, isLoading, error: kindeError } = useKindeAuth()
  const navigate = useNavigate()
  const authenticatedFetch = useAuthenticatedFetch()
  const [syncStatus, setSyncStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [hasSynced, setHasSynced] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Handle Kinde authentication errors
  useEffect(() => {
    if (kindeError) {
      console.error('Kinde authentication error:', kindeError)
      setSyncStatus('error')
      setErrorMessage('Authentication failed. Please try logging in again.')
    }
  }, [kindeError])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !kindeError) {
      // If not authenticated and no error, redirect to login after delay
      const timer = setTimeout(() => {
        setShouldRedirect(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, isAuthenticated, kindeError])

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/')
    }
  }, [shouldRedirect, navigate])

  const handleRetry = () => {
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1)
      setSyncStatus('loading')
      setErrorMessage('')
      setHasSynced(false)
      // Force reload to retry authentication
      window.location.reload()
    } else {
      // Too many retries, redirect to home
      navigate('/')
    }
  }

  useEffect(() => {
    const syncUser = async () => {
      if (!isAuthenticated || !user || kindeError) {
        return
      }

      try {
        const syncUrl = urlResolver.getSyncUserUrl()

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await authenticatedFetch(syncUrl, {
          method: 'POST',
          signal: controller.signal,
          body: JSON.stringify({
            kindeId: user.id,
            email: user.email,
            givenName: user.givenName,
            familyName: user.familyName,
            picture: user.picture || null,
            isEmailVerified: user.email_verified || false
          }),
        })
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          console.log('✅ User synced successfully')
          setSyncStatus('success')
          
          setTimeout(() => {
            navigate('/dashboard')
          }, 1500)
        } else {
          console.error('❌ User sync failed:', result.error)
          setSyncStatus('error')
          setErrorMessage(result.error || 'Failed to sync user data')
        }
      } catch (err) {
        console.error('❌ Network error during sync:', err)
        setSyncStatus('error')
        
        if (err.name === 'AbortError') {
          setErrorMessage('Request timed out. Please check your connection and try again.')
        } else if (err.message.includes('Failed to fetch')) {
          setErrorMessage('Cannot connect to server. Please ensure the backend is running.')
        } else {
          setErrorMessage(`Sync failed: ${err.message}`)
        }
      }
    }

    if (isAuthenticated && user && !hasSynced && !kindeError) {
      setHasSynced(true)
      syncUser()
    }
  }, [isAuthenticated, user, navigate, hasSynced, authenticatedFetch, kindeError])

  // Show loading while Kinde is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Authenticating...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment...</p>
        </div>
      </div>
    )
  }

  // If Kinde error or not authenticated after loading
  if (kindeError || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">
            {kindeError?.message || errorMessage || 'Authentication failed. Please try again.'}
          </p>
          <div className="space-y-2">
            <button
              onClick={handleRetry}
              disabled={retryCount >= 2}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2 flex items-center justify-center w-full disabled:opacity-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {retryCount >= 2 ? 'Maximum retries reached' : `Retry (${retryCount + 1}/3)`}
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center w-full"
            >
              Back to Home
            </button>
          </div>
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