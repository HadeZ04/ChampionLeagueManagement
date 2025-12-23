import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

/**
 * ErrorState Component
 * Consistent error display with retry capability
 * High contrast colors for accessibility (WCAG AA+)
 */
const ErrorState = ({ 
  title = "Không thể tải dữ liệu",
  message = "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.",
  onRetry,
  retrying = false
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border-2 border-[#FCA5A5] p-8 text-center shadow-lg">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#FEE2E2] rounded-full p-4">
            <AlertCircle size={48} className="text-[#DC2626]" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-[#0F172A] mb-3">
          {title}
        </h3>

        {/* Message */}
        <p className="text-[#334155] text-base mb-6 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="space-y-4">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={retrying}
              className="w-full inline-flex items-center justify-center gap-2 
                bg-[#00C65A] hover:bg-[#00A84E] 
                text-white font-semibold 
                px-6 py-3 rounded-lg 
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm"
            >
              <RefreshCw 
                size={18} 
                className={retrying ? 'animate-spin' : ''} 
              />
              <span>{retrying ? 'Đang thử lại...' : 'Thử lại'}</span>
            </button>
          )}

          <p className="text-[#64748B] text-sm">
            Server có thể đang gặp sự cố. Nếu vẫn lỗi, vui lòng liên hệ quản trị viên.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ErrorState
