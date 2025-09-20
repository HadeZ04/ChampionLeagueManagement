import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token'
    this.refreshTokenKey = 'refresh_token'
    this.userKey = 'user_data'
  }

  // Login
  async login(credentials) {
    try {
      const response = await ApiService.post(APP_CONFIG.API.ENDPOINTS.AUTH.LOGIN, credentials)
      
      if (response.success) {
        this.setTokens(response.data.token, response.data.refreshToken)
        this.setUser(response.data.user)
        return response.data.user
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      // Mock authentication for development
      return this.mockLogin(credentials)
    }
  }

  // Mock login for development
  mockLogin(credentials) {
    if (credentials.username === 'admin' && credentials.password === 'uefa2025') {
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@uefa.com',
        role: 'administrator',
        permissions: ['read', 'write', 'delete', 'admin'],
        profile: {
          firstName: 'UEFA',
          lastName: 'Administrator',
          avatar: null
        }
      }
      
      const mockToken = 'mock_jwt_token_' + Date.now()
      this.setTokens(mockToken, 'mock_refresh_token')
      this.setUser(mockUser)
      return mockUser
    } else {
      throw new Error('Invalid credentials')
    }
  }

  // Logout
  async logout() {
    try {
      await ApiService.post(APP_CONFIG.API.ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      this.clearTokens()
      this.clearUser()
    }
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

      if (response.success) {
        this.setTokens(response.data.token, response.data.refreshToken)
        return response.data.token
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.logout()
      throw error
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.AUTH.PROFILE)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      return this.getUser()
    }
  }

  // Token management
  setTokens(token, refreshToken) {
    localStorage.setItem(this.tokenKey, token)
    localStorage.setItem(this.refreshTokenKey, refreshToken)
  }

  getToken() {
    return localStorage.getItem(this.tokenKey)
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
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  getUser() {
    const userData = localStorage.getItem(this.userKey)
    return userData ? JSON.parse(userData) : null
  }

  clearUser() {
    localStorage.removeItem(this.userKey)
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
    return user && user.role === role
  }
}

export default new AuthService()
