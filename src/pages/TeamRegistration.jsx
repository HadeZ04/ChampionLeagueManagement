import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Plus, Trash2, Save, Users, MapPin } from 'lucide-react'
import { useTournament } from '../context/TournamentContext'
import confetti from 'canvas-confetti'

const TeamRegistration = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { addTeam, regulations } = useTournament()
  
  const [formData, setFormData] = useState({
    name: '',
    stadium: '',
    players: []
  })

  const [errors, setErrors] = useState({})

  const addPlayer = () => {
    setFormData({
      ...formData,
      players: [...formData.players, {
        name: '',
        birthdate: '',
        type: 'Local',
        notes: ''
      }]
    })
  }

  const removePlayer = (index) => {
    setFormData({
      ...formData,
      players: formData.players.filter((_, i) => i !== index)
    })
  }

  const updatePlayer = (index, field, value) => {
    const updatedPlayers = [...formData.players]
    updatedPlayers[index][field] = value
    setFormData({
      ...formData,
      players: updatedPlayers
    })
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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required'
    }

    if (!formData.stadium.trim()) {
      newErrors.stadium = 'Home stadium is required'
    }

    if (formData.players.length < regulations.minPlayers) {
      newErrors.players = `Team must have at least ${regulations.minPlayers} players`
    }

    if (formData.players.length > regulations.maxPlayers) {
      newErrors.players = `Team cannot have more than ${regulations.maxPlayers} players`
    }

    const foreignPlayers = formData.players.filter(p => p.type === 'Foreign').length
    if (foreignPlayers > regulations.maxForeignPlayers) {
      newErrors.foreignPlayers = `Team cannot have more than ${regulations.maxForeignPlayers} foreign players`
    }

    formData.players.forEach((player, index) => {
      if (!player.name.trim()) {
        newErrors[`player_${index}_name`] = 'Player name is required'
      }

      if (!player.birthdate) {
        newErrors[`player_${index}_birthdate`] = 'Player birthdate is required'
      } else {
        const age = calculateAge(player.birthdate)
        if (age < regulations.minAge || age > regulations.maxAge) {
          newErrors[`player_${index}_age`] = `Player must be between ${regulations.minAge} and ${regulations.maxAge} years old`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      addTeam(formData)
      
      // Success animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#228B22', '#ffffff']
      })

      // Reset form
      setFormData({
        name: '',
        stadium: '',
        players: []
      })
      setErrors({})

      alert('Team registered successfully!')
    }
  }

  return (
    <div className="section-light">
      <section className="min-h-screen py-20 pt-32">
        <div className="container mx-auto px-6">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 section-title-container"
          >
            <h1 className="text-5xl font-bold text-white mb-6">TEAM REGISTRATION</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Register your football team for the tournament
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="professional-card rounded-xl p-8">
              {/* Team Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Users className="mr-3 text-football-green" size={28} />
                  Team Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Team Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-football-green transition-colors"
                      placeholder="Enter team name"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Home Stadium *</label>
                    <input
                      type="text"
                      value={formData.stadium}
                      onChange={(e) => setFormData({...formData, stadium: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-football-green transition-colors"
                      placeholder="Enter home stadium"
                    />
                    {errors.stadium && <p className="text-red-400 text-sm mt-1">{errors.stadium}</p>}
                  </div>
                </div>
              </div>

              {/* Players Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <MapPin className="mr-3 text-football-green" size={28} />
                    Players ({formData.players.length}/{regulations.maxPlayers})
                  </h2>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addPlayer}
                    disabled={formData.players.length >= regulations.maxPlayers}
                    className="flex items-center space-x-2 px-4 py-2 bg-football-green rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={20} />
                    <span>Add Player</span>
                  </motion.button>
                </div>

                {errors.players && <p className="text-red-400 text-sm mb-4">{errors.players}</p>}
                {errors.foreignPlayers && <p className="text-red-400 text-sm mb-4">{errors.foreignPlayers}</p>}

                <div className="space-y-4">
                  {formData.players.map((player, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="professional-card rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Player {index + 1}</h3>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removePlayer(index)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2">Name *</label>
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-football-green transition-colors"
                            placeholder="Player name"
                          />
                          {errors[`player_${index}_name`] && (
                            <p className="text-red-400 text-sm mt-1">{errors[`player_${index}_name`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Birthdate *</label>
                          <input
                            type="date"
                            value={player.birthdate}
                            onChange={(e) => updatePlayer(index, 'birthdate', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                          />
                          {errors[`player_${index}_birthdate`] && (
                            <p className="text-red-400 text-sm mt-1">{errors[`player_${index}_birthdate`]}</p>
                          )}
                          {errors[`player_${index}_age`] && (
                            <p className="text-red-400 text-sm mt-1">{errors[`player_${index}_age`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Type</label>
                          <select
                            value={player.type}
                            onChange={(e) => updatePlayer(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                          >
                            <option value="Local">Local</option>
                            <option value="Foreign">Foreign</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Notes</label>
                          <input
                            type="text"
                            value={player.notes}
                            onChange={(e) => updatePlayer(index, 'notes', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-football-green transition-colors"
                            placeholder="Optional notes"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {formData.players.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No players added yet. Click "Add Player" to start building your team.</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-8 py-4 bg-football-green rounded-lg text-white font-bold text-lg mx-auto football-shadow"
                >
                  <Save size={24} />
                  <span>Register Team</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default TeamRegistration
