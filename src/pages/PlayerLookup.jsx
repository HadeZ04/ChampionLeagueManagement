import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Search, User, Calendar, MapPin, Trophy, Target } from 'lucide-react'
import { useTournament } from '../context/TournamentContext'

const PlayerLookup = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { teams, results } = useTournament()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  // Get all players from all teams
  const allPlayers = teams.flatMap(team => 
    team.players.map(player => ({
      ...player,
      teamName: team.name,
      teamStadium: team.stadium
    }))
  )

  // Filter players based on search term
  const filteredPlayers = allPlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate player statistics
  const getPlayerStats = (playerName, teamName) => {
    let goals = 0
    let matches = 0
    const goalDetails = []

    results.forEach(result => {
      const isPlayerInMatch = result.team1 === teamName || result.team2 === teamName
      if (isPlayerInMatch) {
        matches++
        
        if (result.goals) {
          result.goals.forEach(goal => {
            if (goal.player === playerName && goal.team === teamName) {
              goals++
              goalDetails.push({
                opponent: result.team1 === teamName ? result.team2 : result.team1,
                time: goal.time,
                type: goal.type,
                date: result.date
              })
            }
          })
        }
      }
    })

    return { goals, matches, goalDetails }
  }

  const calculateAge = (birthdate) => {
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="section-dark">
      <section className="min-h-screen py-20">
        <div className="container mx-auto px-6">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 section-title-container"
          >
            <h1 className="text-5xl font-bold text-white mb-6">PLAYER LOOKUP</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Search and view detailed player information and statistics
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Search and Player List */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="professional-card rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Search className="mr-3 text-football-green" size={28} />
                  Search Players
                </h2>

                <div className="mb-6">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-football-green transition-colors"
                    placeholder="Search by player or team name..."
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredPlayers.map((player, index) => (
                    <motion.div
                      key={`${player.teamName}-${player.name}-${index}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlayer(player)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedPlayer?.name === player.name && selectedPlayer?.teamName === player.teamName
                          ? 'bg-football-green text-white'
                          : 'bg-white/5 hover:bg-white/10 text-white'
                      }`}
                    >
                      <div className="font-bold">{player.name}</div>
                      <div className="text-sm opacity-75">{player.teamName}</div>
                      <div className="text-xs opacity-60">{player.type} Player</div>
                    </motion.div>
                  ))}
                </div>

                {filteredPlayers.length === 0 && searchTerm && (
                  <div className="text-center py-8 text-gray-400">
                    <User size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No players found</p>
                  </div>
                )}

                {allPlayers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <User size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No players registered yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Player Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2"
            >
              {selectedPlayer ? (
                <div className="space-y-6">
                  {/* Player Info Card */}
                  <div className="professional-card rounded-xl p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{selectedPlayer.name}</h2>
                        <p className="text-football-green text-lg font-semibold">{selectedPlayer.teamName}</p>
                      </div>
                      <div className="w-20 h-20 bg-football-green rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {selectedPlayer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex items-center space-x-3">
                        <Calendar className="text-football-green" size={20} />
                        <div>
                          <p className="text-gray-400 text-sm">Age</p>
                          <p className="text-white font-semibold">
                            {selectedPlayer.birthdate ? calculateAge(selectedPlayer.birthdate) : 'N/A'} years
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <User className="text-football-green" size={20} />
                        <div>
                          <p className="text-gray-400 text-sm">Type</p>
                          <p className="text-white font-semibold">{selectedPlayer.type}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="text-football-green" size={20} />
                        <div>
                          <p className="text-gray-400 text-sm">Home Stadium</p>
                          <p className="text-white font-semibold">{selectedPlayer.teamStadium}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Target className="text-football-green" size={20} />
                        <div>
                          <p className="text-gray-400 text-sm">Position</p>
                          <p className="text-white font-semibold">
                            {selectedPlayer.notes || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics Card */}
                  <div className="professional-card rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Trophy className="mr-3 text-football-green" size={28} />
                      Statistics
                    </h3>

                    {(() => {
                      const stats = getPlayerStats(selectedPlayer.name, selectedPlayer.teamName)
                      return (
                        <>
                          <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Trophy className="text-white" size={24} />
                              </div>
                              <div className="text-3xl font-bold text-white mb-1">{stats.goals}</div>
                              <div className="text-gray-400 text-sm">Goals Scored</div>
                            </div>

                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Target className="text-white" size={24} />
                              </div>
                              <div className="text-3xl font-bold text-white mb-1">{stats.matches}</div>
                              <div className="text-gray-400 text-sm">Matches Played</div>
                            </div>

                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <User className="text-white" size={24} />
                              </div>
                              <div className="text-3xl font-bold text-white mb-1">
                                {stats.matches > 0 ? (stats.goals / stats.matches).toFixed(2) : '0.00'}
                              </div>
                              <div className="text-gray-400 text-sm">Goals per Match</div>
                            </div>
                          </div>

                          {/* Goal Details */}
                          {stats.goalDetails.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-4">Goal History</h4>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {stats.goalDetails.map((goal, index) => (
                                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-white font-medium">vs {goal.opponent}</p>
                                        <p className="text-gray-400 text-sm">{goal.date}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-football-green font-bold">{goal.time}'</p>
                                        <p className="text-gray-400 text-sm">Type {goal.type}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {stats.goals === 0 && (
                            <div className="text-center py-8 text-gray-400">
                              <Target size={32} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No goals scored yet</p>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
              ) : (
                <div className="professional-card rounded-xl p-8">
                  <div className="text-center py-16 text-gray-400">
                    <User size={64} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Select a Player</h3>
                    <p>Choose a player from the list to view their details and statistics</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PlayerLookup
