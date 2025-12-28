import React, { useEffect, useState } from 'react'
import {
    Mail,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Calendar,
    Shield,
    Loader2,
    RefreshCw,
    Info,
    History,
    Inbox
} from 'lucide-react'
import { getMyInvitations, respondToInvitation } from '../../../layers/application/services/TeamInvitationService'
import AuthService from '../../../layers/application/services/AuthService'

// --- Helper Components ---

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    const bgClass = type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
    const Icon = type === 'success' ? CheckCircle : AlertTriangle

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-fade-in-up ${bgClass} transition-all`}>
            <Icon size={20} />
            <span className="font-medium text-sm">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
                <XCircle size={16} />
            </button>
        </div>
    )
}

// --- Main Page Component ---

const TeamInvitationsPage = ({ currentUser }) => {
    // Data State
    const [invitations, setInvitations] = useState([])
    const [respondedHistory, setRespondedHistory] = useState([]) // Local session history
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // UI State
    const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'history'
    const [toast, setToast] = useState(null) // { message, type }

    // Modal State
    const [selectedInvitation, setSelectedInvitation] = useState(null)
    const [actionType, setActionType] = useState(null) // 'accepted' | 'declined'
    const [responseNotes, setResponseNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchInvitations = async (isManual = false) => {
        try {
            if (isManual) setLoading(true)
            const token = AuthService.getToken()
            if (!token) throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')

            const data = await getMyInvitations(token)
            setInvitations(data)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch invitations:', err)
            setError(err.message || 'Không thể tải danh sách lời mời.')
        } finally {
            if (isManual || loading) setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvitations(true)
    }, [])

    // Handlers
    const handleActionClick = (invitation, type) => {
        setSelectedInvitation(invitation)
        setActionType(type)
        setResponseNotes('')
    }

    const handleCloseModal = () => {
        setSelectedInvitation(null)
        setActionType(null)
        setResponseNotes('')
    }

    const handleSubmitResponse = async () => {
        if (!selectedInvitation || !actionType) return

        try {
            setIsSubmitting(true)
            const token = AuthService.getToken()
            if (!token) throw new Error('Phiên đăng nhập hết hạn.')

            await respondToInvitation(
                selectedInvitation.invitationId,
                actionType,
                responseNotes,
                token
            )

            // 1. Add to local history
            const historyItem = {
                ...selectedInvitation,
                responseStatus: actionType,
                respondedAtLocal: new Date().toISOString(),
                responseNotes
            }
            setRespondedHistory(prev => [historyItem, ...prev])

            // 2. Show toast
            setToast({
                message: `Đã ${actionType === 'accepted' ? 'chấp nhận' : 'từ chối'} lời mời thành công`,
                type: 'success'
            })

            // 3. Switch tab if list becomes empty? Optional, but keeping user on Pending is default.
            // 4. Refetch list
            await fetchInvitations(false)

            handleCloseModal()
        } catch (err) {
            console.error('Submit error:', err)
            setToast({ message: err.message || 'Lỗi khi gửi phản hồi', type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Helpers
    const formatDateTime = (isoStr) => {
        if (!isoStr) return '—'
        const d = new Date(isoStr)
        return d.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const getDeadlineWarning = (isoStr) => {
        if (!isoStr) return null
        const deadline = new Date(isoStr)
        const now = new Date()
        const diffMs = deadline - now
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

        const dateStr = deadline.toLocaleDateString('vi-VN')

        if (diffDays <= 0) return { text: 'Đã hết hạn', color: 'text-red-500' }
        if (diffDays <= 2) return { text: `Hết hạn sau ${Math.max(0, diffDays)} ngày`, color: 'text-orange-500' }
        return { text: `Hạn chót: ${dateStr}`, color: 'text-gray-400' }
    }

    const getTypeLabel = (type) => {
        switch (type) {
            case 'retained':
                return { label: 'Được giữ lại', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
            case 'promoted':
                return { label: 'Thăng hạng', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
            case 'replacement':
                return { label: 'Thay thế', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
            default:
                return { label: type, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
        }
    }

    // --- RENDER ---

    const renderEmptyState = () => (
        <div className="bg-[#0f1926] rounded-xl border border-white/5 p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Inbox className="text-blue-500 opacity-60" size={32} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Không còn lời mời cần phản hồi</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
                Nếu bạn đã phản hồi trước đó, trạng thái đã được ghi nhận ở phía BTC/Super Admin.
                <br />
                Trang này chỉ hiển thị các lời mời đang ở trạng thái <span className="text-yellow-400">Waiting/Pending</span>.
            </p>

            <button
                onClick={() => fetchInvitations(true)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-blue-300 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
                <RefreshCw size={18} />
                Tải lại danh sách
            </button>
        </div>
    )

    const renderHistoryEmpty = () => (
        <div className="bg-[#0f1926] rounded-xl border border-white/5 p-12 text-center">
            <History className="mx-auto mb-4 opacity-30 text-gray-400" size={48} />
            <p className="text-gray-500">Chưa có lịch sử phản hồi trong phiên làm việc này.</p>
        </div>
    )

    if (loading && !invitations.length && !respondedHistory.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertTriangle className="mx-auto mb-3" size={32} />
                {error}
                <button
                    onClick={() => fetchInvitations(true)}
                    className="block mx-auto mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-sm font-medium"
                >
                    Thử lại
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Mail className="text-blue-500" />
                        Lời mời tham gia mùa giải
                    </h1>
                    <p className="text-blue-200/60">
                        Quản lý các lời mời tham gia giải đấu
                    </p>
                </div>

                {/* Helper Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300">
                    <Info size={14} />
                    <span>Chỉ hiển thị lời mời đang chờ</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'pending'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Inbox size={16} />
                    Chờ phản hồi ({invitations.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'history'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <History size={16} />
                    Lịch sử phiên này ({respondedHistory.length})
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
                {activeTab === 'pending' ? (
                    invitations.length === 0 ? renderEmptyState() : (
                        <div className="bg-[#0f1926] rounded-xl border border-white/5 overflow-hidden animate-fade-in">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/5 text-xs uppercase tracking-wider text-blue-300/80">
                                            <th className="p-4 font-semibold">Mùa giải</th>
                                            <th className="p-4 font-semibold">Loại</th>
                                            <th className="p-4 font-semibold">Ngày nhận</th>
                                            <th className="p-4 font-semibold">Hạn chót</th>
                                            <th className="p-4 font-semibold text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {invitations.map((inv) => {
                                            const typeStyle = getTypeLabel(inv.inviteType)
                                            const deadlineInfo = getDeadlineWarning(inv.responseDeadline)

                                            return (
                                                <tr key={inv.invitationId} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4 font-medium text-white">
                                                        <div className="flex items-center gap-2">
                                                            <Shield size={16} className="text-blue-500" />
                                                            {inv.seasonName || `Season #${inv.seasonId}`}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${typeStyle.color}`}>
                                                            {typeStyle.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-blue-100/70 text-sm">
                                                        {formatDateTime(inv.invitedAt)}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className={`text-sm font-medium ${deadlineInfo?.color}`}>
                                                                {deadlineInfo?.text}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleActionClick(inv, 'accepted')}
                                                                className="group p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                                                                title="Chấp nhận"
                                                            >
                                                                <CheckCircle size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleActionClick(inv, 'declined')}
                                                                className="group p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                                                title="Từ chối"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    /* History Tab */
                    respondedHistory.length === 0 ? renderHistoryEmpty() : (
                        <div className="bg-[#0f1926] rounded-xl border border-white/5 overflow-hidden animate-fade-in">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                                            <th className="p-4">Mùa giải</th>
                                            <th className="p-4">Quyết định</th>
                                            <th className="p-4">Thời gian xử lý</th>
                                            <th className="p-4">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {respondedHistory.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-white/[0.02]">
                                                <td className="p-4 text-gray-300">
                                                    {item.seasonName || `Season #${item.seasonId}`}
                                                </td>
                                                <td className="p-4">
                                                    {item.responseStatus === 'accepted' ? (
                                                        <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                                                            <CheckCircle size={14} /> Chấp nhận
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
                                                            <XCircle size={14} /> Từ chối
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-gray-400 text-sm">
                                                    {formatDateTime(item.respondedAtLocal)}
                                                </td>
                                                <td className="p-4 text-gray-500 text-sm italic">
                                                    {item.responseNotes || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Confirmation Modal */}
            {selectedInvitation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-[#0f1926] border border-white/10 rounded-2xl shadow-2xl p-6 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            {actionType === 'accepted' ? (
                                <CheckCircle className="text-green-500" />
                            ) : (
                                <XCircle className="text-red-500" />
                            )}
                            {actionType === 'accepted'
                                ? 'Xác nhận tham gia'
                                : 'Xác nhận từ chối'}
                        </h3>

                        <p className="text-gray-300 mb-4">
                            Bạn có chắc chắn muốn <span className={`font-bold ${actionType === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>
                                {actionType === 'accepted' ? 'CHẤP NHẬN' : 'TỪ CHỐI'}
                            </span> lời mời tham gia mùa giải{' '}
                            <span className="text-blue-400 font-semibold">
                                {selectedInvitation.seasonName}
                            </span>
                            ?
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">
                                Ghi chú (tùy chọn)
                            </label>
                            <textarea
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-24 text-sm"
                                placeholder="Nhập ghi chú hoặc lý do..."
                                value={responseNotes}
                                onChange={(e) => setResponseNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                disabled={isSubmitting}
                                onClick={handleCloseModal}
                                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 text-gray-300 rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                disabled={isSubmitting}
                                onClick={handleSubmitResponse}
                                className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 ${actionType === 'accepted'
                                        ? 'bg-gradient-to-r from-green-600 to-green-500 hover:shadow-green-500/20'
                                        : 'bg-gradient-to-r from-red-600 to-red-500 hover:shadow-red-500/20'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    'Xác nhận'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TeamInvitationsPage
