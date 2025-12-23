import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Globe, MapPin, Search, Shield, Users } from 'lucide-react';
import TeamsService from '../../../layers/application/services/TeamsService';
import logger from '../../../shared/utils/logger';

const TeamsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seasonOptions, setSeasonOptions] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [isSeasonsLoading, setIsSeasonsLoading] = useState(true);

  useEffect(() => {
    const loadSeasons = async () => {
      setIsSeasonsLoading(true);
      try {
        const seasons = await TeamsService.getCompetitionSeasons(2020);
        setSeasonOptions(seasons);
        if (seasons.length) {
          setSelectedSeason(String(seasons[0].year));
        }
      } catch (err) {
        logger.error('Failed to load seasons', err);
        setSeasonOptions([]);
      } finally {
        setIsSeasonsLoading(false);
      }
    };

    loadSeasons();
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    
    // Debounce search to avoid excessive API calls
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await TeamsService.getAllTeams({ 
          season: selectedSeason,
          search: searchTerm
        });
        setTeams(response.teams ?? []);
        setError(null);
      } catch (err) {
        logger.error('Failed to load teams', err);
        setError('Không thể tải danh sách đội bóng ngay bây giờ. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [selectedSeason, searchTerm]);

  const countryFilters = useMemo(() => {
    const uniqueCountries = new Map();

    teams.forEach((team) => {
      if (!team.country) {
        return;
      }
      const key = (team.countryCode ?? team.country).toLowerCase();
      if (!uniqueCountries.has(key)) {
        uniqueCountries.set(key, {
          id: key,
          name: team.country,
        });
      }
    });

    return [
      { id: 'all', name: 'All countries' },
      ...Array.from(uniqueCountries.values()).sort((a, b) => a.name.localeCompare(b.name)),
    ];
  }, [teams]);

  const filteredTeams = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesSearch =
        !search ||
        team.name.toLowerCase().includes(search) ||
        (team.shortName ?? '').toLowerCase().includes(search) ||
        (team.tla ?? '').toLowerCase().includes(search);

      const countryId = (team.countryCode ?? team.country ?? '').toLowerCase();
      const matchesCountry = selectedCountry === 'all' || selectedCountry === '' || countryId === selectedCountry;

      return matchesSearch && matchesCountry;
    });
  }, [teams, searchTerm, selectedCountry]);

  const summaryStats = useMemo(() => {
    const countryCount = new Set(teams.map((team) => team.country).filter(Boolean)).size;
    const coachCount = teams.filter((team) => Boolean(team.coach)).length;
    const averageFounded =
      teams.length > 0
        ? Math.round(
            teams.reduce((sum, team) => {
              if (!team.founded) {
                return sum;
              }
              return sum + team.founded;
            }, 0) / Math.max(teams.filter((team) => team.founded).length, 1),
          )
        : null;

    return {
      totalTeams: teams.length,
      countryCount,
      coachCount,
      averageFounded,
    };
  }, [teams]);

  const renderTeamLogo = (team) => {
    if (team.logo || team.crest) {
      return team.logo || team.crest;
    }
    const initials = team.name.slice(0, 3).toUpperCase();
    const svg = `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="16" fill="#001845"/>
        <text x="50%" y="55%" text-anchor="middle" fill="#FFFFFF" font-size="20" font-family="Arial, sans-serif" font-weight="bold">${initials}</text>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  return (
    <div className="uefa-container py-8">
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link to="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
          Trang chủ
          </Link>
          <span className="text-white/40">/</span>
          <span className="text-slate-300">Cúp C1</span>
          <span className="text-white/40">/</span>
          <span className="text-white font-semibold">Đội bóng & đội hình</span>
        </nav>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-400/80">Dữ liệu chính thức • Football-Data.org</p>
        <h1 className="text-4xl font-bold text-white mt-2">Các câu lạc bộ của giải Vô địch Châu Âu</h1>
        <p className="text-slate-300 text-lg mt-3">
          Theo dõi 36 câu lạc bộ và danh sách cầu thủ chính thức của giải vô địch châu Âu .
        </p>
        {selectedSeason && (
          <p className="text-slate-400 text-sm mt-2">
            Mùa giải: {selectedSeason}/{Number(selectedSeason) + 1}
          </p>
        )}
      </header>

      <div className="px-4 sm:px-0 flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên đội hoặc mã (VD: FCB, MCI)"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full h-11 pl-12 pr-4 rounded-full bg-[#020617]/85 border border-white/15 text-slate-50 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400/70 transition"
          />
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <select
            className="h-11 px-4 rounded-full bg-[#020617]/85 border border-white/15 text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400/70 transition sm:w-56 appearance-none cursor-pointer"
            value={selectedCountry}
            onChange={(event) => setSelectedCountry(event.target.value)}
            style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\'%23cbd5e1\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px'}}
          >
            {countryFilters.map((country) => (
              <option key={country.id} value={country.id} className="bg-[#0a1929] text-white">
                {country.name}
              </option>
            ))}
          </select>
          <div className="relative sm:w-48">
            <select
              className={`h-11 px-4 w-full rounded-full bg-[#020617]/85 border border-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400/70 transition appearance-none ${
                isSeasonsLoading ? 'cursor-wait opacity-75 text-slate-300' : 'cursor-pointer text-slate-50'
              }`}
              value={selectedSeason}
              onChange={(event) => setSelectedSeason(event.target.value)}
              disabled={isSeasonsLoading || seasonOptions.length === 0}
              style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\'%23cbd5e1\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px'}}
            >
              {isSeasonsLoading && <option className="bg-[#0a1929] text-slate-300">Đang tải mùa giải...</option>}
              {!isSeasonsLoading &&
                seasonOptions.map((season) => (
                  <option key={season.id} value={season.year} className="bg-[#0a1929] text-white">
                    {season.year}/{season.year + 1}
                  </option>
                ))}
            </select>
            {isSeasonsLoading && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-uefa-gray">
          <Users size={32} className="mx-auto mb-4 animate-pulse" />
          Đang tải dữ liệu từ UEFA...
        </div>
      )}

      {error && (
        <div className="bg-uefa-red/10 border border-uefa-red/40 text-uefa-red rounded-2xl p-6 flex items-center justify-between">
          <div className="flex-1">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-uefa-red hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
          >
            Thử lại
          </button>
        </div>
      )}

      {!isLoading && !error && filteredTeams.length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/20 rounded-3xl text-white/70">
          Không tìm thấy đội bóng phù hợp với từ khóa / bộ lọc hiện tại.
        </div>
      )}

      {!isLoading && !error && filteredTeams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="uefa-card p-6 border border-white/5 bg-white/5 backdrop-blur-xl rounded-3xl shadow-[0_35px_80px_rgba(4,9,32,0.45)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                  <img
                    src={renderTeamLogo(team)}
                    alt={team.name}
                    className="w-14 h-14 object-contain"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/60">{team.tla || 'UEFA'}</p>
                  <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Globe size={14} />
                    <span>{team.country || '—'}</span>
                  </div>
                </div>
              </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-uefa-gold" />
                    <span>Huấn luyện viên:</span>
                    <strong className="ml-auto text-white">{team.coach || 'Đang cập nhật'}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-uefa-blue" />
                    <span>Sân nhà:</span>
                    <strong className="ml-auto text-right text-white">{team.venue || 'Chưa xác định'}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-uefa-green" />
                    <span>Năm thành lập:</span>
                    <strong className="ml-auto text-white">{team.founded ?? '—'}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-uefa-gold" />
                    <span>Màu áo:</span>
                    <strong className="ml-auto text-right text-white">
                      {team.clubColors || 'Chưa có màu chính thức'}
                    </strong>
                  </div>
                </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={selectedSeason ? `/teams/${team.id}?season=${selectedSeason}` : `/teams/${team.id}`}
                  className="uefa-btn-primary px-4 py-2 text-xs uppercase tracking-[0.3em]"
                >
                  Hồ sơ đội
                </Link>
                {team.website && (
                  <a
                    href={team.website}
                    target="_blank"
                    rel="noreferrer"
                    className="uefa-btn-secondary px-4 py-2 text-xs uppercase tracking-[0.3em]"
                  >
                    Trang chính thức
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-white/80">
        <div className="rounded-3xl border border-white/10 p-5 bg-white/5">
          <p className="text-3xl font-bold text-white">{summaryStats.totalTeams}</p>
          <p className="text-xs uppercase tracking-[0.4em] mt-2">Đội</p>
        </div>
        <div className="rounded-3xl border border-white/10 p-5 bg-white/5">
          <p className="text-3xl font-bold text-white">{summaryStats.countryCount}</p>
          <p className="text-xs uppercase tracking-[0.4em] mt-2">Quốc gia</p>
        </div>
        <div className="rounded-3xl border border-white/10 p-5 bg-white/5">
          <p className="text-3xl font-bold text-white">{summaryStats.coachCount}</p>
          <p className="text-xs uppercase tracking-[0.4em] mt-2">Có HLV</p>
        </div>
        <div className="rounded-3xl border border-white/10 p-5 bg-white/5">
          <p className="text-3xl font-bold text-white">
            {summaryStats.averageFounded ? summaryStats.averageFounded : '—'}
          </p>
          <p className="text-xs uppercase tracking-[0.4em] mt-2">Năm thành lập TB</p>
        </div>
      </section>
    </div>
  );
};

export default TeamsPage;
