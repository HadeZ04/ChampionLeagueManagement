import React, { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Tv, AlertCircle } from 'lucide-react'
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
      const response = await MatchesService.getAllMatches({
        status: 'SCHEDULED',
        limit: 4
      })
      const mapped = (response.matches || []).map(match => ({
        id: match.id,
        date: new Date(match.utcDate),
        homeTeam: {
          name: match.homeTeamName,
          shortName: match.homeTeamTla || match.homeTeamName.slice(0, 3).toUpperCase()
        },
        awayTeam: {
          name: match.awayTeamName,
          shortName: match.awayTeamTla || match.awayTeamName.slice(0, 3).toUpperCase()
        },
        venue: match.venue || 'Chưa xác định',
        group: match.groupName || match.stage || 'Vòng phân hạng'
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
        // Reset state if unmounted during fetch
        setUpcomingMatches([])
        setError(null)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const getImportanceAccent = (importance) => {
    switch (importance) {
      case 'high':
        return {
          glow: '0 25px 55px rgba(0, 198, 90, 0.45)',
          bar: 'linear-gradient(180deg, #00C65A, #00924A)'
        }
      case 'medium':
        return {
          glow: '0 25px 55px rgba(250, 204, 21, 0.45)',
          bar: 'linear-gradient(180deg, #FACC15, #FF9F1C)'
        }
      default:
        return {
          glow: '0 25px 55px rgba(0, 116, 240, 0.35)',
          bar: 'linear-gradient(180deg, #E3F2FF, #0074F0)'
        }
    }
  }

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
    <div className="rounded-[32px] border border-white/15 bg-gradient-to-br from-[#003B73] via-[#00924A] to-[#00C65A] p-6 text-white shadow-[0_35px_90px_rgba(0,59,115,0.45)]">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="text-white" size={24} />
        <h2 className="text-2xl font-bold">Trận sắp diễn ra</h2>
        <div className="flex-1" />
        {error && (
          <button
            onClick={fetchMatches}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition-colors hover:bg-white/10"
            disabled={loading}
          >
            Thử lại
          </button>
        )}
        <a
          href="/matches"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition-colors hover:bg-white/10"
        >
          Xem lịch thi đấu
        </a>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8 bg-red-500/10 rounded-lg border border-red-500/30 mb-4">
          <AlertCircle className="mx-auto mb-2 text-red-200" size={32} />
          <p className="text-sm text-white/90 mb-2">{error}</p>
          <button
            onClick={fetchMatches}
            className="text-xs text-white/70 hover:text-white underline"
          >
            Nhấn để thử lại
          </button>
        </div>
      )}

      <div className="space-y-4">
        {loading && (
          <div className="text-white/80 text-sm">Đang tải lịch thi đấu sắp tới...</div>
        )}
        {!loading && upcomingMatches.length === 0 && (
          <div className="text-white/80 text-sm">
            Không có trận đã lên lịch trong khoảng thời gian đã chọn.
          </div>
        )}
        {upcomingMatches.map((match) => {
          const accent = getImportanceAccent('high')
          return (
            <div
              key={match.id}
              className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-4 pl-6 backdrop-blur-sm transition-all duration-300 group"
              style={{ boxShadow: accent.glow }}
            >
              <span
                className="absolute inset-y-4 left-0 w-1 rounded-full"
                style={{ background: accent.bar }}
              />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-white/70 text-sm">
                    <Calendar size={14} />
                    <span className="font-medium">{formatDate(match.date)}</span>
                    <Clock size={14} />
                    <span className="font-medium">{formatTime(match.date)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-white/70 text-sm">
                  <Tv size={14} />
                  <span>Đối tác phát sóng</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div>
                    <div className="font-semibold text-white">{match.homeTeam.name}</div>
                    <div className="text-white/70 text-sm">{match.homeTeam.shortName}</div>
                  </div>
                </div>

                <div className="px-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] to-[#00C65A] font-bold">
                  VS
                </div>

                <div className="flex items-center space-x-3 flex-1 justify-end">
                  <div className="text-right">
                    <div className="font-semibold text-white">{match.awayTeam.name}</div>
                    <div className="text-white/70 text-sm">{match.awayTeam.shortName}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-sm text-white/80">
                <div className="flex items-center space-x-2">
                  <MapPin size={14} />
                  <span>{match.venue} • {match.group}</span>
                </div>
                <div className="flex space-x-3">
                  <a href="/match-center" className="text-white/80 hover:text-white">Nhận định</a>
                  <a href="/tickets" className="text-white/80 hover:text-white">Vé</a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 text-center">
        <a
          href="/matches"
          className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-white/10"
        >
          Danh sách lịch thi đấu
        </a>
      </div>
    </div>
  )
}

export default UpcomingMatches

