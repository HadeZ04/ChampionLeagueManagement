import React, { useMemo, useState } from 'react'
import { CheckCircle, XCircle, Plus, Search, Filter, Shield, UserCheck } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const initialOfficials = [
  { id: 1, name: 'Pierluigi Collina', role: 'Referee', availability: 'Available', certifications: ['UEFA Elite'], status: 'active' },
  { id: 2, name: 'Bibiana Steinhaus', role: 'VAR', availability: 'Limited', certifications: ['FIFA'], status: 'active' },
  { id: 3, name: 'Mark Clattenburg', role: 'Supervisor', availability: 'Unavailable', certifications: ['UEFA'], status: 'inactive' }
]

const OfficialsManagement = () => {
  const [officials, setOfficials] = useState(initialOfficials)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [form, setForm] = useState({ name: '', role: 'Referee', availability: 'Available', certifications: '' })
  const [errors, setErrors] = useState([])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return officials.filter((o) => {
      const matchesSearch = !term || o.name.toLowerCase().includes(term)
      const matchesRole = roleFilter === 'all' || o.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [officials, search, roleFilter])

  const handleSubmit = (event) => {
    event.preventDefault()
    const errs = []
    if (!form.name.trim()) errs.push('Name is required.')
    if (!form.role) errs.push('Role is required.')
    setErrors(errs)
    if (errs.length > 0) return

    const certs = form.certifications
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)

    setOfficials((prev) => [
      { id: Date.now(), name: form.name.trim(), role: form.role, availability: form.availability, certifications: certs, status: 'active' },
      ...prev
    ])
    toast.success('Official added.')
    setForm({ name: '', role: 'Referee', availability: 'Available', certifications: '' })
    setErrors([])
  }

  const toggleStatus = (id) => {
    setOfficials((prev) =>
      prev.map((off) => (off.id === id ? { ...off, status: off.status === 'active' ? 'inactive' : 'active' } : off))
    )
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-blue-600">Officials</p>
          <h1 className="text-3xl font-bold text-gray-900">Officials & Assignments</h1>
          <p className="text-sm text-gray-600">Maintain referee pools and supervisor availability.</p>
        </div>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Add official</h2>
        {errors.length > 0 && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ul className="list-disc space-y-1 pl-4">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-4 md:items-end">
          <label className="space-y-1 text-sm text-gray-700">
            Name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="space-y-1 text-sm text-gray-700">
            Role
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Referee</option>
              <option>Assistant</option>
              <option>VAR</option>
              <option>Supervisor</option>
            </select>
          </label>
          <label className="space-y-1 text-sm text-gray-700">
            Availability
            <select
              value={form.availability}
              onChange={(e) => setForm((prev) => ({ ...prev, availability: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Available</option>
              <option>Limited</option>
              <option>Unavailable</option>
            </select>
          </label>
          <label className="space-y-1 text-sm text-gray-700">
            Certifications (comma separated)
            <input
              type="text"
              value={form.certifications}
              onChange={(e) => setForm((prev) => ({ ...prev, certifications: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="UEFA Elite, FIFA"
            />
          </label>
          <button
            type="submit"
            className="md:col-span-4 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Add official
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
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search officials..."
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600">
              <Filter size={14} />
              Filters
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All roles</option>
              <option value="Referee">Referee</option>
              <option value="Assistant">Assistant</option>
              <option value="VAR">VAR</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">Showing {filtered.length} officials</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Official</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Role</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Availability</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Certifications</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((off) => (
                <tr key={off.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <span className="inline-flex items-center gap-2">
                      <Shield size={16} className="text-blue-500" />
                      {off.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{off.role}</td>
                  <td className="px-4 py-3">{off.availability}</td>
                  <td className="px-4 py-3">
                    {off.certifications.length === 0 ? '—' : off.certifications.join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    {off.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        <CheckCircle size={14} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        <XCircle size={14} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleStatus(off.id)}
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <UserCheck size={14} />
                      Toggle status
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No officials match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default OfficialsManagement
