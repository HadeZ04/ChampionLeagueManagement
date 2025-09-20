import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Settings, Save, RotateCcw, Users, Trophy, Target, Clock } from 'lucide-react'
import { useTournament } from '../context/TournamentContext'

const AdminSettings = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { regulations, updateRegulations } = useTournament()
  const [formData, setFormData] = useState(regulations)
  const [newGoalType, setNewGoalType] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    updateRegulations(formData)
    alert('Regulations updated successfully!')
  }

  const resetToDefaults = () => {
    const defaultRegulations = {
      minAge: 16,
      maxAge: 40,
      maxForeignPlayers: 3,
      minPlayers: 15,
      maxPlayers: 22,
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
      goalTypes: ['A', 'B', 'C'],
      maxGoalTime: 90
    }
    setFormData(defaultRegulations)
  }

  const addGoalType = () => {
    if (newGoalType && !formData.goalTypes.includes(newGoalType)) {
      setFormData({
        ...formData,
        goalTypes: [...formData.goalTypes, newGoalType]
      })
      setNewGoalType('')
    }
  }

  const removeGoalType = (typeToRemove) => {
    setFormData({
      ...formData,
      goalTypes: formData.goalTypes.filter(type => type !== typeToRemove)
    })
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
            <h1 className="text-5xl font-bold text-white mb-6">ADMIN SETTINGS</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Configure tournament rules and regulations
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="professional-card rounded-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Settings className="mr-3 text-football-green" size={28} />
                  Tournament Regulations
                </h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetToDefaults}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 rounded-lg text-white font-medium"
                >
                  <RotateCcw size={16} />
                  <span>Reset to Defaults</span>
                </motion.button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Player Regulations */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Users className="mr-3 text-football-green" size={24} />
                    Player Regulations
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Minimum Age</label>
                      <input
                        type="number"
                        min="10"
                        max="50"
                        value={formData.minAge}
                        onChange={(e) => setFormData({...formData, minAge: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Maximum Age</label>
                      <input
                        type="number"
                        min="20"
                        max="60"
                        value={formData.maxAge}
                        onChange={(e) => setFormData({...formData, maxAge: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Maximum Foreign Players</label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={formData.maxForeignPlayers}
                      onChange={(e) => setFormData({...formData, maxForeignPlayers: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Minimum Players per Team</label>
                      <input
                        type="number"
                        min="11"
                        max="30"
                        value={formData.minPlayers}
                        onChange={(e) => setFormData({...formData, minPlayers: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Maximum Players per Team</label>
                      <input
                        type="number"
                        min="15"
                        max="35"
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Scoring System */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Trophy className="mr-3 text-football-green" size={24} />
                    Scoring System
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Win Points</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.winPoints}
                        onChange={(e) => setFormData({...formData, winPoints: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Draw Points</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={formData.drawPoints}
                        onChange={(e) => setFormData({...formData, drawPoints: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Loss Points</label>
                      <input
                        type="number"
                        min="0"
                        max="3"
                        value={formData.lossPoints}
                        onChange={(e) => setFormData({...formData, lossPoints: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Goal Regulations */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Target className="mr-3 text-football-green" size={24} />
                  Goal Regulations
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-white font-medium mb-2">Maximum Goal Time (minutes)</label>
                    <input
                      type="number"
                      min="90"
                      max="120"
                      value={formData.maxGoalTime}
                      onChange={(e) => setFormData({...formData, maxGoalTime: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Goal Types</label>
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={newGoalType}
                        onChange={(e) => setNewGoalType(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-football-green transition-colors"
                        placeholder="Add goal type (e.g., D)"
                        maxLength="1"
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addGoalType}
                        className="px-4 py-3 bg-football-green rounded-lg text-white font-medium"
                      >
                        Add
                      </motion.button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.goalTypes.map((type) => (
                        <motion.div
                          key={type}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20"
                        >
                          <span className="text-white font-medium">Type {type}</span>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}  whileTap={{ scale: 0.9 }}
                            onClick={() => removeGoalType(type)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            ×
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Settings Preview */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Clock className="mr-3 text-football-green" size={24} />
                  Current Settings Preview
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-football-green font-semibold mb-3">Player Rules</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Age Range:</span>
                        <span className="text-white">{formData.minAge}-{formData.maxAge} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Team Size:</span>
                        <span className="text-white">{formData.minPlayers}-{formData.maxPlayers} players</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Foreign:</span>
                        <span className="text-white">{formData.maxForeignPlayers} players</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-football-green font-semibold mb-3">Point System</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Win:</span>
                        <span className="text-white">{formData.winPoints} points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Draw:</span>
                        <span className="text-white">{formData.drawPoints} points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Loss:</span>
                        <span className="text-white">{formData.lossPoints} points</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-football-green font-semibold mb-3">Goal Rules</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Time:</span>
                        <span className="text-white">{formData.maxGoalTime} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Goal Types:</span>
                        <span className="text-white">{formData.goalTypes.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center mt-8">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-8 py-4 bg-football-green rounded-lg text-white font-bold text-lg mx-auto football-shadow"
                >
                  <Save size={24} />
                  <span>Save Regulations</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default AdminSettings
