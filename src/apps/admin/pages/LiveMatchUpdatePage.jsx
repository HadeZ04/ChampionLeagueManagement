import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock, Goal, Play, Square, Replace, ShieldCheck,
    ChevronLeft, Users, FileText, Activity, AlertCircle, CheckCircle, Trash2
} from 'lucide-react';
import MatchesService from '../../../layers/application/services/MatchesService';
import TeamsService from '../../../layers/application/services/TeamsService';
import toast from 'react-hot-toast';

const LiveMatchUpdatePage = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [activeTab, setActiveTab] = useState('control');
    const [loading, setLoading] = useState(true);

    // Lineup State
    const [homeSquad, setHomeSquad] = useState([]);
    const [awaySquad, setAwaySquad] = useState([]);
    const [homeLineup, setHomeLineup] = useState([]);
    const [awayLineup, setAwayLineup] = useState([]);

    // Live Control State
    const [matchEvents, setMatchEvents] = useState([]);
    const [matchTime, setMatchTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    // Auto-calculate match time
    useEffect(() => {
        let interval;
        if (match && ['in_progress', 'live', 'in_play'].includes(match.status?.toLowerCase())) {
            const updateTime = () => {
                const startTime = new Date(match.scheduledKickoff).getTime();
                const now = new Date().getTime();
                const diffMinutes = Math.floor((now - startTime) / 60000);
                // Clamp between 0 and 120+ for safety, but allow it to grow
                setMatchTime(Math.max(0, diffMinutes));
            };

            updateTime(); // Initial update
            interval = setInterval(updateTime, 10000); // Update every 10 seconds
        }
        return () => clearInterval(interval);
    }, [match]);

    useEffect(() => {
        fetchMatchData();
    }, [matchId]);

    const fetchMatchData = async () => {
        try {
            setLoading(true);
            const data = await MatchesService.getMatchById(matchId);
            setMatch(data);
            setMatchEvents(data.events || []);

            // Fetch squads if lineups are needed
            if (data.homeTeamId) {
                const homePlayers = await TeamsService.getTeamPlayers(data.homeTeamId);
                setHomeSquad(homePlayers);
            }
            if (data.awayTeamId) {
                const awayPlayers = await TeamsService.getTeamPlayers(data.awayTeamId);
                setAwaySquad(awayPlayers);
            }
        } catch (error) {
            console.error('Error fetching match:', error);
            toast.error('Could not load match data');
        } finally {
            setLoading(false);
        }
    };

    // Event Handling
    const handleAddEvent = async (type, teamId, playerId = null, extraData = {}) => {
        try {
            const time = matchTime || 0;
            const payload = {
                matchId,
                teamId,
                playerId,
                type,
                minute: time,
                ...extraData
            };

            await MatchesService.createMatchEvent(matchId, payload);
            toast.success(`${type} recorded!`);
            fetchMatchData(); // Refresh to get updated score/events
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error('Failed to save event');
        }
    };

    const handleFinalize = async () => {
        if (!window.confirm('Are you sure you want to end this match?')) return;
        try {
            await MatchesService.finalizeMatch(matchId);
            toast.success('Match finalized!');
            navigate('/admin/matches');
        } catch (error) {
            console.error('Error finalizing:', error);
            toast.error('Failed to finalize match');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Match Data...</div>;
    if (!match) return <div className="p-8 text-center text-red-500">Match not found</div>;

    const tabs = [
        { id: 'lineups', label: 'Lineups', icon: <Users size={18} /> },
        { id: 'control', label: 'Live Control', icon: <Activity size={18} /> },
        { id: 'summary', label: 'Match Sheet', icon: <FileText size={18} /> },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/admin/matches-today')} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                    <ChevronLeft size={20} /> Back to Match Day
                </button>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === tab.id ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${match.status === 'in_progress' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
                    {match.status?.toUpperCase().replace('_', ' ')}
                </div>
            </div>

            {/* Scoreboard */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white shadow-xl">
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                    <div className="text-center flex-1">
                        {match.homeTeamLogo && <img src={match.homeTeamLogo} className="h-20 mx-auto mb-4 object-contain filter drop-shadow-md" alt="Home" />}
                        <h2 className="text-2xl font-bold">{match.homeTeamName}</h2>
                    </div>
                    <div className="text-center px-8">
                        <div className="text-6xl font-black font-mono tracking-wider mb-2">
                            {match.scoreHome} - {match.scoreAway}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-yellow-400 text-xl font-mono bg-black/30 px-4 py-1 rounded-full w-fit mx-auto">
                            <Clock size={20} />
                            <span>{matchTime}'</span>
                        </div>
                    </div>
                    <div className="text-center flex-1">
                        {match.awayTeamLogo && <img src={match.awayTeamLogo} className="h-20 mx-auto mb-4 object-contain filter drop-shadow-md" alt="Away" />}
                        <h2 className="text-2xl font-bold">{match.awayTeamName}</h2>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'control' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Home Controls */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 border-b pb-2">{match.homeTeamName} Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleAddEvent('GOAL', match.homeTeamId)}
                                    className="p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 flex flex-col items-center gap-2 transition-colors"
                                >
                                    <Goal size={24} /> <span>Goal</span>
                                </button>
                                <button
                                    onClick={() => handleAddEvent('YELLOW_CARD', match.homeTeamId)}
                                    className="p-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-200 flex flex-col items-center gap-2 transition-colors"
                                >
                                    <Square fill="currentColor" size={24} /> <span>Yellow Card</span>
                                </button>
                                <button
                                    onClick={() => handleAddEvent('RED_CARD', match.homeTeamId)}
                                    className="p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 flex flex-col items-center gap-2 transition-colors"
                                >
                                    <Square fill="currentColor" size={24} /> <span>Red Card</span>
                                </button>
                                <button
                                    onClick={() => handleAddEvent('SUBSTITUTION', match.homeTeamId)}
                                    className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 flex flex-col items-center gap-2 transition-colors"
                                >
                                    <Replace size={24} /> <span>Sub</span>
                                </button>
                            </div>
                        </div>

                        {/* Central Feed / Timer Control */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                            <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700">Match Events</div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                                {matchEvents.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">No events yet</div>
                                ) : (
                                    matchEvents.map(event => (
                                        <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="font-mono text-sm font-bold w-8 text-gray-500">{event.minute}'</div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm">{event.type.replace('_', ' ')}</div>
                                                <div className="text-xs text-gray-500">
                                                    {event.teamId === match.homeTeamId ? match.homeTeamName : match.awayTeamName}
                                                </div>
                                            </div>
                                            <button className="text-red-400 hover:text-red-600 p-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 border-t bg-gray-50">
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={matchTime}
                                        onChange={(e) => setMatchTime(parseInt(e.target.value))}
                                        className="w-20 p-2 border rounded text-center font-mono"
                                        min="0" max="120"
                                    />
                                    <button
                                        className="flex-1 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-colors py-2 flex items-center justify-center gap-2"
                                        onClick={handleFinalize}
                                    >
                                        <ShieldCheck size={18} /> End Match
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Away Controls */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 border-b pb-2 text-right">{match.awayTeamName} Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleAddEvent('GOAL', match.awayTeamId)}
                                    className="p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 flex flex-col items-center gap-2 transition-colors"
                                >
                                    <Goal size={24} /> <span>Goal</span>
                                </button>
                                <button
                                    onClick={() => handleAddEvent('YELLOW_CARD', match.awayTeamId)}
                                    className="p-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-200 flex flex-col items-center gap-2 transition-colors"
                                >
                                    <Square fill="currentColor" size={24} /> <span>Yellow Card</span>
                                </button>
                                <button
                                    onClick={() => handleAddEvent('RED_CARD', match.awayTeamId)}
                                    className="p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 flex flex-col items-center gap-2 transition-colors"
                                >
                                    <Square fill="currentColor" size={24} /> <span>Red Card</span>
                                </button>
                                <button
                                    onClick={() => handleAddEvent('SUBSTITUTION', match.awayTeamId)}
                                    className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 flex flex-col items-center gap-2 transition-colors"
                                >
                                    <Replace size={24} /> <span>Sub</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'lineups' && (
                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="font-bold text-lg mb-4">{match.homeTeamName} Squad</h3>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {homeSquad.map(player => (
                                    <div key={player.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 cursor-pointer">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs text-gray-600">
                                            {player.shirtNumber || '#'}
                                        </div>
                                        <div>
                                            <div className="font-medium">{player.name}</div>
                                            <div className="text-xs text-gray-500">{player.position}</div>
                                        </div>
                                    </div>
                                ))}
                                {homeSquad.length === 0 && <div className="text-gray-400 italic">No players found</div>}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="font-bold text-lg mb-4">{match.awayTeamName} Squad</h3>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {awaySquad.map(player => (
                                    <div key={player.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 cursor-pointer">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs text-gray-600">
                                            {player.shirtNumber || '#'}
                                        </div>
                                        <div>
                                            <div className="font-medium">{player.name}</div>
                                            <div className="text-xs text-gray-500">{player.position}</div>
                                        </div>
                                    </div>
                                ))}
                                {awaySquad.length === 0 && <div className="text-gray-400 italic">No players found</div>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div className="bg-white p-8 rounded-lg shadow-sm border text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900">Match Sheet Generation</h3>
                        <p>Detailed match report and statistics will be available here after the match.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveMatchUpdatePage;