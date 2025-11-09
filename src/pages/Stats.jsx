import React, { useEffect, useMemo, useState } from 'react'
import { Trophy, Target, Users, TrendingUp, Award, Zap, Shield, Clock, X } from 'lucide-react'
import StatsService from '../layers/application/services/StatsService'

const Stats = () => {
  const [selectedCategory, setSelectedCategory] = useState('goals')
  const [seasonFilter, setSeasonFilter] = useState('2025-2026')
  const [playerStats, setPlayerStats] = useState({
    goals: [],
    assists: [],
    'clean-sheets': [],
    minutes: []
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState(null)
  const [playerSearch, setPlayerSearch] = useState('')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailData, setDetailData] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      setStatsLoading(true)
      setStatsError(null)
      try {
        const data = await StatsService.getPlayerStats({ season: seasonFilter })
        if (isMounted) {
          setPlayerStats(data)
        }
      } catch (error) {
        if (isMounted) {
          setStatsError('Unable to load player statistics right now.')
        }
      } finally {
        if (isMounted) {
          setStatsLoading(false)
        }
      }
    }

    loadStats()
    return () => {
      isMounted = false
    }
  }, [seasonFilter])

  const categories = [
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'assists', name: 'Assists', icon: Zap },
    { id: 'clean-sheets', name: 'Clean Sheets', icon: Shield },
    { id: 'minutes', name: 'Minutes Played', icon: Clock }
  ]

  const seasonOptions = ['2025-2026', '2024-2025', '2023-2024']
  const statsForCategory = useMemo(() => playerStats[selectedCategory] ?? [], [playerStats, selectedCategory])
  const filteredStatsForCategory = useMemo(() => {
    if (!playerSearch.trim()) {
      return statsForCategory
    }
    const search = playerSearch.toLowerCase()
    return statsForCategory.filter(
      (player) =>
        player.player?.toLowerCase().includes(search) ||
        player.team?.toLowerCase().includes(search) ||
        player.nationality?.toLowerCase().includes(search)
    )
  }, [playerSearch, statsForCategory])

  const openPlayerDetail = async (player) => {
    setDetailModalOpen(true)
    setDetailLoading(true)
    setDetailData(player)
    if (!player?.id) {
      setDetailLoading(false)
      return
    }
    try {
      const detail = await StatsService.getPlayerStatDetail(player.id)
      setDetailData(detail ?? player)
    } catch (error) {
      console.error('Failed to load player detail', error)
      setDetailData(player)
    } finally {
      setDetailLoading(false)
    }
  }

  const closePlayerDetail = () => {
    setDetailModalOpen(false)
    setDetailData(null)
    setDetailLoading(false)
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-uefa-dark">Player Statistics</h2>
          <div className="flex items-center space-x-3">
            <span className="text-uefa-gray text-sm uppercase tracking-wide">Season</span>
            <select
              className="uefa-select bg-white text-uefa-dark w-48"
              value={seasonFilter}
              onChange={(event) => setSeasonFilter(event.target.value)}
            >
              {seasonOptions.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>
        </div>

        {statsError && (
          <div className="mb-4 p-4 rounded-uefa bg-red-50 text-sm text-red-700 border border-red-200">
            {statsError}
          </div>
        )}

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

        <div className="mb-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search players, clubs or nationality..."
              className="w-full rounded-uefa border border-gray-300 py-2 pl-3 pr-3 text-sm text-gray-700 focus:border-uefa-blue focus:outline-none"
              value={playerSearch}
              onChange={(event) => setPlayerSearch(event.target.value)}
            />
          </div>
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
              {statsLoading && (
                <tr>
                  <td className="uefa-table-cell text-center py-8 text-uefa-gray" colSpan={6}>
                    Loading player statistics...
                  </td>
                </tr>
              )}

              {!statsLoading && filteredStatsForCategory.length === 0 && (
                <tr>
                  <td className="uefa-table-cell text-center py-8 text-uefa-gray" colSpan={6}>
                    No statistics available for this season.
                  </td>
                </tr>
              )}

              {!statsLoading &&
                filteredStatsForCategory.map((player) => (
                  <tr
                    key={`${player.id ?? player.rank}-${player.player}`}
                    className="uefa-table-row cursor-pointer hover:bg-uefa-light-gray/60"
                    onClick={() => openPlayerDetail(player)}
                  >
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
                        ? `${player.matches ? Math.round(player.value / player.matches) : 0}'`
                        : player.matches
                          ? (player.value / player.matches).toFixed(2)
                          : '0.00'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-uefa-lg bg-white p-6 shadow-uefa-xl relative">
            <button
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
              onClick={closePlayerDetail}
            >
              <X className="h-4 w-4" />
            </button>
            {detailLoading ? (
              <div className="flex items-center justify-center py-12 text-uefa-gray">
                Loading profile...
              </div>
            ) : (
              detailData && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-uefa-light-gray flex items-center justify-center text-2xl font-bold text-uefa-dark">
                      {detailData.avatar ? (
                        <img src={detailData.avatar} alt={detailData.player} className="h-full w-full object-cover" />
                      ) : (
                        detailData.player?.slice(0, 2)?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="text-sm uppercase tracking-wide text-uefa-gray">{detailData.category}</div>
                      <h3 className="text-2xl font-bold text-uefa-dark">{detailData.player}</h3>
                      <p className="text-uefa-gray">
                        {detailData.position ? `${detailData.position} • ` : ''}
                        {detailData.team}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-uefa bg-uefa-light-gray p-4">
                      <div className="text-sm text-uefa-gray">Statistic</div>
                      <div className="text-2xl font-bold text-uefa-dark">
                        {detailData.category === 'minutes' ? `${detailData.value}'` : detailData.value}
                      </div>
                    </div>
                    <div className="rounded-uefa bg-uefa-light-gray p-4">
                      <div className="text-sm text-uefa-gray">Matches</div>
                      <div className="text-2xl font-bold text-uefa-dark">{detailData.matches}</div>
                    </div>
                    <div className="rounded-uefa bg-uefa-light-gray p-4">
                      <div className="text-sm text-uefa-gray">Nationality</div>
                      <div className="text-lg font-semibold text-uefa-dark">
                        {detailData.nationality ?? 'Updating'}
                      </div>
                    </div>
                    <div className="rounded-uefa bg-uefa-light-gray p-4">
                      <div className="text-sm text-uefa-gray">Season</div>
                      <div className="text-lg font-semibold text-uefa-dark">{detailData.season}</div>
                    </div>
                  </div>

                  {detailData.recentMatches && detailData.recentMatches.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-uefa-gray uppercase tracking-wide">
                        Recent Matches
                      </h4>
                      <div className="space-y-2">
                        {detailData.recentMatches.map((match, index) => (
                          <div
                            key={`${match.opponent}-${index}`}
                            className="flex items-center justify-between rounded-uefa border border-uefa-light-gray px-4 py-2 text-sm"
                          >
                            <div className="font-medium text-uefa-dark">{match.opponent}</div>
                            <div className="text-uefa-gray">{match.result}</div>
                            <div className="font-semibold text-uefa-blue">{match.contribution}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

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
