import React, { useEffect, useMemo, useState } from 'react'
import { 
  AlertTriangle, 
  Award, 
  Ban, 
  ChevronDown, 
  Crown, 
  Loader2, 
  Medal, 
  Plus, 
  Search, 
  Target, 
  Trash2, 
  Trophy, 
  Users, 
  X 
} from 'lucide-react'
import toast from 'react-hot-toast'

import StatsService from '../../../layers/application/services/StatsService'
import SeasonService from '../../../layers/application/services/SeasonService'

// Tab configurations
const TABS = [
  { id: 'top-scorers', label: 'Vua phá lưới', icon: Crown, color: 'from-yellow-500 to-orange-500' },
  { id: 'cards', label: 'Thẻ phạt', icon: AlertTriangle, color: 'from-red-500 to-pink-500' },
  { id: 'suspended', label: 'Treo giò', icon: Ban, color: 'from-gray-600 to-gray-800' },
  { id: 'man-of-match', label: 'Cầu thủ xuất sắc', icon: Award, color: 'from-purple-500 to-indigo-500' },
  { id: 'legacy', label: 'Thống kê khác', icon: Target, color: 'from-blue-500 to-cyan-500' }
]

const CATEGORY_OPTIONS = [
  { value: 'goals', label: 'Bàn thắng' },
  { value: 'assists', label: 'Kiến tạo' },
  { value: 'clean-sheets', label: 'Sạch lưới' },
  { value: 'minutes', label: 'Thời gian thi đấu' }
]

const DEFAULT_FORM = {
  category: 'goals',
  player: '',
  team: '',
  teamLogo: '',
  value: '',
  matches: '',
  rank: '',
  season: '2025-2026',
  nationality: '',
  position: ''
}

