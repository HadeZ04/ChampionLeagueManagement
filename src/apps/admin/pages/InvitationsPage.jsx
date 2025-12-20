import React, { useMemo, useState } from 'react'
import { Mail, Plus, RefreshCw, Search, Filter, Send, XCircle, CheckCircle, Clock, Loader2 } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const defaultInvitations = [
  { id: 1, email: 'manager@example.com', role: 'competition_manager', status: 'pending', sentAt: '2025-02-10', expiresAt: '2025-02-20' },
  { id: 2, email: 'referee@example.com', role: 'referee', status: 'accepted', sentAt: '2025-02-01', expiresAt: '2025-02-11' },
  { id: 3, email: 'auditor@example.com', role: 'auditor', status: 'expired', sentAt: '2025-01-15', expiresAt: '2025-01-25' }
]

const pageSize = 5

const InvitationsPage = () => {
  const [invitations, setInvitations] = useState(defaultInvitations)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState({ email: '', role: 'competition_manager', note: '' })
  const [formErrors, setFormErrors] = useState([])
  const [page, setPage] = useState(1)
  const [isSending, setIsSending] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return invitations.filter((inv) => {
      const matchesSearch = !term || inv.email.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [invitations, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSubmit = (event) => {
    event.preventDefault()
    const errs = []
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      errs.push('Email không hợp lệ.')
    }
    if (!form.role) {
      errs.push('Chọn vai trò được cấp quyền.')
    }
    setFormErrors(errs)
    if (errs.length > 0) {
      return
    }
    setIsSending(true)
    setTimeout(() => {
      const now = new Date().toISOString().slice(0, 10)
      const newInvite = {
        id: Date.now(),
        email: form.email,
        role: form.role,
        status: 'pending',
        sentAt: now,
        expiresAt: form.expiresAt || ''
      }
      setInvitations((prev) => [newInvite, ...prev])
      toast.success('Invitation sent.')
      setForm({ email: '', role: 'competition_manager', note: '' })
      setIsSending(false)
      setPage(1)
    }, 400)
  }

  const resendInvite = (id) => {
    setInvitations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'pending', sentAt: new Date().toISOString().slice(0, 10) } : item))
    )
    toast.success('Invitation resent.')
  }

  const revokeInvite = (id) => {
    if (!window.confirm('Revoke this invitation?')) return
    setInvitations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'revoked' } : item))
    )
    toast.success('Invitation revoked.')
  }

  const renderStatus = (status) => {
    if (status === 'accepted') return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700"><CheckCircle size={14} />Đã chấp nhận</span>
    if (status === 'pending') return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700"><Clock size={14} />Đang chờ</span>
    if (status === 'expired') return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">Hết hạn</span>
    if (status === 'revoked') return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Thu hồi</span>
    return status
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-blue-600">Access control</p>
          <h1 className="text-3xl font-bold text-gray-900">Invitations</h1>
          <p className="text-sm text-gray-600">Send one-time invitations and track their status.</p>
        </div>
        <button
          type="button"
          onClick={() => setPage(1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Create invitation</h2>
        {formErrors.length > 0 && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ul className="list-disc space-y-1 pl-4">
              {formErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-3 md:items-end">
          <label className="space-y-1 text-sm text-gray-700">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>
          <label className="space-y-1 text-sm text-gray-700">
            Role
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="competition_manager">Competition Manager</option>
              <option value="referee">Referee</option>
              <option value="official">Official</option>
              <option value="auditor">Auditor</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={isSending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
            Send invitation
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by email..."
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600">
              <Filter size={14} />
              Filters
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">
            Showing {paged.length} of {filtered.length} invitations
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Email</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Role</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Sent</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Expires</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{inv.email}</td>
                  <td className="px-4 py-3 capitalize">{inv.role.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">{inv.sentAt || '—'}</td>
                  <td className="px-4 py-3">{inv.expiresAt || '—'}</td>
                  <td className="px-4 py-3">{renderStatus(inv.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => resendInvite(inv.id)}
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                        disabled={inv.status === 'accepted'}
                        title="Resend invitation"
                      >
                        <Send size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => revokeInvite(inv.id)}
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        title="Revoke invitation"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No invitations match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-60"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default InvitationsPage
