import React, { useState, useEffect } from 'react';
import MatchesService from '../../../layers/application/services/MatchesService';
import logger from '../../../shared/utils/logger';

/**
 * LiveMatchTicker - Real-time match ticker component
 * Displays live matches in a horizontal scrolling banner
 * Fetches data from API every 30 seconds
 */
const LiveMatchTicker = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveMatches = async () => {
    try {
      const response = await MatchesService.getAllMatches({ 
        status: 'IN_PROGRESS',
        limit: 10 
      });
      
      if (response && Array.isArray(response.matches)) {
        setLiveMatches(response.matches);
      } else {
        setLiveMatches([]);
      }
      setLoading(false);
    } catch (error) {
      logger.error('Failed to fetch live matches for ticker:', error);
      setLiveMatches([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLiveMatches();

    // Poll every 30 seconds for live updates
    const interval = setInterval(() => {
      fetchLiveMatches();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Don't render if no live matches and not loading
  if (!loading && liveMatches.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#003B73] via-[#004EA8] to-[#00C65A] overflow-hidden">
      <style>
        {`
          @keyframes scroll-ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-ticker {
            animation: scroll-ticker 45s linear infinite;
          }
          .animate-scroll-ticker:hover {
            animation-play-state: paused;
          }
        `}
      </style>
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center h-8 text-xs text-white font-medium">
          <span className="bg-white text-red-600 px-2 py-0.5 rounded text-[10px] font-bold mr-3 flex-shrink-0 animate-pulse">
            TRỰC TIẾP
          </span>
          
          {loading ? (
            <span className="text-white/70">Đang tải...</span>
          ) : (
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-6 whitespace-nowrap animate-scroll-ticker">
                {/* Duplicate content for seamless loop */}
                {[...liveMatches, ...liveMatches].map((match, index) => (
                  <React.Fragment key={`${match.matchId}-${index}`}>
                    <span className="inline-flex items-center gap-2">
                      <span className="font-semibold">
                        {match.homeTeam?.shortName || match.homeTeam?.name || 'TBD'}
                      </span>
                      <span className="text-[#00d4ff] font-bold">
                        {match.homeScore ?? 0}-{match.awayScore ?? 0}
                      </span>
                      <span className="font-semibold">
                        {match.awayTeam?.shortName || match.awayTeam?.name || 'TBD'}
                      </span>
                      {match.minute && (
                        <span className="text-white/80">• {match.minute}'</span>
                      )}
                    </span>
                    {index < liveMatches.length * 2 - 1 && (
                      <span className="text-white/40">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMatchTicker;
