import APP_CONFIG from '../../../config/app.config'

class ApiService {
  constructor() {
    this.baseURL = APP_CONFIG.API.BASE_URL
    this.timeout = APP_CONFIG.API.TIMEOUT
    this.retryAttempts = APP_CONFIG.API.RETRY_ATTEMPTS
  }

  // =========================
  // Generic HTTP request
  // =========================
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

    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        let errorMessage = response.statusText
        try {
          const errJson = await response.json()
          errorMessage = errJson.error || errJson.message || errorMessage
        } catch (_) { }

        throw {
          status: response.status,
          message: errorMessage
        }
      }

      if (response.status === 204 || response.status === 205) {
        return null
      }

      const responseText = await response.text()
      if (!responseText) return null

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
    return this.request(url, { method: 'GET' })
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

  async delete(endpoint, params = undefined) {
    const queryString =
      params && typeof params === 'object' ? new URLSearchParams(params).toString() : ''
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: 'DELETE' })
  }

  // =========================
  // FILE UPLOAD — FIX CHÍNH
  // =========================
  // File upload method (FIXED – DO NOT SKIP)
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData()
    formData.append('file', file)

    Object.keys(additionalData).forEach(key => {
      if (additionalData[key] !== undefined && additionalData[key] !== null) {
        formData.append(key, additionalData[key])
      }
    })

    const token = localStorage.getItem('auth_token')
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    })

    // 🔥 QUAN TRỌNG: đọc body TRƯỚC
    const responseText = await response.text()
    let data = null

    try {
      data = responseText ? JSON.parse(responseText) : null
    } catch {
      data = responseText
    }

    // ❌ nếu backend trả lỗi
    if (!response.ok) {
      const errorMessage =
        data?.error ||
        data?.message ||
        `HTTP ${response.status}`

      const error = new Error(errorMessage)
      error.status = response.status
      error.payload = data
      throw error
    }

    return data
  }


  // =========================
  // Retry
  // =========================
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

