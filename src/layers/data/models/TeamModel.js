// Team Data Model
// Defines the structure and validation rules for team data

export class TeamModel {
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.logo = data.logo || ''
    this.country = data.country || ''
    this.countryCode = data.countryCode || ''
    this.countryFlag = data.countryFlag || ''
    this.city = data.city || ''
    this.stadium = data.stadium || ''
    this.capacity = data.capacity || 0
    this.founded = data.founded || null
    this.coach = data.coach || ''
    this.website = data.website || ''
    this.marketValue = data.marketValue || 0
    this.averageAge = data.averageAge || 0
    this.status = data.status || 'active' // active, inactive, suspended
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
    
    // Tournament specific data
    this.position = data.position || null
    this.points = data.points || 0
    this.played = data.played || 0
    this.won = data.won || 0
    this.drawn = data.drawn || 0
    this.lost = data.lost || 0
    this.goalsFor = data.goalsFor || 0
    this.goalsAgainst = data.goalsAgainst || 0
    this.goalDifference = data.goalDifference || 0
    this.form = data.form || []
    this.titles = data.titles || 0
    this.coefficient = data.coefficient || 0
  }

  // Validation methods
  validate() {
    const errors = []

    if (!this.name || this.name.length < 2) {
      errors.push('Team name must be at least 2 characters long')
    }

    if (!this.country) {
      errors.push('Country is required')
    }

    if (!this.city) {
      errors.push('City is required')
    }

    if (!this.stadium) {
      errors.push('Stadium is required')
    }

    if (this.capacity < 1000) {
      errors.push('Stadium capacity must be at least 1,000')
    }

    if (this.founded && (this.founded < 1850 || this.founded > new Date().getFullYear())) {
      errors.push('Founded year must be between 1850 and current year')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Calculate derived fields
  calculateStats() {
    this.goalDifference = this.goalsFor - this.goalsAgainst
    this.points = (this.won * 3) + this.drawn
    
    // Calculate win percentage
    this.winPercentage = this.played > 0 ? (this.won / this.played * 100).toFixed(1) : 0
    
    // Calculate goals per match
    this.goalsPerMatch = this.played > 0 ? (this.goalsFor / this.played).toFixed(2) : 0
    
    return this
  }

  // Convert to database format
  toDatabase() {
    return {
      id: this.id,
      name: this.name,
      logo: this.logo,
      country: this.country,
      country_code: this.countryCode,
      country_flag: this.countryFlag,
      city: this.city,
      stadium: this.stadium,
      capacity: this.capacity,
      founded: this.founded,
      coach: this.coach,
      website: this.website,
      market_value: this.marketValue,
      average_age: this.averageAge,
      status: this.status,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      position: this.position,
      points: this.points,
      played: this.played,
      won: this.won,
      drawn: this.drawn,
      lost: this.lost,
      goals_for: this.goalsFor,
      goals_against: this.goalsAgainst,
      goal_difference: this.goalDifference,
      form: JSON.stringify(this.form),
      titles: this.titles,
      coefficient: this.coefficient
    }
  }

  // Create from database format
  static fromDatabase(dbData) {
    return new TeamModel({
      id: dbData.id,
      name: dbData.name,
      logo: dbData.logo,
      country: dbData.country,
      countryCode: dbData.country_code,
      countryFlag: dbData.country_flag,
      city: dbData.city,
      stadium: dbData.stadium,
      capacity: dbData.capacity,
      founded: dbData.founded,
      coach: dbData.coach,
      website: dbData.website,
      marketValue: dbData.market_value,
      averageAge: dbData.average_age,
      status: dbData.status,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
      position: dbData.position,
      points: dbData.points,
      played: dbData.played,
      won: dbData.won,
      drawn: dbData.drawn,
      lost: dbData.lost,
      goalsFor: dbData.goals_for,
      goalsAgainst: dbData.goals_against,
      goalDifference: dbData.goal_difference,
      form: JSON.parse(dbData.form || '[]'),
      titles: dbData.titles,
      coefficient: dbData.coefficient
    })
  }

  // Convert to API format
  toAPI() {
    return {
      id: this.id,
      name: this.name,
      logo: this.logo,
      country: this.country,
      countryCode: this.countryCode,
      countryFlag: this.countryFlag,
      city: this.city,
      stadium: this.stadium,
      capacity: this.capacity,
      founded: this.founded,
      coach: this.coach,
      website: this.website,
      marketValue: this.marketValue,
      averageAge: this.averageAge,
      status: this.status,
      position: this.position,
      points: this.points,
      played: this.played,
      won: this.won,
      drawn: this.drawn,
      lost: this.lost,
      goalsFor: this.goalsFor,
      goalsAgainst: this.goalsAgainst,
      goalDifference: this.goalDifference,
      form: this.form,
      titles: this.titles,
      coefficient: this.coefficient,
      winPercentage: this.winPercentage,
      goalsPerMatch: this.goalsPerMatch
    }
  }
}

export default TeamModel
