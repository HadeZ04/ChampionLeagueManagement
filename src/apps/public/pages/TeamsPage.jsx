import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Globe, MapPin, Search, Shield, Users } from 'lucide-react';
import TeamsService from '../../../layers/application/services/TeamsService';

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
        console.error('Failed to load seasons', err);
        setSeasonOptions([]);
      } finally {
        setIsSeasonsLoading(false);
      }
    };

    loadSeasons();
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    const loadTeams = async () => {
      setIsLoading(true);
      try {
        const response = await TeamsService.getAllTeams({ season: selectedSeason });
        setTeams(response.teams ?? []);
        setError(null);
      } catch (err) {
        console.error('Failed to load teams', err);
        setError('Không thể tải danh sách đội bóng ngay bây giờ. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, [selectedSeason]);

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
        <nav className="uefa-breadcrumb">
          <Link to="/" className="uefa-breadcrumb-item">
          Trang chủ
          </Link>
          <span className="uefa-breadcrumb-separator">/</span>
          <span className="uefa-breadcrumb-item">Cúp C1</span>
          <span className="uefa-breadcrumb-separator">/</span>
          <span className="text-uefa-dark font-semibold">Đội bóng & đội hình</span>
        </nav>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Dữ liệu chính thức • Football-Data.org</p>
        <h1 className="uefa-section-title mt-2">Các câu lạc bộ Cúp C1 châu Âu</h1>
        <p className="uefa-section-subtitle">
          Theo dõi 36 câu lạc bộ và danh sách cầu thủ chính thức của Cúp C1 châu Âu (mã: CL).
        </p>
        {selectedSeason && (
          <p className="text-white/60 text-sm mt-2">
            Mùa giải: {selectedSeason}/{Number(selectedSeason) + 1}
          </p>
        )}
      </header>

      <div className="flex flex-col xl:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-uefa-gray" />
          <input
            type="text"
            placeholder="Tìm theo tên đội hoặc mã (VD: FCB, MCI)"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="uefa-input pl-12"
          />
        </div>
        <div className="flex gap-4 flex-col sm:flex-row">
          <select
            className="uefa-select sm:w-56"
            value={selectedCountry}
            onChange={(event) => setSelectedCountry(event.target.value)}
          >
            {countryFilters.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
          <select
            className="uefa-select sm:w-48"
            value={selectedSeason}
            onChange={(event) => setSelectedSeason(event.target.value)}
            disabled={isSeasonsLoading || seasonOptions.length === 0}
          >
            {isSeasonsLoading && <option>Đang tải mùa giải...</option>}
            {!isSeasonsLoading &&
              seasonOptions.map((season) => (
                <option key={season.id} value={season.year}>
                  {season.year}/{season.year + 1}
                </option>
              ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-uefa-gray">
          <Users size={32} className="mx-auto mb-4 animate-pulse" />
          Đang tải dữ liệu từ UEFA...
        </div>
      )}

      {error && (
        <div className="bg-uefa-red/10 border border-uefa-red/40 text-uefa-red rounded-2xl p-6 mb-6">
          {error}
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
