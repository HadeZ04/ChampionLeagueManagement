import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Trophy, Plus, Trash2, Save, Target } from 'lucide-react'
import { useTournament } from '../context/TournamentContext'

const MatchResults = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { teams, matches, results, addResult, regulations } = useTournament()
  
  const [formData, setFormData] = useState({
    matchId: '',
    team1: '',
    team2: '',
    score1: 0,
    score2: 0,
    venue: '',
    date: '',
    time: '',
    goals: []
  })

  const [errors, setErrors] = useState({})

  const addGoal = () => {
    setFormData({
      ...formData,
      goals: [...formData.goals, {
        player: '',
        team: '',
        type: 'A',
        time: ''
      }]
    })
  }

  const removeGoal = (index) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index)
    })
  }

  const updateGoal = (index, field, value) => {
    const updatedGoals = [...formData.goals]
    updatedGoals[index][field] = value
    setFormData({
      ...formData,
      goals: updatedGoals
    })
  }

  const handleMatchSelect = (matchId) => {
    const selectedMatch = matches.find(m => m.id === parseInt(matchId))
    if (selectedMatch) {
      setFormData({
        ...formData,
        matchId,
        team1: selectedMatch.team1,
        team2: selectedMatch.team2,
        venue: selectedMatch.venue,
        date: selectedMatch.date,
        time: selectedMatch.time
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.matchId) {
      newErrors.match = 'Please select a match'
    }

    if (formData.score1 < 0 || formData.score2 < 0) {
      newErrors.scores = 'Scores cannot be negative'
    }

    const totalGoals = formData.score1 + formData.score2
    if (formData.goals.length !== totalGoals) {
      newErrors.goals = `Number of goal details (${formData.goals.length}) must match total score (${totalGoals})`
    }

    formData.goals.forEach((goal, index) => {
      if (!goal.player.trim()) {
        newErrors[`goal_${index}_player`] = 'Player name is required'
      }

      if (!goal.team) {
        newErrors[`goal_${index}_team`] = 'Team is required'
      }

      const goalTime = parseInt(goal.time)
      if (!goal.time || goalTime < 0 || goalTime > regulations.maxGoalTime) {
        newErrors[`goal_${index}_time`] = `Goal time must be between 0 and ${regulations.maxGoalTime} minutes`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      addResult(formData)
      
      // Reset form
      setFormData({
        matchId: '',
        team1: '',
        team2: '',
        score1: 0,
        score2: 0,
        venue: '',
        date: '',
        time: '',
        goals: []
      })
      setErrors({})

      alert('Match result recorded successfully!')
    }
  }

  const availableMatches = matches.filter(match => 
    !results.some(result => result.matchId === match.id.toString())
  )

  return (
    <div className="section-light">
      <section className="min-h-screen py-20">
        <div className="container mx-auto px-6">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 section-title-container"
          >
            <h1 className="text-5xl font-bold text-white mb-6">MATCH RESULTS</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Record match results and player statistics
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Results Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="professional-card rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Trophy className="mr-3 text-football-green" size={28} />
                  Record Result
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Select Match *</label>
                    <select
                      value={formData.matchId}
                      onChange={(e) => handleMatchSelect(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                    >
                      <option value="">Choose a match</option>
                      {availableMatches.map(match => (
                        <option key={match.id} value={match.id}>
                          {match.team1} vs {match.team2} - {match.date}
                        </option>
                      ))}
                    </select>
                    {errors.match && <p className="text-red-400 text-sm mt-1">{errors.match}</p>}
                  </div>

                  {formData.team1 && formData.team2 && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2">{formData.team1} Score</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.score1}
                            onChange={(e) => setFormData({...formData, score1: parseInt(e.target.value) || 0})}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">{formData.team2} Score</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.score2}
                            onChange={(e) => setFormData({...formData, score2: parseInt(e.target.value) || 0})}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors"
                          />
                        </div>
                      </div>

                      {errors.scores && <p className="text-red-400 text-sm">{errors.scores}</p>}

                      {/* Goals Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">
                            Goal Details ({formData.goals.length}/{formData.score1 + formData.score2})
                          </h3>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={addGoal}
                            className="flex items-center space-x-2 px-3 py-2 bg-football-green rounded-lg text-white font-medium text-sm"
                          >
                            <Plus size={16} />
                            <span>Add Goal</span>
                          </motion.button>
                        </div>

                        {errors.goals && <p className="text-red-400 text-sm mb-4">{errors.goals}</p>}

                        <div className="space-y-4">
                          {formData.goals.map((goal, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-white/5 rounded-lg p-4 border border-white/10"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-white font-medium">Goal {index + 1}</h4>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeGoal(index)}
                                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              </div>

                              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-white font-medium mb-1 text-sm">Player *</label>
                                  <input
                                    type="text"
                                    value={goal.player}
                                    onChange={(e) => updateGoal(index, 'player', e.target.value)}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-football-green transition-colors text-sm"
                                    placeholder="Player name"
                                  />
                                  {errors[`goal_${index}_player`] && (
                                    <p className="text-red-400 text-xs mt-1">{errors[`goal_${index}_player`]}</p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-white font-medium mb-1 text-sm">Team *</label>
                                  <select
                                    value={goal.team}
                                    onChange={(e) => updateGoal(index, 'team', e.target.value)}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors text-sm"
                                  >
                                    <option value="">Select team</option>
                                    <option value={formData.team1}>{formData.team1}</option>
                                    <option value={formData.team2}>{formData.team2}</option>
                                  </select>
                                  {errors[`goal_${index}_team`] && (
                                    <p className="text-red-400 text-xs mt-1">{errors[`goal_${index}_team`]}</p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-white font-medium mb-1 text-sm">Type</label>
                                  <select
                                    value={goal.type}
                                    onChange={(e) => updateGoal(index, 'type', e.target.value)}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors text-sm"
                                  >
                                    {regulations.goalTypes.map(type => (
                                      <option key={type} value={type}>Type {type}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-white font-medium mb-1 text-sm">Time (min) *</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={regulations.maxGoalTime}
                                    value={goal.time}
                                    onChange={(e) => updateGoal(index, 'time', e.target.value)}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-football-green transition-colors text-sm"
                                    placeholder="0-90"
                                  />
                                  {errors[`goal_${index}_time`] && (
                                    <p className="text-red-400 text-xs mt-1">{errors[`goal_${index}_time`]}</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {formData.goals.length === 0 && (formData.score1 + formData.score2) > 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <Target size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Add goal details for each score</p>
                          </div>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-football-green rounded-lg text-white font-bold"
                      >
                        <Save size={20} />
                        <span>Record Result</span>
                      </motion.button>
                    </>
                  )}
                </form>
              </div>
            </motion.div>

            {/* Results List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="professional-card rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Trophy className="mr-3 text-football-green" size={28} />
                  Recent Results ({results.length})
                </h2>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`rounded-lg p-4 border ${
                        result.score1 > result.score2 ? 'match-result-win' :
                        result.score1 < result.score2 ? 'match-result-loss' :
                        'match-result-draw'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">{result.date} {result.time}</span>
                        <span className="text-gray-400 text-sm">{result.venue}</span>
                      </div>
                      
                      <div className="text-white font-bold text-lg mb-2">
                        {result.team1} {result.score1} - {result.score2} {result.team2}
                      </div>
                      
                      {result.goals && result.goals.length > 0 && (
                        <div className="text-gray-300 text-sm">
                          <p className="font-medium mb-1">Goals:</p>
                          {result.goals.map((goal, goalIndex) => (
                            <p key={goalIndex} className="text-xs">
                              {goal.time}' {goal.player} ({goal.team}) - Type {goal.type}
                            </p>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {results.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No results recorded yet.</p>
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

export default MatchResults
