// Application Store - Global State Management
// Manages application-wide state using React Context

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import TeamsService from '../services/TeamsService'
import MatchesService from '../services/MatchesService'
import AuthService from '../services/AuthService'
import logger from '../../../shared/utils/logger'

// Initial state
const initialState = {
  // Authentication
  user: null,
  isAuthenticated: false,
  
  // Tournament data
  teams: [],
  matches: [],
  standings: [],
  players: [],
  news: [],
  
  // UI state
  loading: {
    teams: false,
    matches: false,
    standings: false,
    players: false,
    news: false
  },
  
  // Error state
  errors: {
    teams: null,
    matches: null,
    standings: null,
    players: null,
    news: null
  },
  
  // Filters and pagination
  filters: {
    teams: { country: 'all', search: '', page: 1 },
    matches: { date: '', status: 'all', page: 1 },
    news: { category: 'all', search: '', page: 1 }
  },
  
  // Live data
  liveMatches: [],
  liveEvents: [],
  
  // Cache timestamps
  lastUpdated: {
    teams: null,
    matches: null,
    standings: null,
    players: null,
    news: null
  }
}

// Action types
const ActionTypes = {
  // Authentication
  SET_USER: 'SET_USER',
  CLEAR_USER: 'CLEAR_USER',
  
  // Loading states
  SET_LOADING: 'SET_LOADING',
  
  // Data updates
  SET_TEAMS: 'SET_TEAMS',
  SET_MATCHES: 'SET_MATCHES',
  SET_STANDINGS: 'SET_STANDINGS',
  SET_PLAYERS: 'SET_PLAYERS',
  SET_NEWS: 'SET_NEWS',
  
  // Live updates
  SET_LIVE_MATCHES: 'SET_LIVE_MATCHES',
  ADD_LIVE_EVENT: 'ADD_LIVE_EVENT',
  
  // Filters
  UPDATE_FILTER: 'UPDATE_FILTER',
  
  // Errors
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Cache
  UPDATE_TIMESTAMP: 'UPDATE_TIMESTAMP'
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      }
      
    case ActionTypes.CLEAR_USER:
      return {
        ...state,
        user: null,
        isAuthenticated: false
      }
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      }
      
    case ActionTypes.SET_TEAMS:
      return {
        ...state,
        teams: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          teams: new Date()
        }
      }
      
    case ActionTypes.SET_MATCHES:
      return {
        ...state,
        matches: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          matches: new Date()
        }
      }
      
    case ActionTypes.SET_STANDINGS:
      return {
        ...state,
        standings: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          standings: new Date()
        }
      }
      
    case ActionTypes.SET_LIVE_MATCHES:
      return {
        ...state,
        liveMatches: action.payload
      }
      
    case ActionTypes.ADD_LIVE_EVENT:
      return {
        ...state,
        liveEvents: [action.payload, ...state.liveEvents.slice(0, 9)]
      }
      
    case ActionTypes.UPDATE_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.category]: {
            ...state.filters[action.payload.category],
            ...action.payload.filters
          }
        }
      }
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error
        }
      }
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null
        }
      }
      
    default:
      return state
  }
}

// Context
const AppContext = createContext()

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize authentication state
  useEffect(() => {
    const user = AuthService.getUser()
    if (user) {
      dispatch({ type: ActionTypes.SET_USER, payload: user })
    }
  }, [])

  // Actions
  const actions = {
    // Authentication actions
    login: async (credentials) => {
      try {
        const user = await AuthService.login(credentials)
        dispatch({ type: ActionTypes.SET_USER, payload: user })
        return user
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: { key: 'auth', error: error.message } })
        throw error
      }
    },

    logout: async () => {
      await AuthService.logout()
      dispatch({ type: ActionTypes.CLEAR_USER })
    },

    // Data fetching actions
    fetchTeams: async (filters = {}) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'teams', value: true } })
      try {
        const response = await TeamsService.getAllTeams(filters)
        dispatch({ type: ActionTypes.SET_TEAMS, payload: response.teams })
        dispatch({ type: ActionTypes.CLEAR_ERROR, payload: 'teams' })
        return response
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: { key: 'teams', error: error.message } })
        throw error
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'teams', value: false } })
      }
    },

    fetchMatches: async (filters = {}) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'matches', value: true } })
      try {
        const response = await MatchesService.getAllMatches(filters)
        dispatch({ type: ActionTypes.SET_MATCHES, payload: response.matches })
        dispatch({ type: ActionTypes.CLEAR_ERROR, payload: 'matches' })
        return response
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: { key: 'matches', error: error.message } })
        throw error
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'matches', value: false } })
      }
    },

    fetchLiveMatches: async () => {
      try {
        const liveMatches = await MatchesService.getLiveMatches()
        dispatch({ type: ActionTypes.SET_LIVE_MATCHES, payload: liveMatches })
        return liveMatches
      } catch (error) {
        logger.error('Failed to fetch live matches:', error)
      }
    },

    // Filter actions
    updateFilter: (category, filters) => {
      dispatch({ 
        type: ActionTypes.UPDATE_FILTER, 
        payload: { category, filters } 
      })
    },

    // Live event actions
    addLiveEvent: (event) => {
      dispatch({ type: ActionTypes.ADD_LIVE_EVENT, payload: event })
    },

    // Error actions
    clearError: (key) => {
      dispatch({ type: ActionTypes.CLEAR_ERROR, payload: key })
    }
  }

  const value = {
    state,
    actions,
    dispatch
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use the app context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext

