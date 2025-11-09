import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Activity, Calendar, Flag, MapPin, Shield, Shirt } from 'lucide-react';
import TeamsService from '../../../layers/application/services/TeamsService';

const TeamProfilePage = () => {
  const { teamId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const querySeason = searchParams.get('season') || '';

  const [team, setTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(querySeason);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (querySeason && querySeason !== selectedSeason) {
      setSelectedSeason(querySeason);
    }
  }, [querySeason, selectedSeason]);

  useEffect(() => {
    const loadSeasons = async () => {
      setIsLoadingSeasons(true);
      try {
        const seasons = await TeamsService.getCompetitionSeasons(2020);
        setSeasonOptions(seasons);
        if (!querySeason && seasons.length) {
          const newest = String(seasons[0].year);
          setSelectedSeason(newest);
          setSearchParams((params) => {
            const next = new URLSearchParams(params);
            next.set('season', newest);
            return next;
          });
        }
      } catch (err) {
        console.error('Failed to fetch seasons', err);
      } finally {
        setIsLoadingSeasons(false);
      }
    };

    loadSeasons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [querySeason]);

  useEffect(() => {
    if (!teamId) return;

    const loadTeam = async () => {
      setIsLoading(true);
      try {
        const query = selectedSeason ? { season: selectedSeason } : {};
        const teamResponse = await TeamsService.getTeamById(teamId, query);
        setTeam(teamResponse);

        if (teamResponse?.squad?.length) {
          setSquad(teamResponse.squad);
        } else {
          const squadResponse = await TeamsService.getTeamPlayers(teamId, query);
          setSquad(squadResponse);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to load team profile', err);
        setError('Không thể tải thông tin chi tiết đội bóng ngay lúc này.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeam();
  }, [teamId, selectedSeason]);

  const groupedSquad = useMemo(() => {
    const groups = squad.reduce((acc, player) => {
      const key = player.position || 'Utility';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(player);
      return acc;
    }, {});

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [squad]);

  const handleSeasonChange = (seasonValue) => {
    setSelectedSeason(seasonValue);
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      if (seasonValue) {
        next.set('season', seasonValue);
      } else {
        next.delete('season');
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="uefa-container py-16 text-center text-white/70">
        <Shield size={32} className="mx-auto mb-4 animate-spin" />
        Đang tải dữ liệu đội bóng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="uefa-container py-16">
        <div className="bg-uefa-red/10 border border-uefa-red/40 text-uefa-red rounded-3xl p-8 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="uefa-container py-16 text-center text-white/70">
        Không tìm thấy đội bóng yêu cầu.
      </div>
    );
  }

  const crest = team.logo || team.crest;

  return (
    <div className="uefa-container py-8 space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">Team profile</p>
          <h1 className="text-4xl font-display text-white mt-2">{team.name}</h1>
          <p className="text-white/70 text-sm mt-1">{team.country ?? 'Europe'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="uefa-select bg-white/5 text-white"
            value={selectedSeason}
            onChange={(event) => handleSeasonChange(event.target.value)}
            disabled={isLoadingSeasons || seasonOptions.length === 0}
          >
            {isLoadingSeasons && <option>Loading seasons...</option>}
            {!isLoadingSeasons &&
              seasonOptions.map((season) => (
                <option key={season.id} value={season.year}>
                  {season.year}/{season.year + 1}
                </option>
              ))}
          </select>
          <Link
            to={selectedSeason ? `/teams?season=${selectedSeason}` : '/teams'}
            className="uefa-btn-secondary px-5 py-2 text-xs uppercase tracking-[0.3em]"
          >
            Back to teams
          </Link>
          {team.website && (
            <a
              href={team.website}
              target="_blank"
              rel="noreferrer"
              className="uefa-btn-primary px-5 py-2 text-xs uppercase tracking-[0.3em]"
            >
              Official site
            </a>
          )}
        </div>
      </div>

      <section className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 flex flex-col lg:flex-row gap-8">
        <div className="w-full max-w-xs mx-auto lg:mx-0">
          <div className="w-40 h-40 rounded-[30px] bg-white/10 border border-white/10 flex items-center justify-center mx-auto">
            {crest ? (
              <img src={crest} alt={team.name} className="w-32 h-32 object-contain" loading="lazy" />
            ) : (
              <Shield size={48} className="text-white/40" />
            )}
          </div>
          <div className="mt-6 text-center text-white/80 space-y-1">
            <p>{team.tla}</p>
            <p className="text-sm flex items-center justify-center gap-2">
              <MapPin size={14} /> {team.venue ?? 'Stadium TBD'}
            </p>
            <p className="text-sm flex items-center justify-center gap-2">
              <Calendar size={14} /> Founded {team.founded ?? '—'}
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 text-white/80">
          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">Coach</p>
            <p className="text-xl font-semibold text-white">{team.coach || 'Updating'}</p>
            <p className="text-sm text-white/60">{team.coachNationality || ''}</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">Colours</p>
            <p className="text-xl font-semibold text-white">{team.clubColors || 'Official palette pending'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">Address</p>
            <p className="text-sm">{team.address || '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">Competitions</p>
            <div className="flex flex-wrap gap-2">
              {(team.runningCompetitions ?? []).map((competition) => (
                <span key={competition.id} className="px-3 py-1 rounded-full bg-white/10 text-xs">
                  {competition.code || competition.name}
                </span>
              ))}
              {(!team.runningCompetitions || team.runningCompetitions.length === 0) && <span>UEFA Champions League</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Official Squad</p>
            <h2 className="text-2xl font-semibold text-white">
              {squad.length} registered players • Season {selectedSeason || 'current'}
            </h2>
          </div>
        </div>

        {squad.length === 0 && (
          <div className="text-center text-white/70 py-12">
            UEFA chưa công bố danh sách cầu thủ cho đội bóng này ở mùa giải đã chọn.
          </div>
        )}

        {groupedSquad.length > 0 && (
          <div className="grid md:grid-cols-2 gap-5">
            {groupedSquad.map(([position, players]) => (
              <div key={position} className="rounded-2xl border border-white/10 p-5 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{position}</h3>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/60">{players.length} cầu thủ</span>
                </div>
                <div className="space-y-3">
                  {players.map((player) => (
                    <div
                      key={player.id ?? `${player.name}-${player.shirtNumber}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-white">{player.name}</p>
                        <p className="text-xs text-white/60 flex items-center gap-2">
                          <Flag size={12} /> {player.nationality || '—'}
                        </p>
                        <p className="text-xs text-white/60 flex items-center gap-2">
                          <Calendar size={12} /> {player.dateOfBirth || '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-white/80">
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Kit</p>
                          <p className="text-lg font-semibold">{player.shirtNumber ?? '—'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                          <Shirt size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
        <div className="flex items-center gap-3 text-white/80">
          <Activity size={20} className="text-uefa-green" />
          <p>
            Dữ liệu đội và cầu thủ được đồng bộ trực tiếp từ Football-Data.org (Competition code: CL – Champions League).
          </p>
        </div>
      </section>
    </div>
  );
};

export default TeamProfilePage;
