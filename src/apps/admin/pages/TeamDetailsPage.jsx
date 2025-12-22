import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Flag, Loader2, Shirt, User } from 'lucide-react'
import TeamsService from '../../../layers/application/services/TeamsService'

const TeamDetailsPage = () => {
  const { teamId } = useParams()

  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    Promise.all([TeamsService.getTeamById(teamId), TeamsService.getTeamPlayers(teamId)])
      .then(([teamData, playersData]) => {
        if (!isMounted) return
        setTeam(teamData)
        setPlayers(Array.isArray(playersData) ? playersData : [])
      })
      .catch((err) => {
        console.error('Failed to load team details', err)
        if (isMounted) {
          setError(err?.message || 'Unable to load team details from the server.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [teamId])

  const meta = useMemo(() => {
    if (!team) return []
    return [
      { icon: Flag, label: 'Country', value: team.country || '-' },
      { icon: Calendar, label: 'Founded', value: team.founded_year || '-' }
    ]
  }, [team])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-600">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading team details...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6 text-red-700">
        {error}
      </div>
    )
  }

  if (!team) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-700">
        Team not found.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/teams"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Teams
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <div className="text-gray-600 mt-1">
              {team.short_name ? `${team.short_name} • ` : ''}
              {team.code || 'No code'}
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {team.status || 'active'}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {meta.map((item) => (
            <div key={item.label} className="flex items-center text-gray-700">
              <item.icon size={18} className="mr-2 text-gray-400" />
              <span className="text-sm">
                <span className="text-gray-500">{item.label}:</span> {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Players</h2>
          <div className="text-sm text-gray-600">{players.length} total</div>
        </div>

        {players.length === 0 ? (
          <div className="p-6 text-gray-600">No players found for this team.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationality</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shirt</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {players.map((player) => (
                  <tr key={player.id ?? player.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-gray-400" />
                        {player.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{player.position || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{player.nationality || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{player.dateOfBirth || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center">
                        <Shirt size={16} className="mr-2 text-gray-400" />
                        {player.shirtNumber ?? '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamDetailsPage

