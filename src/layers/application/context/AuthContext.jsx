import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AuthService from '../services/AuthService'

const AuthContext = createContext(null)

const getInitialStatus = () => (AuthService.isAuthenticated() ? 'checking' : 'anonymous')

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(AuthService.getUser())
  const [status, setStatus] = useState(getInitialStatus())
  const [error, setError] = useState(null)

  const bootstrap = useCallback(async () => {
    if (!AuthService.isAuthenticated()) {
      setUser(null)
      setStatus('anonymous')
      return
    }

    setStatus('checking')
    try {
      const profile = await AuthService.restoreSession()
      setUser(profile)
      setStatus('authenticated')
    } catch (err) {
      console.error('Failed to restore session', err)
      setUser(null)
      setStatus('anonymous')
      setError(err?.message ?? 'Session expired')
    }
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const handleAuthChanged = (event) => {
      const nextUser = event?.detail?.user ?? AuthService.getUser()
      const isAuthenticated = event?.detail?.isAuthenticated ?? AuthService.isAuthenticated()
      setUser(nextUser)
      setStatus(isAuthenticated ? 'authenticated' : 'anonymous')
    }

    window.addEventListener('auth:changed', handleAuthChanged)
    return () => window.removeEventListener('auth:changed', handleAuthChanged)
  }, [])

  const login = useCallback(async (credentials) => {
    setStatus('authenticating')
    setError(null)
    try {
      const loggedInUser = await AuthService.login(credentials)
      setUser(loggedInUser)
      setStatus('authenticated')
      return loggedInUser
    } catch (err) {
      const message = err?.message ?? 'Unable to sign in right now.'
      setError(message)
      setUser(AuthService.getUser())
      setStatus(AuthService.isAuthenticated() ? 'authenticated' : 'anonymous')
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    await AuthService.logout()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const refreshProfile = useCallback(async () => {
    const profile = await AuthService.getCurrentUser()
    setUser(profile)
    setStatus('authenticated')
    return profile
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      isAuthenticated: status === 'authenticated',
      login,
      logout,
      refreshProfile,
      setUser,
      setStatus
    }),
    [user, status, error, login, logout, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export default AuthContext
