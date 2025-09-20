import React from 'react'
import { Target, Trophy, TrendingUp } from 'lucide-react'

const TopScorers = () => {
  const topScorers = [
    {
      rank: 1,
      player: 'Robert Lewandowski',
      team: 'Barcelona',
      teamLogo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png',
      country: '🇵🇱',
      goals: 7,
      matches: 6,
      minutes: 487,
      penalties: 1,
      trend: 'up'
    },
    {
      rank: 2,
      player: 'Viktor Gyökeres',
      team: 'Sporting CP',
      teamLogo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52747.png',
      country: '🇸🇪',
      goals: 5,
      matches: 6,
      minutes: 540,
      penalties: 2,
      trend: 'same'
    },
    {
      rank: 3,
      player: 'Raphinha',
      team: 'Barcelona',
      teamLogo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png',
      country: '🇧🇷',
      goals: 4,
      matches: 6,
      minutes: 456,
      penalties: 0,
      trend: 'up'
    },
    {
      rank: 4,
      player: 'Harry Kane',
      team: 'Bayern Munich',
      teamLogo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50037.png',
      country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      goals: 4,
      matches: 6,
      minutes: 523,
      penalties: 1,
      trend: 'down'
    },
    {
      rank: 5,
      player: 'Serhou Guirassy',
      team: 'Borussia Dortmund',
      teamLogo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52758.png',
      country: '🇬🇳',
      goals: 4,
      matches: 5,
      minutes: 398,
      penalties: 0,
      trend: 'up'
    }
  ]

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-uefa-green" />
      case 'down':
        return <TrendingUp size={14} className="text-uefa-red rotate-180" />
      default:
        return <div className="w-3.5 h-3.5 bg-uefa-gray rounded-full"></div>
    }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  return (
    <div className="uefa-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Target className="text-uefa-blue" size={24} />
        <h2 className="text-2xl font-bold text-uefa-dark">Top Scorers</h2>
        <div className="flex-1"></div>
        <button className="text-uefa-blue hover:text-uefa-dark text-sm font-medium transition-colors">
          View All →
        </button>
      </div>

      <div className="space-y-4">
        {topScorers.map((scorer) => (
          <div key={scorer.rank} className="flex items-center justify-between p-4 bg-uefa-light-gray rounded-lg hover:bg-uefa-medium-gray transition-colors group">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-uefa-dark w-8 text-center">
                  {getRankBadge(scorer.rank)}
                </span>
                {getTrendIcon(scorer.trend)}
              </div>
              
              <img 
                src={scorer.teamLogo} 
                alt={scorer.team}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.src = `data:image/svg+xml;base64,${btoa(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#003399"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${scorer.team.substring(0, 3).toUpperCase()}</text></svg>`)}`
                }}
              />
              
              <div>
                <div className="font-bold text-uefa-dark group-hover:text-uefa-blue transition-colors">
                  {scorer.player}
                </div>
                <div className="text-uefa-gray text-sm flex items-center space-x-2">
                  <span>{scorer.country}</span>
                  <span>•</span>
                  <span>{scorer.team}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-uefa-blue">{scorer.goals}</div>
              <div className="text-uefa-gray text-sm">
                {scorer.matches} matches • {Math.round(scorer.minutes / scorer.matches)}' avg
              </div>
              {scorer.penalties > 0 && (
                <div className="text-uefa-gray text-xs">
                  {scorer.penalties} penalties
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-uefa-medium-gray">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-xl font-bold text-uefa-blue">312</div>
            <div className="text-uefa-gray">Total Goals</div>
          </div>
          <div>
            <div className="text-xl font-bold text-uefa-blue">2.89</div>
            <div className="text-uefa-gray">Goals/Match</div>
          </div>
          <div>
            <div className="text-xl font-bold text-uefa-blue">67%</div>
            <div className="text-uefa-gray">From Play</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopScorers
