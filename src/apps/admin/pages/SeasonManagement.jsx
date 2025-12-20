import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Edit2, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import SeasonFormModal from '../components/SeasonFormModal'
import ConfirmationModal from '../components/ConfirmationModal'
import SeasonService from '../../../layers/application/services/SeasonService'

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-700',
  inviting: 'bg-blue-100 text-blue-700',
  registering: 'bg-indigo-100 text-indigo-700',
  scheduled: 'bg-sky-100 text-sky-700',
  in_progress: 'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  locked: 'bg-red-100 text-red-700',
  archived: 'bg-slate-200 text-slate-600'
}

const STATUS_LABELS = {
  draft: 'Nháp',
  inviting: 'Mời tham dự',
  registering: 'Đăng ký',
  scheduled: 'Lên lịch',
  in_progress: 'Đang diễn ra',
  completed: 'Đã kết thúc',
  locked: 'Đã khóa',
  archived: 'Lưu trữ'
}

const LOCKED_STATUSES = new Set(['locked', 'completed', 'archived'])

const formatDateRange = (start, end) => {
  if (!start && !end) {
    return '--'
  }
  if (start && !end) {
    return `${start} →`
  }
  if (!start && end) {
    return `→ ${end}`
  }
  return `${start} → ${end}`
}

const formatCurrency = (value) => {
  const amount = Number(value ?? 0)
  if (!Number.isFinite(amount) || amount === 0) {
    return '—'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount)
}

const SeasonManagement = () => {
  const [seasons, setSeasons] = useState([])
  const [metadata, setMetadata] = useState({ statuses: [], tournaments: [], rulesets: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingSeason, setEditingSeason] = useState(null)
  const [seasonToDelete, setSeasonToDelete] = useState(null)

  const loadMetadata = useCallback(async () => {
    try {
      const data = await SeasonService.getMetadata()
      setMetadata(data)
    } catch (err) {
      console.error(err)
      setError('Không thể tải dữ liệu cấu hình cho mùa giải.')
    }
  }, [])

  const loadSeasons = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await SeasonService.listSeasons()
      setSeasons(data)
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách mùa giải.')
      setSeasons([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMetadata()
    loadSeasons()
  }, [loadMetadata, loadSeasons])

  const handleOpenModal = (season = null) => {
    if (season && LOCKED_STATUSES.has(String(season.status).toLowerCase())) {
      setError('Mùa giải đang bị khóa và không thể chỉnh sửa.')
      setSuccess(null)
      return
    }
    setEditingSeason(season)
    setIsModalOpen(true)
    setError(null)
    setSuccess(null)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSeason(null)
  }

  const handleSave = async (payload) => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (editingSeason) {
        await SeasonService.updateSeason(editingSeason.id, payload)
        setSuccess('Đã cập nhật mùa giải thành công.')
      } else {
        await SeasonService.createSeason(payload)
        setSuccess('Đã tạo mùa giải mới thành công.')
      }
      closeModal()
      await loadSeasons()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Không thể lưu mùa giải. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!seasonToDelete) {
      return
    }
    setError(null)
    setSuccess(null)
    try {
      await SeasonService.deleteSeason(seasonToDelete.id)
      setSuccess(`Đã xóa mùa giải "${seasonToDelete.name}".`)
      setSeasonToDelete(null)
      await loadSeasons()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Không thể xóa mùa giải. Vui lòng thử lại.')
    }
  }

  const statusOptions = useMemo(() => metadata.statuses ?? [], [metadata.statuses])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Mùa giải</h1>
          <p className="text-gray-600">Tạo mới, chỉnh sửa và lưu trữ các mùa giải nội bộ.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadSeasons()}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-60"
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            <Plus size={18} />
            Tạo Mùa giải mới
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Mùa giải</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Giải đấu</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Bộ điều lệ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Thời gian</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Phí tham dự</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                      <Loader2 className="animate-spin" size={32} />
                      <span>Đang tải dữ liệu mùa giải...</span>
                    </div>
                  </td>
                </tr>
              ) : seasons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    <p className="text-lg font-medium">Chưa có mùa giải nào</p>
                    <p className="text-sm text-gray-400">Nhấn &quot;Tạo Mùa giải mới&quot; để bắt đầu quản lý giải đấu.</p>
                  </td>
                </tr>
              ) : (
                seasons.map((season) => {
                  const statusStyle = STATUS_STYLES[season.status] ?? 'bg-gray-100 text-gray-700'
                  const statusLabel = STATUS_LABELS[season.status] ?? season.status
                  return (
                    <tr key={season.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{season.name}</span>
                          <span className="text-xs text-gray-500">Mã: {season.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {season.tournamentName || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {season.rulesetName || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDateRange(season.startDate, season.endDate)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">
                        {formatCurrency(season.participationFee)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleOpenModal(season)}
                            className="rounded-full p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                            title="Chỉnh sửa mùa giải"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setSeasonToDelete(season)}
                            className="rounded-full p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            title="Xóa mùa giải"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SeasonFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        season={editingSeason}
        metadata={metadata}
        isSubmitting={isSaving}
      />

      {seasonToDelete && (
        <ConfirmationModal
          title="Xóa mùa giải"
          message={`Bạn có chắc chắn muốn xóa mùa giải "${seasonToDelete.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setSeasonToDelete(null)}
          isProcessing={false}
        />
      )}
    </div>
  )
}

export default SeasonManagement
