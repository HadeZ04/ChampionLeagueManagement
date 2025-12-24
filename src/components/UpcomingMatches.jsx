import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Play, AlertCircle, RefreshCw, Shield, ChevronRight } from 'lucide-react'
import MatchesService from '../layers/application/services/MatchesService'
import logger from '../shared/utils/logger'

const UpcomingMatches = () => {
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await MatchesService.getExternalMatches({
        status: 'SCHEDULED',
        limit: 4
      })
      const mapped = (response.matches || []).map(match => ({
        id: match.id,
        date: new Date(match.utcDate),
        homeTeam: {
          name: match.homeTeamName,
          shortName: match.homeTeamTla || match.homeTeamName?.slice(0, 3).toUpperCase(),
          logo: match.homeTeamLogo
        },
        awayTeam: {
          name: match.awayTeamName,
          shortName: match.awayTeamTla || match.awayTeamName?.slice(0, 3).toUpperCase(),
          logo: match.awayTeamLogo
        },
        venue: match.venue || 'Chưa xác định',
        group: match.groupName || match.stage || 'Vòng phân hạng',
        matchday: match.matchday
      }))
      setUpcomingMatches(mapped)
    } catch (err) {
      logger.error('Không thể tải các trận sắp diễn ra', err)
      setError(err?.message || 'Không thể tải dữ liệu trận đấu')
      setUpcomingMatches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchMatches().then(() => {
      if (!isMounted) {
        setUpcomingMatches([])
        setError(null)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Ngày mai'
    } else {
      return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    }
  }

  return (
    <div className="rounded-2xl backdrop-blur-md bg-white/[0.05] border border-white/[0.1] p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="text-cyan-400" size={24} />
        <h2 className="text-xl font-bold text-white">Trận sắp diễn ra</h2>
        <div className="flex-1" />
        <Link
          to="/match-center"
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
        >
          Xem tất cả →
        </Link>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-6 bg-rose-500/10 rounded-xl border border-rose-500/30 mb-4">
          <AlertCircle className="mx-auto mb-2 text-rose-400" size={28} />
          <p className="text-sm text-white/80 mb-2">{error}</p>
          <button
            onClick={fetchMatches}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && upcomingMatches.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">Không có trận đã lên lịch</p>
        </div>
      )}

      {/* Matches List */}
      {!loading && upcomingMatches.length > 0 && (
        <div className="space-y-3">
          {upcomingMatches.map((match) => (
            <Link
              key={match.id}
              to="/match-center"
              className="block p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-cyan-400/30 transition-all group"
            >
              {/* Date & Time */}
              <div className="flex items-center justify-between mb-3 text-xs text-white/50">
                <div className="flex items-center gap-2">
                  <Calendar size={12} />
                  <span>{formatDate(match.date)}</span>
                  <Clock size={12} />
                  <span>{formatTime(match.date)}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                  MD {match.matchday || '-'}
                </span>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    {match.homeTeam.logo ? (
                      <img src={match.homeTeam.logo} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <Shield size={16} className="text-white/40" />
                    )}
                  </div>
                  <span className="text-white font-medium truncate text-sm">
                    {match.homeTeam.name}
                  </span>
                </div>

                <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/20 mx-2">
                  <span className="text-cyan-400 font-bold text-xs">VS</span>
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="text-white font-medium truncate text-sm text-right">
                    {match.awayTeam.name}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    {match.awayTeam.logo ? (
                      <img src={match.awayTeam.logo} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <Shield size={16} className="text-white/40" />
                    )}
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-white/50">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span className="truncate max-w-[180px]">{match.venue}</span>
                </div>
                <ChevronRight size={14} className="text-white/30 group-hover:text-cyan-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <Link
          to="/match-center"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-medium text-sm transition-all"
        >
          <Play size={16} />
          <span>Xem trung tâm trận đấu</span>
        </Link>
      </div>
    </div>
  )
}

export default UpcomingMatches
