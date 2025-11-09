import React, { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  CheckCircle,
  AlertCircle,
  Play,
  Loader2
} from 'lucide-react'
import MatchesService from '../../../layers/application/services/MatchesService'

const statusOptions = [
  { id: 'all', name: 'All Matches' },
  { id: 'SCHEDULED', name: 'Scheduled' },
  { id: 'LIVE', name: 'Live' },
  { id: 'IN_PLAY', name: 'In Play' },
  { id: 'PAUSED', name: 'Paused' },
  { id: 'FINISHED', name: 'Completed' },
  { id: 'POSTPONED', name: 'Postponed' },
  { id: 'CANCELLED', name: 'Cancelled' }
]

const statusBadge = (status) => {
  const normalized = status?.toUpperCase() || ''
  switch (normalized) {
    case 'SCHEDULED':
    case 'TIMED':
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Scheduled</span>
    case 'LIVE':
    case 'IN_PLAY':
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">Live</span>
    case 'FINISHED':
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>
    case 'POSTPONED':
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Postponed</span>
    case 'CANCELLED':
      return <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">Cancelled</span>
    default:
      return <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">{status}</span>
  }
}

const statusIcon = (status) => {
  const normalized = status?.toUpperCase() || ''
  switch (normalized) {
    case 'SCHEDULED':
    case 'TIMED':
      return <Clock size={16} className="text-blue-500" />
    case 'LIVE':
    case 'IN_PLAY':
      return <Play size={16} className="text-red-500" />
    case 'FINISHED':
      return <CheckCircle size={16} className="text-green-500" />
    case 'POSTPONED':
    case 'CANCELLED':
      return <AlertCircle size={16} className="text-yellow-500" />
    default:
      return <Clock size={16} className="text-gray-500" />
  }
}

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const MatchesManagement = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all'
  })
  const [matches, setMatches] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchMatches = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await MatchesService.getExternalMatches({
          status: filters.status === 'all' ? '' : filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          page: pagination.page,
          limit: pagination.limit
        })
        if (!isMounted) return
        setMatches(response.matches || [])
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
          total: response.total
        }))
      } catch (err) {
        console.error('Failed to load matches', err)
        if (isMounted) {
          setError('Unable to load matches from the server.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    fetchMatches()
    return () => {
      isMounted = false
    }
  }, [filters, pagination.page, pagination.limit])

  const totals = useMemo(() => {
    const counters = {
      scheduled: 0,
      finished: 0,
      live: 0
    }
    matches.forEach(match => {
      const status = match.status?.toUpperCase()
      if (status === 'FINISHED') counters.finished += 1
      else if (status === 'SCHEDULED' || status === 'TIMED') counters.scheduled += 1
      else if (status === 'LIVE' || status === 'IN_PLAY') counters.live += 1
    })
    return counters
  }, [matches])

  const handleSync = async () => {
    try {
      setSyncing(true)
      const result = await MatchesService.syncMatches({
        status: filters.status === 'all' ? '' : filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      })
      
      // Show success message
      if (result?.data?.results?.matches) {
        const { totalMatches, syncedMatches, skippedMatches } = result.data.results.matches
        alert(`✅ Successfully synced ${totalMatches || syncedMatches} matches from Football-Data.org API!\n\n${skippedMatches ? `⚠️ Skipped ${skippedMatches} matches with incomplete data.` : ''}`)
      }
      
      // Force reload matches
      const response = await MatchesService.getExternalMatches({
        status: filters.status === 'all' ? '' : filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        page: pagination.page,
        limit: pagination.limit
      })
      setMatches(response.matches || [])
      setPagination(prev => ({
        ...prev,
        ...response.pagination,
        total: response.total
      }))
    } catch (err) {
      console.error('Failed to sync matches', err)
      alert('Unable to sync match data from upstream API.')
    } finally {
      setSyncing(false)
    }
  }

  const handleDelete = async (matchId) => {
    if (!window.confirm('Are you sure you want to remove this match from the local schedule?')) {
      return
    }
    try {
      await MatchesService.deleteMatch(matchId)
      setMatches(prev => prev.filter(match => match.id !== matchId))
    } catch (err) {
      console.error('Failed to delete match', err)
      alert('Could not delete match. Please try again.')
    }
  }

  const openEditModal = (match) => {
    setEditingMatch({
      id: match.id,
      status: match.status,
      venue: match.venue || '',
      referee: match.referee || '',
      scoreHome: match.scoreHome ?? '',
      scoreAway: match.scoreAway ?? ''
    })
    setShowEditModal(true)
  }

  const handleUpdateMatch = async (event) => {
    event.preventDefault()
    if (!editingMatch) return
    try {
      const payload = {
        status: editingMatch.status,
        venue: editingMatch.venue || null,
        referee: editingMatch.referee || null,
        scoreHome: editingMatch.scoreHome === '' ? null : Number(editingMatch.scoreHome),
        scoreAway: editingMatch.scoreAway === '' ? null : Number(editingMatch.scoreAway)
      }
      const updated = await MatchesService.updateMatch(editingMatch.id, payload)
      setMatches(prev => prev.map(match => (match.id === updated.id ? { ...match, ...updated } : match)))
      setShowEditModal(false)
    } catch (err) {
      console.error('Failed to update match', err)
      alert('Could not update match. Please retry.')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matches Management</h1>
            <p className="text-gray-600 mt-2">
              View real fixtures and results from the Champions League data feed, edit local details or remove entries.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSync}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={syncing}
            >
              {syncing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              <span>{syncing ? 'Syncing...' : 'Sync Matches'}</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download size={16} />
              <span>Export Schedule</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              placeholder="From"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              placeholder="To"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            >
              {statusOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Matches ({pagination.total})</h2>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officials</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading matches...</span>
                    </div>
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No matches found for the selected filters.
                  </td>
                </tr>
              ) : (
                matches.map(match => (
                  <tr key={match.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {statusIcon(match.status)}
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {match.homeTeamName} vs {match.awayTeamName}
                          </div>
                          <div className="text-gray-500 text-sm">
                            Matchday {match.matchday ?? '—'}
                          </div>
                          {typeof match.scoreHome === 'number' && typeof match.scoreAway === 'number' && (
                            <div className="text-blue-600 font-bold text-sm">
                              {match.scoreHome} - {match.scoreAway}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(match.utcDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(match.utcDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 space-x-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{match.venue || 'TBC'}</span>
                      </div>
                      <div className="text-sm text-gray-500">{match.stage || match.groupName || 'League Phase'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{match.referee || 'Not assigned'}</div>
                      <div className="text-xs text-gray-500">Updated {new Date(match.updatedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusBadge(match.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingMatch(match)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(match)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(match.id)}
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
            <Calendar size={24} className="text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
              <div className="text-gray-600 text-sm">Total Matches</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle size={24} className="text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totals.finished}</div>
              <div className="text-gray-600 text-sm">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock size={24} className="text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totals.scheduled}</div>
              <div className="text-gray-600 text-sm">Scheduled</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Play size={24} className="text-red-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totals.live}</div>
              <div className="text-gray-600 text-sm">Live Now</div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && editingMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Update Match</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateMatch} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingMatch.status}
                  onChange={(e) => setEditingMatch(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions
                    .filter(option => option.id !== 'all')
                    .map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Score</label>
                  <input
                    type="number"
                    value={editingMatch.scoreHome}
                    onChange={(e) => setEditingMatch(prev => ({ ...prev, scoreHome: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Away Score</label>
                  <input
                    type="number"
                    value={editingMatch.scoreAway}
                    onChange={(e) => setEditingMatch(prev => ({ ...prev, scoreAway: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={editingMatch.venue}
                  onChange={(e) => setEditingMatch(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referee</label>
                <input
                  type="text"
                  value={editingMatch.referee}
                  onChange={(e) => setEditingMatch(prev => ({ ...prev, referee: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  )
}

export default MatchesManagement
