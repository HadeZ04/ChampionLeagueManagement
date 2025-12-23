import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineDetector = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-slideDown">
      <div className={`${
        isOnline 
          ? 'bg-green-500' 
          : 'bg-orange-500'
      } text-white px-4 py-3 shadow-lg`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <>
                <Wifi size={20} className="animate-pulse" />
                <span className="font-semibold">Đã kết nối lại Internet</span>
              </>
            ) : (
              <>
                <WifiOff size={20} className="animate-pulse" />
                <span className="font-semibold">Không có kết nối Internet</span>
              </>
            )}
          </div>
          {isOnline && (
            <button
              onClick={() => setShowBanner(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Đóng"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineDetector;
