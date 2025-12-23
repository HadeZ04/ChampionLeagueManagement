import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2, User } from 'lucide-react'
import TeamsService from '../../../layers/application/services/TeamsService'
import PlayersService from '../../../layers/application/services/PlayersService'

const MyTeamPage = ({ currentUser }) => {
  const teamIds = useMemo(() => {
    return Array.isArray(currentUser?.teamIds) ? currentUser.teamIds : []
  }, [currentUser])

  const [teams, setTeams] = useState([])
  const [playersByTeam, setPlayersByTeam] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (!teamIds.length) {
        setTeams([])
        setPlayersByTeam({})
        return
      }

      setLoading(true)
      setError(null)
      try {
        const teamsResponse = await TeamsService.getAllTeams({ page: 1, limit: 500 })
        const scopedTeams = (teamsResponse.teams || []).filter((team) => teamIds.includes(team.id))

        const playersEntries = await Promise.all(
          scopedTeams.map(async (team) => {
            const playersResponse = await PlayersService.listPlayers({ teamId: team.id, page: 1, limit: 50 })
            return [team.id, playersResponse.players || []]
          })
        )

        if (!isMounted) return
        setTeams(scopedTeams)
        setPlayersByTeam(Object.fromEntries(playersEntries))
      } catch (err) {
        console.error('Failed to load my team', err)
        if (isMounted) {
          setError(err?.message || 'Unable to load your team data.')
          setTeams([])
          setPlayersByTeam({})
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [teamIds.join(',')])

  if (!teamIds.length) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-lg font-semibold mb-2">No team assigned</h2>
        <p className="text-sm">
          This account has no team assignment. Ask a league administrator to assign your club/team.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-300">
        <Loader2 className="animate-spin mr-2" size={18} />
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5" />
        <div>{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Team</h1>
        <p className="text-gray-400 mt-1">Team profile and current players (read-only).</p>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-gray-200">
          Team not found in the catalog.
        </div>
      ) : (
        teams.map((team) => {
          const players = playersByTeam[team.id] || []
          return (
            <section key={team.id} className="rounded-xl border border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between gap-4 border-b border-gray-700 px-6 py-4">
                <div>
                  <div className="text-lg font-semibold text-white">{team.name}</div>
                  <div className="text-sm text-gray-400">
                    {team.code ? `${team.code} · ` : ''}
                    {team.country || '—'}
                  </div>
                </div>
                <div className="text-sm text-gray-300">{players.length} players</div>
              </div>

              {players.length === 0 ? (
                <div className="px-6 py-5 text-gray-300">No players found for this team.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-900/50 text-gray-300">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Player</th>
                        <th className="px-6 py-3 text-left font-semibold">Position</th>
                        <th className="px-6 py-3 text-left font-semibold">Nationality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {players.map((player) => (
                        <tr key={player.player_id ?? player.id ?? player.full_name} className="hover:bg-gray-900/40">
                          <td className="px-6 py-3 text-gray-100">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              {player.full_name ?? player.name ?? '—'}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-gray-200">{player.preferred_position ?? player.position ?? '—'}</td>
                          <td className="px-6 py-3 text-gray-200">{player.nationality ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })
      )}
    </div>
  )
}

export default MyTeamPage

