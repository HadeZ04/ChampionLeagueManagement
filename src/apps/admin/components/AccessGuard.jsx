import React from 'react'
import { Navigate } from 'react-router-dom'
import { hasAdminPortalAccess, hasAnyPermission, hasPermission } from '../utils/accessControl'

const AccessGuard = ({ children, permission, anyPermissions, allowedRoles, disallowedRoles, currentUser }) => {
  if (!hasAdminPortalAccess(currentUser)) {
    return <Navigate to="/admin/login" replace />
  }

  const userRoles = Array.isArray(currentUser?.roles) ? currentUser.roles : []

  const isAllowedRole =
    !Array.isArray(allowedRoles) || allowedRoles.length === 0
      ? true
      : allowedRoles.some((role) => userRoles.includes(role))

  const isDisallowedRole =
    Array.isArray(disallowedRoles) && disallowedRoles.length > 0
      ? disallowedRoles.some((role) => userRoles.includes(role))
      : false

  const isAllowed =
    Array.isArray(anyPermissions) && anyPermissions.length > 0
      ? hasAnyPermission(currentUser, anyPermissions)
      : hasPermission(currentUser, permission)

  if (!isAllowed || !isAllowedRole || isDisallowedRole) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-lg font-semibold mb-2">Không có quyền truy cập</h2>
        <p className="text-sm">
          Tài khoản của bạn không có quyền sử dụng chức năng này. Vui lòng liên hệ quản trị viên nếu cần cấp quyền.
        </p>
      </div>
    )
  }

  return children
}

export default AccessGuard
