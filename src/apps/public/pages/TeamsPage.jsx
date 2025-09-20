import React, { useState } from 'react'
import { Search, Users, Trophy, Target, MapPin, Calendar } from 'lucide-react'


const TeamsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('all')

  const countries = [
    { id: 'all', name: 'All Countries' },
    { id: 'england', name: 'England' },
    { id: 'spain', name: 'Spain' },
    { id: 'italy', name: 'Italy' },
    { id: 'germany', name: 'Germany' },
    { id: 'france', name: 'France' },
    { id: 'netherlands', name: 'Netherlands' },
    { id: 'portugal', name: 'Portugal' }
  ]

  const teams = [
    {
      id: 1,
      name: 'Liverpool',
      logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png',
      country: 'england',
      countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      city: 'Liverpool',
      stadium: 'Anfield',
      capacity: 53394,
      founded: 1892,
      coach: 'Arne Slot',
      position: 1,
      points: 18,
      played: 6,
      won: 6,
      drawn: 0,
      lost: 0,
      goalsFor: 13,
      goalsAgainst: 1,
      titles: 6,
      marketValue: '€1.2B',
      averageAge: 26.8,
      topScorer: 'Mohamed Salah (5 goals)',
      keyPlayers: ['Mohamed Salah', 'Virgil van Dijk', 'Sadio Mané'],
      status: 'qualified'
    },
    {
      id: 2,
      name: 'Barcelona',
      logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png',
      country: 'spain',
      countryFlag: '🇪🇸',
      city: 'Barcelona',
      stadium: 'Spotify Camp Nou',
      capacity: 99354,
      founded: 1899,
      coach: 'Hansi Flick',
      position: 2,
      points: 15,
      played: 6,
      won: 5,
      drawn: 0,
      lost: 1,
      goalsFor: 21,
      goalsAgainst: 7,
      titles: 5,
      marketValue: '€1.1B',
      averageAge: 25.3,
      topScorer: 'Robert Lewandowski (7 goals)',
      keyPlayers: ['Robert Lewandowski', 'Raphinha', 'Pedri'],
      status: 'qualified'
    },
    {
      id: 3,
      name: 'Arsenal',
      logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52280.png',
      country: 'england',
      countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      city: 'London',
      stadium: 'Emirates Stadium',
      capacity: 60704,
      founded: 1886,
      coach: 'Mikel Arteta',
      position: 3,
      points: 13,
      played: 6,
      won: 4,
      drawn: 1,
      lost: 1,
      goalsFor: 11,
      goalsAgainst: 2,
      titles: 0,
      marketValue: '€950M',
      averageAge: 24.7,
      topScorer: 'Bukayo Saka (3 goals)',
      keyPlayers: ['Bukayo Saka', 'Martin Ødegaard', 'William Saliba'],
      status: 'qualified'
    }
  ]

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.coach.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCountry = selectedCountry === 'all' || team.country === selectedCountry
    return matchesSearch && matchesCountry
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'qualified':
        return 'border-l-uefa-green bg-uefa-green/5'
      case 'playoff':
        return 'border-l-uefa-yellow bg-uefa-yellow/5'
      case 'eliminated':
        return 'border-l-uefa-red bg-uefa-red/5'
      default:
        return 'border-l-uefa-gray bg-uefa-gray/5'
    }
  }

  return (
    <div className="uefa-container py-8">
      {/* Breadcrumb */}
      <nav className="uefa-breadcrumb">
        <a href="#" className="uefa-breadcrumb-item">Home</a>
        <span className="uefa-breadcrumb-separator">/</span>
        <a href="#" className="uefa-breadcrumb-item">Champions League</a>
        <span className="uefa-breadcrumb-separator">/</span>
        <span className="text-uefa-dark">Teams</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="uefa-section-title">UEFA Champions League Teams</h1>
        <p className="uefa-section-subtitle">
          All 36 teams competing in the 2024/25 season
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-uefa-gray" />
          <input
            type="text"
            placeholder="Search teams, cities, or coaches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="uefa-input pl-10"
          />
        </div>

        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="uefa-select"
        >
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className={`uefa-card p-6 border-l-4 ${getStatusColor(team.status)} group hover:shadow-2xl transition-all duration-500`}>
            {/* Team Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={team.logo} 
                  alt={team.name}
                  className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = `data:image/svg+xml;base64,${btoa(`<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#003399"/><text x="24" y="28" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${team.name.substring(0, 3).toUpperCase()}</text></svg>`)}`
                  }}
                />
                <div>
                  <h3 className="font-bold text-uefa-dark text-lg group-hover:text-uefa-blue transition-colors">
                    {team.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-uefa-gray text-sm">
                    <span>{team.countryFlag}</span>
                    <span>{team.city}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-uefa-blue">#{team.position}</div>
                <div className="text-uefa-gray text-sm">Position</div>
              </div>
            </div>

            {/* Enhanced Team Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-uefa-light-gray rounded-uefa group-hover:bg-uefa-blue/10 transition-colors">
                <div className="text-xl font-bold text-uefa-dark">{team.points}</div>
                <div className="text-uefa-gray text-xs">Points</div>
              </div>
              <div className="text-center p-3 bg-uefa-light-gray rounded-uefa group-hover:bg-uefa-blue/10 transition-colors">
                <div className="text-xl font-bold text-uefa-dark">{team.goalsFor}</div>
                <div className="text-uefa-gray text-xs">Goals</div>
              </div>
              <div className="text-center p-3 bg-uefa-light-gray rounded-uefa group-hover:bg-uefa-blue/10 transition-colors">
                <div className="text-xl font-bold text-uefa-dark">{((team.won / team.played) * 100).toFixed(0)}%</div>
                <div className="text-uefa-gray text-xs">Win Rate</div>
              </div>
            </div>

            {/* Enhanced Match Record */}
            <div className="grid grid-cols-4 gap-2 mb-6 p-4 bg-uefa-light-gray rounded-uefa">
              <div className="text-center">
                <div className="text-lg font-bold text-uefa-green">{team.won}</div>
                <div className="text-uefa-gray text-xs">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-uefa-yellow">{team.drawn}</div>
                <div className="text-uefa-gray text-xs">Draws</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-uefa-red">{team.lost}</div>
                <div className="text-uefa-gray text-xs">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-uefa-dark">
                  {team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}{team.goalsFor - team.goalsAgainst}
                </div>
                <div className="text-uefa-gray text-xs">GD</div>
              </div>
            </div>

            {/* Enhanced Team Info */}
            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center justify-between">
                <span className="text-uefa-gray flex items-center">
                  <Users size={14} className="mr-2" />
                  Coach:
                </span>
                <span className="text-uefa-dark font-semibold">{team.coach}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-uefa-gray flex items-center">
                  <MapPin size={14} className="mr-2" />
                  Stadium:
                </span>
                <span className="text-uefa-dark font-semibold">{team.stadium}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-uefa-gray flex items-center">
                  <Target size={14} className="mr-2" />
                  Capacity:
                </span>
                <span className="text-uefa-dark font-semibold">{team.capacity?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-uefa-gray flex items-center">
                  <Calendar size={14} className="mr-2" />
                  Founded:
                </span>
                <span className="text-uefa-dark font-semibold">{team.founded}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-uefa-gray flex items-center">
                  <Trophy size={14} className="mr-2" />
                  UCL Titles:
                </span>
                <span className="text-uefa-dark font-semibold flex items-center">
                  {team.titles}
                  {team.titles > 0 && <Trophy size={14} className="ml-1 text-uefa-gold" />}
                </span>
              </div>
              {team.marketValue && (
                <div className="flex items-center justify-between">
                  <span className="text-uefa-gray">Market Value:</span>
                  <span className="text-uefa-dark font-semibold">{team.marketValue}</span>
                </div>
              )}
              {team.averageAge && (
                <div className="flex items-center justify-between">
                  <span className="text-uefa-gray">Average Age:</span>
                  <span className="text-uefa-dark font-semibold">{team.averageAge} years</span>
                </div>
              )}
              {team.topScorer && (
                <div className="flex items-center justify-between">
                  <span className="text-uefa-gray">Top Scorer:</span>
                  <span className="text-uefa-dark font-semibold">{team.topScorer}</span>
                </div>
              )}
            </div>

            {/* Key Players */}
            {team.keyPlayers && (
              <div className="mb-6">
                <h4 className="font-semibold text-uefa-dark mb-3 text-sm">Key Players</h4>
                <div className="flex flex-wrap gap-2">
                  {team.keyPlayers.map((player, index) => (
                    <span key={index} className="bg-uefa-blue/10 text-uefa-blue px-2 py-1 rounded text-xs font-medium">
                      {player}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="uefa-btn-primary text-sm py-2 group-hover:shadow-lg transition-all">
                Team Profile
              </button>
              <button className="uefa-btn-secondary text-sm py-2 group-hover:shadow-lg transition-all">
                Squad & Stats
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-uefa-gray mb-4" />
          <h3 className="text-xl font-semibold text-uefa-dark mb-2">No teams found</h3>
          <p className="text-uefa-gray">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-12 pt-8 border-t border-uefa-medium-gray">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">{teams.length}</div>
            <div className="text-uefa-gray">Total Teams</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">{new Set(teams.map(t => t.country)).size}</div>
            <div className="text-uefa-gray">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">{teams.reduce((sum, team) => sum + team.titles, 0)}</div>
            <div className="text-uefa-gray">Total UCL Titles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">{Math.round(teams.reduce((sum, team) => sum + team.capacity, 0) / teams.length).toLocaleString()}</div>
            <div className="text-uefa-gray">Avg. Capacity</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamsPage
