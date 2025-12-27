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
  Loader2,
  Sparkles,
  Zap,
  Star,
  Activity,
  Play,
  ChevronRight
} from 'lucide-react'
import StatsService from '../../../layers/application/services/StatsService'
import AuditLogService from '../../../layers/application/services/AuditLogService'
import MatchesService from '../../../layers/application/services/MatchesService'
import bannerImage from '@/assets/images/banner_c1.jpg'
import uclLogo from '@/assets/images/UEFA_CHAMPIONS_LEAGUE.png'

const DashboardPage = () => {
  const [overview, setOverview] = useState(null)
  const [activities, setActivities] = useState([])
  const [todayMatches, setTodayMatches] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getTodayRange = () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return {
      dateFrom: start.toISOString(),
      dateTo: end.toISOString()
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const { dateFrom, dateTo } = getTodayRange()
        const [ov, audit, matches] = await Promise.all([
          StatsService.getOverview(),
          AuditLogService.listEvents({ page: 1, pageSize: 5 }),
          MatchesService.getAllMatches({ 
            dateFrom, 
            dateTo, 
            limit: 10 
          })
        ])
        setOverview(ov)
        setActivities(audit.data ?? [])
        setTodayMatches(matches.matches ?? [])
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
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl ucl-hero-card">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <img 
            src={bannerImage} 
            alt="Champions League" 
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 p-8 pt-10 flex items-center justify-between min-h-[300px]">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <img src={uclLogo} alt="UCL" className="w-12 h-12 object-contain" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-400/30">
                <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">Mùa giải 2024/25</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h1 className="text-4xl md:text-5xl font-black uppercase leading-relaxed">
                <span className="text-white drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  Bảng điều khiển
                </span>
              </h1>
              <h2 className="text-3xl md:text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 mt-1">
                Champions League
              </h2>
            </div>
            
            <p className="text-blue-200/60 text-lg max-w-md">
              Quản lý toàn diện giải đấu danh giá nhất châu Âu. Theo dõi trận đấu, đội bóng và cầu thủ.
            </p>
            
            <div className="flex items-center gap-4 mt-6">
              <button className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105">
                <span className="relative z-10 flex items-center gap-2">
                  <Play size={18} fill="currentColor" />
                  Xem trận đấu hôm nay
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl font-semibold text-white border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
                <Activity size={18} />
                Thống kê
              </button>
            </div>
          </div>
          
          {/* Right side decorative trophy/stats */}
          <div className="hidden lg:flex flex-col items-end gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-black/30 backdrop-blur-md rounded-xl border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Trophy size={20} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">{overview?.totals?.matches ?? '—'}</div>
                <div className="text-xs text-blue-200/50 uppercase tracking-wider">Trận đã đấu</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-black/30 backdrop-blur-md rounded-xl border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Target size={20} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">{overview?.totals?.goals ?? '—'}</div>
                <div className="text-xs text-blue-200/50 uppercase tracking-wider">Tổng bàn thắng</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200 backdrop-blur-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => {
          const theme = getStatTheme(stat.color)
          return (
            <div 
              key={index} 
              className="group relative overflow-hidden ucl-stat-card p-6 transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                stat.color === 'blue' ? 'from-blue-500/0 to-blue-500/10' :
                stat.color === 'green' ? 'from-emerald-500/0 to-emerald-500/10' :
                stat.color === 'purple' ? 'from-indigo-500/0 to-indigo-500/10' :
                'from-amber-500/0 to-amber-500/10'
              } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Decorative corner accent */}
              <div className={`absolute -top-10 -right-10 w-24 h-24 ${
                stat.color === 'blue' ? 'bg-blue-500' :
                stat.color === 'green' ? 'bg-emerald-500' :
                stat.color === 'purple' ? 'bg-indigo-500' :
                'bg-amber-500'
              } rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-blue-200/50 text-sm font-medium uppercase tracking-wider">{stat.title}</p>
                  <p className="text-4xl font-black text-white mt-3 tracking-tight ucl-number">{stat.value}</p>
                  {stat.change && stat.change !== '0' && (
                    <div
                      className={`inline-flex items-center mt-4 px-3 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-sm ${
                        stat.changeType === 'positive'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : stat.changeType === 'negative'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                          : 'border-white/10 bg-white/5 text-blue-200/60'
                      }`}
                    >
                      {formatChangeIcon(stat.changeType)}
                      <span className="ml-1.5">{formatTrendLabel(stat.change)}</span>
                    </div>
                  )}
                </div>
                <div
                  className={`relative w-14 h-14 ${theme.iconBg} rounded-2xl flex items-center justify-center text-white shadow-xl ${theme.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                >
                  <stat.icon size={26} strokeWidth={2} />
                  {/* Pulse ring effect */}
                  <span className={`absolute inset-0 ${theme.iconBg} rounded-2xl animate-ping opacity-20`} />
                </div>
              </div>
              
              {/* Bottom gradient line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                stat.color === 'blue' ? 'from-blue-600 via-cyan-500 to-blue-600' :
                stat.color === 'green' ? 'from-emerald-600 via-green-500 to-emerald-600' :
                stat.color === 'purple' ? 'from-indigo-600 via-purple-500 to-indigo-600' :
                'from-amber-600 via-yellow-500 to-amber-600'
              } opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <div className="ucl-glass-card h-full">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <Activity size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Hoạt động gần đây</h3>
                  <span className="text-xs text-blue-200/40">{activities.length} sự kiện hôm nay</span>
                </div>
              </div>
              <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all flex items-center gap-1">
                Xem tất cả <ChevronRight size={14} />
              </button>
            </div>
            <div className="p-6">
              {loading && (
                <div className="text-sm text-blue-200/40 flex items-center gap-2 py-8 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-400" /> Đang tải hoạt động...
                </div>
              )}

              <div className="space-y-4">
                {activities.map((activity, idx) => {
                  const style = getActivityIconWrapper(activity.module)
                  const Icon = activity.module?.toLowerCase().includes('match')
                    ? Trophy
                    : activity.module?.toLowerCase().includes('team')
                    ? Users
                    : FileText

                  return (
                    <div 
                      key={activity.id || idx} 
                      className="group relative flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all duration-300"
                    >
                      {/* Timeline connector */}
                      {idx !== activities.length - 1 && (
                        <div className="absolute top-14 left-8 w-[2px] h-[calc(100%-20px)] bg-gradient-to-b from-white/20 to-transparent" />
                      )}

                      <div
                        className={`relative z-10 w-12 h-12 rounded-xl ${style.bg} ${style.text} flex items-center justify-center shrink-0 border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">{activity.action}</h4>
                          <span className="text-[10px] text-blue-200/40 whitespace-nowrap font-medium bg-white/5 px-2 py-1 rounded-md">
                            {activity.createdAt || activity.time || '--'}
                          </span>
                        </div>
                        {activity.details && (
                          <p className="text-blue-200/50 text-sm mt-1 leading-relaxed line-clamp-2">{activity.details}</p>
                        )}
                      </div>
                    </div>
                  )
                })}

                {!loading && activities.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <Activity size={28} className="text-blue-200/30" />
                    </div>
                    <p className="text-sm text-blue-200/40">Chưa có hoạt động gần đây</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Live Matches Card */}
          <div className="ucl-glass-card relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Play size={18} fill="white" className="text-white ml-0.5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Trận đấu hôm nay</h3>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Live</span>
                </span>
              </div>

              <div className="space-y-3">
                {loading && todayMatches.length === 0 ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mx-auto mb-3" />
                    <p className="text-xs text-blue-200/40">Đang tải trận đấu...</p>
                  </div>
                ) : todayMatches.length > 0 ? (
                  todayMatches.map((match, idx) => (
                    <div
                      key={match.id}
                      className="group ucl-match-card p-4 transition-all duration-300 cursor-pointer"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex justify-between items-center mb-3 text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-blue-200/50 flex items-center gap-1.5">
                          <Clock size={12} />
                          {match.utcDate || match.scheduledKickoff 
                            ? new Date(match.utcDate || match.scheduledKickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                          <Zap size={10} className="animate-pulse" />
                          {formatMatchStatus(match.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                            {match.homeTeamName}
                          </div>
                        </div>
                        {(match.scoreHome !== null && match.scoreHome !== undefined) || (match.scoreAway !== null && match.scoreAway !== undefined) ? (
                          <div className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 via-cyan-500/30 to-blue-500/20 rounded-lg border border-cyan-500/30">
                            <span className="text-xs font-black text-cyan-300">
                              {match.scoreHome ?? 0} - {match.scoreAway ?? 0}
                            </span>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 via-cyan-500/30 to-blue-500/20 rounded-lg border border-cyan-500/30">
                            <span className="text-xs font-black text-cyan-300 uppercase tracking-widest">VS</span>
                          </div>
                        )}
                        <div className="flex-1 text-right">
                          <div className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                            {match.awayTeamName}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-blue-200/40 truncate max-w-[70%] flex items-center gap-1">
                          <Star size={10} className="text-amber-400/50" />
                          {match.venue || 'Địa điểm chưa xác định'}
                        </span>
                        <ChevronRight size={14} className="text-blue-200/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                      <Calendar size={24} className="text-blue-200/30" />
                    </div>
                    <p className="text-xs text-blue-200/40">Không có trận đấu hôm nay</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pending Tasks Card */}
          <div className="ucl-glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <FileText size={18} className="text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Việc cần xử lý</h3>
              </div>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <MoreHorizontal size={18} className="text-blue-200/40" />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Sparkles size={24} className="text-emerald-400" />
                </div>
                <p className="text-sm text-blue-200/50">Tuyệt vời! Không có công việc chờ xử lý.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === 'high' 
                          ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30'
                          : task.priority === 'low'
                          ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                      }`}>
                        {formatPriority(task.priority)}
                      </span>
                      <span className="text-blue-200/40 text-[10px] font-medium flex items-center gap-1">
                        <Clock size={10} /> {task.dueDate || '--'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 leading-tight group-hover:text-cyan-200 transition-colors">
                      {task.title}
                    </h4>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#0a1628]">
                        {task.assignee ? String(task.assignee).charAt(0).toUpperCase() : '?'}
                      </div>
                      <p className="text-blue-200/50 text-xs">{task.assignee || 'Chưa phân công'}</p>
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
