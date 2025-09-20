import React from 'react'
import { MapPin, Users, Calendar, Trophy, Target, Shield } from 'lucide-react'

const TeamCard = ({ team }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'qualified':
        return 'border-l-uefa-green bg-uefa-green/5'
      case 'playoff':
        return 'border-l-uefa-yellow bg-uefa-yellow/5'
      case 'eliminated':
        return 'border-l-uefa-red bg-uefa-red/5'
      default:
        return 'border-l-uefa-gray bg-uefa-gray/5'
    }
  }

  return (
    <div className={`uefa-card p-6 border-l-4 ${getStatusColor(team.status)} group hover:shadow-xl transition-all duration-300`}>
      {/* Team Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img 
            src={team.logo} 
            alt={team.name}
            className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `data:image/svg+xml;base64,${btoa(`<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="32" fill="#003399"/><text x="32" y="38" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${team.name.substring(0, 3).toUpperCase()}</text></svg>`)}`
            }}
          />
          <div>
            <h3 className="font-bold text-uefa-dark text-xl group-hover:text-uefa-blue transition-colors">
              {team.name}
            </h3>
            <div className="flex items-center space-x-2 text-uefa-gray">
              <span className="text-lg">{team.countryFlag}</span>
              <span className="font-medium">{team.city}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-uefa-blue">#{team.position}</div>
          <div className="text-uefa-gray text-sm font-medium">Position</div>
        </div>
      </div>

      {/* Current Season Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-uefa-light-gray rounded-uefa group-hover:bg-uefa-blue/10 transition-colors">
          <div className="text-2xl font-bold text-uefa-dark">{team.points}</div>
          <div className="text-uefa-gray text-sm font-medium">Points</div>
        </div>
        <div className="text-center p-4 bg-uefa-light-gray rounded-uefa group-hover:bg-uefa-blue/10 transition-colors">
          <div className="text-2xl font-bold text-uefa-dark">{team.goalsFor}</div>
          <div className="text-uefa-gray text-sm font-medium">Goals</div>
        </div>
      </div>

      {/* Match Record */}
      <div className="flex justify-between items-center mb-6 p-4 bg-uefa-light-gray rounded-uefa">
        <div className="text-center">
          <div className="text-xl font-bold text-uefa-green">{team.won}</div>
          <div className="text-uefa-gray text-xs font-medium">Wins</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-uefa-yellow">{team.drawn}</div>
          <div className="text-uefa-gray text-xs font-medium">Draws</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-uefa-red">{team.lost}</div>
          <div className="text-uefa-gray text-xs font-medium">Losses</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-uefa-dark">
            {team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}{team.goalsFor - team.goalsAgainst}
          </div>
          <div className="text-uefa-gray text-xs font-medium">GD</div>
        </div>
      </div>

      {/* Team Information */}
      <div className="space-y-3 text-sm mb-6">
        <div className="flex items-center justify-between">
          <span className="text-uefa-gray flex items-center">
            <Users size={14} className="mr-2" />
            Coach:
          </span>
          <span className="text-uefa-dark font-semibold">{team.coach}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-uefa-gray flex items-center">
            <MapPin size={14} className="mr-2" />
            Stadium:
          </span>
          <span className="text-uefa-dark font-semibold">{team.stadium}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-uefa-gray flex items-center">
            <Target size={14} className="mr-2" />
            Capacity:
          </span>
          <span className="text-uefa-dark font-semibold">{team.capacity?.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-uefa-gray flex items-center">
            <Calendar size={14} className="mr-2" />
            Founded:
          </span>
          <span className="text-uefa-dark font-semibold">{team.founded}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-uefa-gray flex items-center">
            <Trophy size={14} className="mr-2" />
            UCL Titles:
          </span>
          <span className="text-uefa-dark font-semibold flex items-center">
            {team.titles}
            {team.titles > 0 && <Trophy size={14} className="ml-1 text-uefa-gold" />}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button className="flex-1 uefa-btn-primary text-sm py-2 group-hover:shadow-lg transition-all">
          Team Details
        </button>
        <button className="flex-1 uefa-btn-secondary text-sm py-2 group-hover:shadow-lg transition-all">
          Fixtures
        </button>
      </div>
    </div>
  )
}

export default TeamCard
