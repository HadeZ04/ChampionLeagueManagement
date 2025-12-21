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
    <div className="py-10">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-lg font-bold uppercase">
            {initials}
          </div>
          <div>
            <p className="text-sm text-blue-100">Đã đăng nhập</p>
            <h1 className="text-2xl font-semibold leading-tight">Xin chào, {name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide">
              {roles.map((role) => (
                <span key={role} className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
                  {toRoleLabel(role)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 transition"
          >
            <UserRound size={16} />
            Hồ sơ
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 text-gray-700">
        <ShieldCheck size={18} className="text-blue-600" />
        <p className="text-sm">
          Quyền truy cập được giới hạn theo vai trò. Các mục dưới đây thể hiện những gì bạn có thể làm hôm nay.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <div key={module.key} className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  {module.key === 'team_registrar' && <ClipboardList size={18} />}
                  {module.key === 'referee' && <BadgeCheck size={18} />}
                  {module.key === 'supervisor' && <FileText size={18} />}
                  {module.key === 'viewer' && <UserRound size={18} />}
                  {module.key === 'profile' && <UserRound size={18} />}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">{module.badge}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{module.badge}</span>
            </div>
            <p className="mt-3 text-sm text-gray-600">{module.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {module.actions?.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:border-blue-500 hover:text-blue-700 transition"
                >
                  <ArrowRight size={14} />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PortalHomePage
