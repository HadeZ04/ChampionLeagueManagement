import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  X, 
  ChevronUp, 
  ChevronDown,
  Calendar,
  Clock,
  Tv
} from 'lucide-react';
import MatchesService from '../../../layers/application/services/MatchesService';

/**
 * LiveTicker - Professional live matches widget
 * Connects to backend API and displays real-time match data
 */
const LiveTicker = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'upcoming'

  // Fetch live matches
  const fetchMatches = useCallback(async () => {
    try {
      // Fetch live matches
      const liveResponse = await MatchesService.getAllMatches({ 
        status: 'IN_PROGRESS',
        limit: 5 
      });
      
      if (liveResponse && Array.isArray(liveResponse.matches)) {
        setLiveMatches(liveResponse.matches);
      } else {
        setLiveMatches([]);
      }

      // Fetch upcoming matches
      const upcomingResponse = await MatchesService.getExternalMatches({
        status: 'SCHEDULED',
        limit: 5
      });
      
      if (upcomingResponse && Array.isArray(upcomingResponse.matches)) {
        setUpcomingMatches(upcomingResponse.matches);
      } else {
        setUpcomingMatches([]);
      }
    } catch (error) {
      console.warn('LiveTicker: Failed to fetch matches', error);
      setLiveMatches([]);
      setUpcomingMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    
    // Update clock every second
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Refresh match data every 30 seconds
    const fetchTimer = setInterval(fetchMatches, 30000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(fetchTimer);
    };
  }, [fetchMatches]);

  // Auto-switch to upcoming tab if no live matches
  useEffect(() => {
    if (!loading && liveMatches.length === 0 && upcomingMatches.length > 0) {
      setActiveTab('upcoming');
    }
  }, [loading, liveMatches, upcomingMatches]);

  // Hide widget entirely if no data
  if (!loading && liveMatches.length === 0 && upcomingMatches.length === 0) {
    return null;
  }

  if (!isVisible) return null;

  const formatMatchTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMatchDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Ngày mai';
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getTeamName = (team) => {
    if (!team) return 'TBD';
    return team.shortName || team.tla || team.name?.slice(0, 3).toUpperCase() || 'TBD';
  };

  const matches = activeTab === 'live' ? liveMatches : upcomingMatches;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out
        ${isMinimized ? 'w-14' : 'w-80'}
      `}
    >
      {/* Main Container */}
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          </div>
          
          <div className="relative flex items-center justify-between">
            {!isMinimized && (
              <div className="flex items-center gap-2">
                {liveMatches.length > 0 && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
                <span className="text-white font-bold text-sm tracking-wide">
                  {liveMatches.length > 0 ? 'TRỰC TIẾP' : 'LỊCH THI ĐẤU'}
                </span>
                {liveMatches.length > 0 && (
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {liveMatches.length}
                  </span>
                )}
              </div>
            )}
            
            {isMinimized && (
              <div className="flex items-center justify-center w-full">
                <Activity className="h-5 w-5 text-white" />
              </div>
            )}
            
            {!isMinimized && (
              <div className="flex items-center gap-1">
                <span className="text-white/80 text-xs font-mono mr-2">
                  {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <button 
                  onClick={() => setIsMinimized(true)} 
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                  aria-label="Thu nhỏ"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsVisible(false)} 
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Tab Buttons */}
          {!isMinimized && liveMatches.length > 0 && upcomingMatches.length > 0 && (
            <div className="relative flex mt-3 gap-1 bg-black/20 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('live')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'live' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`${activeTab === 'live' ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75`}></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  Trực tiếp ({liveMatches.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'upcoming' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Sắp tới ({upcomingMatches.length})
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Minimized state - expand button */}
        {isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full p-3 flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            <ChevronUp className="h-5 w-5 text-slate-400" />
          </button>
        )}

        {/* Content */}
        {!isMinimized && (
          <>
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center gap-2 text-slate-400">
                  <div className="h-4 w-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-sm">Đang tải...</span>
                </div>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-6 text-center">
                <Tv className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm font-medium">
                  {activeTab === 'live' ? 'Không có trận đấu trực tiếp' : 'Không có lịch sắp tới'}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Kiểm tra lại sau nhé!
                </p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {matches.map((match, index) => (
                  <div 
                    key={match.matchId || index}
                    className="group border-b border-slate-800 last:border-b-0 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="p-3">
                      {/* Match Time/Status Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {activeTab === 'live' ? (
                            <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400"></span>
                              </span>
                              {match.minute ? `${match.minute}'` : 'LIVE'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-medium">
                              <Clock className="h-3 w-3" />
                              {formatMatchTime(match.utcDate || match.scheduledKickoff)}
                            </span>
                          )}
                          {activeTab === 'upcoming' && (
                            <span className="text-[10px] text-slate-500">
                              {formatMatchDate(match.utcDate || match.scheduledKickoff)}
                            </span>
                          )}
                        </div>
                        {match.competition && (
                          <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                            {match.competition.name || 'Champions League'}
                          </span>
                        )}
                      </div>

                      {/* Teams and Score */}
                      <div className="flex items-center justify-between">
                        {/* Home Team */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {match.homeTeam?.crest && (
                            <img 
                              src={match.homeTeam.crest} 
                              alt=""
                              className="h-6 w-6 object-contain flex-shrink-0"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <span className="text-white text-sm font-semibold truncate">
                            {getTeamName(match.homeTeam)}
                          </span>
                        </div>

                        {/* Score/VS */}
                        <div className="px-3 flex-shrink-0">
                          {activeTab === 'live' ? (
                            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1">
                              <span className="text-white font-bold text-lg tabular-nums">
                                {match.score?.fullTime?.home ?? match.homeScore ?? 0}
                              </span>
                              <span className="text-slate-500 text-sm">-</span>
                              <span className="text-white font-bold text-lg tabular-nums">
                                {match.score?.fullTime?.away ?? match.awayScore ?? 0}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 font-medium text-sm">VS</span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          <span className="text-white text-sm font-semibold truncate text-right">
                            {getTeamName(match.awayTeam)}
                          </span>
                          {match.awayTeam?.crest && (
                            <img 
                              src={match.awayTeam.crest} 
                              alt=""
                              className="h-6 w-6 object-contain flex-shrink-0"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/50">
              <Link 
                to="/matches"
                className="block w-full text-center text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
              >
                Xem tất cả trận đấu →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveTicker;
