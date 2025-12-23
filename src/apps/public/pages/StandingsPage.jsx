import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Download, Share2, TrendingUp, Users, Target } from 'lucide-react';
import StandingsTable from '../components/StandingsTable';
import TopScorers from '../components/TopScorers';
import UpcomingMatches from '../components/UpcomingMatches';
import TeamsService from '../../../layers/application/services/TeamsService';
import logger from '../../../shared/utils/logger';

const phases = [
  { id: 'league', name: 'Vòng phân hạng', icon: Users },
  { id: 'knockout', name: 'Vòng loại trực tiếp', icon: Target }
];

const groups = [
  { id: 'all', name: 'Tất cả', count: 36 },
  { id: 'qualified', name: 'Vào thẳng', count: 8 },
  { id: 'playoff', name: 'Tranh vé', count: 16 },
  { id: 'eliminated', name: 'Bị loại', count: 12 }
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
        logger.error('Không thể tải danh sách mùa giải', err);
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
        console.error('Không thể tải bảng xếp hạng', err);
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
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#4C1D95] p-6 md:p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)] border border-white/10 backdrop-blur-sm">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          
          <div className="relative flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm">
                <Trophy size={14} className="text-cyan-400" />
                <span className="uppercase tracking-wider font-bold">Cúp C1 châu Âu</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Bảng xếp hạng vòng phân hạng
              </h1>
              
              <p className="mt-2 text-sm md:text-base text-slate-200/85 max-w-2xl leading-relaxed">
                Theo dõi suất đi tiếp, nhóm tranh vé và phong độ gần đây dựa trên dữ liệu giải đấu.
              </p>
              
              {selectedSeason && standings?.updated && (
                <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
                    <span>Mùa {selectedSeason}/{Number(selectedSeason) + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-cyan-400" />
                    <span>Cập nhật {new Date(standings.updated).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                value={selectedSeason}
                onChange={(event) => setSelectedSeason(event.target.value)}
                disabled={isLoadingSeasons || seasons.length === 0}
              >
                {isLoadingSeasons && <option className="text-slate-900">Đang tải...</option>}
                {!isLoadingSeasons &&
                  seasons.map((season) => (
                    <option key={season.id} value={season.year} className="text-slate-900">
                      {season.year}/{season.year + 1}
                    </option>
                  ))}
              </select>
              
              <button className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition flex items-center gap-2 group">
                <Download size={18} className="group-hover:animate-bounce" />
                <span>Xuất</span>
              </button>
              
              <button className="px-4 py-2 rounded-full bg-gradient-to-r from-[#2563EB] to-[#22C55E] text-white font-medium hover:shadow-lg transition flex items-center gap-2">
                <Share2 size={18} />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </section>

        {/* Phase Selector */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1 mt-6">
          {phases.map((phase) => {
            const Icon = phase.icon;
            return (
              <button
                key={phase.id}
                onClick={() => setSelectedPhase(phase.id)}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                  selectedPhase === phase.id
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white shadow-sm'
                    : 'bg-[#020617]/80 text-slate-200/85 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} className={selectedPhase === phase.id ? 'text-white' : 'text-slate-300'} />
                <span>{phase.name}</span>
              </button>
            );
          })}
        </div>

        {/* Group Filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-medium text-sm border transition-all duration-200 ${
                selectedGroup === group.id
                  ? 'bg-white/15 text-white border-white/25 shadow-sm'
                  : 'bg-[#020617]/70 text-slate-200/85 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{group.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-slate-100">
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
            <div className="flex-1">
              <h3 className="font-bold text-white">Lỗi tải dữ liệu</h3>
              <p className="text-white/80">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 font-semibold flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Thử lại
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          {/* Standings Table */}
          <div className="space-y-6">
            {isLoadingStandings ? (
                <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-16 flex flex-col items-center justify-center gap-4 shadow-2xl">
                  <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white/80 font-medium">Đang tải bảng xếp hạng...</p>
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
                  <h3 className="text-lg font-bold text-white mb-2">Thể lệ đi tiếp</h3>
                  <div className="space-y-2 text-sm text-white/80">
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></span>
                      <span><strong className="text-white">Top 8 đội</strong> vào thẳng vòng 1/8</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"></span>
                      <span><strong className="text-white">Các đội hạng 9-24</strong> vào vòng tranh vé</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 shadow-lg shadow-rose-400/50"></span>
                      <span><strong className="text-white">12 đội cuối</strong> bị loại</span>
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
