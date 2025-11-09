import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

class MatchesService {
  // Get all matches
  async getAllMatches(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || APP_CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.seasonId ? { seasonId: filters.seasonId } : {}),
        ...(filters.search || filters.team ? { search: filters.search || filters.team } : {}),
        ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
        ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
        ...(filters.teamId ? { teamId: filters.teamId } : {})
      }

      const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.MATCHES.LIST, params)
      
      // Map backend structure to frontend
      const matches = (response?.data || []).map(match => ({
        id: match.matchId,
        homeTeamName: match.homeTeamName,
        awayTeamName: match.awayTeamName,
        utcDate: match.scheduledKickoff,
        status: match.status,
        scoreHome: match.homeScore,
        scoreAway: match.awayScore,
        venue: match.stadiumName,
        matchday: match.matchdayNumber,
        updatedAt: match.updatedAt,
        seasonId: match.seasonId
      }))
      
      return {
        matches,
        pagination: response?.pagination || { page: params.page, limit: params.limit, totalPages: 1 },
        total: response?.total || 0
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error)
      throw error
    }
  }

  // Get live matches
  async getLiveMatches() {
    try {
      const response = await ApiService.get(APP_CONFIG.API.ENDPOINTS.MATCHES.LIVE)
      return response?.data || []
    } catch (error) {
      console.error('Failed to fetch live matches:', error)
      throw error
    }
  }

  // Get match by ID
  async getMatchById(matchId) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.MATCHES.DETAIL.replace(':id', matchId)
      const response = await ApiService.get(endpoint)
      return response?.data
    } catch (error) {
      console.error('Failed to fetch match:', error)
      throw error
    }
  }

  // Create new match
  async createMatch(matchData) {
    try {
      const payload = {
        homeTeamId: matchData.homeTeamId,
        awayTeamId: matchData.awayTeamId,
        scheduledKickoff: matchData.scheduledKickoff || new Date().toISOString(),
        seasonId: matchData.seasonId,
        stadiumId: matchData.stadiumId,
        status: matchData.status || 'scheduled'
      }
      const response = await ApiService.post(APP_CONFIG.API.ENDPOINTS.MATCHES.CREATE, payload)
      return response?.data
    } catch (error) {
      console.error('Failed to create match:', error)
      throw error
    }
  }

  // Update match
  async updateMatch(matchId, matchData) {
    try {
      const endpoint = APP_CONFIG.API.ENDPOINTS.MATCHES.UPDATE.replace(':id', matchId)
      const payload = {
        status: matchData.status,
        homeScore: matchData.scoreHome,
        awayScore: matchData.scoreAway,
        attendance: matchData.attendance
      }
      const response = await ApiService.put(endpoint, payload)
      
      // Map response back
      if (response?.data) {
        return {
          id: response.data.matchId,
          homeTeamName: response.data.homeTeamName,
          awayTeamName: response.data.awayTeamName,
          utcDate: response.data.scheduledKickoff,
          status: response.data.status,
          scoreHome: response.data.homeScore,
          scoreAway: response.data.awayScore,
          venue: response.data.stadiumName,
          matchday: response.data.matchdayNumber,
          updatedAt: response.data.updatedAt
        }
      }
      return response?.data
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
      return response?.data
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

  async syncMatches(options = {}) {
    const payload = {
      ...(options.count ? { count: options.count } : {}),
      ...(options.seasonId ? { seasonId: options.seasonId } : {}),
      ...(options.startDate ? { startDate: options.startDate } : {})
    }
    return ApiService.post('/matches/sync', payload)
  }

  // Get external matches from FootballMatches table (synced from Football-Data.org API)
  async getExternalMatches(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || APP_CONFIG.UI.PAGINATION.DEFAULT_PAGE_SIZE,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.season ? { season: filters.season } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
        ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
        ...(filters.teamId ? { teamId: filters.teamId } : {})
      }

      const response = await ApiService.get('/matches/external', params)
      
      // Map backend structure to frontend
      const matches = (response?.data || []).map(match => ({
        id: match.id,
        externalId: match.externalId,
        homeTeamName: match.homeTeamName,
        awayTeamName: match.awayTeamName,
        utcDate: match.utcDate,
        status: match.status,
        scoreHome: match.scoreHome,
        scoreAway: match.scoreAway,
        venue: match.venue,
        referee: match.referee,
        matchday: match.matchday,
        stage: match.stage,
        group: match.groupName,
        season: match.season,
        updatedAt: match.lastUpdated
      }))
      
      return {
        matches,
        pagination: response?.pagination || { page: params.page, limit: params.limit, totalPages: 1 },
        total: response?.total || 0
      }
    } catch (error) {
      console.error('Failed to fetch external matches:', error)
      throw error
    }
  }

  async generateRandomMatches(options = {}) {
    const payload = {
      count: options.count || 10,
      seasonId: options.seasonId,
      startDate: options.startDate || new Date().toISOString()
    }
    return ApiService.post('/matches/generate/random', payload)
  }
}

export default new MatchesService()
