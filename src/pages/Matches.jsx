import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Filter, RefreshCw, Search } from 'lucide-react'
import MatchCard from '../components/MatchCard'
import LoadingState from '../shared/components/LoadingState'
import ErrorState from '../shared/components/ErrorState'
import EmptyState from '../shared/components/EmptyState'
import MatchesService from '../layers/application/services/MatchesService'
import SeasonService from '../layers/application/services/SeasonService'
import logger from '../shared/utils/logger'

const Matches = () => {
  const [matches, setMatches] = useState([])
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSeason, setSelectedSeason] = useState('current')
  const [selectedRound, setSelectedRound] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const statusOptions = [
    { id: 'all', name: 'Tất cả trận' },
    { id: 'SCHEDULED', name: 'Sắp diễn ra' },
    { id: 'IN_PROGRESS', name: 'Đang diễn ra' },
    { id: 'COMPLETED', name: 'Đã kết thúc' },
    { id: 'POSTPONED', name: 'Hoãn' }
  ]

  // Load seasons
  useEffect(() => {
    let isMounted = true
    const loadSeasons = async () => {
      try {
        const data = await SeasonService.listSeasons()
        if (isMounted) {
          setSeasons(data || [])
        }
      } catch (err) {
        logger.error('[Matches] Failed to load seasons:', err)
      }
    }
    loadSeasons()
    return () => { isMounted = false }
  }, [])

  // Load matches
  const fetchMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters = {
        status: selectedStatus === 'all' ? '' : selectedStatus,
        season: selectedSeason === 'current' ? '' : selectedSeason,
        matchday: selectedRound === 'all' ? '' : selectedRound,
        search: searchTerm,
        limit: 50
      }
      
      const response = await MatchesService.getAllMatches(filters)
      
      if (!response || !response.matches) {
        setMatches([])
        return
      }

      const mapped = response.matches.map(match => ({
        id: match.id,
        date: match.utcDate,
        time: new Date(match.utcDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        homeTeam: {
          name: match.homeTeamName,
          shortName: match.homeTeamTla || match.homeTeamName?.slice(0, 3).toUpperCase(),
          logo: match.homeTeamCrest || null
        },
        awayTeam: {
          name: match.awayTeamName,
          shortName: match.awayTeamTla || match.awayTeamName?.slice(0, 3).toUpperCase(),
          logo: match.awayTeamCrest || null
        },
        score: match.homeScore !== null && match.awayScore !== null ? {
          home: match.homeScore,
          away: match.awayScore
        } : null,
        status: match.status,
        venue: match.venue || 'Chưa xác định',
        competition: match.competitionName || 'VĐQG',
        matchday: match.matchday || 1,
        minute: match.minute
      }))

      setMatches(mapped)
    } catch (err) {
      logger.error('[Matches] Error fetching matches:', err)
      setError(err?.message || 'Không thể tải danh sách trận đấu')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [selectedStatus, selectedSeason, selectedRound])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchMatches()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleRetry = () => {
    fetchMatches()
  }

  // Get unique rounds from matches
  const rounds = [...new Set(matches.map(m => m.matchday))].sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-2">Lịch thi đấu</h1>
          <p className="text-[#64748B]">Theo dõi lịch và kết quả các trận đấu</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#334155] mb-2">
                <Filter size={16} className="inline mr-1" />
                Trạng thái
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C65A] focus:border-transparent"
              >
                {statusOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>

            {/* Season Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#334155] mb-2">
                <Calendar size={16} className="inline mr-1" />
                Mùa giải
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C65A] focus:border-transparent"
              >
                <option value="current">Mùa hiện tại</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>{season.name}</option>
                ))}
              </select>
            </div>

            {/* Round Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#334155] mb-2">
                <Clock size={16} className="inline mr-1" />
                Vòng đấu
              </label>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C65A] focus:border-transparent"
              >
                <option value="all">Tất cả vòng</option>
                {rounds.map(round => (
                  <option key={round} value={round}>Vòng {round}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-[#334155] mb-2">
                <Search size={16} className="inline mr-1" />
                Tìm kiếm đội
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên đội..."
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C65A] focus:border-transparent"
              />
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleRetry}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#00C65A] hover:bg-[#00A84E] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && <LoadingState message="Đang tải lịch thi đấu..." />}
        
        {!loading && error && (
          <ErrorState
            title="Lỗi tải dữ liệu"
            message={error}
            onRetry={handleRetry}
          />
        )}

        {!loading && !error && matches.length === 0 && (
          <EmptyState
            title="Không có trận đấu"
            message="Không tìm thấy trận đấu nào phù hợp với bộ lọc của bạn."
            actionLabel="Xóa bộ lọc"
            onAction={() => {
              setSelectedStatus('all')
              setSelectedSeason('current')
              setSelectedRound('all')
              setSearchTerm('')
            }}
          />
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {matches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Matches
