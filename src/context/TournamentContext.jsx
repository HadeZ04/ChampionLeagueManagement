import React, { createContext, useContext, useReducer, useEffect } from 'react'

const TournamentContext = createContext()

const initialState = {
  teams: [],
  matches: [],
  results: [],
  players: [],
  regulations: {
    minAge: 16,
    maxAge: 40,
    maxForeignPlayers: 3,
    minPlayers: 15,
    maxPlayers: 22,
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    goalTypes: ['A', 'B', 'C'],
    maxGoalTime: 90
  }
}

function tournamentReducer(state, action) {
  switch (action.type) {
    case 'ADD_TEAM':
      return {
        ...state,
        teams: [...state.teams, { ...action.payload, id: Date.now() }]
      }
    
    case 'ADD_MATCH':
      return {
        ...state,
        matches: [...state.matches, { ...action.payload, id: Date.now() }]
      }
    
    case 'ADD_RESULT':
      return {
        ...state,
        results: [...state.results, { ...action.payload, id: Date.now() }]
      }
    
    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, { ...action.payload, id: Date.now() }]
      }
    
    case 'UPDATE_REGULATIONS':
      return {
        ...state,
        regulations: { ...state.regulations, ...action.payload }
      }
    
    case 'LOAD_DATA':
      return { ...state, ...action.payload }
    
    default:
      return state
  }
}

export function TournamentProvider({ children }) {
  const [state, dispatch] = useReducer(tournamentReducer, initialState)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('tournamentData')
    if (savedData) {
      dispatch({ type: 'LOAD_DATA', payload: JSON.parse(savedData) })
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('tournamentData', JSON.stringify(state))
  }, [state])

  const addTeam = (team) => {
    dispatch({ type: 'ADD_TEAM', payload: team })
  }

  const addMatch = (match) => {
    dispatch({ type: 'ADD_MATCH', payload: match })
  }

  const addResult = (result) => {
    dispatch({ type: 'ADD_RESULT', payload: result })
  }

  const addPlayer = (player) => {
    dispatch({ type: 'ADD_PLAYER', payload: player })
  }

  const updateRegulations = (regulations) => {
    dispatch({ type: 'UPDATE_REGULATIONS', payload: regulations })
  }

  const calculateStandings = () => {
    const standings = state.teams.map(team => {
      const teamResults = state.results.filter(
        result => result.team1 === team.name || result.team2 === team.name
      )

      let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0

      teamResults.forEach(result => {
        const isTeam1 = result.team1 === team.name
        const teamScore = isTeam1 ? result.score1 : result.score2
        const opponentScore = isTeam1 ? result.score2 : result.score1

        goalsFor += teamScore
        goalsAgainst += opponentScore

        if (teamScore > opponentScore) wins++
        else if (teamScore === opponentScore) draws++
        else losses++
      })

      const points = wins * state.regulations.winPoints + draws * state.regulations.drawPoints
      const goalDifference = goalsFor - goalsAgainst

      return {
        team: team.name,
        played: teamResults.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points
      }
    })

    return standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })
  }

  const getTopScorers = () => {
    const scorers = {}
    
    state.results.forEach(result => {
      if (result.goals) {
        result.goals.forEach(goal => {
          if (!scorers[goal.player]) {
            scorers[goal.player] = {
              player: goal.player,
              team: goal.team,
              goals: 0
            }
          }
          scorers[goal.player].goals++
        })
      }
    })

    return Object.values(scorers).sort((a, b) => b.goals - a.goals)
  }

  const value = {
    ...state,
    addTeam,
    addMatch,
    addResult,
    addPlayer,
    updateRegulations,
    calculateStandings,
    getTopScorers
  }

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  )
}

export function useTournament() {
  const context = useContext(TournamentContext)
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider')
  }
  return context
}
