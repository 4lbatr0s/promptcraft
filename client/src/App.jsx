import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { KindeProvider } from '@kinde-oss/kinde-auth-react'
import { Toaster } from 'sonner'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import Profile from './pages/Profile.jsx'
import Callback from './pages/Callback.jsx'
import Logout from './pages/Logout.jsx'
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx'
import urlResolver from './lib/urlResolver.js'

function AppContent() {
  const kindeConfig = urlResolver.getKindeConfig()
  
  if (!kindeConfig.clientId || !kindeConfig.domain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Configuration Error
            </h1>
            <p className="text-gray-600 mb-4">
              Kinde authentication is not properly configured. Please check your environment variables:
            </p>
            <div className="text-left bg-gray-100 p-4 rounded-md text-sm">
              <p className="font-semibold text-red-600">Missing:</p>
              <ul className="list-disc list-inside mt-2 text-gray-700">
                <li>VITE_KINDE_CLIENT_ID</li>
                <li>VITE_KINDE_DOMAIN</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Copy env.example to .env and fill in your Kinde credentials.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <AuthenticatedLayout currentPageName="Dashboard">
            <Dashboard />
          </AuthenticatedLayout>
        } />
        <Route path="/history" element={
          <AuthenticatedLayout currentPageName="History">
            <History />
          </AuthenticatedLayout>
        } />
        <Route path="/profile" element={
          <AuthenticatedLayout currentPageName="Profile">
            <Profile />
          </AuthenticatedLayout>
        } />
        <Route path="/callback" element={<Callback />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151'
          }
        }}
      />
    </Router>
  )
}

function App() {
  const kindeConfig = urlResolver.getKindeConfig()
  return (
    <KindeProvider
      clientId={kindeConfig.clientId}
      domain={kindeConfig.domain}
      redirectUri={kindeConfig.redirectUri}
      logoutUri={kindeConfig.logoutUri} 
      scope="openid profile email"
      audience={kindeConfig.audience}
    >
      <AppContent />
    </KindeProvider>
  )
}

export default App 