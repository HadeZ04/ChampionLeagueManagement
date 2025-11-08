import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Info, Eye, BarChart3 } from 'lucide-react'

const StandingsTable = ({ standings, selectedGroup }) => {
  const [selectedTeam, setSelectedTeam] = useState(null)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'qualified':
        return <div className="uefa-badge uefa-badge-qualified">Q</div>
      case 'playoff':
        return <div className="uefa-badge uefa-badge-playoff">P</div>
      case 'eliminated':
        return <div className="uefa-badge uefa-badge-eliminated">E</div>
      default:
        return null
    }
  }

  const getFormBadge = (result) => {
    const baseClasses = "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
    switch (result) {
      case 'W':
        return <div className={`${baseClasses} bg-uefa-green`}>W</div>
      case 'D':
        return <div className={`${baseClasses} bg-uefa-yellow text-uefa-black`}>D</div>
      case 'L':
        return <div className={`${baseClasses} bg-uefa-red`}>L</div>
      default:
        return null
    }
  }

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp size={14} className="text-uefa-green" />
    if (change < 0) return <TrendingDown size={14} className="text-uefa-red" />
    return <Minus size={14} className="text-uefa-gray" />
  }

  const filteredStandings = selectedGroup === 'all' 
    ? standings 
    : standings.filter(team => team.status === selectedGroup)

  return (
    <div className="uefa-table-container">
      <div className="bg-gradient-to-r from-uefa-blue to-uefa-light-blue text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">League Phase Standings</h2>
        <div className="text-sm opacity-90">
          Last updated: {new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      
      <table className="uefa-table">
        <thead className="uefa-table-header">
          <tr>
            <th className="text-center w-12">#</th>
            <th className="text-center w-8"></th>
            <th className="text-left min-w-[200px]">Team</th>
            <th className="text-center w-12">P</th>
            <th className="text-center w-12">W</th>
            <th className="text-center w-12">D</th>
            <th className="text-center w-12">L</th>
            <th className="text-center w-16">GF</th>
            <th className="text-center w-16">GA</th>
            <th className="text-center w-16">GD</th>
            <th className="text-center w-16">Pts</th>
            <th className="text-center w-32 hidden lg:table-cell">Form</th>
            <th className="text-center w-12">Status</th>
          </tr>
        </thead>
        <tbody className="uefa-table-body">
          {filteredStandings.map((team, index) => (
            <tr 
              key={team.position} 
              className={`uefa-table-row cursor-pointer transition-all duration-300 ${
                selectedTeam === team.position ? 'bg-uefa-blue/10 border-l-4 border-uefa-blue' :
                team.position <= 8 ? 'hover:bg-green-50' :
                team.position <= 24 ? 'hover:bg-yellow-50' :
                'hover:bg-red-50'
              }`}
              onClick={() => setSelectedTeam(selectedTeam === team.position ? null : team.position)}
            >
              <td className="uefa-table-cell text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="font-bold text-uefa-dark text-lg">{team.position}</span>
                  {team.change > 0 && <TrendingUp size={12} className="text-uefa-green" />}
                  {team.change < 0 && <TrendingDown size={12} className="text-uefa-red" />}
                  {team.change === 0 && <div className="w-3"></div>}
                </div>
              </td>
              <td className="uefa-table-cell text-center">
                <span className="text-xs text-uefa-gray font-bold bg-uefa-light-gray px-1 py-0.5 rounded">
                  {team.country}
                </span>
              </td>
              <td className="uefa-table-cell">
                <div className="flex items-center space-x-3">
                  <img 
                    src={team.logo} 
                    alt={team.team}
                    className="w-8 h-8 object-contain hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml;base64,${btoa(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#003399"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${team.team.substring(0, 3).toUpperCase()}</text></svg>`)}`
                    }}
                  />
                  <div>
                    <div className="uefa-team-name font-semibold text-uefa-dark hover:text-uefa-blue transition-colors">
                      {team.team}
                    </div>
                    <div className="text-xs text-uefa-gray">{team.countryFlag}</div>
                  </div>
                </div>
              </td>
              <td className="uefa-table-cell text-center text-uefa-dark font-medium">{team.played}</td>
              <td className="uefa-table-cell text-center text-uefa-green font-bold">{team.won}</td>
              <td className="uefa-table-cell text-center text-uefa-yellow font-bold">{team.drawn}</td>
              <td className="uefa-table-cell text-center text-uefa-red font-bold">{team.lost}</td>
              <td className="uefa-table-cell text-center text-uefa-dark font-medium">{team.goalsFor}</td>
              <td className="uefa-table-cell text-center text-uefa-dark font-medium">{team.goalsAgainst}</td>
              <td className="uefa-table-cell text-center font-bold text-uefa-dark">
                <span className={team.goalDifference > 0 ? 'text-uefa-green' : team.goalDifference < 0 ? 'text-uefa-red' : 'text-uefa-gray'}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </span>
              </td>
              <td className="uefa-table-cell text-center font-bold text-xl text-uefa-blue">
                {team.points}
              </td>
              <td className="uefa-table-cell text-center hidden lg:table-cell">
                <div className="flex items-center justify-center space-x-1">
                  {team.form.map((result, formIndex) => (
                    <div key={formIndex} title={`Match ${formIndex + 1}: ${result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}`}>
                      {getFormBadge(result)}
                    </div>
                  ))}
                </div>
              </td>
              <td className="uefa-table-cell text-center">
                {getStatusBadge(team.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StandingsTable
