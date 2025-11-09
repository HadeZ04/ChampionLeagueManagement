import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Search, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import StatsService from '../../../layers/application/services/StatsService'
import SeasonService from '../../../layers/application/services/SeasonService'

const CATEGORY_OPTIONS = [
  { value: 'goals', label: 'Goals' },
  { value: 'assists', label: 'Assists' },
  { value: 'clean-sheets', label: 'Clean Sheets' },
  { value: 'minutes', label: 'Minutes Played' }
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

const PlayerStatsManagement = () => {
  const [seasonFilter, setSeasonFilter] = useState('2025-2026')
  const [seasonOptions, setSeasonOptions] = useState(['2025-2026', '2024-2025', '2023-2024'])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ goals: [], assists: [], 'clean-sheets': [], minutes: [] })
  const [loading, setLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formValues, setFormValues] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const list = await SeasonService.listSeasons()
        if (list.length) {
          setSeasonOptions(list.map((season) => season.name))
          if (!list.some((season) => season.name === seasonFilter)) {
            setSeasonFilter(list[0].name)
          }
        }
      } catch (error) {
        console.warn('Unable to load seasons for stats management', error)
      }
    }
    loadSeasons()
  }, [])

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        const response = await StatsService.getPlayerStats({ season: seasonFilter })
        setStats(response)
      } catch (error) {
        console.error(error)
        toast.error('Không thể tải thống kê cầu thủ')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [seasonFilter])

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
      if (!matchesCategory) {
        return false
      }
      if (!searchTerm) {
        return true
      }
      const search = searchTerm.toLowerCase()
      return (
        row.player?.toLowerCase().includes(search) ||
        row.team?.toLowerCase().includes(search) ||
        row.nationality?.toLowerCase().includes(search)
      )
    })
  }, [flattenedStats, categoryFilter, searchTerm])

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

  const refreshStats = async () => {
    const response = await StatsService.getPlayerStats({ season: seasonFilter })
    setStats(response)
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
      await refreshStats()
      closeForm()
    } catch (error) {
      console.error(error)
      toast.error('Không thể lưu thống kê')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa thống kê cầu thủ này?')) {
      return
    }
    try {
      await StatsService.deletePlayerStat(id)
      toast.success('Đã xóa thống kê')
      setStats((prev) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Player Stats Management</h1>
          <p className="text-gray-500">Quản lý thống kê cầu thủ (goals, assists, clean sheets, minutes).</p>
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
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Tất cả nhóm</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
            onClick={openCreateForm}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm thống kê
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên cầu thủ, đội bóng, quốc tịch..."
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
                  Cầu thủ
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Đội</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Giá trị
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Trận
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Thao tác
                </th>
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
                    <td className="px-4 py-3 text-sm text-gray-700">{row.category}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">
                      {row.category === 'minutes' ? `${row.value}'` : row.value}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{row.matches}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="rounded-full border border-gray-200 p-2 text-gray-500 hover:border-blue-500 hover:text-blue-600"
                          onClick={() => openEditForm(row)}
                          title="Chỉnh sửa"
                        >
                          <Plus className="h-4 w-4 rotate-45" />
                        </button>
                        <button
                          className="rounded-full border border-gray-200 p-2 text-gray-500 hover:border-red-500 hover:text-red-600"
                          onClick={() => handleDelete(row.id)}
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
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
                    {seasonOptions.map((season) => (
                      <option key={season} value={season}>
                        {season}
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
