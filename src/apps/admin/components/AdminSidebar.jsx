import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { hasAnyPermission, hasPermission } from '../utils/accessControl'
// 1. Import icon mới
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  FileText,
  Settings,
  BarChart3,
  Trophy,
  Target,
  Shield,
  Globe,
  Swords,
  PlayCircle,
  ScrollText,
  History,
  KeyRound
} from 'lucide-react'

const MENU_SECTIONS = [
  {
    title: 'Đội của tôi',
    allowedRoles: ['team_admin'],
    disallowedRoles: ['super_admin'],
    items: [
      { name: 'Đội của tôi', path: '/admin/my-team', icon: Users, permission: 'view_own_team' },
      {
        name: 'Đăng ký cầu thủ',
        path: '/admin/players',
        icon: UserCheck,
        // Allow if user has either team management or specifically own player registration
        anyPermissions: ['manage_teams', 'manage_own_player_registrations'],
        disallowedRoles: ['super_admin']
      },
      { name: 'Đăng ký mùa giải', path: '/admin/player-registrations', icon: FileText, permission: 'manage_own_player_registrations' }
    ]
  },
  {
    title: 'Tổng quan',
    items: [
      { name: 'Bảng điều khiển', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Báo cáo', path: '/admin/reports', icon: BarChart3 }
    ]
  },
  {
    title: 'Quản lý giải đấu',
    items: [
      { name: 'Mùa giải', path: '/admin/seasons', icon: Swords, permission: 'manage_teams' },
      { name: 'Đội bóng', path: '/admin/teams', icon: Users, permission: 'manage_teams' },
      { name: 'Trận đấu', path: '/admin/matches', icon: Calendar, permission: 'manage_matches' },
      { name: 'Trận trong ngày', path: '/admin/matches-today', icon: PlayCircle, permission: 'manage_matches' },
      { name: 'Tra cứu cầu thủ', path: '/admin/season-players', icon: Users, permission: 'manage_teams' },
      {
        name: 'Duyệt đăng ký cầu thủ',
        path: '/admin/season-player-approvals',
        icon: ScrollText,
        permission: 'approve_player_registrations'
      },
      { name: 'Thống kê cầu thủ', path: '/admin/player-stats', icon: Target, permission: 'manage_matches' },
      { name: 'Bảng đứng', path: '/admin/standings', icon: Trophy, permission: 'manage_matches' }
    ]
  },
  {
    title: 'Quản lý nội dung',
    items: [
      { name: 'Tin tức & Bài viết', path: '/admin/news', icon: FileText, permission: 'manage_content' },
      { name: 'Thư viện Media', path: '/admin/media', icon: Target, permission: 'manage_content' },
      { name: 'Nội dung Website', path: '/admin/content', icon: Globe, permission: 'manage_content' }
    ]
  },
  {
    title: 'Hệ thống',
    items: [
      { name: 'Quản lý người dùng', path: '/admin/users', icon: Shield, permission: 'manage_users' },
      { name: 'Vai trò & Quyền', path: '/admin/roles', icon: KeyRound, permission: 'manage_users' },
      { name: 'Quản trị Quy tắc', path: '/admin/rulesets', icon: ScrollText, permission: 'manage_rulesets' },
      { name: 'Lịch sử Kiểm toán', path: '/admin/audit-log', icon: History, permission: 'view_audit_logs' },
      { name: 'Cài đặt', path: '/admin/settings', icon: Settings, permission: 'manage_users' }
    ]
  }
]

const AdminSidebar = ({ currentUser }) => {
  const location = useLocation()

  const hasAllowedRole = (allowedRoles) => {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      return true
    }
    const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : []
    return allowedRoles.some((role) => roles.includes(role))
  }

  const hasDisallowedRole = (disallowedRoles) => {
    if (!Array.isArray(disallowedRoles) || disallowedRoles.length === 0) {
      return false
    }
    const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : []
    return disallowedRoles.some((role) => roles.includes(role))
  }

  const filteredMenu = useMemo(() => {
    return MENU_SECTIONS
      .filter((section) => hasAllowedRole(section.allowedRoles) && !hasDisallowedRole(section.disallowedRoles))
      .map((section) => {
        const items = section.items.filter((item) => {
          if (!hasAllowedRole(item.allowedRoles) || hasDisallowedRole(item.disallowedRoles)) {
            return false
          }

          return Array.isArray(item.anyPermissions)
            ? hasAnyPermission(currentUser, item.anyPermissions)
            : hasPermission(currentUser, item.permission)
        })

        return { ...section, items }
      })
      .filter((section) => section.items.length > 0)
  }, [currentUser])

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" fill="white" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg">Quản trị UEFA</div>
            <div className="text-gray-400 text-sm">Cổng quản lý</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 min-h-0 overflow-y-auto pr-1">
        {filteredMenu.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3 px-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-1.5 rounded-lg transition-colors ${(location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="mt-auto border-t border-gray-700 pt-4">
        <div className="space-y-2">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Quick Add Match
          </button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
