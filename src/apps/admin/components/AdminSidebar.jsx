import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { hasPermission } from '../utils/accessControl'
import uefaLogo from '@/assets/images/UEFA_CHAMPIONS_LEAGUE.png'
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
      { name: 'Lịch thi đấu', path: '/admin/fixtures', icon: Calendar, permission: 'manage_matches' },
      { name: 'Đội bóng', path: '/admin/teams', icon: Users, permission: 'manage_teams' },
      { name: 'Trận đấu', path: '/admin/matches', icon: Calendar, permission: 'manage_matches' },
      // 2. Thêm link mới vào đây
      { name: 'Trận hôm nay', path: '/admin/matches-today', icon: PlayCircle, permission: 'manage_matches' },
      { name: 'Trận trực tiếp', path: '/admin/matches-live', icon: PlayCircle, permission: 'manage_matches' },
      { name: 'Phê duyệt', path: '/admin/approvals', icon: Shield, permission: 'approve_registrations' },
      { name: 'Cầu thủ', path: '/admin/players', icon: UserCheck, permission: 'manage_teams' },
      { name: 'Bảng thành tích', path: '/admin/leaderboard', icon: Trophy, permission: 'manage_matches' },
      { name: 'Thống kê cầu thủ', path: '/admin/player-stats', icon: Target, permission: 'manage_matches' },
      { name: 'Bảng xếp hạng', path: '/admin/standings', icon: Trophy }
    ]
  },
  {
    title: 'Quản lý nội dung',
    items: [
      { name: 'CMS', path: '/admin/cms', icon: FileText, permission: 'manage_content' },
      { name: 'Tin tức & bài viết', path: '/admin/news', icon: FileText, permission: 'manage_content' },
      { name: 'Thư viện đa phương tiện', path: '/admin/media', icon: Target, permission: 'manage_content' },
      { name: 'Nội dung website', path: '/admin/content', icon: Globe, permission: 'manage_content' }
    ]
  },
  {
    title: 'Hệ thống',
    items: [
      { name: 'Quản lý người dùng', path: '/admin/users', icon: Shield, permission: 'manage_users' },
      { name: 'Phân quyền vai trò', path: '/admin/roles', icon: KeyRound, permission: 'manage_users' },
      { name: 'Lời mời', path: '/admin/invitations', icon: ScrollText, permission: 'manage_users' },
      { name: 'Quản trị bộ luật', path: '/admin/rulesets', icon: ScrollText, permission: 'manage_rulesets' },
      { name: 'Trọng tài', path: '/admin/officials', icon: Shield, permission: 'manage_matches' },
      { name: 'Nhật ký hoạt động', path: '/admin/audit-log', icon: History, permission: 'view_audit_logs' },
      { name: 'Cài đặt', path: '/admin/settings', icon: Settings, permission: 'manage_users' }
    ]
  }
]

const AdminSidebar = ({ currentUser }) => {
  const location = useLocation()

  const filteredMenu = useMemo(() => {
    return MENU_SECTIONS
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => hasPermission(currentUser, item.permission))
      }))
      .filter((section) => section.items.length > 0)
  }, [currentUser])

  return (
    <aside className="w-64 bg-[#0a0f1e]/95 text-white min-h-screen p-4 flex flex-col backdrop-blur-sm">
      {/* Logo */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <img
              src={uefaLogo}
              alt="Cúp C1 châu Âu"
              className="w-6 h-6 object-contain"
              loading="lazy"
            />
          </div>
          <div>
            <div className="font-bold text-lg">Cổng quản trị</div>
            <div className="text-blue-200/40 text-sm">Khu vực quản trị</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        {filteredMenu.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-blue-200/40 text-xs font-semibold uppercase tracking-[0.2em] mb-3 px-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 text-white shadow-[0_0_20px_-10px_rgba(34,211,238,0.6)]'
                        : 'text-blue-100/70 hover:text-white hover:bg-white/5'
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
      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="space-y-2">
          <button className="w-full admin-btn-primary">
            <span>Thêm trận nhanh</span>
          </button>
          <button className="w-full admin-btn-secondary">
            Tạo báo cáo
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
