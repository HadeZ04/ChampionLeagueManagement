import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * LoadingState Component
 * Consistent loading indicator across the app
 * Shows spinner with message, prevents infinite loading with timeout indication
 */
const LoadingState = ({ 
  message = "Đang tải dữ liệu...", 
  size = "default",
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: "h-8 w-8",
    default: "h-12 w-12",
    large: "h-16 w-16"
  }

  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center"
    : "min-h-[400px] flex items-center justify-center"

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 
          className={`${sizeClasses[size]} text-[#00C65A] animate-spin`}
          strokeWidth={2.5}
        />
        <p className="text-[#334155] text-base font-medium">
          {message}
        </p>
        <p className="text-[#64748B] text-sm">
          Nếu quá lâu, vui lòng tải lại trang
        </p>
      </div>
    </div>
  )
}

export default LoadingState
