import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Trophy, Target, Zap, Shield, Star, TrendingUp } from 'lucide-react'
import Tilt from 'react-parallax-tilt'

const PlayerStats = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [selectedCategory, setSelectedCategory] = useState('goals')

  const categories = [
    { id: 'goals', name: 'Top Scorers', icon: Target, color: 'from-red-500 to-red-600' },
    { id: 'assists', name: 'Assists', icon: Zap, color: 'from-blue-500 to-blue-600' },
    { id: 'saves', name: 'Saves', icon: Shield, color: 'from-green-500 to-green-600' },
    { id: 'rating', name: 'Rating', icon: Star, color: 'from-yellow-500 to-yellow-600' }
  ]

  const playerData = {
    goals: [
      { name: 'Erling Haaland', team: 'Manchester City', value: 28, avatar: '🇳🇴', teamColor: 'from-sky-500 to-blue-600' },
      { name: 'Harry Kane', team: 'Tottenham', value: 24, avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', teamColor: 'from-blue-100 to-blue-300' },
      { name: 'Marcus Rashford', team: 'Manchester United', value: 22, avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', teamColor: 'from-red-500 to-red-800' },
      { name: 'Mohamed Salah', team: 'Liverpool', value: 19, avatar: '🇪🇬', teamColor: 'from-red-600 to-red-700' },
      { name: 'Gabriel Jesus', team: 'Arsenal', value: 16, avatar: '🇧🇷', teamColor: 'from-red-500 to-red-600' }
    ],
    assists: [
      { name: 'Kevin De Bruyne', team: 'Manchester City', value: 16, avatar: '🇧🇪', teamColor: 'from-sky-500 to-blue-600' },
      { name: 'Bruno Fernandes', team: 'Manchester United', value: 12, avatar: '🇵🇹', teamColor: 'from-red-500 to-red-800' },
      { name: 'Bukayo Saka', team: 'Arsenal', value: 11, avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', teamColor: 'from-red-500 to-red-600' },
      { name: 'Trent Alexander-Arnold', team: 'Liverpool', value: 10, avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', teamColor: 'from-red-600 to-red-700' },
      { name: 'Son Heung-min', team: 'Tottenham', value: 9, avatar: '🇰🇷', teamColor: 'from-blue-100 to-blue-300' }
    ],
    saves: [
      { name: 'Nick Pope', team: 'Newcastle', value: 142, avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', teamColor: 'from-gray-700 to-black' },
      { name: 'Alisson', team: 'Liverpool', value: 128, avatar: '🇧🇷', teamColor: 'from-red-600 to-red-700' },
      { name: 'Aaron Ramsdale', team: 'Arsenal', value: 115, avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', teamColor: 'from-red-500 to-red-600' },
      { name: 'Ederson', team: 'Manchester City', value: 98, avatar: '🇧🇷', teamColor: 'from-sky-500 to-blue-600' },
      { name: 'David de Gea', team: 'Manchester United', value: 89, avatar: '🇪🇸', teamColor: 'from-red-500 to-red-800' }
    ],
    rating: [
      { name: 'Erling Haaland', team: 'Manchester City', value: 8.9, avatar: '🇳🇴', teamColor: 'from-sky-500 to-blue-600' },
      { name: 'Kevin De Bruyne', team: 'Manchester City', value: 8.7, avatar: '🇧🇪', teamColor: 'from-sky-500 to-blue-600' },
      { name: 'Martin Ødegaard', team: 'Arsenal', value: 8.5, avatar: '🇳🇴', teamColor: 'from-red-500 to-red-600' },
      { name: 'Casemiro', team: 'Manchester United', value: 8.3, avatar: '🇧🇷', teamColor: 'from-red-500 to-red-800' },
      { name: 'Virgil van Dijk', team: 'Liverpool', value: 8.2, avatar: '🇳🇱', teamColor: 'from-red-600 to-red-700' }
    ]
  }

  return (
    <section id="players" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 section-title-container"
        >
          <h2 className="text-5xl font-bold text-white mb-6">PLAYER STATISTICS</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced player analytics and performance metrics
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg cursor-hover transition-all duration-300 ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'stadium-glass text-gray-300 hover:text-white'
              }`}
            >
              <category.icon size={24} />
              <span className="font-rajdhani">{category.name}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Player Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {playerData[selectedCategory].map((player, index) => (
            <Tilt key={player.name} tiltMaxAngleX={15} tiltMaxAngleY={15}>
              <motion.div
                initial={{ opacity: 0, y: 50, rotateY: -30 }}
                animate={inView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10, rotateY: 5 }}
                className="stadium-glass rounded-3xl p-6 cursor-hover team-card-hover relative overflow-hidden"
              >
                {/* Rank Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`w-10 h-10 bg-gradient-to-r ${categories.find(c => c.id === selectedCategory).color} rounded-full flex items-center justify-center text-white font-bold text-lg font-orbitron`}>
                    {index + 1}
                  </div>
                </div>

                {/* Player Avatar */}
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${player.teamColor} rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg`}>
                    {player.avatar}
                  </div>
                  <div className="text-white font-bold text-xl font-rajdhani mb-1">{player.name}</div>
                  <div className="text-gray-400 text-sm font-rajdhani">{player.team}</div>
                </div>

                {/* Stats */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-white font-orbitron mb-2">{player.value}</div>
                  <div className="text-gray-400 text-sm font-rajdhani uppercase">
                    {selectedCategory === 'rating' ? 'Average Rating' : categories.find(c => c.id === selectedCategory).name}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${(player.value / Math.max(...playerData[selectedCategory].map(p => p.value))) * 100}%` } : {}}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={`bg-gradient-to-r ${categories.find(c => c.id === selectedCategory).color} h-2 rounded-full`}
                    />
                  </div>
                </div>

                {/* Holographic Effect */}
                <div className="absolute inset-0 holographic opacity-20 rounded-3xl pointer-events-none"></div>
              </motion.div>
            </Tilt>
          ))}
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
            <div className="stadium-glass rounded-3xl p-8">
              <h3 className="text-3xl font-bold text-white mb-8 font-orbitron text-center">PERFORMANCE TRENDS</h3>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-white" size={32} />
                  </div>
                  <div className="text-2xl font-bold text-white font-orbitron mb-2">+15%</div>
                  <div className="text-gray-400 font-rajdhani">Goals This Month</div>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="text-white" size={32} />
                  </div>
                  <div className="text-2xl font-bold text-white font-orbitron mb-2">+8%</div>
                  <div className="text-gray-400 font-rajdhani">Assists This Month</div>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="text-white" size={32} />
                  </div>
                  <div className="text-2xl font-bold text-white font-orbitron mb-2">8.5</div>
                  <div className="text-gray-400 font-rajdhani">Average Rating</div>
                </div>
              </div>
            </div>
          </Tilt>
        </motion.div>
      </div>
    </section>
  )
}

export default PlayerStats
