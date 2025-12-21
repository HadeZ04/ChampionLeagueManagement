import React, { useMemo, useState } from 'react'
import { Bell, Search, Settings, User, LogOut } from 'lucide-react'
import { toRoleLabel } from '../../../shared/utils/vi'

const AdminHeader = ({ onLogout, currentUser }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const displayName = useMemo(() => {
    if (!currentUser) {
      return 'Quản trị viên'
    }
    if (currentUser.firstName || currentUser.lastName) {
      return `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim()
    }
    return currentUser.username ?? 'Quản trị viên'
  }, [currentUser])

  const displayRole = useMemo(() => {
    const role = currentUser?.roles?.[0]
    if (!role) return 'Quản trị hệ thống'
    return toRoleLabel(role)
  }, [currentUser])

  const notifications = [
    { id: 1, title: 'Có kết quả trận mới được gửi', time: '5 phút trước', type: 'info' },
    { id: 2, title: 'Đăng ký đội đang chờ phê duyệt', time: '15 phút trước', type: 'warning' },
    { id: 3, title: 'Sao lưu hệ thống đã hoàn tất', time: '1 giờ trước', type: 'success' }
  ]

  const getNotificationColor = (type) => {
    switch (type) {
      case 'info': return 'border-l-cyan-400 bg-cyan-500/10'
      case 'warning': return 'border-l-amber-400 bg-amber-500/10'
      case 'success': return 'border-l-emerald-400 bg-emerald-500/10'
      case 'error': return 'border-l-rose-400 bg-rose-500/10'
      default: return 'border-l-white/10 bg-white/5'
    }
  }

  return (
    <header className="admin-topbar sticky top-0 z-40 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 drop-shadow-sm">Cổng quản trị</h1>
          {currentUser?.roles && (
            <span className="admin-badge admin-badge-blue px-3 py-1 text-sm font-bold capitalize">
              {displayRole}
            </span>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200/40" />
            <input
              type="text"
              placeholder="Tìm kiếm đội, trận đấu, cầu thủ..."
              className="admin-input pl-10 pr-4 py-2 text-sm w-64"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 text-blue-200/60 hover:text-white transition-colors relative"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 admin-surface rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold text-white">Thông báo</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 border-l-4 ${getNotificationColor(notification.type)} hover:bg-white/5 transition-colors cursor-pointer`}>
                      <div className="font-medium text-slate-100 text-sm">{notification.title}</div>
                      <div className="text-blue-200/40 text-xs mt-1">{notification.time}</div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/10 text-center">
                  <button className="text-cyan-300 hover:text-cyan-200 text-sm font-bold uppercase tracking-wider">
                    Xem tất cả thông báo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="p-2 text-blue-200/60 hover:text-white transition-colors">
            <Settings size={20} />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 p-2 text-blue-200/60 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-bold text-white">{displayName}</div>
                <div className="text-xs text-blue-200/40 capitalize">{displayRole}</div>
              </div>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 admin-surface rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-white/10">
                  <div className="font-bold text-white">{displayName}</div>
                  <div className="text-sm text-blue-200/40">{currentUser?.email ?? '—'}</div>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-blue-100/80 hover:bg-white/5 transition-colors">
                    Cài đặt hồ sơ
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-blue-100/80 hover:bg-white/5 transition-colors">
                    Tuỳ chọn tài khoản
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-blue-100/80 hover:bg-white/5 transition-colors">
                    Trợ giúp & hỗ trợ
                  </button>
                </div>
                <div className="border-t border-white/10 py-1">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
