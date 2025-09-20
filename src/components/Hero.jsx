import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Trophy, Users, Target, BarChart3 } from 'lucide-react'

const Hero = () => {
  const [currentStat, setCurrentStat] = useState(0)
  
  const stats = [
    { label: 'Active Clubs', value: '20', icon: Users },
    { label: 'Matches This Season', value: '380', icon: Target },
    { label: 'Total Goals', value: '1,047', icon: Trophy },
    { label: 'Live Statistics', value: '24/7', icon: BarChart3 }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative pt-20">
      {/* Field Lines Background */}
      <div className="absolute inset-0 field-lines opacity-5"></div>
      
      {/* Professional Corner Accents */}
      <div className="absolute top-20 left-0 w-32 h-32 border-l-2 border-t-2 border-football-green opacity-20"></div>
      <div className="absolute top-20 right-0 w-32 h-32 border-r-2 border-t-2 border-football-green opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-football-green opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-football-green opacity-20"></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black mb-8 text-white"
          >
            PREMIER LEAGUE
            <br />
            <span className="text-football-green">MANAGER</span>
            <motion.div
              className="floating-ball inline-block ml-4"
            >
              <div className="football-icon w-16 h-16"></div>
            </motion.div>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            The most comprehensive football management experience. 
            <span className="text-football-green font-semibold"> Manage your team</span>, 
            <span className="text-white font-semibold"> analyze performance</span>, 
            and <span className="text-football-green font-semibold">achieve greatness</span>.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-10 py-4 bg-football-green rounded-lg text-white font-bold text-lg professional-hover flex items-center space-x-3 football-shadow"
            >
              <Play className="group-hover:scale-110 transition-transform" size={20} />
              <span>START SEASON</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 professional-card rounded-lg text-white font-bold text-lg border border-white/20 hover:border-football-green/50 transition-all duration-300"
            >
              VIEW LEAGUE TABLE
            </motion.button>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -5 }}
                className={`professional-card rounded-xl p-6 professional-hover transition-all duration-300 ${
                  currentStat === index ? 'border-football-green scale-105' : ''
                }`}
              >
                <div className="w-12 h-12 bg-football-green rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <stat.icon className="text-white" size={24} />
                </div>
                <motion.div
                  key={currentStat === index ? 'active' : 'inactive'}
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">{stat.label}</div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating Football Elements */}
          <div className="absolute top-1/4 left-10 opacity-10">
            <div className="football-icon w-8 h-8 floating-ball"></div>
          </div>
          <div className="absolute bottom-1/4 right-10 opacity-10">
            <div className="football-icon w-12 h-12 floating-ball" style={{ animationDelay: '1s' }}></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
