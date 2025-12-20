import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, ClipboardList, FileText, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../../../layers/application/context/AuthContext'
import { hasAdminPortalAccess } from '../../admin/utils/accessControl'

const VIEWER_MODULE = {
  key: 'viewer',
  title: 'Fan & viewer access',
  description: 'Check fixtures, standings, and news tailored to your account.',
  actions: [
    { label: 'See standings', path: '/standings' },
    { label: 'View fixtures', path: '/matches' }
  ],
  badge: 'viewer'
}

const MODULE_CATALOG = [
  {
    key: 'team_registrar',
    title: 'Team registrar',
    description: 'Submit rosters, upload documents, and track approval status.',
    badge: 'team_registrar',
    roles: ['teamregistrar', 'team_registrar', 'team_manager', 'registrar'],
    actions: [
      { label: 'Manage registrations', path: '/submit-lineup' },
      { label: 'Upload documents', path: '/profile' }
    ]
  },
  {
    key: 'referee',
    title: 'Referee',
    description: 'Review your match assignments and jump into the live console.',
    badge: 'referee',
    roles: ['referee', 'match_official', 'official'],
    actions: [
      { label: 'My assignments', path: '/matches' },
      { label: 'Live console', path: '/match-center' }
    ]
  },
  {
    key: 'supervisor',
    title: 'Supervisor',
    description: 'Monitor reports and keep competitions running smoothly.',
    badge: 'supervisor',
    roles: ['supervisor', 'competition_manager', 'competitionmanager'],
    actions: [
      { label: 'Monitor reports', path: '/profile' },
      { label: 'Review matches', path: '/matches' }
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
    title: 'Profile & security',
    description: 'Update your contact info, password, and connected sessions.',
    badge: 'account',
    roles: ['*'],
    actions: [
      { label: 'Open profile', path: '/profile' }
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
    if (!user) return 'Guest'
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    }
    return user.username ?? user.email ?? 'User'
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
            <p className="text-sm text-blue-100">Logged in</p>
            <h1 className="text-2xl font-semibold leading-tight">Welcome, {name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide">
              {roles.map((role) => (
                <span key={role} className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
                  {role}
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
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 text-gray-700">
        <ShieldCheck size={18} className="text-blue-600" />
        <p className="text-sm">
          Portal access is scoped to your role. Modules below reflect what you can do today.
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
