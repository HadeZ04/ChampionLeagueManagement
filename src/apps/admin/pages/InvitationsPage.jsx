import React, { useMemo, useState } from 'react'
import { RefreshCw, Search, Filter, Send, XCircle, CheckCircle, Clock, Loader2 } from 'lucide-react'
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
    setInvitations((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'revoked' } : item)))
    toast.success('Invitation revoked.')
  }

  const renderStatus = (status) => {
    if (status === 'accepted') {
      return (
        <span className="admin-badge admin-badge-green">
          <CheckCircle size={14} />
          Accepted
        </span>
      )
    }
    if (status === 'pending') {
      return (
        <span className="admin-badge admin-badge-amber">
          <Clock size={14} />
          Pending
        </span>
      )
    }
    if (status === 'expired') return <span className="admin-badge admin-badge-blue">Expired</span>
    if (status === 'revoked') return <span className="admin-badge admin-badge-red">Revoked</span>
    return status
  }

  return (
    <div className="admin-page space-y-6">
      <Toaster position="top-right" />

      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Access control</p>
          <h1 className="text-3xl font-black tracking-wider text-white">Invitations</h1>
          <p className="text-sm text-blue-200/40">Send one-time invitations and track their status.</p>
        </div>
        <button type="button" onClick={() => setPage(1)} className="admin-btn-secondary">
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <section className="admin-surface p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Create invitation</h2>

        {formErrors.length > 0 && (
          <div className="rounded border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <ul className="list-disc space-y-1 pl-4">
              {formErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm text-blue-200/60">
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="admin-input"
              placeholder="email@example.com"
            />
          </label>
          <label className="space-y-1 text-sm text-blue-200/60">
            Role
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              className="admin-select"
            >
              <option value="competition_manager">Competition manager</option>
              <option value="referee">Referee</option>
              <option value="auditor">Auditor</option>
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={isSending} className="admin-btn-primary w-full justify-center">
              <span>
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSending ? 'Sending...' : 'Send invitation'}
              </span>
            </button>
          </div>
        </form>
      </section>

      <section className="admin-surface p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/40" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="admin-input pl-10 pr-3 py-2 text-sm"
                placeholder="Search by email..."
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-blue-200/50">
              <Filter size={14} />
              Filters
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="admin-select w-auto px-3 py-2 text-sm"
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
          <p className="text-sm text-blue-200/40">Showing {paged.length} of {filtered.length} invitations</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="admin-table min-w-full">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Sent</th>
                <th>Expires</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((inv) => (
                <tr key={inv.id}>
                  <td className="text-slate-100">{inv.email}</td>
                  <td className="capitalize text-blue-200/70">{inv.role.replace(/_/g, ' ')}</td>
                  <td className="text-blue-200/70">{inv.sentAt || '—'}</td>
                  <td className="text-blue-200/70">{inv.expiresAt || '—'}</td>
                  <td>{renderStatus(inv.status)}</td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => resendInvite(inv.id)}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-blue-100/80 hover:bg-white/10 disabled:opacity-60"
                        disabled={inv.status === 'accepted'}
                        title="Resend invitation"
                      >
                        <Send size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => revokeInvite(inv.id)}
                        className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-xs font-bold text-rose-200 hover:bg-rose-500/15"
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
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-blue-200/40">
                    No invitations match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-blue-200/50">
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="admin-btn-secondary px-3 py-1"
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
              className="admin-btn-secondary px-3 py-1"
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
