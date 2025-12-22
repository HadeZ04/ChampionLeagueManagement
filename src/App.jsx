import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import PublicApp from './apps/public/PublicApp'
import AdminApp from './apps/admin/AdminApp'
import LoginPage from './apps/admin/pages/LoginPage'
import { hasAdminPortalAccess } from './apps/admin/utils/accessControl'
import { useAuth } from './layers/application/context/AuthContext'

const AdminRoute = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, user, status } = useAuth()
  const isAdminAuthenticated = isAuthenticated && hasAdminPortalAccess(user)

  if (status === 'checking') {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/portal" replace />
  }

  return children
}

const AdminLoginRoute = ({ children }) => {
  const { isAuthenticated, user, status } = useAuth()
  const isAdminAuthenticated = isAuthenticated && hasAdminPortalAccess(user)

  if (status === 'checking') {
    return null
  }

  if (isAdminAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (isAuthenticated && !isAdminAuthenticated) {
    return <Navigate to="/portal" replace />
  }

  return children
}

function App() {
  const { user, status, isAuthenticated, login, logout } = useAuth()
  const isAdminAuthenticated = isAuthenticated && hasAdminPortalAccess(user)

  const handleAdminLogin = async (credentials) => {
    const loggedInUser = await login(credentials)
    if (!hasAdminPortalAccess(loggedInUser)) {
      await logout()
      throw new Error('Tài khoản của bạn không có quyền truy cập khu vực quản trị.')
    }
    return loggedInUser
  }

  const handleAdminLogout = async () => {
    await logout()
  }

  if (status === 'checking') {
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
              <AdminLoginRoute>
                <LoginPage onLogin={handleAdminLogin} isAuthenticated={isAdminAuthenticated} />
              </AdminLoginRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <AdminRoute>
                <AdminApp onLogout={handleAdminLogout} currentUser={user} />
              </AdminRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
