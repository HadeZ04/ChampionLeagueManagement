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
  Send,
  Shield,
  MinusCircle,
  RefreshCcw,
  Trash2,
  AlertTriangle
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
  rescinded: 'Đã thu hồi',
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

  // Generic Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'rescind' | 'reinvite' | 'autofill'
    title: '',
    message: '',
    confirmLabel: 'Xác nhận',
    cancelLabel: 'Hủy',
    isDanger: false,
    data: null
  })
  const [isProcessing, setIsProcessing] = useState(false)

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

  // --- ACTIONS HANDLERS (Open Modals) ---

  const openRescindModal = (invitationId) => {
    setConfirmModal({
      isOpen: true,
      type: 'rescind',
      title: 'Thu hồi lời mời?',
      message: 'Đội bóng sẽ không còn thấy lời mời này nữa. Bạn có chắc chắn muốn thu hồi không?',
      confirmLabel: 'Thu hồi',
      cancelLabel: 'Hủy bỏ',
      isDanger: true,
      data: { invitationId }
    })
  }

  const openReinviteModal = (invitationId) => {
    setConfirmModal({
      isOpen: true,
      type: 'reinvite',
      title: 'Mời lại đội này?',
      message: 'Hệ thống sẽ tạo một lời mời mới với hạn phản hồi 14 ngày.',
      confirmLabel: 'Mời lại',
      cancelLabel: 'Hủy bỏ',
      isDanger: false,
      data: { invitationId }
    })
  }

  const openAutoFillModal = () => {
    setConfirmModal({
      isOpen: true,
      type: 'autofill',
      title: 'Tạo lời mời thay thế?',
      message: 'Hệ thống sẽ tự động tìm kiếm và mời thêm các đội phù hợp để đảm bảo đủ 10 lời mời đang chờ/chấp nhận.',
      confirmLabel: 'Xác nhận mời',
      cancelLabel: 'Hủy bỏ',
      isDanger: false,
      data: null
    })
  }

  // --- CONFIRM LOGIC ---

  const handleConfirmAction = async () => {
    if (!selectedSeasonId || !confirmModal.data && confirmModal.type !== 'autofill') return

    setIsProcessing(true)
    try {
      if (confirmModal.type === 'rescind') {
        const { invitationId } = confirmModal.data
        await ApiService.patch(
          `/seasons/${selectedSeasonId}/invitations/${invitationId}/status`,
          { status: 'rescinded', responseNotes: 'Thu hồi bởi BTC' }
        )
        toast.success('Đã thu hồi lời mời')
      }
      else if (confirmModal.type === 'reinvite') {
        const { invitationId } = confirmModal.data
        await ApiService.post(
          `/seasons/${selectedSeasonId}/invitations/${invitationId}/reinvite`
        )
        toast.success('Đã gửi lại lời mời')
      }
      else if (confirmModal.type === 'autofill') {
        const response = await ApiService.post(
          `/seasons/${selectedSeasonId}/invitations/auto-fill`
        )
        const data = response?.data
        if (data?.created > 0) {
          toast.success(`Đã tạo thêm ${data.created} lời mời thay thế`)
        } else {
          toast.info('Không có lời mời nào được tạo thêm')
        }
      }

      // Refresh data
      await loadInvitations()
      await loadStats()
      setConfirmModal({ ...confirmModal, isOpen: false })
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.error || 'Có lỗi xảy ra')
    } finally {
      setIsProcessing(false)
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

    if (daysLeft < 0) return <span className="text-red-400 font-semibold">Đã hết hạn</span>
    if (daysLeft === 0) return <span className="text-orange-400 font-semibold">Hết hạn hôm nay</span>
    if (daysLeft <= 3) return <span className="text-orange-400">{daysLeft} ngày còn lại</span>
    return <span className="text-gray-400 text-sm">{daysLeft} ngày còn lại</span>
  }

  const sortedInvitations = [...invitations].sort((a, b) => {
    // Sort by status priority: pending > accepted > declined > expired
    // Then by invitedAt desc
    const statusPriority = { pending: 1, accepted: 2, declined: 3, expired: 4, rescinded: 5, replaced: 6 }
    const pA = statusPriority[a.status] || 99
    const pB = statusPriority[b.status] || 99
    if (pA !== pB) return pA - pB
    return new Date(b.invitedAt) - new Date(a.invitedAt)
  })

  // Check quota
  const activeCount = stats ? (stats.acceptedCount + stats.totalPending) : 0
  const isQuotaLow = activeCount < 10

  return (
    <div className="admin-page space-y-6 pb-20">
      <Toaster position="top-right" />

      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Quản lý giải đấu</p>
          <h1 className="text-3xl font-black tracking-wider text-white">Lời Mời Đội Bóng</h1>
          <p className="text-sm text-blue-200/40">
            Quản lý danh sách và gửi lời mời tham gia mùa giải
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
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-surface p-4 border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-200/60">Đã chấp nhận</p>
                <p className="text-2xl font-bold text-green-100">{stats.acceptedCount}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
            </div>
          </div>
          <div className="admin-surface p-4 border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-200/60">Chờ phản hồi</p>
                <p className="text-2xl font-bold text-yellow-100">{stats.totalPending}</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Clock size={24} className="text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="admin-surface p-4 hover:bg-white/5 transition-colors">
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
          <div className="admin-surface p-4 hover:bg-white/5 transition-colors">
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

      {/* Warning CTA Banner (Polished) */}
      {selectedSeasonId && stats && isQuotaLow && (
        <div className="admin-surface p-5 bg-[#1a1f2e] border border-orange-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-500/10 rounded-full mt-1 md:mt-0">
                <AlertTriangle className="text-orange-400 animate-pulse" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-orange-200 text-lg flex items-center gap-2">
                  Chưa đủ 10 đội ({activeCount}/10)
                </h3>
                <div className="text-sm text-gray-300 mt-1 space-y-1">
                  <p>Hệ thống yêu cầu 10 lời mời ở trạng thái <span className="text-green-300 font-medium">"Đã chấp nhận"</span> hoặc <span className="text-yellow-300 font-medium">"Chờ phản hồi"</span>.</p>
                  <p>Hiện đang thiếu <span className="font-bold text-orange-300">{10 - activeCount}</span> đội.</p>
                </div>
              </div>
            </div>
            <button
              onClick={openAutoFillModal}
              title="Gửi lời mời thay thế tự động từ danh sách chờ"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Users size={18} />
              Đảm bảo đủ 10 lời mời
            </button>
          </div>
        </div>
      )}

      {/* Main List */}
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
        ) : sortedInvitations.length === 0 ? (
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
                  <th>Đã phản hồi</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedInvitations.map((inv) => (
                  <tr key={inv.invitationId} className="group hover:bg-white/[0.02] transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0f1926] border border-white/10 flex items-center justify-center text-sm font-bold text-blue-300 shadow-sm">
                          {inv.teamName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                            {inv.teamName}
                          </div>
                          {inv.shortName && (
                            <div className="text-xs text-gray-500">{inv.shortName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/10">
                        {INVITE_TYPE_LABELS[inv.inviteType] || inv.inviteType}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${STATUS_STYLES[inv.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="text-gray-400 text-sm">{formatDate(inv.invitedAt)}</td>
                    <td className="text-sm">{formatDeadline(inv.responseDeadline)}</td>
                    <td className="text-gray-400 text-sm">
                      {inv.respondedAt ? (
                        <div className="flex flex-col">
                          <span className="text-xs">{formatDate(inv.respondedAt)}</span>
                          {inv.responseNotes && (
                            <span className="text-xs italic text-gray-500 mt-0.5 max-w-[120px] truncate" title={inv.responseNotes}>
                              "{inv.responseNotes}"
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="opacity-30">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCheckEligibility(inv.invitationId)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          disabled={checkingEligibility}
                          title="Kiểm tra điều kiện tham gia"
                        >
                          <FileCheck size={16} />
                        </button>

                        {/* RESCIND ACTION (Red Trash) */}
                        {inv.status === 'pending' && (
                          <button
                            onClick={() => openRescindModal(inv.invitationId)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
                            title="Refuse" // Meaning "Thu hồi"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        {/* RE-INVITE ACTION (Blue Refresh) */}
                        {(inv.status === 'declined' || inv.status === 'expired' || inv.status === 'rescinded') && (
                          <button
                            onClick={() => openReinviteModal(inv.invitationId)}
                            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-200 hover:bg-blue-500/20 transition-colors"
                            title="Mời lại (Tạo lời mời mới)"
                          >
                            <RefreshCcw size={16} />
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

      {/* Generic Confirmation Modal (Custom) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0f1926] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
            {/* Header */}
            <div className={`p-6 border-b border-white/5 ${confirmModal.isDanger ? 'bg-red-500/5' : 'bg-blue-500/5'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${confirmModal.isDanger ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {confirmModal.type === 'rescind' ? <Trash2 size={24} /> :
                    confirmModal.type === 'autofill' ? <Users size={24} /> : <RefreshCcw size={24} />}
                </div>
                <h3 className="text-xl font-bold text-white">{confirmModal.title}</h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-300 leading-relaxed text-base">
                {confirmModal.message}
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/20 flex gap-3">
              <button
                disabled={isProcessing}
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-colors"
              >
                {confirmModal.cancelLabel}
              </button>
              <button
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className={`flex-1 px-4 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2
                  ${confirmModal.isDanger
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeasonTeamInvitationsPage
