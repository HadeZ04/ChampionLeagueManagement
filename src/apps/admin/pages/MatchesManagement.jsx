import React, { useState } from 'react'
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
  Play
} from 'lucide-react'

const MatchesManagement = () => {
  const [selectedDate, setSelectedDate] = useState('2025-01-22')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const matches = [
    {
      id: 1,
      homeTeam: 'Liverpool',
      awayTeam: 'Lille',
      date: '2025-01-22',
      time: '21:00',
      venue: 'Anfield',
      city: 'Liverpool',
      status: 'scheduled',
      matchday: 7,
      referee: 'Clément Turpin',
      attendance: 53394,
      ticketsSold: 53394
    },
    {
      id: 2,
      homeTeam: 'Barcelona',
      awayTeam: 'Atalanta',
      date: '2025-01-22',
      time: '21:00',
      venue: 'Spotify Camp Nou',
      city: 'Barcelona',
      status: 'scheduled',
      matchday: 7,
      referee: 'Michael Oliver',
      attendance: 99354,
      ticketsSold: 95000
    },
    {
      id: 3,
      homeTeam: 'Arsenal',
      awayTeam: 'Dinamo Zagreb',
      date: '2025-01-21',
      time: '21:00',
      venue: 'Emirates Stadium',
      city: 'London',
      status: 'completed',
      matchday: 6,
      referee: 'Daniele Orsato',
      attendance: 60704,
      ticketsSold: 60704,
      score: { home: 3, away: 0 }
    }
  ]

  const statusOptions = [
    { id: 'all', name: 'All Matches' },
    { id: 'scheduled', name: 'Scheduled' },
    { id: 'live', name: 'Live' },
    { id: 'completed', name: 'Completed' },
    { id: 'postponed', name: 'Postponed' },
    { id: 'cancelled', name: 'Cancelled' }
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Scheduled</span>
      case 'live':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">Live</span>
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>
      case 'postponed':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Postponed</span>
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Cancelled</span>
      default:
        return null
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock size={16} className="text-blue-500" />
      case 'live':
        return <Play size={16} className="text-red-500" />
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />
      case 'postponed':
      case 'cancelled':
        return <AlertCircle size={16} className="text-yellow-500" />
      default:
        return <Clock size={16} className="text-gray-500" />
    }
  }

  const filteredMatches = matches.filter(match => {
    const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus
    const matchesDate = !selectedDate || match.date === selectedDate
    return matchesStatus && matchesDate
  })

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matches Management</h1>
            <p className="text-gray-600 mt-2">Schedule and manage all Champions League matches</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download size={16} />
              <span>Export Schedule</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Schedule Match</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-4">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
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

      {/* Matches Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Matches ({filteredMatches.length})</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Scheduled: {filteredMatches.filter(m => m.status === 'scheduled').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Completed: {filteredMatches.filter(m => m.status === 'completed').length}</span>
              </div>
            </div>
          </div>
        </div>

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
              {filteredMatches.map((match) => (
                <tr key={match.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(match.status)}
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          {match.homeTeam} vs {match.awayTeam}
                        </div>
                        <div className="text-gray-500 text-sm">Matchday {match.matchday}</div>
                        {match.score && (
                          <div className="text-blue-600 font-bold text-sm">
                            {match.score.home} - {match.score.away}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{match.date}</div>
                    <div className="text-sm text-gray-500">{match.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{match.venue}</div>
                    <div className="text-sm text-gray-500">{match.city}</div>
                    <div className="text-xs text-gray-400">
                      {match.ticketsSold?.toLocaleString()}/{match.attendance?.toLocaleString()} tickets
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{match.referee}</div>
                    <div className="text-sm text-gray-500">Main Referee</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(match.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">
                        <Edit size={16} />
                      </button>
                      {match.status === 'scheduled' && (
                        <button className="text-red-600 hover:text-red-900 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar size={24} className="text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{matches.length}</div>
              <div className="text-gray-600 text-sm">Total Matches</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle size={24} className="text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {matches.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-gray-600 text-sm">Completed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock size={24} className="text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {matches.filter(m => m.status === 'scheduled').length}
              </div>
              <div className="text-gray-600 text-sm">Scheduled</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Play size={24} className="text-red-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {matches.filter(m => m.status === 'live').length}
              </div>
              <div className="text-gray-600 text-sm">Live Now</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchesManagement
