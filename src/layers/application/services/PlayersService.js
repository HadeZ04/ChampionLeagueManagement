import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

class PlayersService {
  async listPlayers(filters = {}) {
    const params = {
      search: filters.search || '',
      teamId: filters.teamId || '',
      position: filters.position || '',
      nationality: filters.nationality || '',
      season: filters.season || '',
      page: filters.page || 1,
      limit: filters.limit || APP_CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE
    }

    const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.PLAYERS.LIST, params)
    return {
      players: response?.data || [],
      total: response?.total || 0,
      pagination: response?.pagination || { page: params.page, limit: params.limit, totalPages: 1 }
    }
  }

  async createPlayer(payload) {
    // Correct API: POST /api/players
    // Assuming ApiService handles /api prefix or relative to base
    return ApiService.post('/players', payload)
  }

  async syncPlayers(season) {
    return ApiService.post('/players/sync', { season })
  }

  async getPlayerById(id) {
    const endpoint = APP_CONFIG.API.ENDPOINTS.PLAYERS.DETAIL.replace(':id', id)
    const response = await ApiService.get(endpoint)
    return response?.data
  }

  async updatePlayer(id, payload) {
    const endpoint = APP_CONFIG.API.ENDPOINTS.PLAYERS.UPDATE.replace(':id', id)
    const response = await ApiService.put(endpoint, payload)
    return response?.data
  }

  async deletePlayer(id) {
    const endpoint = APP_CONFIG.API.ENDPOINTS.PLAYERS.DELETE.replace(':id', id)
    await ApiService.delete(endpoint)
    return true
  }
}

export default new PlayersService()


