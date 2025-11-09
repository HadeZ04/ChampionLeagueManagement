import React, { useEffect, useMemo, useState } from 'react'

const DEFAULT_FORM = {
  name: '',
  code: '',
  tournamentId: '',
  rulesetId: '',
  status: 'draft',
  startDate: '',
  endDate: '',
  participationFee: 0,
  description: '',
  invitationOpenedAt: '',
  registrationDeadline: '',
  maxTeams: 10,
  expectedRounds: 18
}

const NUMERIC_FIELDS = new Set(['tournamentId', 'rulesetId', 'participationFee', 'maxTeams', 'expectedRounds'])

const toDateValue = (value) => (value ? String(value).slice(0, 10) : '')
const toDateTimeValue = (value) => (value ? String(value).slice(0, 16) : '')

const SeasonFormModal = ({
  isOpen,
  onClose,
  onSave,
  season,
  metadata = { statuses: [], tournaments: [], rulesets: [] },
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState(DEFAULT_FORM)

  const statusOptions = useMemo(() => {
    return Array.isArray(metadata.statuses) && metadata.statuses.length > 0
      ? metadata.statuses
      : ['draft', 'in_progress', 'completed']
  }, [metadata.statuses])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (season) {
      setFormData({
        name: season.name ?? '',
        code: season.code ?? '',
        tournamentId: season.tournamentId ?? '',
        rulesetId: season.rulesetId ?? '',
        status: season.status ?? statusOptions[0],
        startDate: toDateValue(season.startDate),
        endDate: toDateValue(season.endDate),
        participationFee: season.participationFee ?? 0,
        description: season.description ?? '',
        invitationOpenedAt: toDateTimeValue(season.invitationOpenedAt),
        registrationDeadline: toDateTimeValue(season.registrationDeadline),
        maxTeams: season.maxTeams ?? 10,
        expectedRounds: season.expectedRounds ?? 18
      })
    } else {
      setFormData({
        ...DEFAULT_FORM,
        status: statusOptions[0] ?? 'draft'
      })
    }
  }, [season, isOpen, statusOptions])

  const handleChange = (event) => {
    const { name, value } = event.target

    if (NUMERIC_FIELDS.has(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      tournamentId: Number(formData.tournamentId),
      rulesetId: Number(formData.rulesetId),
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      description: formData.description?.trim() || null,
      participationFee: Number(formData.participationFee || 0),
      invitationOpenedAt: formData.invitationOpenedAt || null,
      registrationDeadline: formData.registrationDeadline || null,
      maxTeams: Number(formData.maxTeams || 10),
      expectedRounds: Number(formData.expectedRounds || 18)
    }

    onSave(payload)
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {season ? 'Chỉnh sửa Mùa giải' : 'Tạo Mùa giải mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100"
            disabled={isSubmitting}
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Tên Mùa giải</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="UEFA Champions League 2025/26"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Mã Mùa giải</label>
              <input
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="UCL_2025"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Giải đấu</label>
              <select
                name="tournamentId"
                value={formData.tournamentId}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="" disabled>
                  Chọn giải đấu
                </option>
                {metadata.tournaments?.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Bộ Điều lệ</label>
              <select
                name="rulesetId"
                value={formData.rulesetId}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="" disabled>
                  Chọn điều lệ
                </option>
                {metadata.rulesets?.map((ruleset) => (
                  <option key={ruleset.id} value={ruleset.id}>
                    {ruleset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Ngày bắt đầu</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Ngày kết thúc</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 capitalize focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Phí tham dự (VND)</label>
              <input
                type="number"
                min="0"
                step="100000"
                name="participationFee"
                value={formData.participationFee}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Số đội tối đa</label>
              <input
                type="number"
                min="2"
                name="maxTeams"
                value={formData.maxTeams}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Ngày mở thư mời</label>
              <input
                type="datetime-local"
                name="invitationOpenedAt"
                value={formData.invitationOpenedAt}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">Hạn đăng ký</label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Thông tin tổng quan, thể thức thi đấu, yêu cầu đặc biệt..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Mùa giải'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SeasonFormModal