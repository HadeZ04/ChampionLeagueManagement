import React, { useEffect, useMemo, useState } from 'react'
import {
  Users,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  User,
  FileText,
  Bell,
  Search,
  MoreHorizontal,
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
        setError('Không thể tải dữ liệu dashboard.')
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
    const cards = [
      { title: 'Total Teams', value: totals.teams ?? '—', icon: Users, color: 'blue', ...buildChange(trends.teams) },
      { title: 'Matches Played', value: totals.matches ?? '—', icon: Calendar, color: 'green', ...buildChange(trends.matches) },
      { title: 'Total Goals', value: totals.goals ?? '—', icon: Target, color: 'purple', ...buildChange(trends.goals) },
      { title: 'Active Players', value: totals.players ?? '—', icon: Trophy, color: 'yellow', ...buildChange(trends.players) }
    ]
    return cards
  }, [overview])

  const formatChangeIcon = (changeType) => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp size={16} className="text-emerald-500" strokeWidth={2.5} />
      case 'negative':
        return <TrendingDown size={16} className="text-rose-500" strokeWidth={2.5} />
      default:
        return null
    }
  }

  const getStatTheme = (color) => {
    const themes = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-500', shadow: 'shadow-blue-200' },
      green: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-500', shadow: 'shadow-purple-200' },
      yellow: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-500', shadow: 'shadow-amber-200' },
      red: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-500', shadow: 'shadow-rose-200' }
    }
    return themes[color] || themes.blue
  }

  const getActivityIconWrapper = (module) => {
    const key = (module || '').toLowerCase()
    if (key.includes('match')) return { bg: 'bg-emerald-100', text: 'text-emerald-600' }
    if (key.includes('team')) return { bg: 'bg-blue-100', text: 'text-blue-600' }
    if (key.includes('content') || key.includes('news')) return { bg: 'bg-purple-100', text: 'text-purple-600' }
    return { bg: 'bg-slate-100', text: 'text-slate-600' }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-10">
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-50/80 to-transparent -z-10"></div>

      <div className="sticky top-0 z-50 px-6 py-4 backdrop-blur-md bg-white/70 border-b border-white/50 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Champions Admin</h1>
              <p className="text-xs text-slate-500 font-medium">Season 2024/2025</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-100 px-3 py-2 rounded-full border border-slate-200 w-64">
              <Search size={16} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
              <Bell size={20} className="text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <User size={16} className="text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Live data pulled from backend services.</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const theme = getStatTheme(stat.color)
            return (
              <div
                key={index}
                className="group bg-white rounded-3xl p-6 border border-white shadow-[0_4px_20px_-4px_rgba(203,213,225,0.4)] hover:shadow-[0_8px_30px_-4px_rgba(203,213,225,0.6)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{stat.value ?? '—'}</p>
                    {stat.change && stat.change !== '0' && (
                      <div
                        className={`inline-flex items-center mt-3 px-2 py-1 rounded-lg text-xs font-semibold ${
                          stat.changeType === 'positive'
                            ? 'bg-emerald-50 text-emerald-600'
                            : stat.changeType === 'negative'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {formatChangeIcon(stat.changeType)}
                        <span className="ml-1">{stat.change} this period</span>
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
            <div className="bg-white rounded-3xl border border-white shadow-sm h-full">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Recent Activities</h2>
                <span className="text-sm text-slate-400">{activities.length} events</span>
              </div>
              <div className="p-6">
                {loading && (
                  <div className="text-sm text-slate-500 flex items-center gap-2">
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
                          <div className="absolute top-10 left-5 w-[2px] h-[calc(100%+24px)] bg-slate-100 group-hover:bg-slate-200 transition-colors -z-10"></div>
                        )}

                        <div
                          className={`w-10 h-10 rounded-full ${style.bg} ${style.text} flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-slate-800">{activity.action}</h3>
                            <span className="text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md">
                              {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">
                            {activity.module} {activity.entityId ? `#${activity.entityId}` : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {activities.length === 0 && !loading && (
                    <div className="text-sm text-slate-500">Chưa có hoạt động gần đây.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl shadow-xl shadow-slate-900/20 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-3xl"></div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-lg font-bold">Today's Matches</h2>
                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-indigo-200">LIVE</span>
              </div>

              <div className="space-y-4 relative z-10">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                      <span>{new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {match.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-200">{match.homeTeamName}</div>
                      <div className="text-xs font-bold text-slate-500 mx-2">VS</div>
                      <div className="text-sm font-semibold text-slate-200 text-right">{match.awayTeamName}</div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 truncate flex items-center gap-1">
                      <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                      {match.venue || 'TBC'}
                    </div>
                  </div>
                ))}
                {upcomingMatches.length === 0 && !loading && (
                  <div className="text-xs text-slate-400">Chưa có trận đấu sắp diễn ra.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Pending Tasks</h2>
                <button className="p-1 hover:bg-slate-50 rounded-lg">
                  <MoreHorizontal size={18} className="text-slate-400" />
                </button>
              </div>
              {pendingTasks.length === 0 ? (
                <div className="text-sm text-slate-500">Không có công việc chờ xử lý.</div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                          {task.priority || 'medium'}
                        </span>
                        <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
                          <Clock size={10} /> {task.dueDate || '--'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-700 leading-tight group-hover:text-indigo-700 transition-colors">
                        {task.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                          {task.assignee ? task.assignee.charAt(0) : '?'}
                        </div>
                        <p className="text-slate-500 text-xs">{task.assignee || 'Unassigned'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
