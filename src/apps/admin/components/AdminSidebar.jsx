import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { hasPermission } from '../utils/accessControl'
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
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Reports', path: '/admin/reports', icon: BarChart3 }
    ]
  },
  {
    title: 'Tournament Management',
    items: [
      { name: 'Seasons', path: '/admin/seasons', icon: Swords, permission: 'manage_teams' },
      { name: 'Teams', path: '/admin/teams', icon: Users, permission: 'manage_teams' },
      { name: 'Matches', path: '/admin/matches', icon: Calendar, permission: 'manage_matches' },
      // 2. Thêm link mới vào đây
      { name: 'Match Day', path: '/admin/matches-today', icon: PlayCircle, permission: 'manage_matches' },
      { name: 'Players', path: '/admin/players', icon: UserCheck, permission: 'manage_teams' },
      { name: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy, permission: 'manage_matches' },
      { name: 'Player Stats', path: '/admin/player-stats', icon: Target, permission: 'manage_matches' },
      { name: 'Standings', path: '/admin/standings', icon: Trophy }
    ]
  },
  {
    title: 'Content Management',
    items: [
      { name: 'News & Articles', path: '/admin/news', icon: FileText, permission: 'manage_content' },
      { name: 'Media Library', path: '/admin/media', icon: Target, permission: 'manage_content' },
      { name: 'Website Content', path: '/admin/content', icon: Globe, permission: 'manage_content' }
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'User Management', path: '/admin/users', icon: Shield, permission: 'manage_users' },
      { name: 'Role Permissions', path: '/admin/roles', icon: KeyRound, permission: 'manage_users' },
      { name: 'Ruleset Governance', path: '/admin/rulesets', icon: ScrollText, permission: 'manage_rulesets' },
      { name: 'Audit Trail', path: '/admin/audit-log', icon: History, permission: 'view_audit_logs' },
      { name: 'Settings', path: '/admin/settings', icon: Settings, permission: 'manage_users' }
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
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg">UEFA Admin</div>
            <div className="text-gray-400 text-sm">Management Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        {filteredMenu.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3 px-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === item.path
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
