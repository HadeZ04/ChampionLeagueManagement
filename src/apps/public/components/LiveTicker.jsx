import React, { useState, useEffect } from 'react'
import { Clock, Zap, Target, Users, AlertCircle, X, Maximize2 } from 'lucide-react'

const LiveTicker = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [liveEvents, setLiveEvents] = useState([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate live events
    const eventTimer = setInterval(() => {
      const events = [
        { time: '67\'', type: 'goal', team: 'Liverpool', player: 'Salah', match: 'LIV vs LIL', id: Date.now() },
        { time: '45\'', type: 'yellow', team: 'Barcelona', player: 'Pedri', match: 'BAR vs ATA', id: Date.now() + 1 },
        { time: '23\'', type: 'substitution', team: 'Bayern', player: 'Müller → Kane', match: 'BAY vs SLO', id: Date.now() + 2 },
      ]
      
      if (Math.random() > 0.7) {
        const randomEvent = events[Math.floor(Math.random() * events.length)]
        setLiveEvents(prev => [randomEvent, ...prev.slice(0, 4)])
      }
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(eventTimer)
    }
  }, [])

  const getEventIcon = (type) => {
    switch (type) {
      case 'goal':
        return <Target size={16} className="text-uefa-green" />
      case 'yellow':
        return <AlertCircle size={16} className="text-uefa-yellow" />
      case 'red':
        return <AlertCircle size={16} className="text-uefa-red" />
      case 'substitution':
        return <Users size={16} className="text-uefa-blue" />
      default:
        return <Zap size={16} className="text-uefa-gray" />
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 z-40 transition-all duration-300 ${
      isMinimized ? 'w-64 h-16' : 'w-80 h-auto max-h-96'
    }`}>
      {/* Header */}
      <div className="bg-uefa-blue text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-uefa-red rounded-full animate-pulse"></div>
            <span className="font-bold">LIVE TICKER</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm font-mono">
              {currentTime.toLocaleTimeString('en-GB')}
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 max-h-64 overflow-y-auto">
          {liveEvents.length > 0 ? (
            <div className="space-y-3">
              {liveEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-uefa-light-gray rounded-lg hover:bg-uefa-medium-gray transition-colors">
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-uefa-dark">
                      {event.time} - {event.match}
                    </div>
                    <div className="text-xs text-uefa-gray">
                      {event.player} ({event.team})
                    </div>
                  </div>
                  <div className="text-xs text-uefa-gray">
                    {new Date().toLocaleTimeString('en-GB', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-uefa-gray">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No live events at the moment</p>
              <p className="text-xs mt-1">Check back during match times</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {!isMinimized && (
        <div className="p-3 border-t border-gray-200 text-center">
          <button className="text-uefa-blue hover:text-uefa-dark text-sm font-medium transition-colors">
            View All Live Matches →
          </button>
        </div>
      )}
    </div>
  )
}

export default LiveTicker
