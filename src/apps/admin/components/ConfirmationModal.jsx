import React from 'react'
import { AlertTriangle } from 'lucide-react'

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmButtonClass = 'bg-rose-600 hover:bg-rose-700',
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
      <div className="w-full max-w-md admin-surface p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="h-6 w-6 text-rose-300" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-blue-200/40">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="admin-btn-secondary"
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
