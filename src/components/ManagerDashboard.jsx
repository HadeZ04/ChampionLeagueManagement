import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Trophy, Target, Users, TrendingUp, Calendar, Settings, Award, Zap } from 'lucide-react'
import Tilt from 'react-parallax-tilt'

const ManagerDashboard = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Trophy },
    { id: 'tactics', name: 'Tactics', icon: Target },
    { id: 'squad', name: 'Squad', icon: Users },
    { id: 'schedule', name: 'Schedule', icon: Calendar }
  ]

  const achievements = [
    { title: 'Premier League Champion', year: '2023', icon: '🏆', color: 'from-yellow-500 to-yellow-600' },
    { title: 'Champions League Winner', year: '2022', icon: '⭐', color: 'from-blue-500 to-blue-600' },
    { title: 'FA Cup Winner', year: '2023', icon: '🥇', color: 'from-green-500 to-green-600' },
    { title: 'Manager of the Year', year: '2023', icon: '👑', color: 'from-purple-500 to-purple-600' }
  ]

  const squadStats = [
    { position: 'Goalkeeper', count: 3, avgRating: 8.2, color: 'from-green-500 to-emerald-600' },
    { position: 'Defender', count: 8, avgRating: 7.8, color: 'from-blue-500 to-blue-600' },
    { position: 'Midfielder', count: 7, avgRating: 8.5, color: 'from-yellow-500 to-yellow-600' },
    { position: 'Forward', count: 5, avgRating: 8.9, color: 'from-red-500 to-red-600' }
  ]

  const upcomingMatches = [
    { opponent: 'Liverpool', date: 'Mar 15', time: '15:30', venue: 'Home', difficulty: 'Hard' },
    { opponent: 'Brighton', date: 'Mar 22', time: '17:45', venue: 'Away', difficulty: 'Medium' },
    { opponent: 'Arsenal', date: 'Mar 29', time: '16:00', venue: 'Home', difficulty: 'Hard' },
    { opponent: 'Crystal Palace', date: 'Apr 5', time: '14:00', venue: 'Away', difficulty: 'Easy' }
  ]

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Hard': return 'bg-red-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Easy': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl font-bold gradient-text mb-6 font-orbitron">MANAGER DASHBOARD</h2>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-rajdhani">
            Your command center for tactical mastery and team management
          </p>
        </motion.div>

        {/* Manager Profile */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
            <div className="stadium-glass rounded-3xl p-8">
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center text-6xl">
                  👨‍💼
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-4xl font-bold text-white font-orbitron mb-2">Alex Ferguson Jr.</h3>
                  <p className="text-xl text-gray-300 font-rajdhani mb-4">Manchester City Manager</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 font-orbitron">156</div>
                      <div className="text-gray-400 text-sm font-rajdhani">Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 font-orbitron">89%</div>
                      <div className="text-gray-400 text-sm font-rajdhani">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400 font-orbitron">12</div>
                      <div className="text-gray-400 text-sm font-rajdhani">Trophies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400 font-orbitron">9.2</div>
                      <div className="text-gray-400 text-sm font-rajdhani">Rating</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold cursor-hover"
                  >
                    <span className="font-rajdhani">Team Talk</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 stadium-glass rounded-xl text-white font-bold cursor-hover border border-white/20"
                  >
                    <span className="font-rajdhani">Settings</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </Tilt>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg cursor-hover transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'stadium-glass text-gray-300 hover:text-white'
              }`}
            >
              <tab.icon size={24} />
              <span className="font-rajdhani">{tab.name}</span>
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
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Achievements */}
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
                <div className="stadium-glass rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 font-orbitron flex items-center">
                    <Award className="mr-3 text-yellow-400" size={28} />
                    ACHIEVEMENTS
                  </h3>
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.title}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl cursor-hover"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center text-2xl`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold font-rajdhani">{achievement.title}</div>
                          <div className="text-gray-400 text-sm font-rajdhani">{achievement.year}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Tilt>

              {/* Performance Metrics */}
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
                <div className="stadium-glass rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 font-orbitron flex items-center">
                    <TrendingUp className="mr-3 text-green-400" size={28} />
                    PERFORMANCE
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Trophy className="text-white" size={32} />
                      </div>
                      <div className="text-3xl font-bold text-white font-orbitron mb-2">1st</div>
                      <div className="text-gray-400 font-rajdhani">League Position</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Target className="text-white" size={32} />
                      </div>
                      <div className="text-3xl font-bold text-white font-orbitron mb-2">68</div>
                      <div className="text-gray-400 font-rajdhani">Goals Scored</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Zap className="text-white" size={32} />
                      </div>
                      <div className="text-3xl font-bold text-white font-orbitron mb-2">18</div>
                      <div className="text-gray-400 font-rajdhani">Goals Conceded</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="text-white" size={32} />
                      </div>
                      <div className="text-3xl font-bold text-white font-orbitron mb-2">23</div>
                      <div className="text-gray-400 font-rajdhani">Squad Players</div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </div>
          )}

          {activeTab === 'squad' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {squadStats.map((stat, index) => (
                <Tilt key={stat.position} tiltMaxAngleX={10} tiltMaxAngleY={10}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="stadium-glass rounded-3xl p-6 cursor-hover"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Users className="text-white" size={24} />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white font-orbitron mb-2">{stat.count}</div>
                      <div className="text-gray-300 font-rajdhani mb-3">{stat.position}s</div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="text-yellow-400 font-bold font-orbitron">{stat.avgRating}</div>
                        <div className="text-gray-400 text-sm font-rajdhani">avg rating</div>
                      </div>
                    </div>
                  </motion.div>
                </Tilt>
              ))}
            </div>
          )}

          {activeTab === 'schedule' && (
            <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
              <div className="stadium-glass rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 font-orbitron flex items-center">
                  <Calendar className="mr-3 text-blue-400" size={28} />
                  UPCOMING FIXTURES
                </h3>
                <div className="space-y-4">
                  {upcomingMatches.map((match, index) => (
                    <motion.div
                      key={match.opponent}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-6 bg-white/5 rounded-xl cursor-hover"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold">
                          VS
                        </div>
                        <div>
                          <div className="text-white font-bold text-lg font-rajdhani">{match.opponent}</div>
                          <div className="text-gray-400 text-sm font-rajdhani">{match.venue}</div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-white font-bold font-rajdhani">{match.date}</div>
                        <div className="text-gray-400 text-sm font-rajdhani">{match.time}</div>
                      </div>
                      
                      <div className={`px-3 py-1 ${getDifficultyColor(match.difficulty)} rounded-full text-white text-sm font-bold font-rajdhani`}>
                        {match.difficulty}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Tilt>
          )}

          {activeTab === 'tactics' && (
            <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
              <div className="stadium-glass rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 font-orbitron flex items-center">
                  <Target className="mr-3 text-red-400" size={28} />
                  TACTICAL SETUP
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4 font-rajdhani">Formation: 4-3-3</h4>
                    <div className="bg-green-900/20 rounded-2xl p-6 field-pattern relative h-80">
                      {/* Football Field with Player Positions */}
                      <div className="absolute inset-4">
                        {/* Goalkeeper */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          GK
                        </div>
                        
                        {/* Defenders */}
                        <div className="absolute bottom-16 left-1/4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          D
                        </div>
                        <div className="absolute bottom-16 left-2/5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          D
                        </div>
                        <div className="absolute bottom-16 right-2/5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          D
                        </div>
                        <div className="absolute bottom-16 right-1/4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          D
                        </div>
                        
                        {/* Midfielders */}
                        <div className="absolute bottom-32 left-1/3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          M
                        </div>
                        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          M
                        </div>
                        <div className="absolute bottom-32 right-1/3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          M
                        </div>
                        
                        {/* Forwards */}
                        <div className="absolute bottom-48 left-1/4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          F
                        </div>
                        <div className="absolute bottom-48 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          F
                        </div>
                        <div className="absolute bottom-48 right-1/4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          F
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-3 font-rajdhani">Playing Style</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-rajdhani">Attacking</span>
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full w-4/5"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-rajdhani">Possession</span>
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-3/4"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-rajdhani">Pressing</span>
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-white mb-3 font-rajdhani">Instructions</h4>
                      <div className="space-y-2 text-gray-300 font-rajdhani">
                        <div>• High defensive line</div>
                        <div>• Quick passing tempo</div>
                        <div>• Press after possession loss</div>
                        <div>• Overlap on flanks</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tilt>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default ManagerDashboard
