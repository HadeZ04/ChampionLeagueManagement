import React, { useState } from 'react'
import { Trophy, Target, Users, TrendingUp, Award, Zap, Shield, Clock } from 'lucide-react'

const Stats = () => {
  const [selectedCategory, setSelectedCategory] = useState('goals')

  const categories = [
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'assists', name: 'Assists', icon: Zap },
    { id: 'clean-sheets', name: 'Clean Sheets', icon: Shield },
    { id: 'minutes', name: 'Minutes Played', icon: Clock }
  ]

  const playerStats = {
    goals: [
      {
        rank: 1,
        player: 'Robert Lewandowski',
        team: 'Barcelona',
        teamLogo: '🔵',
        value: 7,
        matches: 6
      },
      {
        rank: 2,
        player: 'Viktor Gyökeres',
        team: 'Sporting CP',
        teamLogo: '🟢',
        value: 5,
        matches: 6
      },
      {
        rank: 3,
        player: 'Raphinha',
        team: 'Barcelona',
        teamLogo: '🔵',
        value: 4,
        matches: 6
      },
      {
        rank: 4,
        player: 'Harry Kane',
        team: 'Bayern Munich',
        teamLogo: '🔴',
        value: 4,
        matches: 6
      },
      {
        rank: 5,
        player: 'Serhou Guirassy',
        team: 'Borussia Dortmund',
        teamLogo: '🟡',
        value: 4,
        matches: 6
      }
    ],
    assists: [
      {
        rank: 1,
        player: 'Raphinha',
        team: 'Barcelona',
        teamLogo: '🔵',
        value: 4,
        matches: 6
      },
      {
        rank: 2,
        player: 'Mohamed Salah',
        team: 'Liverpool',
        teamLogo: '🔴',
        value: 3,
        matches: 6
      },
      {
        rank: 3,
        player: 'Jamal Musiala',
        team: 'Bayern Munich',
        teamLogo: '🔴',
        value: 3,
        matches: 6
      },
      {
        rank: 4,
        player: 'Bukayo Saka',
        team: 'Arsenal',
        teamLogo: '🔴',
        value: 2,
        matches: 6
      },
      {
        rank: 5,
        player: 'Luka Modrić',
        team: 'Real Madrid',
        teamLogo: '⚪',
        value: 2,
        matches: 6
      }
    ],
    'clean-sheets': [
      {
        rank: 1,
        player: 'Caoimhín Kelleher',
        team: 'Liverpool',
        teamLogo: '🔴',
        value: 5,
        matches: 6
      },
      {
        rank: 2,
        player: 'Yann Sommer',
        team: 'Inter',
        teamLogo: '⚫',
        value: 4,
        matches: 6
      },
      {
        rank: 3,
        player: 'David Raya',
        team: 'Arsenal',
        teamLogo: '🔴',
        value: 4,
        matches: 6
      },
      {
        rank: 4,
        player: 'Marco Bizot',
        team: 'Brest',
        teamLogo: '🔵',
        value: 3,
        matches: 6
      },
      {
        rank: 5,
        player: 'Gianluigi Donnarumma',
        team: 'Paris Saint-Germain',
        teamLogo: '🔵',
        value: 3,
        matches: 6
      }
    ],
    minutes: [
      {
        rank: 1,
        player: 'Caoimhín Kelleher',
        team: 'Liverpool',
        teamLogo: '🔴',
        value: 540,
        matches: 6
      },
      {
        rank: 2,
        player: 'Yann Sommer',
        team: 'Inter',
        teamLogo: '⚫',
        value: 540,
        matches: 6
      },
      {
        rank: 3,
        player: 'David Raya',
        team: 'Arsenal',
        teamLogo: '🔴',
        value: 540,
        matches: 6
      },
      {
        rank: 4,
        player: 'Virgil van Dijk',
        team: 'Liverpool',
        teamLogo: '🔴',
        value: 540,
        matches: 6
      },
      {
        rank: 5,
        player: 'William Saliba',
        team: 'Arsenal',
        teamLogo: '🔴',
        value: 540,
        matches: 6
      }
    ]
  }

  const teamStats = [
    {
      category: 'Goals Scored',
      icon: Target,
      teams: [
        { name: 'Barcelona', logo: '🔵', value: 21 },
        { name: 'Bayern Munich', logo: '🔴', value: 17 },
        { name: 'Borussia Dortmund', logo: '🟡', value: 16 },
        { name: 'Atletico Madrid', logo: '🔴', value: 14 },
        { name: 'Feyenoord', logo: '🔴', value: 14 }
      ]
    },
    {
      category: 'Goals Conceded (Fewest)',
      icon: Shield,
      teams: [
        { name: 'Liverpool', logo: '🔴', value: 1 },
        { name: 'Inter', logo: '⚫', value: 1 },
        { name: 'Arsenal', logo: '🔴', value: 2 },
        { name: 'Atalanta', logo: '⚫', value: 4 },
        { name: 'Juventus', logo: '⚫', value: 5 }
      ]
    },
    {
      category: 'Clean Sheets',
      icon: Trophy,
      teams: [
        { name: 'Liverpool', logo: '🔴', value: 5 },
        { name: 'Inter', logo: '⚫', value: 4 },
        { name: 'Arsenal', logo: '🔴', value: 4 },
        { name: 'Brest', logo: '🔵', value: 3 },
        { name: 'Atalanta', logo: '⚫', value: 3 }
      ]
    },
    {
      category: 'Win Percentage',
      icon: TrendingUp,
      teams: [
        { name: 'Liverpool', logo: '🔴', value: '100%' },
        { name: 'Barcelona', logo: '🔵', value: '83%' },
        { name: 'Arsenal', logo: '🔴', value: '67%' },
        { name: 'Inter', logo: '⚫', value: '67%' },
        { name: 'Sporting CP', logo: '🟢', value: '67%' }
      ]
    }
  ]

  const tournamentStats = [
    {
      title: 'Total Goals',
      value: '312',
      icon: Target,
      description: 'Goals scored across all matches'
    },
    {
      title: 'Average Goals per Match',
      value: '2.89',
      icon: TrendingUp,
      description: 'Goals per match in the competition'
    },
    {
      title: 'Clean Sheets',
      value: '67',
      icon: Shield,
      description: 'Matches without conceding'
    },
    {
      title: 'Hat-tricks',
      value: '8',
      icon: Award,
      description: 'Players scoring 3+ goals in a match'
    }
  ]

  return (
    <div className="uefa-container py-8">
      {/* Breadcrumb */}
      <nav className="uefa-breadcrumb">
        <a href="#" className="uefa-breadcrumb-item">Home</a>
        <span className="uefa-breadcrumb-separator">/</span>
        <a href="#" className="uefa-breadcrumb-item">Champions League</a>
        <span className="uefa-breadcrumb-separator">/</span>
        <span className="text-uefa-dark">Statistics</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="uefa-section-title">UEFA Champions League Statistics</h1>
        <p className="uefa-section-subtitle">
          Player and team statistics for the 2024/25 season
        </p>
      </div>

      {/* Tournament Overview */}
      <div className="uefa-stats-grid mb-12">
        {tournamentStats.map((stat, index) => (
          <div key={index} className="uefa-stats-card">
            <div className="uefa-stats-icon">
              <stat.icon size={24} />
            </div>
            <div className="uefa-stats-number">{stat.value}</div>
            <div className="uefa-stats-label">{stat.title}</div>
            <p className="text-uefa-gray text-sm mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Player Statistics */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-uefa-dark mb-6">Player Statistics</h2>
        
        {/* Category Tabs */}
        <div className="uefa-filter-tabs mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`uefa-filter-tab ${selectedCategory === category.id ? 'active' : ''}`}
            >
              <category.icon size={16} className="mr-2" />
              {category.name}
            </button>
          ))}
        </div>

        {/* Player Stats Table */}
        <div className="uefa-table-container">
          <table className="uefa-table">
            <thead className="uefa-table-header">
              <tr>
                <th className="text-center w-12">#</th>
                <th className="text-left">Player</th>
                <th className="text-left">Team</th>
                <th className="text-center">
                  {selectedCategory === 'goals' && 'Goals'}
                  {selectedCategory === 'assists' && 'Assists'}
                  {selectedCategory === 'clean-sheets' && 'Clean Sheets'}
                  {selectedCategory === 'minutes' && 'Minutes'}
                </th>
                <th className="text-center">Matches</th>
                <th className="text-center">Average</th>
              </tr>
            </thead>
            <tbody className="uefa-table-body">
              {playerStats[selectedCategory].map((player) => (
                <tr key={player.rank} className="uefa-table-row">
                  <td className="uefa-table-cell text-center font-bold text-uefa-dark">
                    {player.rank}
                  </td>
                  <td className="uefa-table-cell">
                    <div className="font-semibold text-uefa-dark">{player.player}</div>
                  </td>
                  <td className="uefa-table-cell">
                    <div className="flex items-center space-x-2">
                      <div className="uefa-team-logo bg-gray-100 flex items-center justify-center text-sm w-6 h-6">
                        {player.teamLogo}
                      </div>
                      <span className="text-uefa-dark">{player.team}</span>
                    </div>
                  </td>
                  <td className="uefa-table-cell text-center font-bold text-lg text-uefa-blue">
                    {selectedCategory === 'minutes' ? `${player.value}'` : player.value}
                  </td>
                  <td className="uefa-table-cell text-center text-uefa-dark">
                    {player.matches}
                  </td>
                  <td className="uefa-table-cell text-center text-uefa-gray">
                    {selectedCategory === 'minutes' 
                      ? `${Math.round(player.value / player.matches)}'`
                      : (player.value / player.matches).toFixed(2)
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-uefa-dark mb-6">Team Statistics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {teamStats.map((category, index) => (
            <div key={index} className="uefa-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-uefa-blue rounded-full flex items-center justify-center">
                  <category.icon size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-uefa-dark">{category.category}</h3>
              </div>
              
              <div className="space-y-3">
                {category.teams.map((team, teamIndex) => (
                  <div key={teamIndex} className="flex items-center justify-between p-3 bg-uefa-light-gray rounded-uefa">
                    <div className="flex items-center space-x-3">
                      <span className="text-uefa-gray font-bold w-6">{teamIndex + 1}.</span>
                      <div className="uefa-team-logo bg-gray-100 flex items-center justify-center text-lg">
                        {team.logo}
                      </div>
                      <span className="font-medium text-uefa-dark">{team.name}</span>
                    </div>
                    <span className="font-bold text-uefa-blue text-lg">{team.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-12 pt-8 border-t border-uefa-medium-gray">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">108</div>
            <div className="text-uefa-gray">Total Matches Played</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">2.89</div>
            <div className="text-uefa-gray">Goals per Match</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">62%</div>
            <div className="text-uefa-gray">Clean Sheet Percentage</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats
