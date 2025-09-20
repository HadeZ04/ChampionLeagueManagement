import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Clock, MapPin, Users, Zap, Target } from 'lucide-react'
import Tilt from 'react-parallax-tilt'
import confetti from 'canvas-confetti'

const MatchCenter = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [selectedMatch, setSelectedMatch] = useState(0)
  const [liveScore, setLiveScore] = useState({ home: 2, away: 1 })

  const matches = [
    {
      id: 1,
      home: { name: 'Manchester City', logo: '🏆', color: 'from-sky-500 to-blue-600' },
      away: { name: 'Arsenal', logo: '🔴', color: 'from-red-500 to-red-600' },
      score: { home: 2, away: 1 },
      status: 'LIVE',
      time: "67'",
      stadium: 'Etihad Stadium',
      attendance: '55,000',
      events: [
        { time: "23'", type: 'goal', team: 'home', player: 'Haaland' },
        { time: "45'", type: 'goal', team: 'away', player: 'Saka' },
        { time: "67'", type: 'goal', team: 'home', player: 'De Bruyne' }
      ]
    },
    {
      id: 2,
      home: { name: 'Liverpool', logo: '🔴', color: 'from-red-600 to-red-700' },
      away: { name: 'Chelsea', logo: '🔵', color: 'from-blue-500 to-blue-700' },
      score: { home: 0, away: 0 },
      status: 'UPCOMING',
      time: '15:30',
      stadium: 'Anfield',
      attendance: '54,000',
      events: []
    },
    {
      id: 3,
      home: { name: 'Manchester United', logo: '🔴', color: 'from-red-500 to-red-800' },
      away: { name: 'Tottenham', logo: '⚪', color: 'from-blue-100 to-blue-300' },
      score: { home: 3, away: 2 },
      status: 'FINISHED',
      time: 'FT',
      stadium: 'Old Trafford',
      attendance: '74,000',
      events: [
        { time: "12'", type: 'goal', team: 'home', player: 'Rashford' },
        { time: "28'", type: 'goal', team: 'away', player: 'Kane' },
        { time: "56'", type: 'goal', team: 'home', player: 'Bruno' },
        { time: "73'", type: 'goal', team: 'away', player: 'Son' },
        { time: "89'", type: 'goal', team: 'home', player: 'Casemiro' }
      ]
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      if (matches[selectedMatch].status === 'LIVE') {
        // Simulate live score updates
        const random = Math.random()
        if (random > 0.98) {
          setLiveScore(prev => ({
            ...prev,
            home: prev.home + (Math.random() > 0.5 ? 1 : 0)
          }))
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#00ff88', '#00ccff']
          })
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [selectedMatch])

  const getStatusColor = (status) => {
    switch(status) {
      case 'LIVE': return 'bg-red-500 animate-pulse'
      case 'UPCOMING': return 'bg-blue-500'
      case 'FINISHED': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <section id="matches" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 section-title-container"
        >
          <h2 className="text-5xl font-bold text-white mb-6">MATCH CENTER</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Live matches, real-time updates, and immersive match experience
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Match List */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {matches.map((match, index) => (
                <Tilt key={match.id} tiltMaxAngleX={5} tiltMaxAngleY={5}>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedMatch(index)}
                    className={`stadium-glass rounded-3xl p-8 cursor-hover transition-all duration-300 ${
                      selectedMatch === index ? 'ring-2 ring-green-400 scale-105' : ''
                    } ${match.status === 'LIVE' ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10' : ''}`}
                  >
                    {/* Match Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 ${getStatusColor(match.status)} rounded-full text-white text-sm font-bold font-rajdhani`}>
                          {match.status}
                        </div>
                        <div className="text-gray-400 font-rajdhani">{match.time}</div>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <MapPin size={16} />
                        <span className="font-rajdhani">{match.stadium}</span>
                      </div>
                    </div>

                    {/* Teams and Score */}
                    <div className="grid grid-cols-5 gap-4 items-center">
                      {/* Home Team */}
                      <div className="col-span-2 flex items-center space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${match.home.color} rounded-2xl flex items-center justify-center text-3xl`}>
                          {match.home.logo}
                        </div>
                        <div>
                          <div className="text-white font-bold text-xl font-rajdhani">{match.home.name}</div>
                          <div className="text-gray-400 text-sm">Home</div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="col-span-1 text-center">
                        <div className="text-4xl font-bold text-white font-orbitron">
                          {match.status === 'LIVE' && selectedMatch === index ? liveScore.home : match.score.home}
                          <span className="text-gray-500 mx-2">-</span>
                          {match.status === 'LIVE' && selectedMatch === index ? liveScore.away : match.score.away}
                        </div>
                        {match.status === 'UPCOMING' && (
                          <div className="text-gray-400 text-sm font-rajdhani">VS</div>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="col-span-2 flex items-center space-x-4 justify-end">
                        <div className="text-right">
                          <div className="text-white font-bold text-xl font-rajdhani">{match.away.name}</div>
                          <div className="text-gray-400 text-sm">Away</div>
                        </div>
                        <div className={`w-16 h-16 bg-gradient-to-br ${match.away.color} rounded-2xl flex items-center justify-center text-3xl`}>
                          {match.away.logo}
                        </div>
                      </div>
                    </div>

                    {/* Match Stats */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Users size={16} />
                        <span className="text-sm font-rajdhani">{match.attendance}</span>
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Target size={16} />
                          <span className="text-sm font-rajdhani">{match.events.filter(e => e.type === 'goal').length}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Zap size={16} />
                          <span className="text-sm font-rajdhani">{match.events.length}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Tilt>
              ))}
            </div>
          </div>

          {/* Match Details */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="stadium-glass rounded-3xl p-6 sticky top-24"
            >
              <h3 className="text-2xl font-bold text-white mb-6 font-orbitron">MATCH EVENTS</h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {matches[selectedMatch].events.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ⚽
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium font-rajdhani">{event.player}</div>
                        <div className="text-gray-400 text-sm">{event.time}</div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        event.team === 'home' ? 'bg-blue-500' : 'bg-red-500'
                      }`}></div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {matches[selectedMatch].events.length === 0 && (
                  <div className="text-center text-gray-400 py-8 font-rajdhani">
                    No events yet
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MatchCenter
