import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, LogOut } from 'lucide-react'

export default function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to homepage after a short delay
    const timer = setTimeout(() => {
      navigate('/')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
          <LogOut className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Successfully Logged Out
        </h2>
        <p className="text-gray-600 mb-4">
          You have been logged out successfully.
        </p>
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Redirecting to homepage...</span>
        </div>
      </div>
    </div>
  )
} 