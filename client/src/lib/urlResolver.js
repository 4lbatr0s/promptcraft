class UrlResolver {
  constructor() {
    this.config = this.getEnvironmentConfig()
  }

  getEnvironmentConfig() {
    const env = import.meta.env.MODE
    const isDev = env === 'development'
    const isProd = env === 'production'

    // Development environment
    if (isDev) {
      return {
        apiBaseUrl: 'http://localhost:8080/api',
        kindeRedirectUri: 'http://localhost:5173/callback',
        kindeDomain: import.meta.env.VITE_KINDE_DOMAIN || '',
        kindeClientId: import.meta.env.VITE_KINDE_CLIENT_ID || '',
        kindeLogoutUri: import.meta.env.VITE_KINDE_LOGOUT_URI || '',
        audience: import.meta.env.VITE_KINDE_AUDIENCE || ''
      }
    }

    // Production environment
    if (isProd) {
      return {
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://your-api-domain.com/api',
        kindeRedirectUri: import.meta.env.VITE_KINDE_REDIRECT_URI || 'https://your-domain.com/callback',
        kindeDomain: import.meta.env.VITE_KINDE_DOMAIN || '',
        kindeClientId: import.meta.env.VITE_KINDE_CLIENT_ID || '',
        kindeLogoutUri: import.meta.env.VITE_KINDE_LOGOUT_URI,
        audience: import.meta.env.VITE_KINDE_AUDIENCE || '',
      }
    }

    // Staging environment (if needed)
    return {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://staging-api.your-domain.com/api',
      kindeRedirectUri: import.meta.env.VITE_KINDE_REDIRECT_URI || 'https://staging.your-domain.com/callback',
      kindeDomain: import.meta.env.VITE_KINDE_DOMAIN || '',
      kindeClientId: import.meta.env.VITE_KINDE_CLIENT_ID || '',
      kindeLogoutUri: import.meta.env.VITE_KINDE_LOGOUT_URI || '',
      audience: import.meta.env.VITE_KINDE_AUDIENCE || ''
    }
  }

  getApiUrl(endpoint) {
    return `${this.config.apiBaseUrl}${endpoint}`
  }

  getSyncUserUrl() {
    return this.getApiUrl('/sync-user')
  }

  getConvertPromptUrl() {
    return this.getApiUrl('/convert-prompt')
  }

  getConvertPromptStreamUrl() {
    return this.getApiUrl('/convert-prompt/stream')
  }

  getHistoryUrl() {
    return this.getApiUrl('/history')
  }

  getProfileUrl() {
    return this.getApiUrl('/profile')
  }

  getProtectedUrl() {
    return this.getApiUrl('/protected')
  }

  getKindeConfig() {
    return {
      clientId: this.config.kindeClientId,
      domain: this.config.kindeDomain,
      redirectUri: this.config.kindeRedirectUri,
      logoutUri: this.config.kindeLogoutUri,
      audience: this.config.audience
    }
  }

  getEnvironment() {
    return import.meta.env.MODE
  }

  isDevelopment() {
    return this.getEnvironment() === 'development'
  }

  isProduction() {
    return this.getEnvironment() === 'production'
  }

  getConfig() {
    return { ...this.config }
  }
}

const urlResolver = new UrlResolver()

export default urlResolver 