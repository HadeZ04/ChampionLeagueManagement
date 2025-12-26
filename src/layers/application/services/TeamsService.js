import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'
import logger from '../../../shared/utils/logger'

class TeamsService {
  normalizeTeam(payload = {}) {
    const teamId = payload.team_id ?? payload.teamId ?? payload.id
    return {
      id: teamId,
      name: payload.name,
      short_name: payload.short_name ?? payload.shortName ?? null,
      code: payload.code ?? null,
      city: payload.city ?? null,
      country: payload.country ?? null,
      founded_year: payload.founded_year ?? payload.foundedYear ?? null,
      status: payload.status ?? 'active',
      governing_body: payload.governing_body ?? payload.governingBody ?? null,
      description: payload.description ?? null,
      home_stadium_id: payload.home_stadium_id ?? payload.homeStadiumId ?? null,
      home_kit_description: payload.home_kit_description ?? payload.homeKitDescription ?? null
    }
  }

  // Get all teams
  async getAllTeams(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || APP_CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE,
        country: filters.country || '',
        search: filters.search || '',
        status: filters.status || '',
        season: filters.season || ''
      }

      const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.TEAMS.LIST, params)

      // Map backend data structure to frontend structure
      const teams = (response.data || []).map(team => ({
        id: team.team_id,
        name: team.name,
        short_name: team.short_name,
        code: team.code,
        city: team.city,
        country: team.country,
        founded_year: team.founded_year,
        status: team.status,
        governing_body: team.governing_body,
        description: team.description,
        playerCount: 0 // Will be populated separately if needed
      }))

      return {
        teams,
        pagination: response.pagination || {},
        total: response.total || 0
      }
    } catch (error) {
      logger.error('Failed to fetch teams:', error)
      throw error
    }
  }

  // Get team by ID
  async getTeamById(teamId, query = {}) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.TEAMS.DETAIL.replace(':id', teamId)
      const response = await ApiService.get(endpoint, query)
      return this.normalizeTeam(response?.data ?? {})
    } catch (error) {
      console.error('Failed to fetch team:', error)
      throw error
    }
  }

  // Create new team
  async createTeam(teamData) {
    try {
      const response = await ApiService.post(APP_CONFIG.API.ENDPOINTS.TEAMS.CREATE, teamData)
      return this.normalizeTeam(response?.data ?? {})
    } catch (error) {
      console.error('Failed to create team:', error)
      throw error
    }
  }

  // Update team
  async updateTeam(teamId, teamData) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.TEAMS.UPDATE.replace(':id', teamId)
      const response = await ApiService.put(endpoint, teamData)
      return this.normalizeTeam(response?.data ?? {})
    } catch (error) {
      console.error('Failed to update team:', error)
      throw error
    }
  }

  // Delete team
  async deleteTeam(teamId) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.TEAMS.DELETE.replace(':id', teamId)
      await ApiService.delete(endpoint)
      return true
    } catch (error) {
      console.error('Failed to delete team:', error)
      const message = error.payload?.message || error.message || 'Failed to delete team'
      throw new Error(message)
    }
  }

  // Get team players
  async getTeamPlayers(teamId, query = {}) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.TEAMS.PLAYERS.replace(':id', teamId)
      const response = await ApiService.get(endpoint, query)
      const raw = response?.data || []
      if (!Array.isArray(raw)) {
        return []
      }
      return raw.map((player) => ({
        id: player.player_id ?? player.id ?? null,
        name: player.display_name ?? player.full_name ?? player.name ?? 'Unknown',
        position: player.preferred_position ?? player.position ?? null,
        nationality: player.nationality ?? null,
        dateOfBirth: player.date_of_birth ?? player.dateOfBirth ?? null,
        shirtNumber: player.shirt_number ?? player.shirtNumber ?? null
      }))
    } catch (error) {
      console.error('Failed to fetch team players:', error)
      return []
    }
  }

  async getCompetitionSeasons(fromYear = 2020) {
    const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.TEAMS.SEASONS, { fromYear })
    return response.data || []
  }

  async getCompetitionStandings(filters = {}) {
    const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.TEAMS.STANDINGS, {
      season: filters.season || ''
    })
    return response.data
  }
}

export default new TeamsService()
