import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Calendar, Clock, MapPin, Plus, Save } from 'lucide-react'
import { useTournament } from '../context/TournamentContext'
import { format } from 'date-fns'

const MatchSchedule = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { teams, matches, addMatch } = useTournament()
  
  const [formData, setFormData] = useState({
    round: 1,
    team1: '',
    team2: '',
    date: '',
    time: '',
    venue: ''
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.team1) {
      newErrors.team1 = 'Please select Team 1'
    }

    if (!formData.team2) {
      newErrors.team2 = 'Please select Team 2'
    }

    if (formData.team1 === formData.team2) {
      newErrors.teams = 'Teams must be different'
    }

    if (!formData.date) {
      newErrors.date = 'Match date is required'
    }

    if (!formData.time) {
      newErrors.time = 'Match time is required'
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      addMatch(formData)
      
      // Reset form
      setFormData({
        round: 1,
        team1: '',
        team2: '',
        date: '',
        time: '',
        venue: ''
      })
      setErrors({})

      alert('Match scheduled successfully!')
    }
  }

  const generateRoundRobin = () => {
    if (teams.length < 2) {
      alert('Need at least 2 teams to generate schedule')
      return
    }

    const newMatches = []
    
    // Round 1 - Home matches
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        newMatches.push({
          round: 1,
          team1: teams[i].name,
          team2: teams[j].name,
          date: '',
          time: '',
          venue: teams[i].stadium
        })
      }
    }

    // Round 2 - Away matches (reverse)
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        newMatches.push({
          round: 2,
          team1: teams[j].name,
          team2: teams[i].name,
          date: '',
          time: '',
          venue: teams[j].stadium
        })
      }
    }

    newMatches.forEach(match => addMatch(match))
    alert(`Generated ${newMatches.length} matches for round-robin tournament!`)
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
            <h1 className="text-5xl font-bold text-white mb-6">MATCH SCHEDULE</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Create and manage tournament match schedules
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Schedule Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="professional-card rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Calendar className="mr-3 text-football-green" size={28} />
                    Schedule Match
                  </h2>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateRoundRobin}
                    className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium text-sm"
                  >
                    Auto Generate
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Round</label>
                    <select
                      value={formData.round}
                      onChange={(e) => setFormData({...formData, round: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                    >
                      <option value={1}>Round 1</option>
                      <option value={2}>Round 2</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Team 1 *</label>
                      <select
                        value={formData.team1}
                        onChange={(e) => setFormData({...formData, team1: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      >
                        <option value="">Select Team 1</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.name}>{team.name}</option>
                        ))}
                      </select>
                      {errors.team1 && <p className="text-red-400 text-sm mt-1">{errors.team1}</p>}
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Team 2 *</label>
                      <select
                        value={formData.team2}
                        onChange={(e) => setFormData({...formData, team2: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      >
                        <option value="">Select Team 2</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.name}>{team.name}</option>
                        ))}
                      </select>
                      {errors.team2 && <p className="text-red-400 text-sm mt-1">{errors.team2}</p>}
                    </div>
                  </div>

                  {errors.teams && <p className="text-red-400 text-sm">{errors.teams}</p>}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Date *</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      />
                      {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Time *</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                      />
                      {errors.time && <p className="text-red-400 text-sm mt-1">{errors.time}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Venue *</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData({...formData, venue: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-football-green transition-colors"
                      placeholder="Enter venue"
                    />
                    {errors.venue && <p className="text-red-400 text-sm mt-1">{errors.venue}</p>}
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-football-green rounded-lg text-white font-bold"
                  >
                    <Save size={20} />
                    <span>Schedule Match</span>
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Match List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="professional-card rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Clock className="mr-3 text-football-green" size={28} />
                  Scheduled Matches ({matches.length})
                </h2>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {matches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-football-green font-bold text-sm">Round {match.round}</span>
                        <span className="text-gray-400 text-sm">{match.date} {match.time}</span>
                      </div>
                      
                      <div className="text-white font-bold text-lg mb-2">
                        {match.team1} vs {match.team2}
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm">
                        <MapPin size={16} className="mr-1" />
                        {match.venue}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {matches.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No matches scheduled yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MatchSchedule
