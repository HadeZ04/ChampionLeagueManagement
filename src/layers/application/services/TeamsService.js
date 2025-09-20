import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

class TeamsService {
  // Get all teams
  async getAllTeams(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || APP_CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE,
        country: filters.country || '',
        search: filters.search || '',
        status: filters.status || 'active'
      }

      const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.TEAMS.LIST, params)
      return {
        teams: response.data || [],
        pagination: response.pagination || {},
        total: response.total || 0
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
      // Return mock data for development
      return this.getMockTeams(filters)
    }
  }

  // Get team by ID
  async getTeamById(teamId) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.TEAMS.DETAIL.replace(':id', teamId)
      const response = await ApiService.get(endpoint)
      return response.data
    } catch (error) {
      console.error('Failed to fetch team:', error)
      return this.getMockTeam(teamId)
    }
  }

  // Create new team
  async createTeam(teamData) {
    try {
      const response = await ApiService.post(APP_CONFIG.API.ENDPOINTS.TEAMS.CREATE, teamData)
      return response.data
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
      return response.data
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
      throw error
    }
  }

  // Get team players
  async getTeamPlayers(teamId) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.TEAMS.PLAYERS.replace(':id', teamId)
      const response = await ApiService.get(endpoint)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch team players:', error)
      return []
    }
  }

  // Mock data for development (will be removed when backend is ready)
  getMockTeams(filters = {}) {
    const mockTeams = [
      {
        id: 1,
        name: 'Liverpool',
        logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png',
        country: 'England',
        countryCode: 'ENG',
        countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        city: 'Liverpool',
        stadium: 'Anfield',
        capacity: 53394,
        founded: 1892,
        coach: 'Arne Slot',
        position: 1,
        points: 18,
        played: 6,
        won: 6,
        drawn: 0,
        lost: 0,
        goalsFor: 13,
        goalsAgainst: 1,
        titles: 6,
        marketValue: '€1.2B',
        averageAge: 26.8,
        status: 'active',
        createdAt: '2024-09-01',
        updatedAt: '2025-01-22'
      },
      {
        id: 2,
        name: 'Barcelona',
        logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png',
        country: 'Spain',
        countryCode: 'ESP',
        countryFlag: '🇪🇸',
        city: 'Barcelona',
        stadium: 'Spotify Camp Nou',
        capacity: 99354,
        founded: 1899,
        coach: 'Hansi Flick',
        position: 2,
        points: 15,
        played: 6,
        won: 5,
        drawn: 0,
        lost: 1,
        goalsFor: 21,
        goalsAgainst: 7,
        titles: 5,
        marketValue: '€1.1B',
        averageAge: 25.3,
        status: 'active',
        createdAt: '2024-09-01',
        updatedAt: '2025-01-21'
      }
      // Add more mock teams...
    ]

    // Apply filters
    let filteredTeams = mockTeams
    
    if (filters.country) {
      filteredTeams = filteredTeams.filter(team => 
        team.country.toLowerCase().includes(filters.country.toLowerCase())
      )
    }
    
    if (filters.search) {
      filteredTeams = filteredTeams.filter(team =>
        team.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        team.city.toLowerCase().includes(filters.search.toLowerCase()) ||
        team.coach.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    return {
      teams: filteredTeams,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || APP_CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE,
        totalPages: Math.ceil(filteredTeams.length / (filters.limit || APP_CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE))
      },
      total: filteredTeams.length
    }
  }

  getMockTeam(teamId) {
    const mockTeams = this.getMockTeams().teams
    return mockTeams.find(team => team.id === parseInt(teamId)) || null
  }
}

export default new TeamsService()
