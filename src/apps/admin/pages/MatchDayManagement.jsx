import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Play, Clock, CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import MatchesService from '../../../layers/application/services/MatchesService';

const MatchDayManagement = () => {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const getTodayRange = () => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return {
            dateFrom: start.toISOString(),
            dateTo: end.toISOString()
        };
    };

    const fetchTodayMatches = async () => {
        try {
            setLoading(true);
            const { dateFrom, dateTo } = getTodayRange();
            const response = await MatchesService.getAllMatches({
                dateFrom,
                dateTo,
                limit: 100 // Fetch all matches for today
            });
            setMatches(response.matches || []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch today matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            const { dateFrom, dateTo } = getTodayRange();
            await MatchesService.syncMatches({
                dateFrom,
                dateTo
            });
            await fetchTodayMatches(); // Refresh list after sync
        } catch (error) {
            console.error('Failed to sync matches:', error);
            alert('Failed to sync data from external source.');
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchTodayMatches();
        // Auto-refresh every 60 seconds for live updates
        const interval = setInterval(fetchTodayMatches, 60000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        const s = status?.toUpperCase();
        if (s === 'IN_PROGRESS' || s === 'LIVE' || s === 'IN_PLAY') return 'bg-red-500 text-white animate-pulse';
        if (s === 'FINISHED' || s === 'COMPLETED') return 'bg-green-500 text-white';
        if (s === 'SCHEDULED' || s === 'TIMED') return 'bg-blue-100 text-blue-800';
        return 'bg-gray-200 text-gray-800';
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Match Day Management</h1>
                    <p className="text-gray-500 mt-1">
                        Manage live matches occurring today ({new Date().toLocaleDateString()}).
                        {lastUpdated && <span className="ml-2 text-xs">Updated: {lastUpdated.toLocaleTimeString()}</span>}
                    </p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                    <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing Data...' : 'Sync Live Data'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading && matches.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Loading today's fixtures...</div>
                ) : matches.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                        <Calendar size={48} className="mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900">No Matches Scheduled for Today</h3>
                        <p className="mt-1">Check the full schedule for upcoming fixtures.</p>
                        <button
                            onClick={() => navigate('/admin/matches')}
                            className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            View All Matches
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {matches.map(match => (
                            <div key={match.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex-1 flex items-center justify-center md:justify-start gap-8 w-full md:w-auto">
                                    <div className="flex items-center gap-4 flex-1 justify-end text-right">
                                        <span className="font-bold text-lg text-gray-900">{match.homeTeamName}</span>
                                        {match.homeTeamLogo && (
                                            <img src={match.homeTeamLogo} alt={match.homeTeamName} className="w-10 h-10 object-contain" />
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center min-w-[100px]">
                                        {['IN_PROGRESS', 'LIVE', 'IN_PLAY', 'FINISHED', 'COMPLETED'].includes(match.status?.toUpperCase()) ? (
                                            <span className="text-2xl font-bold font-mono">
                                                {match.scoreHome} - {match.scoreAway}
                                            </span>
                                        ) : (
                                            <span className="text-xl font-bold font-mono text-gray-400">vs</span>
                                        )}
                                        <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatTime(match.utcDate)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 flex-1 justify-start text-left">
                                        {match.awayTeamLogo && (
                                            <img src={match.awayTeamLogo} alt={match.awayTeamName} className="w-10 h-10 object-contain" />
                                        )}
                                        <span className="font-bold text-lg text-gray-900">{match.awayTeamName}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getStatusColor(match.status)}`}>
                                        {match.status?.replace('_', ' ')}
                                    </span>

                                    <button
                                        onClick={() => navigate(`/admin/matches/${match.id}/live`)}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95 font-medium"
                                    >
                                        {['IN_PROGRESS', 'LIVE', 'IN_PLAY'].includes(match.status?.toUpperCase()) ? (
                                            <>
                                                <Play size={18} /> Continue Update
                                            </>
                                        ) : (
                                            <>
                                                Start Live Update <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchDayManagement;
