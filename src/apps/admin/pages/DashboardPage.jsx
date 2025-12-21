import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Bell,
  Calendar,
  Clock,
  FileText,
  MoreHorizontal,
  Search,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  Users,
  Loader2
} from 'lucide-react'
import StatsService from '../../../layers/application/services/StatsService'
import AuditLogService from '../../../layers/application/services/AuditLogService'
import MatchesService from '../../../layers/application/services/MatchesService'

const DashboardPage = () => {
  const [overview, setOverview] = useState(null)
  const [activities, setActivities] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [ov, audit, matches] = await Promise.all([
          StatsService.getOverview(),
          AuditLogService.listEvents({ page: 1, pageSize: 5 }),
          MatchesService.getExternalMatches({ status: 'SCHEDULED', limit: 3 })
        ])
        setOverview(ov)
        setActivities(audit.data ?? [])
        setUpcomingMatches(matches.matches ?? [])
        setPendingTasks(ov?.pendingTasks ?? [])
      } catch (err) {
        console.error(err)
        setError('Không thể tải dữ liệu bảng điều khiển.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const statCards = useMemo(() => {
    const totals = overview?.totals ?? {}
    const trends = overview?.trends ?? {}

    const buildChange = (value) => {
      const numeric = Number(value || 0)
      if (!numeric) return { change: '0', changeType: 'neutral' }
      return { change: `${numeric > 0 ? '+' : ''}${numeric}`, changeType: numeric > 0 ? 'positive' : 'negative' }
    }

    return [
      { title: 'Tổng số đội', value: totals.teams ?? '--', icon: Users, color: 'blue', ...buildChange(trends.teams) },
      { title: 'Số trận đã đấu', value: totals.matches ?? '--', icon: Calendar, color: 'green', ...buildChange(trends.matches) },
      { title: 'Tổng bàn thắng', value: totals.goals ?? '--', icon: Target, color: 'purple', ...buildChange(trends.goals) },
      { title: 'Cầu thủ hoạt động', value: totals.players ?? '--', icon: Trophy, color: 'yellow', ...buildChange(trends.players) }
    ]
  }, [overview])

  const formatTrendLabel = (value) => {
    if (!value || value === '0') return ''
    return `${value} trong kỳ`
  }

  const formatMatchStatus = (status) => {
    const normalized = String(status || '').toUpperCase()
    switch (normalized) {
      case 'SCHEDULED':
      case 'TIMED':
        return 'Sắp diễn ra'
      case 'LIVE':
      case 'IN_PLAY':
        return 'Đang diễn ra'
      case 'PAUSED':
        return 'Tạm dừng'
      case 'FINISHED':
        return 'Kết thúc'
      case 'POSTPONED':
        return 'Hoãn'
      case 'CANCELLED':
        return 'Hủy'
      default:
        return status || '--'
    }
  }

  const formatPriority = (priority) => {
    const p = String(priority || '').toLowerCase()
    if (p === 'high') return 'cao'
    if (p === 'low') return 'thấp'
    if (p === 'medium') return 'trung bình'
    return priority || 'trung bình'
  }

  const formatChangeIcon = (changeType) => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp size={16} className="text-emerald-300" strokeWidth={2.5} />
      case 'negative':
        return <TrendingDown size={16} className="text-rose-300" strokeWidth={2.5} />
      default:
        return null
    }
  }

  const getStatTheme = (color) => {
    const themes = {
      blue: { iconBg: 'bg-blue-500', shadow: 'shadow-[0_0_25px_-12px_rgba(59,130,246,0.65)]' },
      green: { iconBg: 'bg-emerald-500', shadow: 'shadow-[0_0_25px_-12px_rgba(16,185,129,0.65)]' },
      purple: { iconBg: 'bg-indigo-500', shadow: 'shadow-[0_0_25px_-12px_rgba(99,102,241,0.65)]' },
      yellow: { iconBg: 'bg-amber-500', shadow: 'shadow-[0_0_25px_-12px_rgba(245,158,11,0.65)]' },
      red: { iconBg: 'bg-rose-500', shadow: 'shadow-[0_0_25px_-12px_rgba(244,63,94,0.65)]' }
    }
    return themes[color] || themes.blue
  }

  const getActivityIconWrapper = (module) => {
    const key = (module || '').toLowerCase()
    if (key.includes('match')) return { bg: 'bg-emerald-500/10', text: 'text-emerald-200' }
    if (key.includes('team')) return { bg: 'bg-blue-500/10', text: 'text-blue-200' }
    if (key.includes('content') || key.includes('news')) return { bg: 'bg-indigo-500/10', text: 'text-indigo-200' }
    return { bg: 'bg-white/5', text: 'text-blue-200/60' }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="admin-surface px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 shadow-inner">
              <Trophy size={22} className="text-cyan-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200">
                Bảng điều khiển
              </h2>
              <p className="text-xs text-blue-200/40 font-medium">Dữ liệu cập nhật từ hệ thống.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-white/5 px-3 py-2 rounded-full border border-white/10 w-64">
              <Search size={16} className="text-blue-200/40 mr-2" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-100 placeholder:text-blue-200/30"
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
              <Bell size={20} className="text-blue-200/60" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-[#0a0f1e]"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0a0f1e] flex items-center justify-center border border-white/10">
                <User size={16} className="text-cyan-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const theme = getStatTheme(stat.color)
          return (
            <div key={index} className="group admin-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-[#0b1224]/95">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-200/40 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2 tracking-tight">{stat.value}</p>
                  {stat.change && stat.change !== '0' && (
                    <div
                      className={`inline-flex items-center mt-3 px-2 py-1 rounded-lg text-xs font-semibold border ${
                        stat.changeType === 'positive'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                          : stat.changeType === 'negative'
                          ? 'border-rose-500/20 bg-rose-500/10 text-rose-200'
                          : 'border-white/10 bg-white/5 text-blue-200/60'
                      }`}
                    >
                      {formatChangeIcon(stat.changeType)}
                      <span className="ml-1">{formatTrendLabel(stat.change)}</span>
                    </div>
                  )}
                </div>
                <div
                  className={`w-12 h-12 ${theme.iconBg} rounded-2xl flex items-center justify-center text-white shadow-lg ${theme.shadow} group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon size={22} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="admin-surface h-full">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Hoạt động gần đây</h3>
              <span className="text-sm text-blue-200/40">{activities.length} sự kiện</span>
            </div>
            <div className="p-6">
              {loading && (
                <div className="text-sm text-blue-200/40 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang tải hoạt động...
                </div>
              )}

              <div className="space-y-6">
                {activities.map((activity, idx) => {
                  const style = getActivityIconWrapper(activity.module)
                  const Icon = activity.module?.toLowerCase().includes('match')
                    ? Trophy
                    : activity.module?.toLowerCase().includes('team')
                    ? Users
                    : FileText

                  return (
                    <div key={activity.id || idx} className="relative flex items-start gap-4 group">
                      {idx !== activities.length - 1 && (
                        <div className="absolute top-10 left-5 w-[2px] h-[calc(100%+24px)] bg-white/10 group-hover:bg-white/20 transition-colors -z-10"></div>
                      )}

                      <div
                        className={`w-10 h-10 rounded-full ${style.bg} ${style.text} flex items-center justify-center shrink-0 border border-white/10 shadow-sm z-10`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-bold text-white">{activity.action}</h4>
                          <span className="text-xs text-blue-200/40 whitespace-nowrap">{activity.createdAt || activity.time || '--'}</span>
                        </div>
                        {activity.details && <p className="text-blue-200/40 text-sm mt-0.5 leading-relaxed">{activity.details}</p>}
                      </div>
                    </div>
                  )
                })}

                {!loading && activities.length === 0 && <div className="text-sm text-blue-200/40">Chưa có hoạt động gần đây.</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="admin-surface p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-lg font-bold">Trận đấu hôm nay</h3>
              <span className="admin-badge admin-badge-blue">TRỰC TIẾP</span>
            </div>

            <div className="space-y-4 relative z-10">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-3 text-xs font-medium text-blue-200/40 uppercase tracking-wide">
                    <span>{new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {formatMatchStatus(match.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-100">{match.homeTeamName}</div>
                    <div className="text-xs font-bold text-blue-200/30 mx-2">GẶP</div>
                    <div className="text-sm font-semibold text-slate-100 text-right">{match.awayTeamName}</div>
                  </div>
                  <div className="mt-2 text-xs text-blue-200/30 truncate flex items-center gap-1">
                    <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                    {match.venue || 'Chưa xác định'}
                  </div>
                </div>
              ))}
              {upcomingMatches.length === 0 && !loading && <div className="text-xs text-blue-200/40">Chưa có trận đấu sắp diễn ra.</div>}
            </div>
          </div>

          <div className="admin-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Việc cần xử lý</h3>
              <button className="p-1 hover:bg-white/5 rounded-lg">
                <MoreHorizontal size={18} className="text-blue-200/40" />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-sm text-blue-200/40">Không có công việc chờ xử lý.</div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl border border-white/10 hover:border-cyan-500/20 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/20">
                        {formatPriority(task.priority)}
                      </span>
                      <span className="text-blue-200/40 text-[10px] font-medium flex items-center gap-1">
                        <Clock size={10} /> {task.dueDate || '--'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 leading-tight group-hover:text-cyan-200 transition-colors">
                      {task.title}
                    </h4>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-blue-200/40 border border-white/10">
                        {task.assignee ? String(task.assignee).charAt(0) : '?'}
                      </div>
                      <p className="text-blue-200/40 text-xs">{task.assignee || 'Chưa phân công'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
