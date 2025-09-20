import React, { useState } from 'react'
import { ChevronDown, Trophy, Target, Users, TrendingUp, TrendingDown, Minus, Download, Share2 } from 'lucide-react'
import StandingsTable from '../components/StandingsTable'
import TopScorers from '../components/TopScorers'
import UpcomingMatches from '../components/UpcomingMatches'
import LiveTicker from '../components/LiveTicker'

const StandingsPage = () => {
  const [selectedPhase, setSelectedPhase] = useState('league')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [showLiveTicker, setShowLiveTicker] = useState(true)

  const phases = [
    { id: 'league', name: 'League Phase', active: true },
    { id: 'knockout', name: 'Knockout Phase', active: false },
  ]

  const groups = [
    { id: 'all', name: 'All Teams' },
    { id: 'qualified', name: 'Qualified' },
    { id: 'playoff', name: 'Playoff' },
    { id: 'eliminated', name: 'Eliminated' },
  ]

  const standings = [
    {
      position: 1,
      team: 'Liverpool',
      logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png',
      country: 'ENG',
      countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      played: 6,
      won: 6,
      drawn: 0,
      lost: 0,
      goalsFor: 13,
      goalsAgainst: 1,
      goalDifference: 12,
      points: 18,
      form: ['W', 'W', 'W', 'W', 'W'],
      status: 'qualified',
      change: 0,
      nextMatch: 'vs Lille (H)',
      coefficient: 89.000
    },
    {
      position: 2,
      team: 'Barcelona',
      logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png',
      country: 'ESP',
      countryFlag: '🇪🇸',
      played: 6,
      won: 5,
      drawn: 0,
      lost: 1,
      goalsFor: 21,
      goalsAgainst: 7,
      goalDifference: 14,
      points: 15,
      form: ['W', 'W', 'L', 'W', 'W'],
      status: 'qualified',
      change: 1,
      nextMatch: 'vs Atalanta (H)',
      coefficient: 86.000
    },
    {
      position: 3,
      team: 'Arsenal',
      logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52280.png',
      country: 'ENG',
      countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      played: 6,
      won: 4,
      drawn: 1,
      lost: 1,
      goalsFor: 11,
      goalsAgainst: 2,
      goalDifference: 9,
      points: 13,
      form: ['W', 'D', 'W', 'W', 'W'],
      status: 'qualified',
      change: 0,
      nextMatch: 'vs Dinamo Zagreb (H)',
      coefficient: 78.000
    }
    // Add more teams as needed
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'qualified':
        return <div className="uefa-badge uefa-badge-qualified">Q</div>
      case 'playoff':
        return <div className="uefa-badge uefa-badge-playoff">P</div>
      case 'eliminated':
        return <div className="uefa-badge uefa-badge-eliminated">E</div>
      default:
        return null
    }
  }

  const getFormBadge = (result) => {
    const baseClasses = "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
    switch (result) {
      case 'W':
        return <div className={`${baseClasses} bg-uefa-green`}>W</div>
      case 'D':
        return <div className={`${baseClasses} bg-uefa-yellow text-uefa-black`}>D</div>
      case 'L':
        return <div className={`${baseClasses} bg-uefa-red`}>L</div>
      default:
        return null
    }
  }

  const filteredStandings = selectedGroup === 'all' 
    ? standings 
    : standings.filter(team => team.status === selectedGroup)

  const stats = {
    totalTeams: standings.length,
    totalMatches: standings.reduce((sum, team) => sum + team.played, 0) / 2,
    totalGoals: standings.reduce((sum, team) => sum + team.goalsFor, 0),
    averageGoals: (standings.reduce((sum, team) => sum + team.goalsFor, 0) / (standings.reduce((sum, team) => sum + team.played, 0) / 2)).toFixed(2)
  }

  return (
    <div className="uefa-container py-8">
      {/* Breadcrumb */}
      <nav className="uefa-breadcrumb">
        <a href="#" className="uefa-breadcrumb-item hover:text-uefa-blue transition-colors">Home</a>
        <span className="uefa-breadcrumb-separator">/</span>
        <a href="#" className="uefa-breadcrumb-item hover:text-uefa-blue transition-colors">Champions League</a>
        <span className="uefa-breadcrumb-separator">/</span>
        <span className="text-uefa-dark font-semibold">Standings</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="uefa-section-title flex items-center">
              <Trophy className="mr-4 text-uefa-gold" size={36} />
              UEFA Champions League Standings
            </h1>
            <p className="uefa-section-subtitle">
              League phase standings for the 2024/25 season • Last updated: {new Date().toLocaleString('en-GB')}
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 uefa-btn-secondary">
              <Download size={16} />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 uefa-btn-secondary">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="uefa-stats-grid mb-8">
        <div className="uefa-stats-card">
          <div className="uefa-stats-icon">
            <Users size={24} />
          </div>
          <div className="uefa-stats-number">{stats.totalTeams}</div>
          <div className="uefa-stats-label">Teams</div>
        </div>
        
        <div className="uefa-stats-card">
          <div className="uefa-stats-icon">
            <Trophy size={24} />
          </div>
          <div className="uefa-stats-number">{stats.totalMatches}</div>
          <div className="uefa-stats-label">Matches Played</div>
        </div>
        
        <div className="uefa-stats-card">
          <div className="uefa-stats-icon">
            <Target size={24} />
          </div>
          <div className="uefa-stats-number">{stats.totalGoals}</div>
          <div className="uefa-stats-label">Total Goals</div>
        </div>
        
        <div className="uefa-stats-card">
          <div className="uefa-stats-icon">
            <TrendingUp size={24} />
          </div>
          <div className="uefa-stats-number">{stats.averageGoals}</div>
          <div className="uefa-stats-label">Goals per Match</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Phase Filter */}
        <div className="relative">
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="uefa-select pr-8 appearance-none"
          >
            {phases.map((phase) => (
              <option key={phase.id} value={phase.id}>
                {phase.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-uefa-gray pointer-events-none" />
        </div>

        {/* Group Filter */}
        <div className="uefa-filter-tabs">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`uefa-filter-tab ${selectedGroup === group.id ? 'active' : ''}`}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Standings */}
        <div className="lg:col-span-2">
          <StandingsTable standings={filteredStandings} selectedGroup={selectedGroup} />
          
          {/* Legend */}
          <div className="mt-6 p-6 bg-gradient-to-r from-uefa-light-gray to-uefa-medium-gray rounded-uefa-lg">
            <h3 className="font-bold text-uefa-dark mb-4 flex items-center">
              <Trophy size={20} className="mr-2 text-uefa-gold" />
              Qualification Status
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-3 p-3 bg-white rounded-uefa">
                <div className="uefa-badge uefa-badge-qualified">Q</div>
                <div>
                  <div className="font-semibold text-uefa-dark">Qualified</div>
                  <div className="text-uefa-gray">Round of 16 (1-8)</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white rounded-uefa">
                <div className="uefa-badge uefa-badge-playoff">P</div>
                <div>
                  <div className="font-semibold text-uefa-dark">Playoff</div>
                  <div className="text-uefa-gray">Knockout Playoff (9-24)</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white rounded-uefa">
                <div className="uefa-badge uefa-badge-eliminated">E</div>
                <div>
                  <div className="font-semibold text-uefa-dark">Eliminated</div>
                  <div className="text-uefa-gray">Out of competition (25-36)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Format Explanation */}
          <div className="mt-6 p-6 bg-uefa-blue text-white rounded-uefa-lg">
            <h3 className="font-bold mb-3">New Champions League Format</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">League Phase</h4>
                <ul className="space-y-1 text-uefa-light-gray">
                  <li>• 36 teams in single league table</li>
                  <li>• Each team plays 8 matches</li>
                  <li>• Top 8 qualify directly to Round of 16</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Knockout Phase</h4>
                <ul className="space-y-1 text-uefa-light-gray">
                  <li>• Teams 9-24 enter playoff round</li>
                  <li>• Teams 25-36 are eliminated</li>
                  <li>• Playoff winners join top 8 in Round of 16</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TopScorers />
          <UpcomingMatches />
          
          {/* Quick Stats */}
          <div className="uefa-card p-6">
            <h3 className="font-bold text-uefa-dark mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-uefa-gray">Matches played:</span>
                <span className="font-bold text-uefa-dark">108/144</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-uefa-gray">Goals scored:</span>
                <span className="font-bold text-uefa-dark">312</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-uefa-gray">Average goals:</span>
                <span className="font-bold text-uefa-dark">2.89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-uefa-gray">Clean sheets:</span>
                <span className="font-bold text-uefa-dark">67</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-uefa-gray">Hat-tricks:</span>
                <span className="font-bold text-uefa-dark">8</span>
              </div>
            </div>
          </div>

          {/* Next Matchday Countdown */}
          <div className="uefa-card p-6 bg-gradient-to-br from-uefa-blue to-uefa-light-blue text-white">
            <h3 className="font-bold mb-4">Next Matchday</h3>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">Matchday 7</div>
              <div className="text-sm opacity-90 mb-4">January 22, 2025</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold">16</div>
                  <div className="opacity-75">Matches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">32</div>
                  <div className="opacity-75">Teams</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Ticker */}
      {showLiveTicker && <LiveTicker />}

      {/* Additional Info */}
      <div className="mt-12 pt-8 border-t border-uefa-medium-gray">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-uefa-dark mb-4">Tournament Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-uefa-gray">Season:</span>
                <span className="text-uefa-dark font-medium">2024/25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-uefa-gray">Format:</span>
                <span className="text-uefa-dark font-medium">League Phase + Knockout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-uefa-gray">Teams:</span>
                <span className="text-uefa-dark font-medium">36</span>
              </div>
              <div className="flex justify-between">
                <span className="text-uefa-gray">Matches per team:</span>
                <span className="text-uefa-dark font-medium">8 (League Phase)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-uefa-gray">Total matches:</span>
                <span className="text-uefa-dark font-medium">189</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-uefa-dark mb-4">Key Dates</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-uefa-gray">League Phase ends:</span>
                <span className="text-uefa-dark font-medium">29 January 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-uefa-gray">Knockout draw:</span>
                <span className="text-uefa-dark font-medium">31 January 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-uefa-gray">Playoff round:</span>
                <span className="text-uefa-dark font-medium">11/12 & 18/19 Feb 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-uefa-gray">Round of 16:</span>
                <span className="text-uefa-dark font-medium">4/5 & 11/12 Mar 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-uefa-gray">Final:</span>
                <span className="text-uefa-dark font-medium">31 May 2025, Munich</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StandingsPage
