import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Calendar, 
  Target,
  Trophy,
  Download,
  Upload
} from 'lucide-react'

const PlayersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const players = [
    {
      id: 1,
      name: 'Mohamed Salah',
      team: 'Liverpool',
      teamId: 1,
      position: 'Forward',
      jerseyNumber: 11,
      nationality: 'Egypt',
      age: 31,
      goals: 5,
      assists: 3,
      appearances: 6,
      minutesPlayed: 487,
      status: 'active'
    },
    {
      id: 2,
      name: 'Robert Lewandowski',
      team: 'Barcelona',
      teamId: 2,
      position: 'Forward',
      jerseyNumber: 9,
      nationality: 'Poland',
      age: 35,
      goals: 7,
      assists: 2,
      appearances: 6,
      minutesPlayed: 523,
      status: 'active'
    },
    {
      id: 3,
      name: 'Virgil van Dijk',
      team: 'Liverpool',
      teamId: 1,
      position: 'Defender',
      jerseyNumber: 4,
      nationality: 'Netherlands',
      age: 32,
      goals: 1,
      assists: 0,
      appearances: 6,
      minutesPlayed: 540,
      status: 'active'
    }
  ]

  const teams = [
    { id: 'all', name: 'All Teams' },
    { id: 1, name: 'Liverpool' },
    { id: 2, name: 'Barcelona' },
    { id: 3, name: 'Arsenal' }
  ]

  const positions = [
    { id: 'all', name: 'All Positions' },
    { id: 'goalkeeper', name: 'Goalkeeper' },
    { id: 'defender', name: 'Defender' },
    { id: 'midfielder', name: 'Midfielder' },
    { id: 'forward', name: 'Forward' }
  ]

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeam = selectedTeam === 'all' || player.teamId === parseInt(selectedTeam)
    const matchesPosition = selectedPosition === 'all' || player.position.toLowerCase() === selectedPosition
    return matchesSearch && matchesTeam && matchesPosition
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>
      case 'injured':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Injured</span>
      case 'suspended':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Suspended</span>
      default:
        return null
    }
  }

  const getPositionColor = (position) => {
    switch (position) {
      case 'Goalkeeper':
        return 'bg-yellow-500'
      case 'Defender':
        return 'bg-blue-500'
      case 'Midfielder':
        return 'bg-green-500'
      case 'Forward':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Players Management</h1>
            <p className="text-gray-600 mt-2">Manage all players in the Champions League</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download size={16} />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Upload size={16} />
              <span>Import</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Add Player</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search players, teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Players ({filteredPlayers.length})</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Showing {filteredPlayers.length} players</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assists</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apps</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${getPositionColor(player.position)} rounded-lg flex items-center justify-center mr-3`}>
                        <span className="text-white font-bold text-sm">
                          {player.jerseyNumber}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{player.name}</div>
                        <div className="text-gray-500 text-sm">{player.nationality}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.team}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Target size={16} className="text-green-500 mr-1" />
                      <span className="text-sm font-bold text-gray-900">{player.goals}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users size={16} className="text-blue-500 mr-1" />
                      <span className="text-sm font-bold text-gray-900">{player.assists}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.appearances}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(player.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedPlayer(player)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users size={24} className="text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{players.length}</div>
              <div className="text-gray-600 text-sm">Total Players</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Target size={24} className="text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {players.reduce((sum, p) => sum + p.goals, 0)}
              </div>
              <div className="text-gray-600 text-sm">Total Goals</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Trophy size={24} className="text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {players.reduce((sum, p) => sum + p.assists, 0)}
              </div>
              <div className="text-gray-600 text-sm">Total Assists</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar size={24} className="text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {(players.reduce((sum, p) => sum + p.minutesPlayed, 0) / players.length / 90).toFixed(1)}
              </div>
              <div className="text-gray-600 text-sm">Avg Games</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayersManagement
