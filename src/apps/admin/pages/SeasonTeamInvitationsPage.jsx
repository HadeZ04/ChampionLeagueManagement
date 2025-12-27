import React, { useCallback, useEffect, useState } from 'react'
import { 
  Mail, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Plus,
  Loader2,
  Users,
  TrendingUp,
  FileCheck,
  Send
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import ApiService from '../../../layers/application/services/ApiService'
import SeasonService from '../../../layers/application/services/SeasonService'

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  accepted: 'bg-green-100 text-green-700 border-green-300',
  declined: 'bg-red-100 text-red-700 border-red-300',
  expired: 'bg-gray-100 text-gray-700 border-gray-300',
  rescinded: 'bg-purple-100 text-purple-700 border-purple-300',
  replaced: 'bg-blue-100 text-blue-700 border-blue-300'
}

const STATUS_LABELS = {
  pending: 'Chờ phản hồi',
  accepted: 'Đã chấp nhận',
  declined: 'Đã từ chối',
  expired: 'Hết hạn',
  rescinded: 'Đã hủy',
  replaced: 'Đã thay thế'
}

const INVITE_TYPE_LABELS = {
  retained: 'Được giữ lại',
  promoted: 'Thăng hạng',
  replacement: 'Thay thế'
}

const SeasonTeamInvitationsPage = () => {
  const [seasons, setSeasons] = useState([])
  const [selectedSeasonId, setSelectedSeasonId] = useState(null)
  const [invitations, setInvitations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [eligibilityCheck, setEligibilityCheck] = useState(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)

  useEffect(() => {
    loadSeasons()
  }, [])

  useEffect(() => {
    if (selectedSeasonId) {
      loadInvitations()
      loadStats()
    }
  }, [selectedSeasonId])

  const loadSeasons = async () => {
    try {
      const data = await SeasonService.listSeasons()
      setSeasons(data || [])
      if (data && data.length > 0 && !selectedSeasonId) {
        setSelectedSeasonId(data[0].id)
      }
    } catch (error) {
      console.error(error)
      toast.error('Không thể tải danh sách mùa giải')
    }
  }

  const loadInvitations = async () => {
    if (!selectedSeasonId) return
    
    setLoading(true)
    try {
      const response = await ApiService.get(`/seasons/${selectedSeasonId}/invitations`)
      setInvitations(response?.data || [])
    } catch (error) {
      console.error(error)
      toast.error('Không thể tải danh sách lời mời')
      setInvitations([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!selectedSeasonId) return
    
    try {
      const response = await ApiService.get(`/seasons/${selectedSeasonId}/invitations/stats`)
      setStats(response?.data || null)
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats(null)
    }
  }

  const handleCheckEligibility = async (invitationId) => {
    if (!selectedSeasonId) return
    
    setCheckingEligibility(true)
    try {
      const response = await ApiService.get(
        `/seasons/${selectedSeasonId}/invitations/${invitationId}/eligibility`
      )
      setEligibilityCheck(response?.data)
      toast.success('Đã kiểm tra điều kiện tham gia')
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.error || 'Không thể kiểm tra điều kiện')
      setEligibilityCheck(null)
    } finally {
      setCheckingEligibility(false)
    }
  }

  const handleCreateReplacement = async (invitationId, previousSeasonId) => {
    if (!selectedSeasonId) return
    
    const confirmed = window.confirm('Tạo lời mời thay thế cho đội này?')
    if (!confirmed) return

    try {
      await ApiService.post(
        `/seasons/${selectedSeasonId}/invitations/${invitationId}/create-replacement`,
        { previousSeasonId }
      )
      toast.success('Đã tạo lời mời thay thế')
      await loadInvitations()
      await loadStats()
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.error || 'Không thể tạo lời mời thay thế')
    }
  }

  const handleEnsureMinimumTeams = async (previousSeasonId) => {
    if (!selectedSeasonId) return
    
    const confirmed = window.confirm(
      'Tự động tạo lời mời thay thế để đảm bảo đủ 10 đội đã chấp nhận?'
    )
    if (!confirmed) return

    try {
      const response = await ApiService.post(
        `/seasons/${selectedSeasonId}/invitations/ensure-minimum-teams`,
        { previousSeasonId, minimumTeams: 10 }
      )
      const data = response?.data
      if (data?.createdReplacements?.length > 0) {
        toast.success(`Đã tạo ${data.createdReplacements.length} lời mời thay thế`)
      } else {
        toast.info('Đã đủ 10 đội hoặc không tìm thấy đội thay thế phù hợp')
      }
      await loadInvitations()
      await loadStats()
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.error || 'Không thể đảm bảo số lượng đội tối thiểu')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDeadline = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    const now = new Date()
    const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
    
    if (daysLeft < 0) return <span className="text-red-600 font-semibold">Đã hết hạn</span>
    if (daysLeft === 0) return <span className="text-orange-600 font-semibold">Hết hạn hôm nay</span>
    if (daysLeft <= 3) return <span className="text-orange-600">{daysLeft} ngày còn lại</span>
    return <span className="text-gray-600">{daysLeft} ngày còn lại</span>
  }

  const filteredInvitations = invitations.filter(inv => {
    // Could add filters here
    return true
  })

  const selectedSeason = seasons.find(s => s.id === selectedSeasonId)

  return (
    <div className="admin-page space-y-6">
      <Toaster position="top-right" />

      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Quản lý giải đấu</p>
          <h1 className="text-3xl font-black tracking-wider text-white">Lời Mời Đội Bóng</h1>
          <p className="text-sm text-blue-200/40">
            Quản lý lời mời tham gia giải cho các đội bóng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedSeasonId || ''}
            onChange={(e) => setSelectedSeasonId(e.target.value ? parseInt(e.target.value) : null)}
            className="admin-select"
          >
            <option value="">Chọn mùa giải...</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              loadInvitations()
              loadStats()
            }}
            className="admin-btn-secondary"
            disabled={!selectedSeasonId || loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </header>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200/60">Đã chấp nhận</p>
                <p className="text-2xl font-bold text-white">{stats.acceptedCount} / 10</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
            </div>
          </div>
          <div className="admin-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200/60">Chờ phản hồi</p>
                <p className="text-2xl font-bold text-white">{stats.totalPending}</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Clock size={24} className="text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="admin-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200/60">Đã từ chối</p>
                <p className="text-2xl font-bold text-white">{stats.totalDeclined}</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg">
                <XCircle size={24} className="text-red-400" />
              </div>
            </div>
          </div>
          <div className="admin-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200/60">Đã thay thế</p>
                <p className="text-2xl font-bold text-white">{stats.totalReplaced || 0}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <TrendingUp size={24} className="text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSeasonId && stats && stats.acceptedCount < 10 && stats.totalDeclined > 0 && (
        <div className="admin-surface p-4 bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-400" size={20} />
              <div>
                <p className="font-semibold text-yellow-200">
                  Chưa đủ 10 đội đã chấp nhận ({stats.acceptedCount}/10)
                </p>
                <p className="text-sm text-yellow-200/70">
                  Có {stats.totalDeclined} đội đã từ chối. Bạn có thể tạo lời mời thay thế tự động.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Get previous season ID - in real app, this would be better handled
                const previousSeasonId = window.prompt('Nhập ID mùa giải trước:')
                if (previousSeasonId) {
                  handleEnsureMinimumTeams(parseInt(previousSeasonId))
                }
              }}
              className="admin-btn-primary"
            >
              <Users size={16} />
              Đảm bảo đủ 10 đội
            </button>
          </div>
        </div>
      )}

      {eligibilityCheck && (
        <div className="admin-surface p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Kết quả kiểm tra điều kiện</h3>
          <div className="space-y-2">
            {eligibilityCheck.isEligible ? (
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-200 font-semibold">✓ Đội bóng đáp ứng đầy đủ điều kiện</p>
              </div>
            ) : (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 font-semibold mb-2">✗ Đội bóng chưa đáp ứng điều kiện</p>
                <ul className="list-disc list-inside text-red-200/80 space-y-1">
                  {eligibilityCheck.errors?.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {eligibilityCheck.warnings?.length > 0 && (
              <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-200 font-semibold mb-2">⚠ Cảnh báo</p>
                <ul className="list-disc list-inside text-yellow-200/80 space-y-1">
                  {eligibilityCheck.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="admin-surface p-6">
        {!selectedSeasonId ? (
          <div className="text-center py-12 text-blue-200/60">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>Vui lòng chọn mùa giải để xem lời mời</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <Loader2 size={32} className="animate-spin mx-auto text-blue-400" />
            <p className="mt-4 text-blue-200/60">Đang tải...</p>
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="text-center py-12 text-blue-200/60">
            <Mail size={48} className="mx-auto mb-4 opacity-50" />
            <p>Chưa có lời mời nào cho mùa giải này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-full">
              <thead>
                <tr>
                  <th>Đội bóng</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th>Gửi lúc</th>
                  <th>Hạn phản hồi</th>
                  <th>Phản hồi lúc</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvitations.map((inv) => (
                  <tr key={inv.invitationId}>
                    <td>
                      <div>
                        <div className="font-semibold text-white">{inv.teamName}</div>
                        {inv.shortName && (
                          <div className="text-sm text-blue-200/60">{inv.shortName}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-blue-200/70">
                        {INVITE_TYPE_LABELS[inv.inviteType] || inv.inviteType}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${STATUS_STYLES[inv.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="text-blue-200/70">{formatDate(inv.invitedAt)}</td>
                    <td>{formatDeadline(inv.responseDeadline)}</td>
                    <td className="text-blue-200/70">{formatDate(inv.respondedAt)}</td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleCheckEligibility(inv.invitationId)}
                          className="admin-btn-secondary px-2 py-1 text-xs"
                          disabled={checkingEligibility}
                          title="Kiểm tra điều kiện"
                        >
                          <FileCheck size={14} />
                        </button>
                        {(inv.status === 'declined' || inv.status === 'expired') && (
                          <button
                            onClick={() => {
                              const previousSeasonId = window.prompt('Nhập ID mùa giải trước:')
                              if (previousSeasonId) {
                                handleCreateReplacement(inv.invitationId, parseInt(previousSeasonId))
                              }
                            }}
                            className="admin-btn-secondary px-2 py-1 text-xs"
                            title="Tạo lời mời thay thế"
                          >
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default SeasonTeamInvitationsPage

