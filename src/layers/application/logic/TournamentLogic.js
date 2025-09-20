// Tournament Business Logic
// Contains all business rules and calculations for the tournament

import { APPLICATION_CONFIG } from '../index'

class TournamentLogic {
  constructor() {
    this.config = APPLICATION_CONFIG.BUSINESS_RULES.TOURNAMENT
  }

  // Calculate team standings
  calculateStandings(teams, matches) {
    const standings = teams.map(team => ({
      ...team,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      form: []
    }))

    // Process each completed match
    matches
      .filter(match => match.status === 'finished')
      .forEach(match => {
        const homeTeam = standings.find(t => t.id === match.homeTeamId)
        const awayTeam = standings.find(t => t.id === match.awayTeamId)

        if (homeTeam && awayTeam) {
          // Update match statistics
          homeTeam.played++
          awayTeam.played++
          homeTeam.goalsFor += match.homeScore
          homeTeam.goalsAgainst += match.awayScore
          awayTeam.goalsFor += match.awayScore
          awayTeam.goalsAgainst += match.homeScore

          // Determine result and update points
          if (match.homeScore > match.awayScore) {
            // Home team wins
            homeTeam.won++
            homeTeam.points += 3
            awayTeam.lost++
            homeTeam.form.unshift('W')
            awayTeam.form.unshift('L')
          } else if (match.awayScore > match.homeScore) {
            // Away team wins
            awayTeam.won++
            awayTeam.points += 3
            homeTeam.lost++
            awayTeam.form.unshift('W')
            homeTeam.form.unshift('L')
          } else {
            // Draw
            homeTeam.drawn++
            awayTeam.drawn++
            homeTeam.points += 1
            awayTeam.points += 1
            homeTeam.form.unshift('D')
            awayTeam.form.unshift('D')
          }

          // Keep only last 5 form results
          homeTeam.form = homeTeam.form.slice(0, 5)
          awayTeam.form = awayTeam.form.slice(0, 5)
        }
      })

    // Calculate goal difference and sort standings
    standings.forEach(team => {
      team.goalDifference = team.goalsFor - team.goalsAgainst
    })

    // Sort by UEFA rules: Points > Goal Difference > Goals For > Head-to-head
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
      return a.name.localeCompare(b.name) // Alphabetical as final tiebreaker
    })

    // Assign positions and qualification status
    standings.forEach((team, index) => {
      team.position = index + 1
      
      if (team.position <= 8) {
        team.qualificationStatus = 'qualified'
      } else if (team.position <= 24) {
        team.qualificationStatus = 'playoff'
      } else {
        team.qualificationStatus = 'eliminated'
      }
    })

    return standings
  }

  // Calculate player statistics
  calculatePlayerStats(players, matches) {
    const playerStats = players.map(player => ({
      ...player,
      goals: 0,
      assists: 0,
      appearances: 0,
      minutesPlayed: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      saves: 0
    }))

    // Process match events to calculate player stats
    matches
      .filter(match => match.status === 'finished' && match.events)
      .forEach(match => {
        match.events.forEach(event => {
          const player = playerStats.find(p => p.name === event.player)
          if (player) {
            switch (event.type) {
              case 'goal':
                player.goals++
                break
              case 'assist':
                player.assists++
                break
              case 'yellow_card':
                player.yellowCards++
                break
              case 'red_card':
                player.redCards++
                break
              case 'substitution_in':
                player.appearances++
                break
            }
          }
        })
      })

    return playerStats
  }

  // Determine qualification scenarios
  getQualificationScenarios(team, remainingMatches) {
    const scenarios = {
      directQualification: false,
      playoffQualification: false,
      elimination: false,
      scenarios: []
    }

    const maxPossiblePoints = team.points + (remainingMatches * 3)
    const minPossiblePoints = team.points

    // Direct qualification (top 8)
    if (team.position <= 8 && minPossiblePoints >= this.getMinPointsForPosition(8)) {
      scenarios.directQualification = true
      scenarios.scenarios.push('Already qualified for Round of 16')
    }

    // Playoff qualification (positions 9-24)
    if (maxPossiblePoints >= this.getMinPointsForPosition(24)) {
      scenarios.playoffQualification = true
      scenarios.scenarios.push('Can qualify for playoff round')
    }

    // Elimination (positions 25-36)
    if (maxPossiblePoints < this.getMinPointsForPosition(24)) {
      scenarios.elimination = true
      scenarios.scenarios.push('Eliminated from competition')
    }

    return scenarios
  }

  // Get minimum points typically needed for a position
  getMinPointsForPosition(position) {
    // Historical data suggests these point thresholds
    const thresholds = {
      8: 11,  // Direct qualification
      16: 9,  // Playoff qualification
      24: 6   // Avoid elimination
    }
    
    return thresholds[position] || 0
  }

  // Generate fixture list (round-robin)
  generateFixtures(teams) {
    const fixtures = []
    let matchId = 1

    // Each team plays 8 matches in the new format
    // This is a simplified version - actual UEFA algorithm is more complex
    for (let matchday = 1; matchday <= 8; matchday++) {
      const dayFixtures = []
      
      // Generate matches for this matchday
      // In reality, this would follow UEFA's complex algorithm
      for (let i = 0; i < teams.length; i += 2) {
        if (i + 1 < teams.length) {
          dayFixtures.push({
            id: matchId++,
            homeTeamId: teams[i].id,
            awayTeamId: teams[i + 1].id,
            matchday: matchday,
            date: this.calculateMatchDate(matchday),
            time: this.calculateMatchTime(dayFixtures.length),
            venue: teams[i].stadium,
            city: teams[i].city,
            country: teams[i].country
          })
        }
      }
      
      fixtures.push(...dayFixtures)
    }

    return fixtures
  }

  // Calculate match date based on matchday
  calculateMatchDate(matchday) {
    const startDate = new Date('2024-09-17') // Champions League start date
    const weeksPerMatchday = 2
    const matchDate = new Date(startDate)
    matchDate.setDate(matchDate.getDate() + ((matchday - 1) * weeksPerMatchday * 7))
    return matchDate.toISOString().split('T')[0]
  }

  // Calculate match time based on match order
  calculateMatchTime(matchIndex) {
    const times = ['18:45', '21:00']
    return times[matchIndex % times.length]
  }

  // Validate tournament rules
  validateTournamentRules(data) {
    const errors = []

    // Check team count
    if (data.teams && data.teams.length !== this.config.MAX_TEAMS) {
      errors.push(`Tournament must have exactly ${this.config.MAX_TEAMS} teams`)
    }

    // Check matches per team
    if (data.matches && data.teams) {
      const matchesPerTeam = this.calculateMatchesPerTeam(data.matches, data.teams)
      const invalidTeams = matchesPerTeam.filter(t => t.matches !== this.config.MATCHES_PER_TEAM)
      
      if (invalidTeams.length > 0) {
        errors.push(`Each team must play exactly ${this.config.MATCHES_PER_TEAM} matches`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Calculate matches per team
  calculateMatchesPerTeam(matches, teams) {
    return teams.map(team => ({
      teamId: team.id,
      teamName: team.name,
      matches: matches.filter(match => 
        match.homeTeamId === team.id || match.awayTeamId === team.id
      ).length
    }))
  }

  // Get tournament phase
  getTournamentPhase(matchday) {
    if (matchday <= 8) {
      return 'league'
    } else if (matchday <= 10) {
      return 'playoff'
    } else if (matchday <= 12) {
      return 'round_of_16'
    } else if (matchday <= 14) {
      return 'quarter_finals'
    } else if (matchday <= 16) {
      return 'semi_finals'
    } else {
      return 'final'
    }
  }
}

export default new TournamentLogic()
