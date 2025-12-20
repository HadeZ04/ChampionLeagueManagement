import React, { useMemo, useState } from 'react'
import { Check, X, MessageCircle, Paperclip, Search, Filter, Eye, Loader2 } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const sampleRequests = [
  { id: 101, team: 'Liverpool', contact: 'manager@lfc.com', status: 'pending', submittedAt: '2025-02-10', attachments: ['club_license.pdf'], comments: [] },
  { id: 102, team: 'Barcelona', contact: 'ops@fcb.com', status: 'pending', submittedAt: '2025-02-09', attachments: ['kit.png'], comments: [] },
  { id: 103, team: 'Ajax', contact: 'admin@ajax.nl', status: 'need_more', submittedAt: '2025-02-08', attachments: [], comments: [{ author: 'admin', message: 'Please re-upload roster.', at: '2025-02-08' }] }
]

const statusLabels = {
  pending: { text: 'Pending', className: 'bg-amber-100 text-amber-700' },
  approved: { text: 'Approved', className: 'bg-green-100 text-green-700' },
  rejected: { text: 'Rejected', className: 'bg-red-100 text-red-700' },
  need_more: { text: 'Need more info', className: 'bg-blue-100 text-blue-700' }
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
      toast.error('Comment is required for audit.')
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
      toast.success(`Request ${nextStatus}. Audit log recorded.`)
      setSelectedRequest(null)
      setActionType(null)
      setComment('')
      setIsProcessing(false)
    }, 400)
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-blue-600">BM2.2</p>
          <h1 className="text-3xl font-bold text-gray-900">Teams & Players Approval</h1>
          <p className="text-sm text-gray-600">Review registrations, attachments, and capture audit-ready decisions.</p>
        </div>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by team or contact..."
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600">
              <Filter size={14} />
              Filters
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="need_more">Need more info</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">Showing {filtered.length} registrations</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Team</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Contact</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Submitted</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Attachments</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{req.team}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{req.contact}</p>
                    <p className="text-xs text-gray-500">ID #{req.id}</p>
                  </td>
                  <td className="px-4 py-3">{req.submittedAt}</td>
                  <td className="px-4 py-3">
                    {req.attachments.length === 0 ? (
                      <span className="text-xs text-gray-500">No attachments</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {req.attachments.map((file) => (
                          <span key={file} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            <Paperclip size={12} />
                            {file}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${statusLabels[req.status]?.className || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[req.status]?.text || req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openAction(req, 'approve')}
                        className="rounded-md border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                        disabled={req.status === 'approved'}
                        title="Approve"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openAction(req, 'reject')}
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        disabled={req.status === 'rejected'}
                        title="Reject"
                      >
                        <X size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openAction(req, 'need_more')}
                        className="rounded-md border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                        title="Request info"
                      >
                        <MessageCircle size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Audit entry created for view action')}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No registrations match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === 'approve'
                  ? 'Approve registration'
                  : actionType === 'reject'
                  ? 'Reject registration'
                  : 'Request more information'}
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">Team: {selectedRequest.team}</p>
            <label className="mt-4 block text-sm font-medium text-gray-700">
              Comment (required for audit)
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide decision context and next steps..."
              />
            </label>
            <div className="mt-2 text-xs text-gray-500">Attachment preview will be available in the detailed view.</div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyAction}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={14} />}
                Submit decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalsPage
