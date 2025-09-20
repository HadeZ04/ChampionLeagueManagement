import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { DollarSign, TrendingUp, TrendingDown, Clock, Star, Zap } from 'lucide-react'
import Tilt from 'react-parallax-tilt'
import confetti from 'canvas-confetti'

const TransferMarket = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [transferFilter, setTransferFilter] = useState('all')

  const transfers = [
    {
      id: 1,
      player: 'Kylian Mbappé',
      from: 'PSG',
      to: 'Real Madrid',
      value: '€180M',
      status: 'completed',
      avatar: '🇫🇷',
      position: 'Forward',
      age: 24,
      rating: 9.2,
      fromColor: 'from-blue-600 to-red-600',
      toColor: 'from-white to-purple-600',
      trend: 'up'
    },
    {
      id: 2,
      player: 'Jude Bellingham',
      from: 'Borussia Dortmund',
      to: 'Liverpool',
      value: '€120M',
      status: 'pending',
      avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      position: 'Midfielder',
      age: 20,
      rating: 8.8,
      fromColor: 'from-yellow-500 to-black',
      toColor: 'from-red-600 to-red-700',
      trend: 'up'
    },
    {
      id: 3,
      player: 'Victor Osimhen',
      from: 'Napoli',
      to: 'Manchester United',
      value: '€100M',
      status: 'rumored',
      avatar: '🇳🇬',
      position: 'Forward',
      age: 24,
      rating: 8.6,
      fromColor: 'from-blue-500 to-blue-700',
      toColor: 'from-red-500 to-red-800',
      trend: 'up'
    },
    {
      id: 4,
      player: 'Declan Rice',
      from: 'West Ham',
      to: 'Arsenal',
      value: '€85M',
      status: 'completed',
      avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      position: 'Midfielder',
      age: 24,
      rating: 8.4,
      fromColor: 'from-red-800 to-blue-800',
      toColor: 'from-red-500 to-red-600',
      trend: 'up'
    },
    {
      id: 5,
      player: 'Mason Mount',
      from: 'Chelsea',
      to: 'Manchester United',
      value: '€70M',
      status: 'completed',
      avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      position: 'Midfielder',
      age: 25,
      rating: 8.2,
      fromColor: 'from-blue-500 to-blue-700',
      toColor: 'from-red-500 to-red-800',
      trend: 'same'
    }
  ]

  const filters = [
    { id: 'all', name: 'All Transfers', color: 'from-gray-500 to-gray-600' },
    { id: 'completed', name: 'Completed', color: 'from-green-500 to-green-600' },
    { id: 'pending', name: 'Pending', color: 'from-yellow-500 to-yellow-600' },
    { id: 'rumored', name: 'Rumors', color: 'from-purple-500 to-purple-600' }
  ]

  const filteredTransfers = transferFilter === 'all' 
    ? transfers 
    : transfers.filter(transfer => transfer.status === transferFilter)

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500 animate-pulse'
      case 'rumored': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUp className="text-green-400" size={16} />
      case 'down': return <TrendingDown className="text-red-400" size={16} />
      default: return <div className="w-4 h-4"></div>
    }
  }

  const handleTransferClick = (transfer) => {
    setSelectedPlayer(selectedPlayer === transfer.id ? null : transfer.id)
    if (transfer.status === 'completed') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00ff88', '#00ccff', '#ff0080']
      })
    }
  }

  return (
    <section id="transfers" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 section-title-container"
        >
          <h2 className="text-5xl font-bold text-white mb-6">TRANSFER MARKET</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Latest transfers, rumors, and market valuations
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTransferFilter(filter.id)}
              className={`px-8 py-4 rounded-2xl font-bold text-lg cursor-hover transition-all duration-300 ${
                transferFilter === filter.id
                  ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                  : 'stadium-glass text-gray-300 hover:text-white'
              }`}
            >
              <span className="font-rajdhani">{filter.name}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Transfer Cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          <AnimatePresence mode="wait">
            {filteredTransfers.map((transfer, index) => (
              <Tilt key={transfer.id} tiltMaxAngleX={10} tiltMaxAngleY={10}>
                <motion.div
                  initial={{ opacity: 0, y: 50, rotateX: -30 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -50, rotateX: 30 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, rotateX: 5 }}
                  onClick={() => handleTransferClick(transfer)}
                  className={`stadium-glass rounded-3xl p-8 cursor-hover transition-all duration-500 relative overflow-hidden ${
                    selectedPlayer === transfer.id ? 'ring-2 ring-green-400 scale-105' : ''
                  }`}
                >
                  {/* Status Badge */}
                  <div className="absolute top-6 right-6">
                    <div className={`px-4 py-2 ${getStatusColor(transfer.status)} rounded-full text-white text-sm font-bold font-rajdhani uppercase`}>
                      {transfer.status}
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-4xl">
                      {transfer.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-white font-rajdhani mb-2">{transfer.player}</div>
                      <div className="flex items-center space-x-4 text-gray-400">
                        <span className="font-rajdhani">{transfer.position}</span>
                        <span className="font-rajdhani">Age: {transfer.age}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-400" size={16} />
                          <span className="font-rajdhani">{transfer.rating}</span>
                        </div>
                      </div>
                    </div>
                    {getTrendIcon(transfer.trend)}
                  </div>

                  {/* Transfer Flow */}
                  <div className="flex items-center justify-between mb-6">
                    {/* From Team */}
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${transfer.fromColor} rounded-xl flex items-center justify-center mb-3`}>
                        <div className="text-white font-bold text-sm">FROM</div>
                      </div>
                      <div className="text-white font-medium font-rajdhani">{transfer.from}</div>
                    </div>

                    {/* Arrow and Value */}
                    <div className="flex-1 flex flex-col items-center mx-6">
                      <motion.div
                        animate={{ x: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-4xl mb-2"
                      >
                        ➡️
                      </motion.div>
                      <div className="text-3xl font-bold text-green-400 font-orbitron">{transfer.value}</div>
                    </div>

                    {/* To Team */}
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${transfer.toColor} rounded-xl flex items-center justify-center mb-3`}>
                        <div className="text-white font-bold text-sm">TO</div>
                      </div>
                      <div className="text-white font-medium font-rajdhani">{transfer.to}</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <AnimatePresence>
                    {selectedPlayer === transfer.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/10 pt-6"
                      >
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-white font-orbitron">15</div>
                            <div className="text-gray-400 text-sm font-rajdhani">Goals</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-white font-orbitron">8</div>
                            <div className="text-gray-400 text-sm font-rajdhani">Assists</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-white font-orbitron">28</div>
                            <div className="text-gray-400 text-sm font-rajdhani">Matches</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Holographic Effect */}
                  <div className="absolute inset-0 holographic opacity-10 rounded-3xl pointer-events-none"></div>
                </motion.div>
              </Tilt>
            ))}
          </AnimatePresence>
        </div>

        {/* Market Summary */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
            <div className="stadium-glass rounded-3xl p-8">
              <h3 className="text-3xl font-bold text-white mb-8 font-orbitron text-center">MARKET OVERVIEW</h3>
              
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="text-white" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-white font-orbitron mb-2">€2.1B</div>
                  <div className="text-gray-400 font-rajdhani">Total Spent</div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-white" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-white font-orbitron mb-2">+25%</div>
                  <div className="text-gray-400 font-rajdhani">Market Growth</div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-white" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-white font-orbitron mb-2">156</div>
                  <div className="text-gray-400 font-rajdhani">Active Deals</div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="text-white" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-white font-orbitron mb-2">€180M</div>
                  <div className="text-gray-400 font-rajdhani">Record Deal</div>
                </div>
              </div>
            </div>
          </Tilt>
        </motion.div>
      </div>
    </section>
  )
}

export default TransferMarket
