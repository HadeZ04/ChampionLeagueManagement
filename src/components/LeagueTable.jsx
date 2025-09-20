import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Tilt from 'react-parallax-tilt'

const LeagueTable = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [selectedTeam, setSelectedTeam] = useState(null)

  const teams = [
    { 
      pos: 1, name: 'Manchester City', played: 28, won: 22, drawn: 4, lost: 2, gf: 68, ga: 18, gd: 50, points: 70,
      logo: '🏆', trend: 'up', form: ['W', 'W', 'W', 'D', 'W'], color: 'from-sky-500 to-blue-600'
    },
    { 
      pos: 2, name: 'Arsenal', played: 28, won: 20, drawn: 5, lost: 3, gf: 62, ga: 25, gd: 37, points: 65,
      logo: '🔴', trend: 'up', form: ['W', 'W', 'L', 'W', 'W'], color: 'from-red-500 to-red-600'
    },
    { 
      pos: 3, name: 'Liverpool', played: 28, won: 19, drawn: 6, lost: 3, gf: 58, ga: 28, gd: 30, points: 63,
      logo: '🔴', trend: 'same', form: ['D', 'W', 'W', 'D', 'W'], color: 'from-red-600 to-red-700'
    },
    { 
      pos: 4, name: 'Newcastle', played: 28, won: 16, drawn: 8, lost: 4, gf: 48, ga: 25, gd: 23, points: 56,
      logo: '⚫', trend: 'up', form: ['W', 'D', 'W', 'W', 'L'], color: 'from-gray-700 to-black'
    },
    { 
      pos: 5, name: 'Manchester United', played: 28, won: 15, drawn: 6, lost: 7, gf: 45, ga: 35, gd: 10, points: 51,
      logo: '🔴', trend: 'down', form: ['L', 'W', 'D', 'L', 'W'], color: 'from-red-500 to-red-800'
    },
    { 
      pos: 6, name: 'Tottenham', played: 28, won: 14, drawn: 5, lost: 9, gf: 52, ga: 38, gd: 14, points: 47,
      logo: '⚪', trend: 'down', form: ['L', 'L', 'W', 'D', 'L'], color: 'from-blue-100 to-blue-300'
    }
  ]

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUp className="text-green-400" size={16} />
      case 'down': return <TrendingDown className="text-red-400" size={16} />
      default: return <Minus className="text-gray-400" size={16} />
    }
  }

  const getFormColor = (result) => {
    switch(result) {
      case 'W': return 'bg-green-500'
      case 'L': return 'bg-red-500'
      case 'D': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <section id="league" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 section-title-container"
        >
          <h2 className="text-5xl font-bold text-white mb-6">PREMIER LEAGUE TABLE</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Current season standings and team performance
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="professional-card rounded-2xl overflow-hidden"
        >
            {/* Table Header */}
            <div className="bg-football-green/10 p-6 border-b border-white/10">
              <div className="grid grid-cols-12 gap-4 text-sm font-bold text-gray-300 uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-4">TEAM</div>
                <div className="col-span-1 text-center">P</div>
                <div className="col-span-1 text-center">W</div>
                <div className="col-span-1 text-center">D</div>
                <div className="col-span-1 text-center">L</div>
                <div className="col-span-1 text-center">GD</div>
                <div className="col-span-1 text-center">PTS</div>
                <div className="col-span-1 text-center">FORM</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="p-6">
              {teams.map((team, index) => (
                <motion.div
                  key={team.name}
                  initial={{ opacity: 0, x: -50 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  onClick={() => setSelectedTeam(selectedTeam === team.name ? null : team.name)}
                  className={`grid grid-cols-12 gap-4 py-4 rounded-xl professional-hover transition-all duration-300 border-l-4 ${
                    team.pos <= 4 ? 'border-football-green' : 
                    team.pos <= 6 ? 'border-blue-400' : 
                    team.pos >= 18 ? 'border-red-400' : 'border-gray-600'
                  } ${selectedTeam === team.name ? 'bg-white/5' : ''}`}
                >
                  <div className="col-span-1 flex items-center">
                    <span className="text-2xl font-bold text-white">{team.pos}</span>
                    {getTrendIcon(team.trend)}
                  </div>
                  
                  <div className="col-span-4 flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${team.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {team.logo}
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">{team.name}</div>
                      <div className="text-gray-400 text-sm">Last 5 matches</div>
                    </div>
                  </div>
                  
                  <div className="col-span-1 text-center text-white">{team.played}</div>
                  <div className="col-span-1 text-center text-football-green font-bold">{team.won}</div>
                  <div className="col-span-1 text-center text-yellow-400 font-bold">{team.drawn}</div>
                  <div className="col-span-1 text-center text-red-400 font-bold">{team.lost}</div>
                  <div className="col-span-1 text-center text-white font-bold">
                    {team.gd > 0 ? '+' : ''}{team.gd}
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-2xl font-bold text-white">{team.points}</span>
                  </div>
                  
                  <div className="col-span-1 flex justify-center space-x-1">
                    {team.form.map((result, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.2 }}
                        className={`w-6 h-6 ${getFormColor(result)} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {result}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="bg-black/20 p-4 border-t border-white/10">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-football-green rounded"></div>
                  <span className="text-gray-300">Champions League</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-blue-400 rounded"></div>
                  <span className="text-gray-300">Europa League</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-red-400 rounded"></div>
                  <span className="text-gray-300">Relegation</span>
                </div>
              </div>
            </div>
          </motion.div>
      </div>
    </section>
  )
}

export default LeagueTable
