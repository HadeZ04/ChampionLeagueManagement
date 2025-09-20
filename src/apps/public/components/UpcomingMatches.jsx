import React from 'react'
import { Calendar, Clock, MapPin, Users, Tv } from 'lucide-react'

const UpcomingMatches = () => {
  const upcomingMatches = [
    {
      id: 1,
      date: '2025-01-22',
      time: '21:00',
      homeTeam: {
        name: 'Liverpool',
        logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png',
        shortName: 'LIV'
      },
      awayTeam: {
        name: 'Lille',
        logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52747.png',
        shortName: 'LIL'
      },
      venue: 'Anfield',
      city: 'Liverpool',
      tvChannels: ['BT Sport', 'CBS Sports'],
      importance: 'high'
    },
    {
      id: 2,
      date: '2025-01-22',
      time: '21:00',
      homeTeam: {
        name: 'Barcelona',
        logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png',
        shortName: 'BAR'
      },
      awayTeam: {
        name: 'Atalanta',
        logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52816.png',
        shortName: 'ATA'
      },
      venue: 'Spotify Camp Nou',
      city: 'Barcelona',
      tvChannels: ['TNT Sports', 'Paramount+'],
      importance: 'high'
    },
    {
      id: 3,
      date: '2025-01-22',
      time: '18:45',
      homeTeam: {
        name: 'Bayern Munich',
        logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50037.png',
        shortName: 'BAY'
      },
      awayTeam: {
        name: 'Slovan Bratislava',
        logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/2603.png',
        shortName: 'SLO'
      },
      venue: 'Allianz Arena',
      city: 'Munich',
      tvChannels: ['Sky Sports'],
      importance: 'medium'
    }
  ]

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high':
        return 'border-l-uefa-red bg-uefa-red/5'
      case 'medium':
        return 'border-l-uefa-yellow bg-uefa-yellow/5'
      case 'low':
        return 'border-l-uefa-gray bg-uefa-gray/5'
      default:
        return 'border-l-uefa-gray bg-uefa-gray/5'
    }
  }

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    }
  }

  return (
    <div className="uefa-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="text-uefa-blue" size={24} />
        <h2 className="text-2xl font-bold text-uefa-dark">Upcoming Matches</h2>
        <div className="flex-1"></div>
        <button className="text-uefa-blue hover:text-uefa-dark text-sm font-medium transition-colors">
          View All Fixtures →
        </button>
      </div>

      <div className="space-y-4">
        {upcomingMatches.map((match) => (
          <div key={match.id} className={`border-l-4 ${getImportanceColor(match.importance)} rounded-lg p-4 hover:shadow-md transition-all duration-300 group`}>
            {/* Match Time and Date */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-uefa-gray text-sm">
                  <Calendar size={14} />
                  <span className="font-medium">{formatDate(match.date)}</span>
                  <Clock size={14} />
                  <span className="font-medium">{formatTime(match.time)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Tv size={14} className="text-uefa-gray" />
                <span className="text-uefa-gray text-sm">
                  {match.tvChannels.slice(0, 2).join(', ')}
                  {match.tvChannels.length > 2 && ` +${match.tvChannels.length - 2}`}
                </span>
              </div>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between mb-4">
              {/* Home Team */}
              <div className="flex items-center space-x-3 flex-1">
                <img 
                  src={match.homeTeam.logo} 
                  alt={match.homeTeam.name}
                  className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = `data:image/svg+xml;base64,${btoa(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#003399"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${match.homeTeam.shortName}</text></svg>`)}`
                  }}
                />
                <div>
                  <div className="font-semibold text-uefa-dark group-hover:text-uefa-blue transition-colors">
                    {match.homeTeam.name}
                  </div>
                  <div className="text-uefa-gray text-sm">{match.homeTeam.shortName}</div>
                </div>
              </div>

              {/* VS */}
              <div className="px-4">
                <div className="text-uefa-blue font-bold">VS</div>
              </div>

              {/* Away Team */}
              <div className="flex items-center space-x-3 flex-1 justify-end">
                <div className="text-right">
                  <div className="font-semibold text-uefa-dark group-hover:text-uefa-blue transition-colors">
                    {match.awayTeam.name}
                  </div>
                  <div className="text-uefa-gray text-sm">{match.awayTeam.shortName}</div>
                </div>
                <img 
                  src={match.awayTeam.logo} 
                  alt={match.awayTeam.name}
                  className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = `data:image/svg+xml;base64,${btoa(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#003399"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${match.awayTeam.shortName}</text></svg>`)}`
                  }}
                />
              </div>
            </div>

            {/* Venue and Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-uefa-medium-gray">
              <div className="flex items-center space-x-2 text-uefa-gray text-sm">
                <MapPin size={14} />
                <span>{match.venue}, {match.city}</span>
              </div>
              <div className="flex space-x-3">
                <button className="text-uefa-blue hover:text-uefa-dark text-sm font-medium transition-colors">
                  Preview
                </button>
                <button className="text-uefa-blue hover:text-uefa-dark text-sm font-medium transition-colors">
                  Tickets
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="uefa-btn-secondary">
          View Full Fixture List
        </button>
      </div>
    </div>
  )
}

export default UpcomingMatches
