import React, { useMemo, useState } from 'react'
import { Check, X, MessageCircle, Paperclip, Search, Filter, Eye, Loader2 } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const sampleRequests = [
  { id: 101, team: 'Liverpool', contact: 'manager@lfc.com', status: 'pending', submittedAt: '2025-02-10', attachments: ['club_license.pdf'], comments: [] },
  { id: 102, team: 'Barcelona', contact: 'ops@fcb.com', status: 'pending', submittedAt: '2025-02-09', attachments: ['kit.png'], comments: [] },
  { id: 103, team: 'Ajax', contact: 'admin@ajax.nl', status: 'need_more', submittedAt: '2025-02-08', attachments: [], comments: [{ author: 'admin', message: 'Vui lòng tải lại danh sách cầu thủ.', at: '2025-02-08' }] }
]

const statusLabels = {
  pending: { text: 'Chờ duyệt', className: 'admin-badge admin-badge-amber' },
  approved: { text: 'Đã duyệt', className: 'admin-badge admin-badge-green' },
  rejected: { text: 'Từ chối', className: 'admin-badge admin-badge-red' },
  need_more: { text: 'Cần bổ sung', className: 'admin-badge admin-badge-blue' }
}

const ApprovalsPage = () => {
  const [requests, setRequests] = useState(sampleRequests)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionType, setActionType] = useState(null)
  const [comment, setComment] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return requests.filter((req) => {
      const matchesSearch = !term || req.team.toLowerCase().includes(term) || req.contact.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [requests, search, statusFilter])

  const openAction = (req, type) => {
    setSelectedRequest(req)
    setActionType(type)
    setComment('')
  }

  const applyAction = () => {
    if (!comment.trim()) {
      toast.error('Cần có ghi chú để lưu nhật ký.')
      return
    }
    setIsProcessing(true)
    const nextStatus = actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'need_more'
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: nextStatus,
                comments: [...req.comments, { author: 'admin', message: comment.trim(), at: new Date().toISOString().slice(0, 10) }]
              }
            : req
        )
      )
      toast.success(`Đã cập nhật trạng thái: ${statusLabels[nextStatus]?.text ?? 'Đã cập nhật'}. Đã ghi nhật ký.`)
      setSelectedRequest(null)
      setActionType(null)
      setComment('')
      setIsProcessing(false)
    }, 400)
  }

  return (
    <div className="admin-page space-y-6">
      <Toaster position="top-right" />

      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">BM2.2</p>
          <h1 className="text-3xl font-black tracking-wider text-white">Phê duyệt đội & cầu thủ</h1>
          <p className="text-sm text-blue-200/40">Xem đăng ký, tệp đính kèm và lưu quyết định kèm nhật ký.</p>
        </div>
      </header>

      <section className="admin-surface p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input pl-10 pr-3 py-2 text-sm"
                placeholder="Tìm theo đội hoặc liên hệ..."
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-blue-200/50">
              <Filter size={14} />
              Bộ lọc
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select w-auto px-3 py-2 text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="need_more">Cần bổ sung</option>
            </select>
          </div>
          <p className="text-sm text-blue-200/40">Đang hiển thị {filtered.length} đăng ký</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="admin-table min-w-full">
            <thead>
              <tr>
                <th>Đội</th>
                <th>Liên hệ</th>
                <th>Ngày gửi</th>
                <th>Tệp đính kèm</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td className="font-semibold text-white">{req.team}</td>
                  <td>
                    <p className="text-slate-100">{req.contact}</p>
                    <p className="text-xs text-blue-200/40">ID #{req.id}</p>
                  </td>
                  <td className="text-blue-200/70">{req.submittedAt}</td>
                  <td>
                    {req.attachments.length === 0 ? (
                      <span className="text-xs text-blue-200/40">Không có tệp</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {req.attachments.map((file) => (
                          <span key={file} className="admin-badge admin-badge-blue">
                            <Paperclip size={12} /> {file}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={statusLabels[req.status]?.className || 'admin-badge admin-badge-blue'}>
                      {statusLabels[req.status]?.text || req.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openAction(req, 'approve')}
                        className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-200 hover:bg-emerald-500/15"
                        disabled={req.status === 'approved'}
                        title="Duyệt"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openAction(req, 'reject')}
                        className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-xs font-bold text-rose-200 hover:bg-rose-500/15"
                        disabled={req.status === 'rejected'}
                        title="Từ chối"
                      >
                        <X size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openAction(req, 'need_more')}
                        className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-200 hover:bg-cyan-500/15"
                        title="Yêu cầu bổ sung"
                      >
                        <MessageCircle size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Đã tạo bản ghi nhật ký cho thao tác xem')}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-blue-100/80 hover:bg-white/10"
                        title="Xem chi tiết"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-blue-200/40">
                    Không có đăng ký nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg admin-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {actionType === 'approve'
                  ? 'Duyệt đăng ký'
                  : actionType === 'reject'
                  ? 'Từ chối đăng ký'
                  : 'Yêu cầu bổ sung thông tin'}
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="text-blue-200/40 hover:text-white transition-colors">
                ×
              </button>
            </div>
            <p className="mt-2 text-sm text-blue-200/40">
              Đội: <span className="text-slate-100 font-semibold">{selectedRequest.team}</span>
            </p>
            <label className="mt-4 block text-sm font-medium text-blue-200/60">
              Ghi chú (bắt buộc để lưu nhật ký)
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="mt-2 admin-input px-3 py-2 text-sm"
                placeholder="Nêu lý do quyết định và bước tiếp theo..."
              />
            </label>
            <div className="mt-2 text-xs text-blue-200/40">Xem trước tệp sẽ có trong phần xem chi tiết.</div>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setSelectedRequest(null)} className="admin-btn-secondary">
                Hủy
              </button>
              <button type="button" onClick={applyAction} disabled={isProcessing} className="admin-btn-primary">
                <span>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={14} />}
                  Gửi quyết định
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalsPage
