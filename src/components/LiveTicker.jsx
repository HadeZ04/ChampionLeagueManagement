import React, { useState, useEffect } from 'react'
import { Clock, Zap, Target, Users, AlertCircle } from 'lucide-react'

const LiveTicker = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [liveEvents, setLiveEvents] = useState([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate live events
    const eventTimer = setInterval(() => {
      const events = [
        { time: '67\'', type: 'goal', team: 'Liverpool', player: 'Salah', match: 'LIV vs LIL' },
        { time: '45\'', type: 'yellow', team: 'Barcelona', player: 'Pedri', match: 'BAR vs ATA' },
        { time: '23\'', type: 'substitution', team: 'Bayern', player: 'Müller → Kane', match: 'BAY vs SLO' },
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

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
      {/* Header */}
      <div className="bg-uefa-blue text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-uefa-red rounded-full animate-pulse"></div>
            <span className="font-bold">LIVE TICKER</span>
          </div>
          <div className="text-sm font-mono">
            {currentTime.toLocaleTimeString('en-GB')}
          </div>
        </div>
      </div>

      {/* Live Events */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {liveEvents.length > 0 ? (
          <div className="space-y-3">
            {liveEvents.map((event, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-uefa-light-gray rounded">
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-uefa-dark">
                    {event.time} - {event.match}
                  </div>
                  <div className="text-xs text-uefa-gray">
                    {event.player} ({event.team})
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-uefa-gray">
            <Clock size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No live events at the moment</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 text-center">
        <button className="text-uefa-blue hover:text-uefa-dark text-sm font-medium transition-colors">
          View All Live Matches →
        </button>
      </div>
    </div>
  )
}

export default LiveTicker
