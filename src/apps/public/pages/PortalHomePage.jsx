import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, ClipboardList, FileText, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../../../layers/application/context/AuthContext'
import { hasAdminPortalAccess } from '../../admin/utils/accessControl'
import { toRoleLabel } from '../../../shared/utils/vi'

const VIEWER_MODULE = {
  key: 'viewer',
  title: 'Dành cho người xem',
  description: 'Xem lịch thi đấu, bảng xếp hạng và tin tức phù hợp với tài khoản của bạn.',
  actions: [
    { label: 'Xem bảng xếp hạng', path: '/standings' },
    { label: 'Xem lịch thi đấu', path: '/matches' }
  ],
  badge: 'người xem'
}

const MODULE_CATALOG = [
  {
    key: 'team_registrar',
    title: 'Quản lý đăng ký đội',
    description: 'Gửi danh sách, tải tài liệu và theo dõi trạng thái phê duyệt.',
    badge: 'đăng ký đội',
    roles: ['teamregistrar', 'team_registrar', 'team_manager', 'registrar'],
    actions: [
      { label: 'Quản lý đăng ký', path: '/submit-lineup' },
      { label: 'Tải tài liệu', path: '/profile' }
    ]
  },
  {
    key: 'referee',
    title: 'Trọng tài',
    description: 'Xem phân công trận đấu và truy cập bảng điều khiển trực tiếp.',
    badge: 'trọng tài',
    roles: ['referee', 'match_official', 'official'],
    actions: [
      { label: 'Phân công của tôi', path: '/matches' },
      { label: 'Bảng trực tiếp', path: '/match-center' }
    ]
  },
  {
    key: 'supervisor',
    title: 'Giám sát',
    description: 'Theo dõi báo cáo và vận hành giải đấu trơn tru.',
    badge: 'giám sát',
    roles: ['supervisor', 'competition_manager', 'competitionmanager'],
    actions: [
      { label: 'Theo dõi báo cáo', path: '/profile' },
      { label: 'Duyệt trận đấu', path: '/matches' }
    ]
  },
  {
    key: 'viewer',
    ...VIEWER_MODULE,
    roles: ['viewer', 'read_only', 'readonly', 'fan']
  }
]

const COMMON_MODULES = [
  {
    key: 'profile',
    title: 'Hồ sơ & bảo mật',
    description: 'Cập nhật thông tin liên hệ, mật khẩu và phiên đăng nhập.',
    badge: 'tài khoản',
    roles: ['*'],
    actions: [
      { label: 'Mở hồ sơ', path: '/profile' }
    ]
  }
]

const buildModules = (roles = []) => {
  const normalized = roles.map((role) => String(role).toLowerCase())
  const modules = []

  const tryAdd = (module) => {
    const allowAll = module.roles?.includes('*')
    const isAllowed = allowAll || module.roles?.some((role) => normalized.includes(role))
    if (isAllowed) {
      const exists = modules.find((item) => item.key === module.key)
      if (!exists) {
        modules.push(module)
      }
    }
  }

  MODULE_CATALOG.forEach(tryAdd)
  COMMON_MODULES.forEach(tryAdd)

  if (!modules.length) {
    modules.push(VIEWER_MODULE)
  }

  return modules
}

const PortalHomePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const name = useMemo(() => {
    if (!user) return 'Khách'
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    }
    return user.username ?? user.email ?? 'Người dùng'
  }, [user])

  const roles = useMemo(() => (Array.isArray(user?.roles) && user.roles.length ? user.roles : ['viewer']), [user])
  const modules = useMemo(() => buildModules(roles), [roles])
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (!user || hasAdminPortalAccess(user)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#1e293b] to-[#0f172a] py-10">
      {/* Hero Header with UEFA Style */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#003B73] via-[#004EA8] to-[#00C65A] p-1 shadow-2xl">
        <div className="flex flex-col gap-6 rounded-[22px] bg-gradient-to-br from-[#0a1929]/95 via-[#1e293b]/95 to-[#0f172a]/95 p-8 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0055FF] text-2xl font-bold uppercase shadow-lg shadow-blue-500/50">
              {initials}
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.3em] text-[#00d4ff]">Cổng người dùng • UEFA Champions League</p>
              <h1 className="text-3xl font-bold leading-tight text-white">Xin chào, {name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {roles.map((role) => (
                  <span key={role} className="rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00d4ff]">
                    <ShieldCheck size={10} className="mr-1 inline" />
                    {toRoleLabel(role)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-[#00d4ff]/50 hover:bg-white/10 hover:shadow-lg hover:shadow-[#00d4ff]/20"
            >
              <UserRound size={16} />
              Hồ sơ
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0055FF] px-5 py-3 text-sm font-bold text-[#0a1929] transition-all hover:shadow-lg hover:shadow-blue-500/50"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80 backdrop-blur-xl">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#00d4ff]/10">
          <ShieldCheck size={20} className="text-[#00d4ff]" />
        </div>
        <p className="text-sm leading-relaxed">
          Quyền truy cập được giới hạn theo vai trò. Các mục dưới đây thể hiện những gì bạn có thể làm hôm nay.
        </p>
      </div>

      {/* Modules Grid with Glass Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((module) => (
          <div 
            key={module.key} 
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-2xl transition-all hover:border-[#00d4ff]/50 hover:shadow-[#00d4ff]/20"
          >
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/0 to-[#0055FF]/0 opacity-0 transition-opacity group-hover:opacity-10"></div>
            
            <div className="relative z-10">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-[#0055FF]/20 text-[#00d4ff] shadow-lg">
                    {module.key === 'team_registrar' && <ClipboardList size={24} />}
                    {module.key === 'referee' && <BadgeCheck size={24} />}
                    {module.key === 'supervisor' && <FileText size={24} />}
                    {module.key === 'viewer' && <UserRound size={24} />}
                    {module.key === 'profile' && <UserRound size={24} />}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">{module.badge}</p>
                    <h3 className="text-xl font-bold text-white">{module.title}</h3>
                  </div>
                </div>
                <span className="rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#00d4ff]">
                  {module.badge}
                </span>
              </div>
              
              <p className="mb-5 text-sm leading-relaxed text-white/70">{module.description}</p>
              
              <div className="flex flex-wrap gap-3">
                {module.actions?.map((action) => (
                  <Link
                    key={action.label}
                    to={action.path}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/10 hover:text-[#00d4ff]"
                  >
                    <ArrowRight size={14} />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PortalHomePage
