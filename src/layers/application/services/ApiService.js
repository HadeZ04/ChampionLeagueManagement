import APP_CONFIG from '../../../config/app.config'

class ApiService {
  constructor() {
    this.baseURL = APP_CONFIG.API.BASE_URL
    this.timeout = APP_CONFIG.API.TIMEOUT
    this.retryAttempts = APP_CONFIG.API.RETRY_ATTEMPTS
  }

  // Generic HTTP methods
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    // Add authentication token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (response.status === 204 || response.status === 205) {
        return null
      }

      const responseText = await response.text()
      if (!responseText) {
        return null
      }

      try {
        return JSON.parse(responseText)
      } catch {
        return responseText
      }
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    
    return this.request(url, {
      method: 'GET'
    })
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    })
  }

  // File upload method
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData()
    formData.append('file', file)
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })

    const token = localStorage.getItem('auth_token')
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  // Retry mechanism for failed requests
  async requestWithRetry(endpoint, options = {}, attempts = 0) {
    try {
      return await this.request(endpoint, options)
    } catch (error) {
      if (attempts < this.retryAttempts) {
        console.log(`Retrying request (${attempts + 1}/${this.retryAttempts})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)))
        return this.requestWithRetry(endpoint, options, attempts + 1)
      }
      throw error
    }
  }
}

export default new ApiService()
