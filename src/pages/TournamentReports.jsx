import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { BarChart3, Trophy, Target, Download, Medal, Users } from 'lucide-react'
import { useTournament } from '../context/TournamentContext'

const TournamentReports = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { calculateStandings, getTopScorers, teams, results, regulations } = useTournament()
  const [activeTab, setActiveTab] = useState('standings')

  const standings = calculateStandings()
  const topScorers = getTopScorers()

  const tabs = [
    { id: 'standings', name: 'League Table', icon: Trophy },
    { id: 'scorers', name: 'Top Scorers', icon: Target },
    { id: 'statistics', name: 'Statistics', icon: BarChart3 }
  ]

  const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      data.map(row => Object.values(row).join(",")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getPositionColor = (position) => {
    if (position <= 4) return 'text-football-green'
    if (position <= 6) return 'text-blue-400'
    if (position >= standings.length - 2) return 'text-red-400'
    return 'text-white'
  }

  const getPositionBadge = (position) => {
    if (position === 1) return '🏆'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    if (position <= 4) return '🟢'
    if (position <= 6) return '🔵'
    if (position >= standings.length - 2) return '🔴'
    return '⚪'
  }

  return (
    <div className="section-light">
      <section className="min-h-screen py-20">
        <div className="container mx-auto px-6">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 section-title-container"
          >
            <h1 className="text-5xl font-bold text-white mb-6">TOURNAMENT REPORTS</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive tournament statistics and rankings
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-football-green text-white shadow-lg'
                    : 'professional-card text-gray-300 hover:text-white'
                }`}
              >
                <tab.icon size={24} />
                <span>{tab.name}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeTab === 'standings' && (
              <div className="professional-card rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-football-green/20 via-football-green/10 to-football-green/20 p-6 border-b border-football-green/20 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Trophy className="mr-3 text-football-green" size={28} />
                    League Standings
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => exportToCSV(standings, 'league_standings')}
                    className="flex items-center space-x-2 px-4 py-2 bg-football-green rounded-lg text-white font-medium"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </motion.button>
                </div>

                <div className="p-6">
                  {standings.length > 0 ? (
                    <>
                      <div className="grid grid-cols-12 gap-4 text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 pb-2 border-b border-white/10">
                        <div className="col-span-1">Pos</div>
                        <div className="col-span-4">Team</div>
                        <div className="col-span-1 text-center">P</div>
                        <div className="col-span-1 text-center">W</div>
                        <div className="col-span-1 text-center">D</div>
                        <div className="col-span-1 text-center">L</div>
                        <div className="col-span-1 text-center">GD</div>
                        <div className="col-span-2 text-center">PTS</div>
                      </div>

                      <div className="space-y-2">
                        {standings.map((team, index) => (
                          <motion.div
                            key={team.team}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="grid grid-cols-12 gap-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <div className="col-span-1 flex items-center space-x-2">
                              <span className="text-2xl">{getPositionBadge(index + 1)}</span>
                              <span className={`text-xl font-bold ${getPositionColor(index + 1)}`}>
                                {index + 1}
                              </span>
                            </div>
                            
                            <div className="col-span-4 flex items-center">
                              <div className="w-10 h-10 bg-football-green rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">
                                  {team.team.charAt(0)}
                                </span>
                              </div>
                              <span className="text-white font-bold text-lg">{team.team}</span>
                            </div>
                            
                            <div className="col-span-1 text-center text-white">{team.played}</div>
                            <div className="col-span-1 text-center text-football-green font-bold">{team.wins}</div>
                            <div className="col-span-1 text-center text-yellow-400 font-bold">{team.draws}</div>
                            <div className="col-span-1 text-center text-red-400 font-bold">{team.losses}</div>
                            <div className="col-span-1 text-center text-white font-bold">
                              {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                            </div>
                            <div className="col-span-2 text-center">
                              <span className="text-3xl font-bold text-white">{team.points}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">🏆</span>
                            <span className="text-gray-300">Champion</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">🟢</span>
                            <span className="text-gray-300">Champions League</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">🔵</span>
                            <span className="text-gray-300">Europa League</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">🔴</span>
                            <span className="text-gray-300">Relegation</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No standings available yet. Complete some matches to see rankings.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'scorers' && (
              <div className="professional-card rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-football-green/20 via-football-green/10 to-football-green/20 p-6 border-b border-football-green/20 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Target className="mr-3 text-football-green" size={28} />
                    Top Scorers
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => exportToCSV(topScorers, 'top_scorers')}
                    className="flex items-center space-x-2 px-4 py-2 bg-football-green rounded-lg text-white font-medium"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </motion.button>
                </div>

                <div className="p-6">
                  {topScorers.length > 0 ? (
                    <div className="space-y-4">
                      {topScorers.map((scorer, index) => (
                        <motion.div
                          key={scorer.player}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                              </span>
                              <div className="w-12 h-12 bg-football-green rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {scorer.player.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-white font-bold text-lg">{scorer.player}</h3>
                              <p className="text-gray-400">{scorer.team}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-3xl font-bold text-football-green">{scorer.goals}</div>
                            <div className="text-gray-400 text-sm">Goals</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Target size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No goals scored yet. Record some match results to see top scorers.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tournament Overview */}
                <div className="professional-card rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <BarChart3 className="mr-3 text-football-green" size={24} />
                    Tournament Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Teams</span>
                      <span className="text-white font-bold">{teams.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Matches Played</span>
                      <span className="text-white font-bold">{results.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Goals</span>
                      <span className="text-white font-bold">
                        {results.reduce((total, result) => total + result.score1 + result.score2, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Goals/Match</span>
                      <span className="text-white font-bold">
                        {results.length > 0 
                          ? (results.reduce((total, result) => total + result.score1 + result.score2, 0) / results.length).toFixed(2)
                          : '0.00'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scoring Statistics */}
                <div className="professional-card rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Target className="mr-3 text-football-green" size={24} />
                    Scoring Stats
                  </h3>
                  <div className="space-y-4">
                    {regulations.goalTypes.map(type => {
                      const typeGoals = results.reduce((count, result) => {
                        if (result.goals) {
                          return count + result.goals.filter(goal => goal.type === type).length
                        }
                        return count
                      }, 0)
                      
                      return (
                        <div key={type} className="flex justify-between">
                          <span className="text-gray-400">Type {type} Goals</span>
                          <span className="text-white font-bold">{typeGoals}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Current Regulations */}
                <div className="professional-card rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Users className="mr-3 text-football-green" size={24} />
                    Current Rules
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Player Age Range</span>
                      <span className="text-white font-bold">{regulations.minAge}-{regulations.maxAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Foreign Players</span>
                      <span className="text-white font-bold">{regulations.maxForeignPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Team Size</span>
                      <span className="text-white font-bold">{regulations.minPlayers}-{regulations.maxPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Points</span>
                      <span className="text-white font-bold">{regulations.winPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Draw Points</span>
                      <span className="text-white font-bold">{regulations.drawPoints}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default TournamentReports
