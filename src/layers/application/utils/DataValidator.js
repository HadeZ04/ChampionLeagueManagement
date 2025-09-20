// Data Validation Utilities
// Provides validation functions for all data types

import { APPLICATION_CONFIG } from '../index'

class DataValidator {
  constructor() {
    this.rules = APPLICATION_CONFIG.VALIDATION_RULES
  }

  // Validate team data
  validateTeam(teamData) {
    const errors = []

    // Name validation
    if (!teamData.name) {
      errors.push('Team name is required')
    } else if (teamData.name.length < this.rules.TEAM_NAME.MIN_LENGTH) {
      errors.push(`Team name must be at least ${this.rules.TEAM_NAME.MIN_LENGTH} characters`)
    } else if (teamData.name.length > this.rules.TEAM_NAME.MAX_LENGTH) {
      errors.push(`Team name must not exceed ${this.rules.TEAM_NAME.MAX_LENGTH} characters`)
    }

    // Country validation
    if (!teamData.country) {
      errors.push('Country is required')
    }

    // City validation
    if (!teamData.city) {
      errors.push('City is required')
    }

    // Stadium validation
    if (!teamData.stadium) {
      errors.push('Stadium is required')
    }

    // Capacity validation
    if (teamData.capacity && teamData.capacity < 1000) {
      errors.push('Stadium capacity must be at least 1,000')
    }

    // Founded year validation
    if (teamData.founded) {
      const currentYear = new Date().getFullYear()
      if (teamData.founded < 1850 || teamData.founded > currentYear) {
        errors.push(`Founded year must be between 1850 and ${currentYear}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validate match data
  validateMatch(matchData) {
    const errors = []

    // Teams validation
    if (!matchData.homeTeamId) {
      errors.push('Home team is required')
    }

    if (!matchData.awayTeamId) {
      errors.push('Away team is required')
    }

    if (matchData.homeTeamId === matchData.awayTeamId) {
      errors.push('Home and away teams must be different')
    }

    // Date and time validation
    if (!matchData.date) {
      errors.push('Match date is required')
    } else {
      const matchDate = new Date(matchData.date)
      const today = new Date()
      if (matchDate < today.setHours(0, 0, 0, 0)) {
        errors.push('Match date cannot be in the past')
      }
    }

    if (!matchData.time) {
      errors.push('Match time is required')
    }

    // Venue validation
    if (!matchData.venue) {
      errors.push('Venue is required')
    }

    if (!matchData.city) {
      errors.push('City is required')
    }

    // Matchday validation
    if (!matchData.matchday || matchData.matchday < 1 || matchData.matchday > 8) {
      errors.push('Matchday must be between 1 and 8')
    }

    // Score validation for finished matches
    if (matchData.status === 'finished') {
      if (matchData.homeScore === null || matchData.homeScore === undefined) {
        errors.push('Home team score is required for finished matches')
      }

      if (matchData.awayScore === null || matchData.awayScore === undefined) {
        errors.push('Away team score is required for finished matches')
      }

      if (matchData.homeScore < 0 || matchData.awayScore < 0) {
        errors.push('Scores cannot be negative')
      }

      if (matchData.homeScore > this.rules.MATCH_SCORE.MAX || matchData.awayScore > this.rules.MATCH_SCORE.MAX) {
        errors.push(`Scores cannot exceed ${this.rules.MATCH_SCORE.MAX}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validate player data
  validatePlayer(playerData) {
    const errors = []

    // Name validation
    if (!playerData.name) {
      errors.push('Player name is required')
    }

    // Date of birth validation
    if (!playerData.dateOfBirth) {
      errors.push('Date of birth is required')
    } else {
      const age = this.calculateAge(playerData.dateOfBirth)
      if (age < this.rules.PLAYER_AGE.MIN || age > this.rules.PLAYER_AGE.MAX) {
        errors.push(`Player age must be between ${this.rules.PLAYER_AGE.MIN} and ${this.rules.PLAYER_AGE.MAX}`)
      }
    }

    // Nationality validation
    if (!playerData.nationality) {
      errors.push('Nationality is required')
    }

    // Position validation
    const validPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
    if (!playerData.position || !validPositions.includes(playerData.position)) {
      errors.push('Valid position is required')
    }

    // Jersey number validation
    if (playerData.jerseyNumber) {
      if (playerData.jerseyNumber < 1 || playerData.jerseyNumber > 99) {
        errors.push('Jersey number must be between 1 and 99')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validate news article data
  validateNews(newsData) {
    const errors = []

    // Title validation
    if (!newsData.title) {
      errors.push('Article title is required')
    } else if (newsData.title.length < 10) {
      errors.push('Article title must be at least 10 characters')
    } else if (newsData.title.length > 200) {
      errors.push('Article title must not exceed 200 characters')
    }

    // Content validation
    if (!newsData.content) {
      errors.push('Article content is required')
    } else if (newsData.content.length < 50) {
      errors.push('Article content must be at least 50 characters')
    }

    // Category validation
    const validCategories = ['matches', 'teams', 'players', 'draws', 'awards', 'general']
    if (!newsData.category || !validCategories.includes(newsData.category)) {
      errors.push('Valid category is required')
    }

    // Author validation
    if (!newsData.author) {
      errors.push('Author is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Utility functions
  calculateAge(dateOfBirth) {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate phone number format
  validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }

  // Validate URL format
  validateURL(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Sanitize input data
  sanitizeInput(input) {
    if (typeof input !== 'string') return input
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
  }

  // Validate file upload
  validateFile(file, allowedTypes = [], maxSize = 10 * 1024 * 1024) {
    const errors = []

    if (!file) {
      errors.push('File is required')
      return { isValid: false, errors }
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`)
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must not exceed ${(maxSize / 1024 / 1024).toFixed(1)}MB`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export default new DataValidator()
