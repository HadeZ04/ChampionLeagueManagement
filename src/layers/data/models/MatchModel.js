// Match Data Model
// Defines the structure and validation rules for match data

export class MatchModel {
  constructor(data = {}) {
    this.id = data.id || null
    this.homeTeamId = data.homeTeamId || null
    this.awayTeamId = data.awayTeamId || null
    this.date = data.date || ''
    this.time = data.time || ''
    this.venue = data.venue || ''
    this.city = data.city || ''
    this.country = data.country || ''
    this.matchday = data.matchday || 1
    this.competition = data.competition || 'League Phase'
    this.status = data.status || 'scheduled' // scheduled, live, finished, postponed, cancelled
    this.referee = data.referee || ''
    this.attendance = data.attendance || 0
    this.temperature = data.temperature || ''
    this.weather = data.weather || {}
    this.tvChannels = data.tvChannels || []
    this.odds = data.odds || {}
    
    // Match result data
    this.homeScore = data.homeScore || null
    this.awayScore = data.awayScore || null
    this.extraTime = data.extraTime || false
    this.penalties = data.penalties || null
    this.minute = data.minute || null
    
    // Match events
    this.events = data.events || []
    this.statistics = data.statistics || {}
    
    // Metadata
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
    this.createdBy = data.createdBy || null
    this.updatedBy = data.updatedBy || null
  }

  // Validation methods
  validate() {
    const errors = []

    if (!this.homeTeamId) {
      errors.push('Home team is required')
    }

    if (!this.awayTeamId) {
      errors.push('Away team is required')
    }

    if (this.homeTeamId === this.awayTeamId) {
      errors.push('Home and away teams must be different')
    }

    if (!this.date) {
      errors.push('Match date is required')
    }

    if (!this.time) {
      errors.push('Match time is required')
    }

    if (!this.venue) {
      errors.push('Venue is required')
    }

    if (this.matchday < 1 || this.matchday > 8) {
      errors.push('Matchday must be between 1 and 8')
    }

    // Validate scores if match is finished
    if (this.status === 'finished') {
      if (this.homeScore === null || this.awayScore === null) {
        errors.push('Scores are required for finished matches')
      }

      if (this.homeScore < 0 || this.awayScore < 0) {
        errors.push('Scores cannot be negative')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Calculate match result
  getResult() {
    if (this.status !== 'finished' || this.homeScore === null || this.awayScore === null) {
      return null
    }

    if (this.homeScore > this.awayScore) {
      return 'home_win'
    } else if (this.awayScore > this.homeScore) {
      return 'away_win'
    } else {
      return 'draw'
    }
  }

  // Get match duration
  getDuration() {
    if (this.status === 'live' && this.minute) {
      return this.minute
    } else if (this.status === 'finished') {
      return this.extraTime ? '120+' : '90'
    }
    return null
  }

  // Check if match is today
  isToday() {
    const today = new Date().toISOString().split('T')[0]
    return this.date === today
  }

  // Check if match is live
  isLive() {
    return this.status === 'live'
  }

  // Convert to database format
  toDatabase() {
    return {
      id: this.id,
      home_team_id: this.homeTeamId,
      away_team_id: this.awayTeamId,
      date: this.date,
      time: this.time,
      venue: this.venue,
      city: this.city,
      country: this.country,
      matchday: this.matchday,
      competition: this.competition,
      status: this.status,
      referee: this.referee,
      attendance: this.attendance,
      temperature: this.temperature,
      weather: JSON.stringify(this.weather),
      tv_channels: JSON.stringify(this.tvChannels),
      odds: JSON.stringify(this.odds),
      home_score: this.homeScore,
      away_score: this.awayScore,
      extra_time: this.extraTime,
      penalties: JSON.stringify(this.penalties),
      minute: this.minute,
      events: JSON.stringify(this.events),
      statistics: JSON.stringify(this.statistics),
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      created_by: this.createdBy,
      updated_by: this.updatedBy
    }
  }

  // Create from database format
  static fromDatabase(dbData) {
    return new MatchModel({
      id: dbData.id,
      homeTeamId: dbData.home_team_id,
      awayTeamId: dbData.away_team_id,
      date: dbData.date,
      time: dbData.time,
      venue: dbData.venue,
      city: dbData.city,
      country: dbData.country,
      matchday: dbData.matchday,
      competition: dbData.competition,
      status: dbData.status,
      referee: dbData.referee,
      attendance: dbData.attendance,
      temperature: dbData.temperature,
      weather: JSON.parse(dbData.weather || '{}'),
      tvChannels: JSON.parse(dbData.tv_channels || '[]'),
      odds: JSON.parse(dbData.odds || '{}'),
      homeScore: dbData.home_score,
      awayScore: dbData.away_score,
      extraTime: dbData.extra_time,
      penalties: JSON.parse(dbData.penalties || 'null'),
      minute: dbData.minute,
      events: JSON.parse(dbData.events || '[]'),
      statistics: JSON.parse(dbData.statistics || '{}'),
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
      createdBy: dbData.created_by,
      updatedBy: dbData.updated_by
    })
  }

  // Convert to API format
  toAPI() {
    return {
      id: this.id,
      homeTeamId: this.homeTeamId,
      awayTeamId: this.awayTeamId,
      date: this.date,
      time: this.time,
      venue: this.venue,
      city: this.city,
      country: this.country,
      matchday: this.matchday,
      competition: this.competition,
      status: this.status,
      referee: this.referee,
      attendance: this.attendance,
      temperature: this.temperature,
      weather: this.weather,
      tvChannels: this.tvChannels,
      odds: this.odds,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      extraTime: this.extraTime,
      penalties: this.penalties,
      minute: this.minute,
      events: this.events,
      statistics: this.statistics,
      result: this.getResult(),
      duration: this.getDuration(),
      isToday: this.isToday(),
      isLive: this.isLive()
    }
  }
}

export default MatchModel
