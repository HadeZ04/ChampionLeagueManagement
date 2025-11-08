import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PublicApp from './apps/public/PublicApp'
import AdminApp from './apps/admin/AdminApp'
import LoginPage from './apps/admin/pages/LoginPage'
import AuthService from './layers/application/services/AuthService'
import { hasAdminPortalAccess } from './apps/admin/utils/accessControl'

function App() {
  const [adminUser, setAdminUser] = useState(AuthService.getUser())
  const [isAuthBootstrapped, setIsAuthBootstrapped] = useState(false)

  const isAdminAuthenticated = AuthService.isAuthenticated() && hasAdminPortalAccess(adminUser)

  useEffect(() => {
    const bootstrap = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const profile = await AuthService.restoreSession()
          if (profile && hasAdminPortalAccess(profile)) {
            setAdminUser(profile)
          } else {
            await AuthService.logout()
            setAdminUser(null)
          }
        } catch (error) {
          console.error('Failed to restore admin session:', error)
          await AuthService.logout()
          setAdminUser(null)
        }
      }
      setIsAuthBootstrapped(true)
    }

    bootstrap()
  }, [])

  const handleAdminLogin = async (credentials) => {
    const user = await AuthService.login(credentials)
    if (!hasAdminPortalAccess(user)) {
      await AuthService.logout()
      setAdminUser(null)
      throw new Error('Your account does not have access to the admin area..')
    }
    setAdminUser(user)
  }

  const handleAdminLogout = async () => {
    await AuthService.logout()
    setAdminUser(null)
  }

  if (!isAuthBootstrapped) {
    return null
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Public Portal Routes */}
          <Route path="/*" element={<PublicApp />} />
          
          {/* Admin Dashboard Routes */}
          <Route 
            path="/admin/login" 
            element={
              <LoginPage onLogin={handleAdminLogin} isAuthenticated={isAdminAuthenticated} />
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              isAdminAuthenticated ? (
                <AdminApp onLogout={handleAdminLogout} currentUser={adminUser} />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
