import React from 'react'
import { Inbox, RefreshCw } from 'lucide-react'

/**
 * EmptyState Component
 * Shows when no data is available (but not an error)
 * Clear messaging with optional action button
 */
const EmptyState = ({ 
  icon: Icon = Inbox,
  title = "Chưa có dữ liệu",
  message = "Hiện tại chưa có dữ liệu để hiển thị.",
  actionLabel,
  onAction
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#F1F5F9] rounded-full p-6">
            <Icon size={56} className="text-[#64748B]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#0F172A] mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-[#64748B] text-base mb-6 leading-relaxed">
          {message}
        </p>

        {/* Optional action button */}
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 
              bg-[#F1F5F9] hover:bg-[#E2E8F0] 
              text-[#0F172A] font-semibold 
              px-6 py-3 rounded-lg 
              border border-[#CBD5E1]
              transition-colors duration-200
              shadow-sm"
          >
            <RefreshCw size={18} />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default EmptyState