// ================== TOP SCORERS TAB ==================
const TopScorersTab = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Crown className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Chưa có dữ liệu vua phá lưới cho mùa giải này</p>
        <p className="text-sm text-gray-400 mt-2">Dữ liệu sẽ được cập nhật sau khi có kết quả trận đấu</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-yellow-700">#</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-yellow-700">Cầu thủ</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-yellow-700">Đội</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-yellow-700">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-4 w-4" />
                Bàn thắng
              </div>
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-yellow-700">Kiến tạo</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-yellow-700">Trận</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-yellow-700">TB/Trận</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((player, index) => (
            <tr key={player.playerId} className={index < 3 ? 'bg-yellow-50/50' : ''}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                  {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                  {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                  <span className={`font-bold ${index < 3 ? 'text-yellow-700' : 'text-gray-600'}`}>{index + 1}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-semibold text-gray-900">{player.playerName}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-gray-700">{player.teamName}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 px-3 py-1 font-bold text-yellow-800 text-lg min-w-[40px]">
                  {player.goals}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-gray-700 font-medium">{player.assists}</span>
              </td>
              <td className="px-4 py-3 text-center text-gray-600">{player.matchesPlayed}</td>
              <td className="px-4 py-3 text-center">
                <span className="text-sm text-gray-500">{player.goalsPerMatch}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ================== CARDS TAB ==================
const CardsTab = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Chưa có dữ liệu thẻ phạt cho mùa giải này</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-red-50 to-pink-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-red-700">#</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-red-700">Cầu thủ</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-red-700">Đội</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-yellow-600">
              <div className="flex items-center justify-center gap-1">
                <div className="w-3 h-4 bg-yellow-400 rounded-sm"></div>
                Vàng
              </div>
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-red-600">
              <div className="flex items-center justify-center gap-1">
                <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                Đỏ
              </div>
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-red-700">Tổng</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-red-700">Trận</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-red-700">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((player, index) => (
            <tr key={player.playerId} className={player.isSuspended ? 'bg-red-50' : ''}>
              <td className="px-4 py-3 font-semibold text-gray-600">{index + 1}</td>
              <td className="px-4 py-3">
                <span className="font-semibold text-gray-900">{player.playerName}</span>
              </td>
              <td className="px-4 py-3 text-gray-700">{player.teamName}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 px-3 py-1 font-bold text-yellow-800 min-w-[32px]">
                  {player.yellowCards}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-3 py-1 font-bold text-red-800 min-w-[32px]">
                  {player.redCards}
                </span>
              </td>
              <td className="px-4 py-3 text-center font-semibold text-gray-800">{player.totalCards}</td>
              <td className="px-4 py-3 text-center text-gray-600">{player.matchesPlayed}</td>
              <td className="px-4 py-3 text-center">
                {player.isSuspended ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    <Ban className="h-3 w-3" />
                    Treo giò
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ================== SUSPENDED PLAYERS TAB ==================
const SuspendedTab = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Ban className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Không có cầu thủ nào đang bị treo giò</p>
        <p className="text-sm text-gray-400 mt-2">Cầu thủ bị treo giò khi nhận 2 thẻ vàng tích lũy hoặc 1 thẻ đỏ</p>
      </div>
    )
  }

  const getReasonBadge = (reason) => {
    switch (reason) {
      case 'direct_red':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            <div className="w-2 h-3 bg-red-500 rounded-sm"></div>
            Thẻ đỏ trực tiếp
          </span>
        )
      case 'two_yellows':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
            <div className="w-2 h-3 bg-yellow-400 rounded-sm"></div>
            <div className="w-2 h-3 bg-yellow-400 rounded-sm"></div>
            2 thẻ vàng
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
            <div className="w-2 h-3 bg-yellow-400 rounded-sm"></div>
            <div className="w-2 h-3 bg-red-500 rounded-sm"></div>
            Vàng + Đỏ
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Ban className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">Quy định treo giò</h4>
            <ul className="mt-2 text-sm text-red-700 space-y-1">
              <li>• Cầu thủ nhận <strong>2 thẻ vàng tích lũy</strong> sẽ bị treo giò 1 trận tiếp theo</li>
              <li>• Cầu thủ nhận <strong>1 thẻ đỏ trực tiếp</strong> sẽ bị treo giò ít nhất 1 trận</li>
              <li>• Sau khi thi đấu trận treo giò, số thẻ vàng tích lũy sẽ được reset</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-700">Cầu thủ</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-700">Đội</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-700">Lý do</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-yellow-600">Vàng</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-red-600">Đỏ</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-700">Ngày thẻ cuối</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((player) => (
              <tr key={player.playerId} className="bg-red-50/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4 text-red-500" />
                    <span className="font-semibold text-gray-900">{player.playerName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{player.teamName}</td>
                <td className="px-4 py-3 text-center">{getReasonBadge(player.reason)}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center rounded bg-yellow-100 px-2 py-0.5 font-bold text-yellow-800">
                    {player.yellowCards}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center rounded bg-red-100 px-2 py-0.5 font-bold text-red-800">
                    {player.redCards}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-500">
                  {player.lastCardDate ? new Date(player.lastCardDate).toLocaleDateString('vi-VN') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ================== MAN OF THE MATCH TAB ==================
const ManOfMatchTab = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Chưa có dữ liệu cầu thủ xuất sắc</p>
        <p className="text-sm text-gray-400 mt-2">Cầu thủ xuất sắc được bầu chọn sau mỗi trận đấu</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-purple-700">#</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-purple-700">Cầu thủ</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-purple-700">Đội</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-purple-700">
              <div className="flex items-center justify-center gap-1">
                <Award className="h-4 w-4" />
                Số lần
              </div>
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-purple-700">Trận</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-purple-700">Tỷ lệ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((player, index) => (
            <tr key={player.playerId} className={index < 3 ? 'bg-purple-50/50' : ''}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {index === 0 && <Award className="h-5 w-5 text-purple-500" />}
                  {index === 1 && <Award className="h-5 w-5 text-gray-400" />}
                  {index === 2 && <Award className="h-5 w-5 text-amber-600" />}
                  <span className={`font-bold ${index < 3 ? 'text-purple-700' : 'text-gray-600'}`}>{index + 1}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-semibold text-gray-900">{player.playerName}</span>
              </td>
              <td className="px-4 py-3 text-gray-700">{player.teamName}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center rounded-full bg-purple-100 px-3 py-1 font-bold text-purple-800 text-lg min-w-[40px]">
                  {player.motmCount}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-gray-600">{player.matchesPlayed}</td>
              <td className="px-4 py-3 text-center">
                <span className="text-sm text-gray-500">
                  {player.matchesPlayed > 0 ? Math.round((player.motmCount / player.matchesPlayed) * 100) : 0}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ================== LEGACY STATS TAB (existing functionality) ==================
const LegacyStatsTab = ({
  stats,
  loading,
  categoryFilter,
  setCategoryFilter,
  searchTerm,
  setSearchTerm,
  onOpenCreateForm,
  onOpenEditForm,
  onDelete
}) => {
  const flattenedStats = useMemo(() => {
    return Object.entries(stats).flatMap(([category, rows]) =>
      rows.map((row) => ({
        ...row,
        category
      }))
    )
  }, [stats])

  const filteredStats = useMemo(() => {
    return flattenedStats.filter((row) => {
      const matchesCategory = categoryFilter === 'all' || row.category === categoryFilter
      if (!matchesCategory) return false
      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      return (
        row.player?.toLowerCase().includes(search) ||
        row.team?.toLowerCase().includes(search) ||
        row.nationality?.toLowerCase().includes(search)
      )
    })
  }, [flattenedStats, categoryFilter, searchTerm])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">Tất cả danh mục</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên cầu thủ, đội bóng..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <button
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
          onClick={onOpenCreateForm}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm thống kê
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cầu thủ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Đội</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Loại</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Giá trị</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Trận</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredStats.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                    Không có thống kê phù hợp.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredStats.map((row) => (
                  <tr key={row.id ?? `${row.category}-${row.rank}-${row.player}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{row.rank}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{row.player}</div>
                      <div className="text-xs text-gray-500">{row.nationality}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-800">{row.team}</div>
                      <div className="text-xs text-gray-400">{row.position}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {CATEGORY_OPTIONS.find(c => c.value === row.category)?.label || row.category}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">
                      {row.category === 'minutes' ? `${row.value}'` : row.value}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{row.matches}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="rounded-full border border-gray-200 p-2 text-gray-500 hover:border-blue-500 hover:text-blue-600"
                          onClick={() => onOpenEditForm(row)}
                          title="Chỉnh sửa"
                        >
                          <Plus className="h-4 w-4 rotate-45" />
                        </button>
                        <button
                          className="rounded-full border border-gray-200 p-2 text-gray-500 hover:border-red-500 hover:text-red-600"
                          onClick={() => onDelete(row.id)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ================== MAIN COMPONENT ==================
const PlayerStatsManagement = () => {
  const [activeTab, setActiveTab] = useState('top-scorers')
  const [seasonFilter, setSeasonFilter] = useState('')
  const [selectedSeasonId, setSelectedSeasonId] = useState(null)
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(false)

  // Data states
  const [topScorers, setTopScorers] = useState([])
  const [cardStats, setCardStats] = useState([])
  const [suspendedPlayers, setSuspendedPlayers] = useState([])
  const [motmStats, setMotmStats] = useState([])
  const [legacyStats, setLegacyStats] = useState({ goals: [], assists: [], 'clean-sheets': [], minutes: [] })

  // Legacy tab states
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formValues, setFormValues] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  // Load seasons
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const list = await SeasonService.listSeasons()
        if (list.length) {
          setSeasons(list)
          setSeasonFilter(list[0].name)
          setSelectedSeasonId(list[0].season_id)
        }
      } catch (error) {
        console.warn('Unable to load seasons', error)
      }
    }
    loadSeasons()
  }, [])

  // Load data based on active tab
  useEffect(() => {
    if (!selectedSeasonId) return

    const loadTabData = async () => {
      setLoading(true)
      try {
        switch (activeTab) {
          case 'top-scorers':
            const scorers = await StatsService.getTopScorers(selectedSeasonId)
            setTopScorers(scorers)
            break
          case 'cards':
            const cards = await StatsService.getCardStats(selectedSeasonId)
            setCardStats(cards)
            break
          case 'suspended':
            const suspended = await StatsService.getSuspendedPlayers(selectedSeasonId)
            setSuspendedPlayers(suspended)
            break
          case 'man-of-match':
            const motm = await StatsService.getManOfMatchStats(selectedSeasonId)
            setMotmStats(motm)
            break
          case 'legacy':
            const legacy = await StatsService.getPlayerStats({ season: seasonFilter })
            setLegacyStats(legacy)
            break
        }
      } catch (error) {
        console.error('Error loading tab data:', error)
        toast.error('Không thể tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    loadTabData()
  }, [activeTab, selectedSeasonId, seasonFilter])

  const handleSeasonChange = (e) => {
    const seasonName = e.target.value
    const season = seasons.find(s => s.name === seasonName)
    setSeasonFilter(seasonName)
    setSelectedSeasonId(season?.season_id || null)
  }

  // Legacy form handlers
  const openCreateForm = () => {
    setEditingEntry(null)
    setFormValues({
      ...DEFAULT_FORM,
      category: categoryFilter === 'all' ? 'goals' : categoryFilter,
      season: seasonFilter
    })
    setIsFormOpen(true)
  }

  const openEditForm = (entry) => {
    setEditingEntry(entry)
    setFormValues({
      category: entry.category ?? 'goals',
      player: entry.player ?? '',
      team: entry.team ?? '',
      teamLogo: entry.teamLogo ?? '',
      value: entry.value ?? '',
      matches: entry.matches ?? '',
      rank: entry.rank ?? '',
      season: entry.season ?? seasonFilter,
      nationality: entry.nationality ?? '',
      position: entry.position ?? ''
    })
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingEntry(null)
    setFormValues(DEFAULT_FORM)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const refreshLegacyStats = async () => {
    const response = await StatsService.getPlayerStats({ season: seasonFilter })
    setLegacyStats(response)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const payload = {
      ...formValues,
      value: Number(formValues.value) || 0,
      matches: Number(formValues.matches) || 0,
      rank: Number(formValues.rank) || undefined,
      season: formValues.season || seasonFilter
    }
    try {
      if (editingEntry?.id) {
        await StatsService.updatePlayerStat(editingEntry.id, payload)
        toast.success('Đã cập nhật thống kê')
      } else {
        await StatsService.addPlayerStat(payload)
        toast.success('Đã thêm thống kê mới')
      }
      await refreshLegacyStats()
      closeForm()
    } catch (error) {
      console.error(error)
      toast.error('Không thể lưu thống kê')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa thống kê cầu thủ này?')) return
    try {
      await StatsService.deletePlayerStat(id)
      toast.success('Đã xóa thống kê')
      setLegacyStats((prev) => {
        const clone = { ...prev }
        Object.keys(clone).forEach((category) => {
          clone[category] = clone[category].filter((row) => row.id !== id)
        })
        return clone
      })
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'top-scorers':
        return <TopScorersTab data={topScorers} loading={loading} />
      case 'cards':
        return <CardsTab data={cardStats} loading={loading} />
      case 'suspended':
        return <SuspendedTab data={suspendedPlayers} loading={loading} />
      case 'man-of-match':
        return <ManOfMatchTab data={motmStats} loading={loading} />
      case 'legacy':
        return (
          <LegacyStatsTab
            stats={legacyStats}
            loading={loading}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenCreateForm={openCreateForm}
            onOpenEditForm={openEditForm}
            onDelete={handleDelete}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-600" />
            Thống kê cầu thủ
          </h1>
          <p className="text-gray-500 mt-1">
            Vua phá lưới, thẻ phạt, cầu thủ xuất sắc và danh sách treo giò
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm font-medium shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={seasonFilter}
              onChange={handleSeasonChange}
            >
              {seasons.map((season) => (
                <option key={season.season_id} value={season.name}>
                  {season.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all
                  ${isActive 
                    ? `border-transparent bg-gradient-to-r ${tab.color} text-white rounded-t-lg` 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {renderTabContent()}
      </div>

      {/* Legacy Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingEntry ? 'Cập nhật thống kê' : 'Thêm thống kê mới'}
              </h2>
              <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100" onClick={closeForm}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Danh mục</label>
                  <select
                    name="category"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.category}
                    onChange={handleFormChange}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Mùa giải</label>
                  <select
                    name="season"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.season}
                    onChange={handleFormChange}
                  >
                    {seasons.map((season) => (
                      <option key={season.season_id} value={season.name}>
                        {season.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Tên cầu thủ</label>
                  <input
                    type="text"
                    name="player"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.player}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Câu lạc bộ</label>
                  <input
                    type="text"
                    name="team"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.team}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Logo viết tắt</label>
                  <input
                    type="text"
                    name="teamLogo"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.teamLogo}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Quốc tịch</label>
                  <input
                    type="text"
                    name="nationality"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.nationality}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Vị trí</label>
                  <input
                    type="text"
                    name="position"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.position}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Giá trị thống kê</label>
                  <input
                    type="number"
                    name="value"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.value}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Số trận</label>
                  <input
                    type="number"
                    name="matches"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.matches}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Thứ hạng</label>
                  <input
                    type="number"
                    name="rank"
                    min="1"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.rank}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  onClick={closeForm}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingEntry ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerStatsManagement
