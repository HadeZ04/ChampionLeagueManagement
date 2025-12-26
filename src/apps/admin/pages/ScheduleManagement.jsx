import React, { useState, useEffect } from 'react';
import MatchesService from '../../../layers/application/services/MatchesService';
import TeamsService from '../../../layers/application/services/TeamsService';
import ApiService from '../../../layers/application/services/ApiService'; // Import ApiService
import { CalendarCheck, ListRestart, Save, CheckCircle, AlertCircle } from 'lucide-react';

const ScheduleManagement = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [quickSelectCount, setQuickSelectCount] = useState(20);

  useEffect(() => {
    fetchTeams();
    fetchSeasons();
    fetchExistingSchedule();
  }, []);

  const fetchSeasons = async () => {
    try {
      const response = await ApiService.get('/seasons');
      const seasonsData = Array.isArray(response) ? response : (response.data || []);
      setSeasons(seasonsData);

      const current = seasonsData.find(s => s.isCurrent) || seasonsData[0];
      if (current) setSelectedSeasonId(current.id || current.seasonId);
    } catch (err) {
      console.error("Failed to fetch seasons", err);
    }
  }

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { teams } = await TeamsService.getAllTeams({ limit: 100 });
      setTeams(teams || []);
      setSelectedTeamIds(teams.map(t => t.id));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingSchedule = async () => {
    try {
      const { matches } = await MatchesService.getAllMatches({ limit: 1000 });
      if (matches && matches.length > 0) {
        // Transform to match key format if needed, but backend usually returns snake_case or camelCase consistently.
        // MatchesService returns camelCase usually.
        // Enriched with team names is needed.
        // We might need to wait for 'teams' to be loaded to map names? 
        // Or just rely on join data if provided (backend usually provides team names).
        // MatchesService.getAllMatches usually provides homeTeamName etc.

        const formattedMatches = matches.map(m => ({
          ...m,
          scheduledKickoff: m.scheduledKickoff || m.utcDate,
          homeTeamName: m.homeTeamName || m.home_team_name || 'Unknown',
          awayTeamName: m.awayTeamName || m.away_team_name || 'Unknown',
          roundNumber: m.roundNumber || m.round_id || 1 // Fallback
        }));
        setSchedule(formattedMatches);
        setIsGenerated(true); // Treat existing schedule as "generated" to show the list
      }
    } catch (err) {
      console.error("Failed to load existing schedule", err);
      // Suppress error here as it might just be empty
    }
  };

  // ... rest of handleGenerate ...

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const generatedFixtures = await MatchesService.generateRoundRobinSchedule(
        selectedTeamIds,
        selectedSeasonId ? Number(selectedSeasonId) : null, // Pass selected season as number
        startDate
      );

      // enrichedFixtures logic needs access to 'teams' state.
      const enrichedFixtures = generatedFixtures.map(f => ({
        ...f,
        homeTeamName: teams.find(t => t.id === f.homeTeamId)?.name || 'Unknown',
        awayTeamName: teams.find(t => t.id === f.awayTeamId)?.name || 'Unknown',
        scheduledKickoff: f.utcDate || f.scheduledKickoff // Map backend utcDate to frontend property
      }));

      setSchedule(enrichedFixtures);
      setIsGenerated(true);
    } catch (err) {
      console.error(err);
      setError('Failed to generate schedule. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const count = await MatchesService.createBulkMatches(schedule);
      setSuccessMsg(`Successfully saved ${count} matches to the database!`);
    } catch (err) {
      console.error(err);
      setError('Failed to save schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSchedule([]);
    setIsGenerated(false);
    setSuccessMsg(null);
    setError(null);
  };

  const toggleTeamSelection = (id) => {
    if (selectedTeamIds.includes(id)) {
      setSelectedTeamIds(selectedTeamIds.filter(tid => tid !== id));
    } else {
      setSelectedTeamIds([...selectedTeamIds, id]);
    }
  }


  const rounds = schedule.reduce((acc, match) => {
    acc[match.roundNumber] = acc[match.roundNumber] || [];
    acc[match.roundNumber].push(match);
    return acc;
  }, {});

  const handleClearDatabase = async () => {
    if (!window.confirm("Are you sure? This will delete ALL matches from the database. This action cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      const count = await MatchesService.deleteAllMatches(); // Optional seasonId
      setSuccessMsg(`Deleted ${count} matches from database.`);
      setSchedule([]); // Clear local state too
      setIsGenerated(false);
      // Do not refetch immediately to avoid race conditions or auto-jumping back
    } catch (err) {
      console.error(err);
      setError('Failed to clear database schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = () => {
    const count = Math.min(Math.max(1, quickSelectCount), teams.length);
    const toSelect = teams.slice(0, count).map(t => t.id);
    setSelectedTeamIds(toSelect);
  };

  const handleSelectAll = () => {
    setSelectedTeamIds(teams.map(t => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedTeamIds([]);
  };

  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    if (isGenerated && schedule.length > 0) {
      setActiveTab('view');
    } else {
      setActiveTab('create');
    }
  }, [isGenerated, schedule.length]); // Auto-switch on generation/clear

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <div className="flex gap-3 items-center">
          <select
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            className="border p-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>-- Select Season --</option>
            {seasons.map(s => (
              <option key={s.id || s.seasonId} value={s.id || s.seasonId}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
          <div className="h-8 w-px bg-gray-300 mx-2"></div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Setup New
            </button>
            <button
              onClick={() => setActiveTab('view')}
              disabled={!isGenerated}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'view' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'}`}
            >
              View Schedule
            </button>
          </div>

          <button
            onClick={handleClearDatabase}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 ml-2"
          >
            <ListRestart size={18} /> Clear DB
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold">Select Teams ({selectedTeamIds.length} selected)</h2>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                <span className="text-sm font-medium">Quick Select:</span>
                <input
                  type="number"
                  min="2"
                  max={teams.length}
                  value={quickSelectCount}
                  onChange={(e) => setQuickSelectCount(parseInt(e.target.value) || 0)}
                  className="w-16 border rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={handleQuickSelect}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handleSelectAll} className="text-xs border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">Select All</button>
                <button onClick={handleDeselectAll} className="text-xs border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">Clear</button>
              </div>

              <div className="flex items-center gap-2 border-l pl-4">
                <label className="font-medium text-sm">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border p-1 rounded text-sm"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || selectedTeamIds.length < 2 || !selectedSeasonId}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed ml-auto"
              >
                <CalendarCheck size={18} /> Generate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {teams.map(team => (
              <div
                key={team.id}
                onClick={() => toggleTeamSelection(team.id)}
                className={`p-3 rounded border cursor-pointer transition-colors ${selectedTeamIds.includes(team.id) ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="font-medium text-sm">{team.name}</div>
              </div>
            ))}
          </div>
          {teams.length === 0 && !loading && (
            <p className="text-gray-500">No teams found. Please add teams in Team Management first.</p>
          )}
        </div>
      )}

      {activeTab === 'view' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Current Schedule</h2>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <Save size={18} /> Save All Changes to Database
            </button>
          </div>
          {Object.entries(rounds).length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded border">
              <p className="text-gray-500">No schedule generated yet.</p>
              <button onClick={() => setActiveTab('create')} className="mt-2 text-blue-600 font-medium hover:underline">Create a schedule</button>
            </div>
          ) : (
            Object.entries(rounds).map(([roundNumber, matches]) => (
              <div key={roundNumber} className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-bold text-lg mb-3">Round {roundNumber} <span className="text-sm font-normal text-gray-500">- {new Date(matches[0].scheduledKickoff).toLocaleDateString('vi-VN', { timeZone: 'Asia/Bangkok' })}</span></h3>
                <div className="space-y-2">
                  {matches.map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border-b last:border-0">
                      <div className="flex-1 text-right font-semibold">{match.homeTeamName}</div>
                      <div className="mx-4 text-gray-500 px-2 bg-gray-100 rounded text-sm">VS</div>
                      <div className="flex-1 text-left font-semibold">{match.awayTeamName}</div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">{new Date(match.scheduledKickoff).toLocaleDateString('vi-VN', { timeZone: 'Asia/Bangkok' })}</span>
                        <span className="text-xs text-gray-400">{new Date(match.scheduledKickoff).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div >
  );
};

export default ScheduleManagement;
