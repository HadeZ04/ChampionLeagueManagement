import React from 'react'
import { AlertTriangle } from 'lucide-react'

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  isProcessing = false,
  onConfirm,
  onCancel,
  onClose
}) => {
  if (!isOpen) {
    return null
  }

  const handleCancel = () => {
    if (isProcessing) {
      return
    }
    if (onCancel) {
      onCancel()
    }
    if (onClose) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (isProcessing) {
      return
    }
    if (onConfirm) {
      onConfirm()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-60"
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${confirmButtonClass}`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
