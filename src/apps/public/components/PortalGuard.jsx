import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../layers/application/context/AuthContext'
import { hasAdminPortalAccess } from '../../admin/utils/accessControl'

const PortalGuard = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, status, user } = useAuth()

  if (status === 'checking') {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (hasAdminPortalAccess(user)) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default PortalGuard
