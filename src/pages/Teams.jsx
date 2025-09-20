import React, { useState } from 'react'
import { Search, Users, Trophy, Target, MapPin, Calendar } from 'lucide-react'

const Teams = () => {
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
    { id: 'portugal', name: 'Portugal' },
    { id: 'belgium', name: 'Belgium' },
    { id: 'austria', name: 'Austria' },
    { id: 'croatia', name: 'Croatia' },
    { id: 'czech-republic', name: 'Czech Republic' },
    { id: 'slovakia', name: 'Slovakia' },
    { id: 'ukraine', name: 'Ukraine' }
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
      keyPlayers: ['Mohamed Salah', 'Virgil van Dijk', 'Sadio Mané']
    },
    {
      id: 2,
      name: 'Barcelona',
      logo: '🔵',
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
      titles: 5
    },
    {
      id: 3,
      name: 'Arsenal',
      logo: '🔴',
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
      titles: 0
    },
    {
      id: 4,
      name: 'Inter',
      logo: '⚫',
      country: 'italy',
      countryFlag: '🇮🇹',
      city: 'Milan',
      stadium: 'San Siro',
      capacity: 75923,
      founded: 1908,
      coach: 'Simone Inzaghi',
      position: 4,
      points: 13,
      played: 6,
      won: 4,
      drawn: 1,
      lost: 1,
      goalsFor: 7,
      goalsAgainst: 1,
      titles: 3
    },
    {
      id: 5,
      name: 'Sporting CP',
      logo: '🟢',
      country: 'portugal',
      countryFlag: '🇵🇹',
      city: 'Lisbon',
      stadium: 'Estádio José Alvalade',
      capacity: 50095,
      founded: 1906,
      coach: 'Rúben Amorim',
      position: 5,
      points: 13,
      played: 6,
      won: 4,
      drawn: 1,
      lost: 1,
      goalsFor: 11,
      goalsAgainst: 6,
      titles: 0
    },
    {
      id: 6,
      name: 'Brest',
      logo: '🔵',
      country: 'france',
      countryFlag: '🇫🇷',
      city: 'Brest',
      stadium: 'Stade Francis-Le Blé',
      capacity: 15931,
      founded: 1950,
      coach: 'Éric Roy',
      position: 6,
      points: 13,
      played: 6,
      won: 4,
      drawn: 1,
      lost: 1,
      goalsFor: 10,
      goalsAgainst: 6,
      titles: 0
    },
    {
      id: 7,
      name: 'Borussia Dortmund',
      logo: '🟡',
      country: 'germany',
      countryFlag: '🇩🇪',
      city: 'Dortmund',
      stadium: 'Signal Iduna Park',
      capacity: 81365,
      founded: 1909,
      coach: 'Nuri Şahin',
      position: 7,
      points: 12,
      played: 6,
      won: 4,
      drawn: 0,
      lost: 2,
      goalsFor: 16,
      goalsAgainst: 10,
      titles: 1
    },
    {
      id: 8,
      name: 'Bayern Munich',
      logo: '🔴',
      country: 'germany',
      countryFlag: '🇩🇪',
      city: 'Munich',
      stadium: 'Allianz Arena',
      capacity: 75024,
      founded: 1900,
      coach: 'Vincent Kompany',
      position: 8,
      points: 12,
      played: 6,
      won: 4,
      drawn: 0,
      lost: 2,
      goalsFor: 17,
      goalsAgainst: 8,
      titles: 6
    },
    {
      id: 9,
      name: 'Atletico Madrid',
      logo: '🔴',
      country: 'spain',
      countryFlag: '🇪🇸',
      city: 'Madrid',
      stadium: 'Cívitas Metropolitano',
      capacity: 68456,
      founded: 1903,
      coach: 'Diego Simeone',
      position: 9,
      points: 12,
      played: 6,
      won: 4,
      drawn: 0,
      lost: 2,
      goalsFor: 14,
      goalsAgainst: 10,
      titles: 0
    },
    {
      id: 10,
      name: 'AC Milan',
      logo: '🔴',
      country: 'italy',
      countryFlag: '🇮🇹',
      city: 'Milan',
      stadium: 'San Siro',
      capacity: 75923,
      founded: 1899,
      coach: 'Paulo Fonseca',
      position: 10,
      points: 12,
      played: 6,
      won: 4,
      drawn: 0,
      lost: 2,
      goalsFor: 12,
      goalsAgainst: 9,
      titles: 7
    },
    {
      id: 11,
      name: 'Atalanta',
      logo: '⚫',
      country: 'italy',
      countryFlag: '🇮🇹',
      city: 'Bergamo',
      stadium: 'Gewiss Stadium',
      capacity: 21300,
      founded: 1907,
      coach: 'Gian Piero Gasperini',
      position: 11,
      points: 11,
      played: 6,
      won: 3,
      drawn: 2,
      lost: 1,
      goalsFor: 13,
      goalsAgainst: 4,
      titles: 1
    },
    {
      id: 12,
      name: 'Juventus',
      logo: '⚫',
      country: 'italy',
      countryFlag: '🇮🇹',
      city: 'Turin',
      stadium: 'Allianz Stadium',
      capacity: 41507,
      founded: 1897,
      coach: 'Thiago Motta',
      position: 12,
      points: 11,
      played: 6,
      won: 3,
      drawn: 2,
      lost: 1,
      goalsFor: 9,
      goalsAgainst: 5,
      titles: 2
    },
    {
      id: 13,
      name: 'Benfica',
      logo: '🔴',
      country: 'portugal',
      countryFlag: '🇵🇹',
      city: 'Lisbon',
      stadium: 'Estádio da Luz',
      capacity: 64642,
      founded: 1904,
      coach: 'Bruno Lage',
      position: 13,
      points: 10,
      played: 6,
      won: 3,
      drawn: 1,
      lost: 2,
      goalsFor: 10,
      goalsAgainst: 7,
      titles: 2
    },
    {
      id: 14,
      name: 'AS Monaco',
      logo: '🔴',
      country: 'france',
      countryFlag: '🇫🇷',
      city: 'Monaco',
      stadium: 'Stade Louis II',
      capacity: 18523,
      founded: 1924,
      coach: 'Adi Hütter',
      position: 14,
      points: 10,
      played: 6,
      won: 3,
      drawn: 1,
      lost: 2,
      goalsFor: 12,
      goalsAgainst: 10,
      titles: 0
    },
    {
      id: 15,
      name: 'Aston Villa',
      logo: '🟣',
      country: 'england',
      countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      city: 'Birmingham',
      stadium: 'Villa Park',
      capacity: 42640,
      founded: 1874,
      coach: 'Unai Emery',
      position: 15,
      points: 10,
      played: 6,
      won: 3,
      drawn: 1,
      lost: 2,
      goalsFor: 9,
      goalsAgainst: 8,
      titles: 1
    },
    {
      id: 16,
      name: 'Feyenoord',
      logo: '🔴',
      country: 'netherlands',
      countryFlag: '🇳🇱',
      city: 'Rotterdam',
      stadium: 'De Kuip',
      capacity: 47500,
      founded: 1908,
      coach: 'Brian Priske',
      position: 16,
      points: 10,
      played: 6,
      won: 3,
      drawn: 1,
      lost: 2,
      goalsFor: 14,
      goalsAgainst: 15,
      titles: 1
    }
  ]

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.coach.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCountry = selectedCountry === 'all' || team.country === selectedCountry
    return matchesSearch && matchesCountry
  })

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="uefa-card p-6">
            {/* Team Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="uefa-team-logo bg-gray-100 flex items-center justify-center text-2xl w-12 h-12">
                  {team.logo}
                </div>
                <div>
                  <h3 className="font-bold text-uefa-dark text-lg">{team.name}</h3>
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

export default Teams
