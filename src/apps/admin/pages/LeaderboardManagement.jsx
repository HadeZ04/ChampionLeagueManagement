import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import LeaderboardService from '../../../layers/application/services/LeaderboardService'
import SeasonService from '../../../layers/application/services/SeasonService'

const DEFAULT_FORM = {
  username: '',
  points: '',
  country: '',
  badge: 'Pro',
  rank: '',
  season: '2025-2026'
}

const BADGE_OPTIONS = ['Legend', 'Master', 'Expert', 'Pro']

const LeaderboardManagement = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [seasonFilter, setSeasonFilter] = useState('2025-2026')
  const [seasonOptions, setSeasonOptions] = useState(['2025-2026', '2024-2025', '2023-2024'])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formValues, setFormValues] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const response = await SeasonService.listSeasons()
        if (response.length) {
          setSeasonOptions(response.map((season) => season.name))
          if (!response.some((season) => season.name === seasonFilter)) {
            setSeasonFilter(response[0].name)
          }
        }
      } catch (error) {
        console.warn('Unable to load season list, using defaults', error)
      }
    }
    loadSeasons()
  }, [])

  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true)
      try {
        const data = await LeaderboardService.getLeaderboard({ season: seasonFilter })
        setEntries(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
        toast.error('Không thể tải leaderboard')
      } finally {
        setLoading(false)
      }
    }
    loadEntries()
  }, [seasonFilter])

  const filteredEntries = useMemo(() => {
    if (!searchTerm) {
      return entries
    }
    const search = searchTerm.toLowerCase()
    return entries.filter(
      (entry) =>
        entry.username?.toLowerCase().includes(search) ||
        entry.country?.toLowerCase().includes(search) ||
        String(entry.rank ?? '').includes(search)
    )
  }, [entries, searchTerm])

  const openCreateForm = () => {
    setEditingEntry(null)
    setFormValues({ ...DEFAULT_FORM, season: seasonFilter })
    setIsFormOpen(true)
  }

  const openEditForm = (entry) => {
    setEditingEntry(entry)
    setFormValues({
      username: entry.username ?? '',
      points: entry.points ?? '',
      country: entry.country ?? '',
      badge: entry.badge ?? 'Pro',
      rank: entry.rank ?? '',
      season: entry.season ?? seasonFilter
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const payload = {
      ...formValues,
      points: Number(formValues.points) || 0,
      rank: Number(formValues.rank) || undefined
    }
    try {
      if (editingEntry?.id) {
        await LeaderboardService.updateEntry(editingEntry.id, payload)
        toast.success('Cập nhật thành công')
      } else {
        await LeaderboardService.addEntry(payload)
        toast.success('Thêm người chơi thành công')
      }
      closeForm()
      const data = await LeaderboardService.getLeaderboard({ season: seasonFilter })
      setEntries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      toast.error('Lưu thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (entryId) => {
    if (!window.confirm('Xóa người chơi khỏi bảng xếp hạng?')) {
      return
    }
    try {
      await LeaderboardService.deleteEntry(entryId)
      toast.success('Đã xóa người chơi')
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard Management</h1>
          <p className="text-gray-500">Theo dõi và quản lý bảng xếp hạng người chơi theo mùa giải.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={seasonFilter}
            onChange={(event) => setSeasonFilter(event.target.value)}
          >
            {seasonOptions.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
          <button
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
            onClick={openCreateForm}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm người chơi
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, quốc gia, thứ hạng..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Quốc gia
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Badge
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Điểm
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                    Không có dữ liệu phù hợp.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredEntries.map((entry) => (
                  <tr key={entry.id ?? entry.rank}>
                    <td className="px-4 py-3 font-semibold text-gray-800">{entry.rank}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{entry.username}</div>
                      <div className="text-xs text-gray-500">{entry.season}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{entry.country}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          entry.badge === 'Legend'
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.badge === 'Master'
                              ? 'bg-purple-100 text-purple-800'
                              : entry.badge === 'Expert'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {entry.badge}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{entry.points?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="rounded-full border border-gray-200 p-2 text-gray-500 hover:border-blue-500 hover:text-blue-600"
                          onClick={() => openEditForm(entry)}
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-full border border-gray-200 p-2 text-gray-500 hover:border-red-500 hover:text-red-600"
                          onClick={() => handleDelete(entry.id)}
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

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingEntry ? 'Cập nhật người chơi' : 'Thêm người chơi'}
              </h2>
              <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100" onClick={closeForm}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.username}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Quốc gia</label>
                  <input
                    type="text"
                    name="country"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.country}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Điểm</label>
                  <input
                    type="number"
                    name="points"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.points}
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
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Badge</label>
                  <select
                    name="badge"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formValues.badge}
                    onChange={handleFormChange}
                  >
                    {BADGE_OPTIONS.map((badge) => (
                      <option key={badge} value={badge}>
                        {badge}
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
                    {seasonOptions.map((season) => (
                      <option key={season} value={season}>
                        {season}
                      </option>
                    ))}
                  </select>
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

export default LeaderboardManagement
