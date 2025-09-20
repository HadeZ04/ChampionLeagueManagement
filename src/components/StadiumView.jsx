import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Volume2, VolumeX, Maximize, Users, Thermometer, Wind } from 'lucide-react'
import Tilt from 'react-parallax-tilt'

const StadiumView = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [isMuted, setIsMuted] = useState(false)
  const [crowdNoise, setCrowdNoise] = useState(75)
  const [weather, setWeather] = useState({
    temp: 18,
    condition: 'Partly Cloudy',
    wind: '12 mph',
    humidity: '65%'
  })

  useEffect(() => {
    // Simulate dynamic crowd noise
    const interval = setInterval(() => {
      setCrowdNoise(prev => {
        const change = (Math.random() - 0.5) * 20
        return Math.max(30, Math.min(100, prev + change))
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const stadiumSections = [
    { name: 'North Stand', capacity: 15000, filled: 98, color: 'from-blue-500 to-blue-600' },
    { name: 'South Stand', capacity: 15000, filled: 95, color: 'from-red-500 to-red-600' },
    { name: 'East Stand', capacity: 12000, filled: 92, color: 'from-green-500 to-green-600' },
    { name: 'West Stand', capacity: 13000, filled: 97, color: 'from-purple-500 to-purple-600' }
  ]

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
          <h2 className="text-6xl font-bold epl-gradient mb-6 font-orbitron">STADIUM EXPERIENCE</h2>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-rajdhani">
            Immerse yourself in the atmosphere of world-class football stadiums
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Stadium View */}
          <div className="lg:col-span-2">
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.2 }}
                className="stadium-glass rounded-3xl overflow-hidden relative"
              >
                {/* Stadium Controls */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-3 stadium-glass rounded-xl text-white hover:text-green-400 transition-colors cursor-hover"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 stadium-glass rounded-xl text-white hover:text-green-400 transition-colors cursor-hover"
                    >
                      <Maximize size={20} />
                    </motion.button>
                  </div>
                  
                  <div className="flex items-center space-x-2 stadium-glass rounded-xl px-4 py-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-rajdhani font-bold">LIVE</span>
                  </div>
                </div>

                {/* Stadium Field */}
                <div className="relative h-96 pitch-texture field-pattern">
                  {/* Field Lines */}
                  <div className="absolute inset-0">
                    {/* Center Circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full opacity-50"></div>
                    
                    {/* Center Line */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white opacity-50"></div>
                    
                    {/* Penalty Areas */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-12 border-2 border-white border-b-0 opacity-50"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-12 border-2 border-white border-t-0 opacity-50"></div>
                    
                    {/* Goals */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-white opacity-75"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-white opacity-75"></div>
                  </div>

                  {/* Animated Players */}
                  <motion.div
                    animate={{ x: [100, 200, 150], y: [150, 100, 180] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute w-3 h-3 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    animate={{ x: [300, 250, 320], y: [200, 150, 220] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute w-3 h-3 bg-red-500 rounded-full"
                  />
                  <motion.div
                    animate={{ x: [180, 220, 190], y: [180, 140, 200] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    className="absolute w-2 h-2 bg-white rounded-full shadow-lg"
                  />

                  {/* Stadium Lights */}
                  <div className="absolute top-4 left-4 w-4 h-4 bg-yellow-300 rounded-full stadium-lights opacity-80"></div>
                  <div className="absolute top-4 right-4 w-4 h-4 bg-yellow-300 rounded-full stadium-lights opacity-80"></div>
                  <div className="absolute bottom-4 left-4 w-4 h-4 bg-yellow-300 rounded-full stadium-lights opacity-80"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 bg-yellow-300 rounded-full stadium-lights opacity-80"></div>
                </div>

                {/* Crowd Noise Indicator */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="stadium-glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-condensed font-bold">Crowd Atmosphere</span>
                      <span className="text-premier-gold font-display font-bold">{crowdNoise}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div
                        animate={{ width: `${crowdNoise}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-r from-epl-cyan to-premier-gold h-3 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Tilt>
          </div>

          {/* Stadium Info Panel */}
          <div className="space-y-6">
            {/* Weather Conditions */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
                <div className="stadium-glass rounded-3xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 font-display flex items-center">
                    <Thermometer className="mr-3 text-blue-400" size={24} />
                    WEATHER
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-condensed">Temperature</span>
                      <span className="text-white font-bold font-display">{weather.temp}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-rajdhani">Condition</span>
                      <span className="text-white font-condensed">{weather.condition}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-rajdhani">Wind</span>
                      <span className="text-white font-condensed">{weather.wind}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-rajdhani">Humidity</span>
                      <span className="text-white font-condensed">{weather.humidity}</span>
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.div>

            {/* Stadium Capacity */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
                <div className="stadium-glass rounded-3xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 font-display flex items-center">
                    <Users className="mr-3 text-epl-cyan" size={24} />
                    ATTENDANCE
                  </h3>
                  <div className="space-y-4">
                    {stadiumSections.map((section, index) => (
                      <motion.div
                        key={section.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-condensed">{section.name}</span>
                          <span className="text-white font-bold font-display">{section.filled}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${section.filled}%` }}
                            transition={{ duration: 1, delay: 1 + index * 0.1 }}
                            className={`bg-gradient-to-r ${section.color} h-2 rounded-full`}
                          />
                        </div>
                        <div className="text-xs text-gray-400 font-condensed">
                          {Math.round((section.capacity * section.filled) / 100).toLocaleString()} / {section.capacity.toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white font-display mb-2">
                        {stadiumSections.reduce((total, section) => 
                          total + Math.round((section.capacity * section.filled) /  100), 0).toLocaleString()}
                      </div>
                      <div className="text-gray-400 font-condensed">Total Attendance</div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.div>

            {/* Match Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
                <div className="stadium-glass rounded-3xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 font-display">LIVE STATS</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-condensed">Possession</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 font-bold font-display">58%</span>
                        <span className="text-gray-500">-</span>
                        <span className="text-red-400 font-bold font-display">42%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-condensed">Shots</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 font-bold font-display">12</span>
                        <span className="text-gray-500">-</span>
                        <span className="text-red-400 font-bold font-display">8</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-condensed">Corners</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 font-bold font-display">7</span>
                        <span className="text-gray-500">-</span>
                        <span className="text-red-400 font-bold font-display">4</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-condensed">Fouls</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 font-bold font-display">9</span>
                        <span className="text-gray-500">-</span>
                        <span className="text-red-400 font-bold font-display">11</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          </div>
        </div>

        {/* Stadium Features */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16"
        >
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
            <div className="stadium-glass rounded-3xl p-8">
              <h3 className="text-3xl font-bold text-white mb-8 font-display text-center">STADIUM FEATURES</h3>
              
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-white text-2xl">🏟️</div>
                  </div>
                  <div className="text-2xl font-bold text-white font-display mb-2">55,000</div>
                  <div className="text-gray-400 font-condensed">Capacity</div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-white text-2xl">🌱</div>
                  </div>
                  <div className="text-2xl font-bold text-white font-display mb-2">Hybrid</div>
                  <div className="text-gray-400 font-condensed">Pitch Type</div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-white text-2xl">💡</div>
                  </div>
                  <div className="text-2xl font-bold text-white font-display mb-2">LED</div>
                  <div className="text-gray-400 font-condensed">Lighting</div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-white text-2xl">🎵</div>
                  </div>
                  <div className="text-2xl font-bold text-white font-display mb-2">Dolby</div>
                  <div className="text-gray-400 font-condensed">Sound System</div>
                </div>
              </div>
            </div>
          </Tilt>
        </motion.div>
      </div>
    </section>
  )
}

export default StadiumView
