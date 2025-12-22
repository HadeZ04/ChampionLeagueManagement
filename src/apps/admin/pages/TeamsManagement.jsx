import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import {
  Download,
  Edit,
  Eye,
  Filter,
  Loader2,
  Plus,
  Search,
  Shield,
  Trash2,
  Trophy,
  Upload,
  Users,
  X
} from 'lucide-react'
import TeamsService from '../../../layers/application/services/TeamsService'

const EMPTY_TEAM = {
  id: null,
  name: '',
  short_name: '',
  code: '',
  city: '',
  country: '',
  founded_year: ''
}

const TeamsManagement = () => {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [teams, setTeams] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    const delay = setTimeout(async () => {
      try {
        const filters = {
          search: searchTerm,
          page: pagination.page,
          limit: pagination.limit
        }
        const response = await TeamsService.getAllTeams(filters)
        if (!isMounted) return
        setTeams(response.teams || [])
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
          total: response.total
        }))
      } catch (err) {
        console.error('Failed to load teams', err)
        if (isMounted) {
          setError(err?.message || 'Unable to load teams from the server.')
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
  }, [searchTerm, pagination.page, pagination.limit, reloadKey])

  const totalPlayers = useMemo(
    () => teams.reduce((sum, team) => sum + (team.playerCount || 0), 0),
    [teams]
  )

  const openCreateModal = () => {
    setIsCreating(true)
    setEditingTeam({ ...EMPTY_TEAM })
    setShowTeamModal(true)
  }

  const openEditModal = (team) => {
    setIsCreating(false)
    setEditingTeam({
      id: team.id,
      name: team.name,
      short_name: team.short_name || '',
      code: team.code || '',
      city: team.city || '',
      country: team.country || '',
      founded_year: team.founded_year || ''
    })
    setShowTeamModal(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setShowTeamModal(false)
    setEditingTeam(null)
  }

  const handleDelete = async (teamId) => {
    const confirmed = window.confirm('Are you sure you want to remove this team?')
    if (!confirmed) return
    try {
      await TeamsService.deleteTeam(teamId)
      toast.success('Team deleted')
      setReloadKey(prev => prev + 1)
    } catch (err) {
      console.error('Failed to delete team', err)
      toast.error(err?.message || 'Could not delete team. Please try again.')
    }
  }

  const handleSaveTeam = async (event) => {
    event.preventDefault()
    if (!editingTeam) return

    const teamName = (editingTeam.name || '').trim()
    if (!teamName) {
      toast.error('Team name is required')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: teamName,
        short_name: editingTeam.short_name?.trim() ? editingTeam.short_name.trim() : null,
        code: editingTeam.code?.trim() ? editingTeam.code.trim() : null,
        city: editingTeam.city?.trim() ? editingTeam.city.trim() : null,
        country: editingTeam.country?.trim() ? editingTeam.country.trim() : null,
        founded_year: editingTeam.founded_year ? Number(editingTeam.founded_year) : null
      }

      if (isCreating) {
        await TeamsService.createTeam(payload)
        toast.success('Team created')
      } else {
        await TeamsService.updateTeam(editingTeam.id, payload)
        toast.success('Team updated')
      }

      closeModal()
      setReloadKey(prev => prev + 1)
    } catch (err) {
      console.error('Failed to save team', err)
      toast.error(err?.message || 'Could not save team. Please retry.')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-gray-500'
      case 'suspended':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
            <p className="text-gray-600 mt-2">Manage teams registered in your internal tournament system.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Add Team</span>
            </button>
            <button
              type="button"
              onClick={() => toast('Export not implemented yet')}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={() => toast('Import not implemented yet')}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Upload size={16} />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams by name, code, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => toast('More filters not implemented yet')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Teams ({pagination.total})</h2>
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>
        </div>

        {error && <div className="p-6 text-red-600 bg-red-50 border-b border-red-100">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Founded</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading teams...</span>
                    </div>
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No teams found for the selected criteria.
                  </td>
                </tr>
              ) : (
                teams.map(team => (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 ${getStatusColor(team.status)} rounded-lg flex items-center justify-center mr-3 text-white font-bold`}
                        >
                          <Shield size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{team.name}</div>
                          <div className="text-gray-500 text-sm">{team.short_name || 'No short name'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">{team.code || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {team.city && <div>{team.city}</div>}
                        {team.country && <div className="text-gray-500">{team.country}</div>}
                        {!team.city && !team.country && '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.founded_year || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(team.status)}`}
                      >
                        {team.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{team.playerCount || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/teams/${team.id}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View team details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(team)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Edit team"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(team.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete team"
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

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users size={24} className="text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
              <div className="text-gray-600 text-sm">Total Teams</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Shield size={24} className="text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalPlayers}</div>
              <div className="text-gray-600 text-sm">Total Players (loaded)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Trophy size={24} className="text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{teams.filter(t => t.status === 'active').length}</div>
              <div className="text-gray-600 text-sm">Active Teams</div>
            </div>
          </div>
        </div>
      </div>

      {showTeamModal && editingTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{isCreating ? 'Add Team' : 'Edit Team'}</h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveTeam} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
                  <input
                    type="text"
                    value={editingTeam.short_name}
                    onChange={(e) => setEditingTeam(prev => ({ ...prev, short_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={editingTeam.code}
                    onChange={(e) => setEditingTeam(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editingTeam.city}
                    onChange={(e) => setEditingTeam(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={editingTeam.country}
                    onChange={(e) => setEditingTeam(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                <input
                  type="number"
                  value={editingTeam.founded_year}
                  onChange={(e) => setEditingTeam(prev => ({ ...prev, founded_year: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max="2100"
                  disabled={isSaving}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamsManagement
