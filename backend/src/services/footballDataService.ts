import axios from "axios";
import { appConfig } from "../config";

type FootballDataTeam = {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
  area?: {
    id?: number;
    name?: string;
    code?: string;
    flag?: string;
  };
  venue?: string;
  clubColors?: string;
  founded?: number;
  coach?: {
    id?: number;
    name?: string;
    nationality?: string;
  };
  runningCompetitions?: Array<{
    id: number;
    name: string;
    code?: string;
    type?: string;
  }>;
  website?: string;
  address?: string;
  squad?: FootballDataPlayer[];
};

type FootballDataPlayer = {
  id?: number;
  name: string;
  position?: string;
  nationality?: string;
  dateOfBirth?: string;
  shirtNumber?: number;
};

const buildUrl = (path: string, params?: Record<string, string | number | undefined | null>): string => {
  if (!params) {
    return path;
  }
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });
  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
};

export type TeamSummary = {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  logo: string | null;
  crest: string | null;
  country?: string | null;
  countryCode?: string | null;
  countryFlag?: string | null;
  venue?: string | null;
  clubColors?: string | null;
  founded?: number | null;
  coach?: string | null;
  coachNationality?: string | null;
  website?: string | null;
  address?: string | null;
  runningCompetitions: Array<{
    id: number;
    name: string;
    code?: string;
    type?: string;
  }>;
  season?: string | number | null;
};

export type TeamDetail = TeamSummary & {
  squad: PlayerSummary[];
};

export type PlayerSummary = {
  id: number | null;
  name: string;
  position?: string | null;
  nationality?: string | null;
  dateOfBirth?: string | null;
  shirtNumber?: number | null;
};

export type CompetitionStandingRow = {
  position: number;
  teamId: number;
  teamName: string;
  shortName?: string | null;
  tla?: string | null;
  crest: string | null;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
  status: "qualified" | "playoff" | "eliminated" | "unknown";
};

export type CompetitionStandings = {
  season: {
    year: number;
    label: string;
    startDate: string;
    endDate: string;
  };
  updated: string;
  table: CompetitionStandingRow[];
};

export type CompetitionSeasonInfo = {
  id: number;
  year: number;
  startDate: string;
  endDate: string;
  winner?: {
    id?: number;
    name?: string;
    shortName?: string;
    tla?: string;
  } | null;
  currentMatchday?: number | null;
  stages: string[];
  current?: boolean;
  future?: boolean;
};

export type MatchSummary = {
  id: number;
  utcDate: string;
  status: string;
  stage?: string | null;
  group?: string | null;
  matchday?: number | null;
  season?: string | number | null;
  competition?: {
    id?: number;
    name?: string;
    code?: string;
  } | null;
  homeTeam: {
    id: number;
    name: string;
    tla?: string | null;
  };
  awayTeam: {
    id: number;
    name: string;
    tla?: string | null;
  };
  score: {
    winner?: string | null;
    duration?: string | null;
    fullTime?: {
      home: number | null;
      away: number | null;
    } | null;
    halfTime?: {
      home: number | null;
      away: number | null;
    } | null;
    extraTime?: {
      home: number | null;
      away: number | null;
    } | null;
    penalties?: {
      home: number | null;
      away: number | null;
    } | null;
  };
  venue?: string | null;
  referees?: Array<{
    id?: number;
    name?: string;
    type?: string;
    nationality?: string;
  }> | null;
  lastUpdated?: string | null;
};

const httpClient = axios.create({
  baseURL: appConfig.footballData.baseUrl,
  timeout: appConfig.footballData.timeout,
  headers: {
    "Content-Type": "application/json",
    "X-Auth-Token": appConfig.footballData.token,
  },
});

type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};

const cache = new Map<string, CacheEntry<unknown>>();

const getCache = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
};

const setCache = <T>(key: string, data: T): void => {
  cache.set(key, { data, expiresAt: Date.now() + appConfig.footballData.cacheTtlMs });
};

const normalisePlayer = (player: FootballDataPlayer): PlayerSummary => ({
  id: player.id ?? null,
  name: player.name,
  position: player.position ?? null,
  nationality: player.nationality ?? null,
  dateOfBirth: player.dateOfBirth ?? null,
  shirtNumber: player.shirtNumber ?? null,
});

const normaliseTeamSummary = (team: FootballDataTeam, season?: string | number | null): TeamSummary => ({
  id: team.id,
  name: team.name,
  shortName: team.shortName,
  tla: team.tla,
  logo: team.crest ?? null,
  crest: team.crest ?? null,
  country: team.area?.name ?? null,
  countryCode: team.area?.code ?? null,
  countryFlag: team.area?.flag ?? null,
  venue: team.venue ?? null,
  clubColors: team.clubColors ?? null,
  founded: team.founded ?? null,
  coach: team.coach?.name ?? null,
  coachNationality: team.coach?.nationality ?? null,
  website: team.website ?? null,
  address: team.address ?? null,
  runningCompetitions: (team.runningCompetitions ?? []).map((competition) => ({
    id: competition.id,
    name: competition.name,
    code: competition.code,
    type: competition.type,
  })),
  season: season ?? null,
});

const normaliseTeamDetail = (team: FootballDataTeam, season?: string | number | null): TeamDetail => ({
  ...normaliseTeamSummary(team, season),
  squad: (team.squad ?? []).map(normalisePlayer),
});

const fetchFromFootballData = async <T>(url: string): Promise<T> => {
  try {
    const response = await httpClient.get<T>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data ?? error.message;
      throw new Error(`Football-Data API error (${status ?? "network"}): ${JSON.stringify(message)}`);
    }
    throw error;
  }
};

const computeStatus = (position: number): CompetitionStandingRow["status"] => {
  if (position <= 8) return "qualified";
  if (position <= 24) return "playoff";
  if (position > 24) return "eliminated";
  return "unknown";
};

export const getCompetitionTeams = async (season?: string): Promise<TeamSummary[]> => {
  const seasonKey = season ?? "current";
  const cacheKey = `competition:${appConfig.footballData.competitionCode}:teams:${seasonKey}`;
  const cached = getCache<TeamSummary[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchFromFootballData<{ teams: FootballDataTeam[] }>(
    buildUrl(`/competitions/${appConfig.footballData.competitionCode}/teams`, { season }),
  );
  const teams = data.teams.map((team) => normaliseTeamSummary(team, season));
  setCache(cacheKey, teams);
  return teams;
};

export const getTeamDetail = async (teamId: string | number, season?: string): Promise<TeamDetail> => {
  const seasonKey = season ?? "current";
  const cacheKey = `team:${teamId}:season:${seasonKey}`;
  const cached = getCache<TeamDetail>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchFromFootballData<FootballDataTeam>(buildUrl(`/teams/${teamId}`, { season }));
  const team = normaliseTeamDetail(data, season);
  setCache(cacheKey, team);
  return team;
};

export const getTeamSquad = async (teamId: string | number, season?: string): Promise<PlayerSummary[]> => {
  const team = await getTeamDetail(teamId, season);
  return team.squad;
};

export const clearTeamCache = (teamId?: string | number): void => {
  if (teamId) {
    cache.delete(`team:${teamId}`);
    return;
  }
  cache.clear();
};

export const getCompetitionStandings = async (season?: string): Promise<CompetitionStandings> => {
  const seasonKey = season ?? "current";
  const cacheKey = `competition:${appConfig.footballData.competitionCode}:standings:${seasonKey}`;
  const cached = getCache<CompetitionStandings>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchFromFootballData<{
    standings: Array<{
      type: string;
      table: Array<{
        position: number;
        team: FootballDataTeam;
        playedGames: number;
        won: number;
        draw: number;
        lost: number;
        goalsFor: number;
        goalsAgainst: number;
        goalDifference: number;
        points: number;
        form?: string;
      }>;
    }>;
    season: {
      startDate: string;
      endDate: string;
    };
  }>(buildUrl(`/competitions/${appConfig.footballData.competitionCode}/standings`, { season }));

  const firstTable = data.standings[0]?.table ?? [];
  const table = firstTable.map((row) => ({
    position: row.position,
    teamId: row.team.id,
    teamName: row.team.name,
    shortName: row.team.shortName ?? null,
    tla: row.team.tla ?? null,
    crest: row.team.crest ?? null,
    played: row.playedGames,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    points: row.points,
    form: row.form ? row.form.replace(/,/g, "").split("") : [],
    status: computeStatus(row.position),
  }));

  const seasonYear = data.season?.startDate ? new Date(data.season.startDate).getFullYear() : new Date().getFullYear();

  const standings: CompetitionStandings = {
    season: {
      year: seasonYear,
      label: `${seasonYear}/${seasonYear + 1}`,
      startDate: data.season?.startDate ?? "",
      endDate: data.season?.endDate ?? "",
    },
    updated: new Date().toISOString(),
    table,
  };

  setCache(cacheKey, standings);
  return standings;
};

export const getCompetitionSeasons = async (fromYear = 2020): Promise<CompetitionSeasonInfo[]> => {
  const cacheKey = `competition:${appConfig.footballData.competitionCode}:seasons`;
  const cached = getCache<CompetitionSeasonInfo[]>(cacheKey);
  if (cached) {
    return cached.filter((season) => season.year >= fromYear);
  }

  const data = await fetchFromFootballData<{
    currentSeason?: {
      id: number;
    };
    seasons: Array<{
      id: number;
      startDate: string;
      endDate: string;
      currentMatchday?: number;
      winner?: {
        id?: number;
        name?: string;
        shortName?: string;
        tla?: string;
      };
      stages?: string[];
    }>;
  }>(`/competitions/${appConfig.footballData.competitionCode}`);

  const seasons = (data.seasons ?? []).map((season) => {
    const year = season.startDate ? new Date(season.startDate).getFullYear() : 0;
    const startDate = season.startDate ? new Date(season.startDate) : null;
    const isFuture = startDate ? startDate.getTime() > Date.now() : false;
    return {
      id: season.id,
      year,
      startDate: season.startDate,
      endDate: season.endDate,
      winner: season.winner ?? null,
      currentMatchday: season.currentMatchday ?? null,
      stages: season.stages ?? [],
      current: season.id === data.currentSeason?.id,
      future: isFuture,
    };
  });

  setCache(cacheKey, seasons);
  return seasons
    .filter((season) => (!fromYear || season.year >= fromYear) && !season.future)
    .sort((a, b) => b.year - a.year);
};

export const getCompetitionMatches = async (options: {
  season?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): Promise<MatchSummary[]> => {
  const { season, status, dateFrom, dateTo } = options;
  
  // Helper to format date to yyyy-MM-dd
  const formatDateForAPI = (dateStr: string): string => {
    if (!dateStr) return dateStr;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Invalid date, return as-is
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      // If already in yyyy-MM-dd format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      return dateStr;
    }
  };
  
  const params: Record<string, string | number | undefined> = {};
  if (season) params.season = season;
  if (status) params.status = status;
  if (dateFrom) params.dateFrom = formatDateForAPI(dateFrom);
  if (dateTo) params.dateTo = formatDateForAPI(dateTo);

  const data = await fetchFromFootballData<{
    matches: Array<{
      id: number;
      utcDate: string;
      status: string;
      stage?: string;
      group?: string;
      matchday?: number;
      season?: {
        id?: number;
        startDate?: string;
        endDate?: string;
      };
      competition?: {
        id?: number;
        name?: string;
        code?: string;
      };
      homeTeam: {
        id: number;
        name: string;
        tla?: string;
      };
      awayTeam: {
        id: number;
        name: string;
        tla?: string;
      };
      score: {
        winner?: string;
        duration?: string;
        fullTime?: {
          home: number | null;
          away: number | null;
        };
        halfTime?: {
          home: number | null;
          away: number | null;
        };
        extraTime?: {
          home: number | null;
          away: number | null;
        };
        penalties?: {
          home: number | null;
          away: number | null;
        };
      };
      venue?: string;
      referees?: Array<{
        id?: number;
        name?: string;
        type?: string;
        nationality?: string;
      }>;
      lastUpdated?: string;
    }>;
  }>(buildUrl(`/competitions/${appConfig.footballData.competitionCode}/matches`, params));

  const matches = (data.matches ?? []).map((match) => {
    const seasonYear = match.season?.startDate 
      ? new Date(match.season.startDate).getFullYear() 
      : season;

    return {
      id: match.id,
      utcDate: match.utcDate,
      status: match.status,
      stage: match.stage ?? null,
      group: match.group ?? null,
      matchday: match.matchday ?? null,
      season: seasonYear,
      competition: match.competition ? {
        id: match.competition.id,
        name: match.competition.name,
        code: match.competition.code,
      } : null,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        tla: match.homeTeam.tla ?? null,
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        tla: match.awayTeam.tla ?? null,
      },
      score: {
        winner: match.score.winner ?? null,
        duration: match.score.duration ?? null,
        fullTime: match.score.fullTime ?? null,
        halfTime: match.score.halfTime ?? null,
        extraTime: match.score.extraTime ?? null,
        penalties: match.score.penalties ?? null,
      },
      venue: match.venue ?? null,
      referees: match.referees ?? null,
      lastUpdated: match.lastUpdated ?? null,
    };
  });

  return matches;
};
