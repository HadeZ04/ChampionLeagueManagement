import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

const ENDPOINTS = APP_CONFIG.API.ENDPOINTS.LEADERBOARD

const replaceIdParam = (template, id) => template.replace(':id', id)

class LeaderboardService {
  async getLeaderboard(params = {}) {
    const response = await ApiService.get(ENDPOINTS.LIST, params)
    if (Array.isArray(response)) {
      return response
    }
    if (Array.isArray(response?.data)) {
      return response.data
    }
    return []
  }

  async addEntry(payload) {
    const response = await ApiService.post(ENDPOINTS.CREATE, payload)
    return response?.data ?? response ?? null
  }

  async updateEntry(id, payload) {
    if (!id) {
      throw new Error('Leaderboard entry ID is required')
    }
    const endpoint = replaceIdParam(ENDPOINTS.UPDATE, id)
    const response = await ApiService.put(endpoint, payload)
    return response?.data ?? response ?? null
  }

  async deleteEntry(id) {
    if (!id) {
      throw new Error('Leaderboard entry ID is required')
    }
    const endpoint = replaceIdParam(ENDPOINTS.DELETE, id)
    await ApiService.delete(endpoint)
    return true
  }
}

export default new LeaderboardService()
