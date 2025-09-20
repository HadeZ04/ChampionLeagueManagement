import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

class MatchesService {
  // Get all matches
  async getAllMatches(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || APP_CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE,
        date: filters.date || '',
        status: filters.status || '',
        team: filters.team || '',
        matchday: filters.matchday || ''
      }

      const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.MATCHES.LIST, params)
      return {
        matches: response.data || [],
        pagination: response.pagination || {},
        total: response.total || 0
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error)
      return this.getMockMatches(filters)
    }
  }

  // Get live matches
  async getLiveMatches() {
    try {
      const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.MATCHES.LIVE)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch live matches:', error)
      return []
    }
  }

  // Get match by ID
  async getMatchById(matchId) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.MATCHES.DETAIL.replace(':id', matchId)
      const response = await ApiService.get(endpoint)
      return response.data
    } catch (error) {
      console.error('Failed to fetch match:', error)
      return this.getMockMatch(matchId)
    }
  }

  // Create new match
  async createMatch(matchData) {
    try {
      const response = await ApiService.post(APP_CONFIG.API.ENDPOINTS.MATCHES.CREATE, matchData)
      return response.data
    } catch (error) {
      console.error('Failed to create match:', error)
      throw error
    }
  }

  // Update match
  async updateMatch(matchId, matchData) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.MATCHES.UPDATE.replace(':id', matchId)
      const response = await ApiService.put(endpoint, matchData)
      return response.data
    } catch (error) {
      console.error('Failed to update match:', error)
      throw error
    }
  }

  // Update match result
  async updateMatchResult(matchId, resultData) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.MATCHES.RESULTS.replace(':id', matchId)
      const response = await ApiService.post(endpoint, resultData)
      return response.data
    } catch (error) {
      console.error('Failed to update match result:', error)
      throw error
    }
  }

  // Delete match
  async deleteMatch(matchId) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.MATCHES.DELETE.replace(':id', matchId)
      await ApiService.delete(endpoint)
      return true
    } catch (error) {
      console.error('Failed to delete match:', error)
      throw error
    }
  }

  // Mock data for development
  getMockMatches(filters = {}) {
    const mockMatches = [
      {
        id: 1,
        date: '2025-01-22',
        time: '21:00',
        status: 'upcoming',
        homeTeam: {
          id: 1,
          name: 'Liverpool',
          logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png',
          shortName: 'LIV',
          country: 'ENG'
        },
        awayTeam: {
          id: 2,
          name: 'Lille',
          logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52747.png',
          shortName: 'LIL',
          country: 'FRA'
        },
        venue: 'Anfield',
        city: 'Liverpool',
        matchday: 7,
        competition: 'League Phase',
        referee: 'Clément Turpin (FRA)',
        temperature: '8°C',
        attendance: 53394,
        weather: {
          condition: 'Partly Cloudy',
          humidity: 78,
          windSpeed: '12 mph'
        },
        tvChannels: ['BT Sport 1', 'CBS Sports', 'Paramount+'],
        odds: { home: 1.45, draw: 4.20, away: 6.50 }
      },
      {
        id: 2,
        date: '2025-01-22',
        time: '21:00',
        status: 'upcoming',
        homeTeam: {
          id: 3,
          name: 'Barcelona',
          logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png',
          shortName: 'BAR',
          country: 'ESP'
        },
        awayTeam: {
          id: 4,
          name: 'Atalanta',
          logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52816.png',
          shortName: 'ATA',
          country: 'ITA'
        },
        venue: 'Spotify Camp Nou',
        city: 'Barcelona',
        matchday: 7,
        competition: 'League Phase',
        referee: 'Michael Oliver (ENG)',
        temperature: '15°C',
        attendance: 99354,
        weather: {
          condition: 'Clear',
          humidity: 65,
          windSpeed: '8 mph'
        },
        tvChannels: ['TNT Sports', 'Paramount+'],
        odds: { home: 1.75, draw: 3.60, away: 4.80 }
      }
    ]

    // Apply filters
    let filteredMatches = mockMatches

    if (filters.date) {
      filteredMatches = filteredMatches.filter(match => match.date === filters.date)
    }

    if (filters.status) {
      filteredMatches = filteredMatches.filter(match => match.status === filters.status)
    }

    if (filters.team) {
      filteredMatches = filteredMatches.filter(match =>
        match.homeTeam.name.toLowerCase().includes(filters.team.toLowerCase()) ||
        match.awayTeam.name.toLowerCase().includes(filters.team.toLowerCase())
      )
    }

    return {
      matches: filteredMatches,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || APP_CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE,
        totalPages: Math.ceil(filteredMatches.length / (filters.limit || APP_CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE))
      },
      total: filteredMatches.length
    }
  }

  getMockMatch(matchId) {
    const mockMatches = this.getMockMatches().matches
    return mockMatches.find(match => match.id === parseInt(matchId)) || null
  }
}

export default new MatchesService()
