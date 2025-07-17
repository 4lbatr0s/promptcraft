export function createPageUrl(pageName) {
  const baseUrl = window.location.origin
  const pageRoutes = {
    'Dashboard': '/dashboard',
    'History': '/history',
    'Profile': '/profile',
    'Landing': '/'
  }
  
  return `${baseUrl}${pageRoutes[pageName] || '/'}`
} 