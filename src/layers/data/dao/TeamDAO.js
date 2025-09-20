// Team Data Access Object
// Handles all database operations for teams

import { DATA_CONFIG } from '../index'
import TeamModel from '../models/TeamModel'

class TeamDAO {
  constructor(database) {
    this.db = database
    this.tableName = DATA_CONFIG.TABLES.TEAMS
  }

  // Create new team
  async create(teamData) {
    try {
      const team = new TeamModel(teamData)
      const validation = team.validate()
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const dbData = team.toDatabase()
      const query = `
        INSERT INTO ${this.tableName} 
        (name, logo, country, country_code, city, stadium, capacity, founded, coach, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `
      
      const result = await this.db.query(query, [
        dbData.name,
        dbData.logo,
        dbData.country,
        dbData.country_code,
        dbData.city,
        dbData.stadium,
        dbData.capacity,
        dbData.founded,
        dbData.coach,
        dbData.status,
        dbData.created_at,
        dbData.updated_at
      ])

      return TeamModel.fromDatabase(result[0])
    } catch (error) {
      console.error('Failed to create team:', error)
      throw error
    }
  }

  // Get all teams with filters
  async findAll(filters = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName} WHERE 1=1`
      const params = []

      // Apply filters
      if (filters.country) {
        query += ' AND country = ?'
        params.push(filters.country)
      }

      if (filters.status) {
        query += ' AND status = ?'
        params.push(filters.status)
      }

      if (filters.search) {
        query += ' AND (name ILIKE ? OR city ILIKE ? OR coach ILIKE ?)'
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`)
      }

      // Apply sorting
      if (filters.sortBy) {
        const sortOrder = filters.sortOrder || 'ASC'
        query += ` ORDER BY ${filters.sortBy} ${sortOrder}`
      } else {
        query += ' ORDER BY position ASC, points DESC, goal_difference DESC'
      }

      // Apply pagination
      if (filters.limit) {
        query += ' LIMIT ?'
        params.push(filters.limit)
        
        if (filters.offset) {
          query += ' OFFSET ?'
          params.push(filters.offset)
        }
      }

      const results = await this.db.query(query, params)
      return results.map(row => TeamModel.fromDatabase(row))
    } catch (error) {
      console.error('Failed to fetch teams:', error)
      throw error
    }
  }

  // Get team by ID
  async findById(teamId) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = ?`
      const result = await this.db.query(query, [teamId])
      
      if (result.length === 0) {
        return null
      }

      return TeamModel.fromDatabase(result[0])
    } catch (error) {
      console.error('Failed to fetch team by ID:', error)
      throw error
    }
  }

  // Update team
  async update(teamId, teamData) {
    try {
      const team = new TeamModel({ ...teamData, id: teamId })
      const validation = team.validate()
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const dbData = team.toDatabase()
      const query = `
        UPDATE ${this.tableName} 
        SET name = ?, logo = ?, country = ?, country_code = ?, city = ?, 
            stadium = ?, capacity = ?, founded = ?, coach = ?, status = ?, updated_at = ?
        WHERE id = ?
        RETURNING *
      `
      
      const result = await this.db.query(query, [
        dbData.name,
        dbData.logo,
        dbData.country,
        dbData.country_code,
        dbData.city,
        dbData.stadium,
        dbData.capacity,
        dbData.founded,
        dbData.coach,
        dbData.status,
        new Date(),
        teamId
      ])

      if (result.length === 0) {
        throw new Error('Team not found')
      }

      return TeamModel.fromDatabase(result[0])
    } catch (error) {
      console.error('Failed to update team:', error)
      throw error
    }
  }

  // Delete team
  async delete(teamId) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`
      const result = await this.db.query(query, [teamId])
      
      return result.affectedRows > 0
    } catch (error) {
      console.error('Failed to delete team:', error)
      throw error
    }
  }

  // Update team standings
  async updateStandings(teamId, standingsData) {
    try {
      const query = `
        UPDATE ${this.tableName} 
        SET position = ?, points = ?, played = ?, won = ?, drawn = ?, lost = ?,
            goals_for = ?, goals_against = ?, goal_difference = ?, form = ?, updated_at = ?
        WHERE id = ?
      `
      
      await this.db.query(query, [
        standingsData.position,
        standingsData.points,
        standingsData.played,
        standingsData.won,
        standingsData.drawn,
        standingsData.lost,
        standingsData.goalsFor,
        standingsData.goalsAgainst,
        standingsData.goalDifference,
        JSON.stringify(standingsData.form),
        new Date(),
        teamId
      ])

      return true
    } catch (error) {
      console.error('Failed to update team standings:', error)
      throw error
    }
  }

  // Get teams by country
  async findByCountry(country) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE country = ? ORDER BY name ASC`
      const results = await this.db.query(query, [country])
      return results.map(row => TeamModel.fromDatabase(row))
    } catch (error) {
      console.error('Failed to fetch teams by country:', error)
      throw error
    }
  }

  // Get standings
  async getStandings(phase = 'league') {
    try {
      const query = `
        SELECT * FROM ${this.tableName} 
        WHERE status = 'active'
        ORDER BY points DESC, goal_difference DESC, goals_for DESC, name ASC
      `
      
      const results = await this.db.query(query)
      return results.map(row => TeamModel.fromDatabase(row))
    } catch (error) {
      console.error('Failed to fetch standings:', error)
      throw error
    }
  }
}

export default TeamDAO
