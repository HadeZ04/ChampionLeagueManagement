import React, { useEffect, useMemo, useState } from 'react'
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
  Upload,
  Loader2
} from 'lucide-react'
import PlayersService from '../../../layers/application/services/PlayersService'
import TeamsService from '../../../layers/application/services/TeamsService'
import SeasonPlayerRegistrationForm from '../components/SeasonPlayerRegistrationForm'
import ImportPlayersCsvModal from '../components/ImportPlayersCsvModal'

const defaultTeamsOption = [{ id: 'all', name: 'Tất cả đội' }]

const PlayersManagement = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [teams, setTeams] = useState(defaultTeamsOption)
  const [players, setPlayers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchTeams = async () => {
      try {
        const response = await TeamsService.getAllTeams({ limit: 100 })
        if (!isMounted) return
        const mappedTeams = (response.teams || []).map(team => ({
          id: team.id,
          name: team.name
        }))
        setTeams([...defaultTeamsOption, ...mappedTeams])
      } catch (err) {
        console.error('Failed to load teams', err)
      }
    }
    fetchTeams()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    const delay = setTimeout(async () => {
      try {
        const filters = {
          search: searchTerm,
          position: selectedPosition !== 'all' && selectedPosition !== 'Tất cả vị trí' ? selectedPosition : '',
          teamId: selectedTeam !== 'all' ? Number(selectedTeam) : '',
          page: pagination.page,
          limit: pagination.limit
        }
        const response = await PlayersService.listPlayers(filters)
        if (!isMounted) return
        setPlayers(response.players || [])
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
          total: response.total
        }))
      } catch (err) {
        console.error('Failed to load players', err)
        if (isMounted) {
          setError('Không thể tải cầu thủ từ máy chủ.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      isMounted = false
      clearTimeout(delay)
    }
  }, [searchTerm, selectedTeam, selectedPosition, pagination.page, pagination.limit])

  const positions = useMemo(() => {
    const set = new Set(players.map(player => player.preferred_position || 'Unknown'))
    return ['Tất cả vị trí', ...Array.from(set)]
  }, [players])

  const totalGoals = useMemo(
    () => players.reduce((sum, player) => sum + (player.goals || 0), 0),
    [players]
  )
  const totalAssists = useMemo(
    () => players.reduce((sum, player) => sum + (player.assists || 0), 0),
    [players]
  )

  const handleEdit = (player) => {
    setEditingPlayer({
      id: player.player_id,
      name: player.full_name,
      position: player.preferred_position || '',
      nationality: player.nationality || '',
      shirtNumber: '' // Internal players don't have shirt numbers
    })
    setShowEditModal(true)
  }

  const handleDelete = async (playerId) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa cầu thủ này?')
    if (!confirmed) return
    try {
      await PlayersService.deletePlayer(playerId)
      setPlayers(prev => prev.filter(player => player.player_id !== playerId))
    } catch (err) {
      console.error('Failed to delete player', err)
      alert('Không thể xóa cầu thủ. Vui lòng thử lại.')
    }
  }

  const handleUpdatePlayer = async (event) => {
    event.preventDefault()
    if (!editingPlayer) return
    try {
      const payload = {
        name: editingPlayer.name,
        position: editingPlayer.position || null,
        nationality: editingPlayer.nationality || null,
        shirtNumber: editingPlayer.shirtNumber === '' ? null : Number(editingPlayer.shirtNumber)
      }
      const updated = await PlayersService.updatePlayer(editingPlayer.id, payload)
      setPlayers(prev =>
        prev.map(player => (player.player_id === updated.player_id ? { ...player, ...updated } : player))
      )
      setShowEditModal(false)
    } catch (err) {
      console.error('Failed to update player', err)
      alert('Could not update player. Please retry.')
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      await PlayersService.syncPlayers()
      setPagination(prev => ({ ...prev }))
    } catch (err) {
      console.error('Failed to sync players', err)
      alert('Unable to sync players from upstream API.')
    } finally {
      setSyncing(false)
    }
  }

  const getPositionColor = (position) => {
    const pos = (position || '').toLowerCase()
    if (pos.includes('goalkeeper')) return 'bg-yellow-500'
    if (pos.includes('defence') || pos.includes('back')) return 'bg-blue-500'
    if (pos.includes('midfield')) return 'bg-green-500'
    if (pos.includes('offence') || pos.includes('forward') || pos.includes('attack')) return 'bg-red-500'
    return 'bg-gray-500'
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Players Management</h1>
            <p className="text-gray-600 mt-2">
              Sync, review and edit player information retrieved from the official data feed.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Upload size={16} />
              <span>Import danh sách cầu thủ (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      <SeasonPlayerRegistrationForm currentUser={currentUser} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search players by name or club..."
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
              {teams.map((team, index) => (
                <option key={`team-${team.id}-${index}`} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {positions.map((position, index) => (
                <option key={`position-${position}-${index}`} value={position === 'All Positions' ? 'all' : position}>
                  {position}
                </option>
              ))}
            </select>

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Players ({pagination.total})
            </h2>
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shirt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Season</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading players...</span>
                    </div>
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No players found for the selected criteria.
                  </td>
                </tr>
              ) : (
                players.map(player => (
                  <tr key={player.player_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 ${getPositionColor(player.preferred_position)} rounded-lg flex items-center justify-center mr-3 text-white font-bold text-xs`}
                        >
                          {player.player_id}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{player.full_name}</div>
                          <div className="text-gray-500 text-sm">
                            {player.date_of_birth
                              ? `Born: ${new Date(player.date_of_birth).toLocaleDateString()}`
                              : 'No birth date'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.team_name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getPositionColor(player.preferred_position)}`}>
                        {player.preferred_position || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.nationality || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      —
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Current
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingPlayer(player)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(player)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(player.player_id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users size={24} className="text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
              <div className="text-gray-600 text-sm">Total Players</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Target size={24} className="text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalGoals}</div>
              <div className="text-gray-600 text-sm">Goals (season)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Trophy size={24} className="text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalAssists}</div>
              <div className="text-gray-600 text-sm">Assists (season)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar size={24} className="text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{teams.length - 1}</div>
              <div className="text-gray-600 text-sm">Teams Covered</div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && editingPlayer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Player</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdatePlayer} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={editingPlayer.position}
                    onChange={(e) => setEditingPlayer(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={editingPlayer.nationality}
                    onChange={(e) => setEditingPlayer(prev => ({ ...prev, nationality: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shirt Number</label>
                <input
                  type="number"
                  value={editingPlayer.shirtNumber}
                  onChange={(e) => setEditingPlayer(prev => ({ ...prev, shirtNumber: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="99"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      <ImportPlayersCsvModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          alert("Import cầu thủ thành công!");
          // Trigger reload by resetting page
          setPagination(prev => ({ ...prev, page: 1 }));
        }}
      />
    </div>
  )
}

export default PlayersManagement

