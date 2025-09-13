// Telegram URL Authorization Utility
// Based on https://core.telegram.org/bots/webapps#authorizing-by-url

/**
 * Telegram URL Authorization Service
 * Handles autologin tokens and URL-based authentication
 */
export const telegramURLAuth = {
  /**
   * Get current autologin token
   * In production, this would come from Telegram MTProto API
   */
  getAutologinToken() {
    // Demo implementation - in production this would be fetched from Telegram
    const mockToken = `mock_autologin_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    console.log('🔧 Generated mock autologin token:', mockToken)
    return mockToken
  },

  /**
   * Validate if autologin token is still valid
   * Tokens are valid for 10000 seconds according to Telegram docs
   */
  isTokenValid(token) {
    if (!token) return false
    
    // Extract timestamp from mock token
    const match = token.match(/mock_autologin_(\d+)_/)
    if (!match) return false
    
    const tokenTime = parseInt(match[1])
    const currentTime = Date.now()
    const maxAge = 10000 * 1000 // 10000 seconds in milliseconds
    
    return (currentTime - tokenTime) < maxAge
  },

  /**
   * Create autologin URL
   * Appends autologin_token to the provided URL
   */
  createAutologinURL(baseUrl, extraParams = {}) {
    try {
      const token = this.getAutologinToken()
      const url = new URL(baseUrl)
      
      // Add extra parameters first
      Object.entries(extraParams).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
      
      // Add autologin token
      url.searchParams.set('autologin_token', token)
      
      console.log('🔗 Created autologin URL:', url.toString())
      return url.toString()
    } catch (error) {
      console.error('❌ Error creating autologin URL:', error)
      return baseUrl
    }
  },

  /**
   * Extract autologin token from URL
   */
  extractTokenFromURL(url) {
    try {
      const urlObj = new URL(url)
      return urlObj.searchParams.get('autologin_token')
    } catch (error) {
      console.error('❌ Error extracting token from URL:', error)
      return null
    }
  },

  /**
   * Remove autologin token from URL for security
   */
  cleanURL(url) {
    try {
      const urlObj = new URL(url)
      urlObj.searchParams.delete('autologin_token')
      return urlObj.toString()
    } catch (error) {
      console.error('❌ Error cleaning URL:', error)
      return url
    }
  },

  /**
   * Process URL for autologin
   * Extracts token, validates it, and cleans the URL
   */
  processAutologinURL(url) {
    const token = this.extractTokenFromURL(url)
    const isValid = this.isTokenValid(token)
    const cleanUrl = this.cleanURL(url)
    
    return {
      token,
      isValid,
      cleanUrl,
      shouldAutoLogin: token && isValid
    }
  }
}

console.log('✅ Telegram URL Auth utility initialized')