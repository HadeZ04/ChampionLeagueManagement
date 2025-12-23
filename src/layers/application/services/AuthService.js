import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token'
    this.refreshTokenKey = 'refresh_token'
    this.userKey = 'user_data'
  }

  notifyAuthChange(user) {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
      return
    }

    const detail = {
      isAuthenticated: this.isAuthenticated(),
      user
    }

    if (typeof window.CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('auth:changed', { detail }))
      return
    }

    if (typeof document !== 'undefined' && typeof document.createEvent === 'function') {
      const event = document.createEvent('CustomEvent')
      event.initCustomEvent('auth:changed', false, false, detail)
      window.dispatchEvent(event)
    }
  }

  // Login
  async login(credentials) {
    const response = await ApiService.post(APP_CONFIG.API.ENDPOINTS.AUTH.LOGIN, credentials)

    const normalizedToken =
      response?.token ??
      response?.accessToken ??
      response?.data?.token ??
      response?.data?.accessToken
    const normalizedRefresh =
      response?.refreshToken ??
      response?.data?.refreshToken ??
      response?.data?.refresh_token ??
      null
    const normalizedUser = response?.user ?? response?.data?.user ?? null

    if (!normalizedToken || !normalizedUser) {
      throw new Error(response?.message || 'Login failed')
    }

    this.setTokens(normalizedToken, normalizedRefresh)
    this.setUser(normalizedUser)
    return normalizedUser
  }

  // Logout
  async logout() {
    this.clearTokens()
    this.clearUser()
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await ApiService.post(APP_CONFIG.API.ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      })

      const normalizedToken = response?.token ?? response?.data?.token ?? null
      const normalizedRefresh = response?.refreshToken ?? response?.data?.refreshToken ?? null

      if (!normalizedToken) {
        throw new Error('Token refresh failed')
      }

      this.setTokens(normalizedToken, normalizedRefresh)
      return normalizedToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.logout()
      throw error
    }
  }

  async restoreSession() {
    if (!this.isAuthenticated()) {
      return null
    }
    try {
      const profile = await this.getCurrentUser()
      if (profile) {
        this.setUser(profile)
      }
      return profile
    } catch (error) {
      this.clearTokens()
      this.clearUser()
      throw error
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.AUTH.PROFILE)
      const payload = response?.data ?? response ?? null
      if (payload) {
        this.setUser(payload)
      }
      return payload
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      throw error
    }
  }

  async updateProfile(updates) {
    try {
      const response = await ApiService.put(APP_CONFIG.API.ENDPOINTS.AUTH.PROFILE, updates)
      const payload = response?.data ?? response ?? null
      if (payload) {
        this.setUser(payload)
      }
      return payload
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  /**
   * Token management
   * 
   * SECURITY TODO: Migrate to httpOnly cookies for enhanced security
   * 
   * Current implementation stores JWT tokens in localStorage, which is vulnerable to XSS attacks.
   * 
   * Recommended migration plan:
   * 1. Backend: Set JWT as httpOnly cookie in Set-Cookie header (response from /login)
   * 2. Frontend: Remove localStorage.setItem calls - cookies managed automatically by browser
   * 3. Backend: Read token from cookie in auth middleware (req.cookies.auth_token)
   * 4. Configure CORS with credentials: true + allowed origins
   * 5. Add CSRF protection using double-submit cookie pattern or SameSite=Strict
   * 
   * Benefits after migration:
   * - XSS protection: JavaScript cannot access httpOnly cookies
   * - Automatic cookie management (expiry, secure flags)
   * - Better security posture for production deployment
   * 
   * Migration complexity: MEDIUM (requires backend team coordination)
   * Priority: LOW (current implementation acceptable for MVP, plan for v2.0)
   */
  setTokens(token, refreshToken) {
    if (token) {
      localStorage.setItem(this.tokenKey, token)
    } else {
      localStorage.removeItem(this.tokenKey)
    }

    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken)
    } else {
      localStorage.removeItem(this.refreshTokenKey)
    }
  }

  getToken() {
    const token = localStorage.getItem(this.tokenKey)
    if (!token) {
      return null
    }
    
    // Check token expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiryTime = payload.exp * 1000 // Convert to milliseconds
      const now = Date.now()
      
      if (expiryTime < now) {
        // Token expired - auto logout
        this.logout()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:token-expired', { 
            detail: { message: 'Phiên đăng nhập đã hết hạn' } 
          }))
        }
        return null
      }
      
      return token
    } catch (err) {
      // Invalid token format
      this.logout()
      return null
    }
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey)
  }

  clearTokens() {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  // User management
  setUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user))
    } else {
      localStorage.removeItem(this.userKey)
    }
    this.notifyAuthChange(user ?? null)
  }

  getUser() {
    const userData = localStorage.getItem(this.userKey)
    return userData ? JSON.parse(userData) : null
  }

  clearUser() {
    this.setUser(null)
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken()
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const user = this.getUser()
    return user && user.permissions && user.permissions.includes(permission)
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getUser()
    return Array.isArray(user?.roles) && user.roles.includes(role)
  }
}

export default new AuthService()
