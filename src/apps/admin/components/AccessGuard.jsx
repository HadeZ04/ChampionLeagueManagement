import React from 'react'
import { Navigate } from 'react-router-dom'
import { hasAdminPortalAccess, hasPermission } from '../utils/accessControl'

const AccessGuard = ({ children, permission, currentUser }) => {
  if (!hasAdminPortalAccess(currentUser)) {
    return <Navigate to="/admin/login" replace />
  }

  if (!hasPermission(currentUser, permission)) {
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
