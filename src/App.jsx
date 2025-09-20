import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PublicApp from './apps/public/PublicApp'
import AdminApp from './apps/admin/AdminApp'
import LoginPage from './apps/admin/pages/LoginPage'

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [currentApp, setCurrentApp] = useState('public') // 'public' or 'admin'

  // Check if current path is admin
  const isAdminPath = window.location.pathname.startsWith('/admin')

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
              <LoginPage 
                onLogin={() => setIsAdminAuthenticated(true)} 
                isAuthenticated={isAdminAuthenticated}
              />
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              isAdminAuthenticated ? (
                <AdminApp onLogout={() => setIsAdminAuthenticated(false)} />
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
