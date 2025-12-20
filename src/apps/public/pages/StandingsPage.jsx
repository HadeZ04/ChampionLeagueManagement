import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Download, Share2, TrendingUp, Users, Target } from 'lucide-react';
import StandingsTable from '../components/StandingsTable';
import TopScorers from '../components/TopScorers';
import UpcomingMatches from '../components/UpcomingMatches';
import TeamsService from '../../../layers/application/services/TeamsService';

const phases = [
  { id: 'league', name: 'League Phase', icon: Users },
  { id: 'knockout', name: 'Knockout Phase', icon: Target }
];

const groups = [
  { id: 'all', name: 'All Teams', count: 36 },
  { id: 'qualified', name: 'Qualified', count: 8 },
  { id: 'playoff', name: 'Playoff', count: 16 },
  { id: 'eliminated', name: 'Eliminated', count: 12 }
];

const StandingsPage = () => {
  const [selectedPhase, setSelectedPhase] = useState('league');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [standings, setStandings] = useState(null);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
  const [isLoadingStandings, setIsLoadingStandings] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSeasons = async () => {
      setIsLoadingSeasons(true);
      try {
        const data = await TeamsService.getCompetitionSeasons(2020);
        setSeasons(data);
        if (data.length) {
          setSelectedSeason(String(data[0].year));
        }
      } catch (err) {
        console.error('Failed to fetch seasons', err);
        setError('Không thể tải danh sách mùa giải.');
      } finally {
        setIsLoadingSeasons(false);
      }
    };

    loadSeasons();
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;

    const loadStandings = async () => {
      setIsLoadingStandings(true);
      try {
        const data = await TeamsService.getCompetitionStandings({ season: selectedSeason });
        setStandings(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch standings', err);
        setError('Không thể tải bảng xếp hạng.');
      } finally {
        setIsLoadingStandings(false);
      }
    };

    loadStandings();
  }, [selectedSeason]);

  const formattedStandings = useMemo(() => {
    if (!standings?.table) return [];
    return standings.table.map((row) => ({
      position: row.position,
      change: 0,
      country: row.tla || row.shortName || '',
      logo: row.crest,
      team: row.teamName,
      played: row.played,
      won: row.won,
      drawn: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
      form: row.form || [],
      status: row.status
    }));
  }, [standings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-8 lg:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
          
          <div className="relative flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Trophy size={16} className="text-yellow-300" />
                <span className="text-xs uppercase tracking-wider text-white font-bold">UEFA Champions League</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                League Phase Standings
              </h1>
              
              <p className="text-lg text-blue-100 max-w-2xl leading-relaxed">
                Track qualification spots, playoff zones, and live form powered by Champions League data from Football-Data.org.
              </p>
              
              {selectedSeason && standings?.updated && (
                <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span>Season {selectedSeason}/{Number(selectedSeason) + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    <span>Updated {new Date(standings.updated).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold cursor-pointer hover:bg-white/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                value={selectedSeason}
                onChange={(event) => setSelectedSeason(event.target.value)}
                disabled={isLoadingSeasons || seasons.length === 0}
              >
                {isLoadingSeasons && <option>Loading...</option>}
                {!isLoadingSeasons &&
                  seasons.map((season) => (
                    <option key={season.id} value={season.year} className="text-slate-900">
                      {season.year}/{season.year + 1}
                    </option>
                  ))}
              </select>
              
              <button className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2 group">
                <Download size={18} className="group-hover:animate-bounce" />
                <span>Export</span>
              </button>
              
              <button className="px-6 py-3 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </section>

        {/* Phase Selector */}
        <div className="flex flex-wrap gap-3">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            return (
              <button
                key={phase.id}
                onClick={() => setSelectedPhase(phase.id)}
                className={`
                  px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 backdrop-blur-xl
                  ${selectedPhase === phase.id
                    ? 'bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white shadow-lg shadow-blue-500/30 scale-105 border border-white/20'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }
                `}
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`
                }}
              >
                <Icon size={18} />
                <span>{phase.name}</span>
              </button>
            );
          })}
        </div>

        {/* Group Filter */}
        <div className="flex flex-wrap gap-3">
          {groups.map((group, index) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`
                px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 backdrop-blur-xl
                ${selectedGroup === group.id
                  ? 'bg-white/20 text-white shadow-lg border-2 border-white/40 scale-105'
                  : 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/20 hover:border-white/30'
                }
              `}
              style={{
                animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`
              }}
            >
              <span>{group.name}</span>
              <span className={`
                px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm
                ${selectedGroup === group.id
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 text-white/70'
                }
              `}>
                {group.count}
              </span>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl bg-rose-500/20 backdrop-blur-xl border-2 border-rose-400/30 p-6 flex items-center gap-4 animate-shake">
            <div className="w-12 h-12 rounded-full bg-rose-500/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-rose-400/30">
              <Trophy size={24} className="text-rose-300" />
            </div>
            <div>
              <h3 className="font-bold text-white">Error Loading Data</h3>
              <p className="text-white/80">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          {/* Standings Table */}
          <div className="space-y-6">
            {isLoadingStandings ? (
              <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-16 flex flex-col items-center justify-center gap-4 shadow-2xl">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/80 font-medium">Loading standings...</p>
              </div>
            ) : (
              <StandingsTable standings={formattedStandings} selectedGroup={selectedGroup} />
            )}

            {/* Qualification Info Card */}
            <div className="rounded-3xl bg-white/5 backdrop-blur-xl p-6 border border-white/10 shadow-2xl hover:shadow-blue-500/20 hover:border-white/20 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-400/30">
                  <Trophy size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">Qualification Rules</h3>
                  <div className="space-y-2 text-sm text-white/80">
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></span>
                      <span><strong className="text-white">Top 8 teams</strong> qualify directly to Round of 16</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"></span>
                      <span><strong className="text-white">Teams 9-24</strong> enter playoff round</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 shadow-lg shadow-rose-400/50"></span>
                      <span><strong className="text-white">Bottom 12 teams</strong> are eliminated</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TopScorers />
            <UpcomingMatches />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default StandingsPage;
