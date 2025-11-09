import { query } from "../db/sqlServer";
import { getCompetitionMatches, type MatchSummary } from "./footballDataService";
import { calculateStandings } from "./standingsAdminService";

export interface MatchRecord {
  matchId: number;
  seasonId: number;
  roundId: number;
  matchdayNumber: number;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  stadiumId: number;
  stadiumName: string | null;
  scheduledKickoff: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  attendance: number | null;
  matchCode: string | null;
  updatedAt: string | null;
}

export interface MatchFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  teamId?: number;
  seasonId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedMatches {
  data: MatchRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateMatchInput {
  homeTeamId: number;
  awayTeamId: number;
  scheduledKickoff: string;
  seasonId?: number;
  roundNumber?: number;
  matchdayNumber?: number;
  stadiumId?: number;
  status?: string;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Helper: Ensure default season exists
const ensureDefaultSeason = async (): Promise<number> => {
  const existingSeason = await query<{ season_id: number }>(
    `SELECT TOP 1 season_id FROM seasons ORDER BY created_at DESC`
  );
  
  if (existingSeason.recordset.length > 0) {
    return existingSeason.recordset[0].season_id;
  }

  // Create default tournament first
  const tournamentResult = await query<{ tournament_id: number }>(
    `
      IF NOT EXISTS (SELECT 1 FROM tournaments WHERE code = 'DEFAULT')
      BEGIN
        INSERT INTO tournaments (code, name, organizer, region)
        OUTPUT INSERTED.tournament_id
        VALUES ('DEFAULT', 'Default Tournament', 'System', 'International');
      END
      ELSE
      BEGIN
        SELECT tournament_id FROM tournaments WHERE code = 'DEFAULT';
      END
    `
  );
  
  const tournamentId = tournamentResult.recordset[0].tournament_id;

  // Create default ruleset
  const rulesetResult = await query<{ ruleset_id: number }>(
    `
      IF NOT EXISTS (SELECT 1 FROM rulesets WHERE name = 'Standard Rules')
      BEGIN
        INSERT INTO rulesets (name, version_tag, is_active, created_by)
        OUTPUT INSERTED.ruleset_id
        VALUES ('Standard Rules', '1.0', 1, 1);
      END
      ELSE
      BEGIN
        SELECT ruleset_id FROM rulesets WHERE name = 'Standard Rules';
      END
    `
  );
  
  const rulesetId = rulesetResult.recordset[0].ruleset_id;

  // Create default season
  const seasonResult = await query<{ season_id: number }>(
    `
      INSERT INTO seasons (
        tournament_id, ruleset_id, name, code, 
        start_date, participation_fee, created_by, status
      )
      OUTPUT INSERTED.season_id
      VALUES (
        @tournamentId, @rulesetId, 'Season ' + CAST(YEAR(GETDATE()) AS VARCHAR), 
        'S' + CAST(YEAR(GETDATE()) AS VARCHAR),
        GETDATE(), 0, 1, 'in_progress'
      );
    `,
    { tournamentId, rulesetId }
  );

  return seasonResult.recordset[0].season_id;
};

// Helper: Ensure round exists for season
const ensureRoundForSeason = async (seasonId: number, roundNumber?: number): Promise<number> => {
  const roundNum = roundNumber || 1;
  
  const existingRound = await query<{ round_id: number }>(
    `SELECT round_id FROM season_rounds WHERE season_id = @seasonId AND round_number = @roundNum`,
    { seasonId, roundNum }
  );

  if (existingRound.recordset.length > 0) {
    return existingRound.recordset[0].round_id;
  }

  const roundResult = await query<{ round_id: number }>(
    `
      INSERT INTO season_rounds (season_id, round_number, name, status)
      OUTPUT INSERTED.round_id
      VALUES (@seasonId, @roundNum, 'Round ' + CAST(@roundNum AS VARCHAR), 'planned');
    `,
    { seasonId, roundNum }
  );

  return roundResult.recordset[0].round_id;
};

// Helper: Get or create default stadium
const ensureDefaultStadium = async (): Promise<number> => {
  const existingStadium = await query<{ stadium_id: number }>(
    `SELECT TOP 1 stadium_id FROM stadiums ORDER BY created_at DESC`
  );

  if (existingStadium.recordset.length > 0) {
    return existingStadium.recordset[0].stadium_id;
  }

  const stadiumResult = await query<{ stadium_id: number }>(
    `
      INSERT INTO stadiums (name, city, capacity, is_certified)
      OUTPUT INSERTED.stadium_id
      VALUES ('Default Stadium', 'Default City', 50000, 1);
    `
  );

  return stadiumResult.recordset[0].stadium_id;
};

// Helper: Ensure team is registered in season
const ensureTeamInSeason = async (teamId: number, seasonId: number): Promise<number> => {
  const existing = await query<{ season_team_id: number }>(
    `SELECT season_team_id FROM season_team_participants 
     WHERE season_id = @seasonId AND team_id = @teamId`,
    { seasonId, teamId }
  );

  if (existing.recordset.length > 0) {
    return existing.recordset[0].season_team_id;
  }

  const result = await query<{ season_team_id: number }>(
    `
      INSERT INTO season_team_participants (season_id, team_id, status)
      OUTPUT INSERTED.season_team_id
      VALUES (@seasonId, @teamId, 'active');
    `,
    { seasonId, teamId }
  );

  return result.recordset[0].season_team_id;
};

export const createMatch = async (input: CreateMatchInput): Promise<MatchRecord> => {
  const seasonId = input.seasonId || await ensureDefaultSeason();
  const roundId = await ensureRoundForSeason(seasonId, input.roundNumber);
  const stadiumId = input.stadiumId || await ensureDefaultStadium();
  
  const homeSeasonTeamId = await ensureTeamInSeason(input.homeTeamId, seasonId);
  const awaySeasonTeamId = await ensureTeamInSeason(input.awayTeamId, seasonId);

  const rulesetResult = await query<{ ruleset_id: number }>(
    `SELECT ruleset_id FROM seasons WHERE season_id = @seasonId`,
    { seasonId }
  );
  const rulesetId = rulesetResult.recordset[0].ruleset_id;

  const matchResult = await query<{ match_id: number }>(
    `
      INSERT INTO matches (
        season_id, round_id, matchday_number,
        home_season_team_id, away_season_team_id,
        stadium_id, ruleset_id, scheduled_kickoff, status
      )
      OUTPUT INSERTED.match_id
      VALUES (
        @seasonId, @roundId, @matchdayNumber,
        @homeSeasonTeamId, @awaySeasonTeamId,
        @stadiumId, @rulesetId, @scheduledKickoff, @status
      );
    `,
    {
      seasonId,
      roundId,
      matchdayNumber: input.matchdayNumber || 1,
      homeSeasonTeamId,
      awaySeasonTeamId,
      stadiumId,
      rulesetId,
      scheduledKickoff: input.scheduledKickoff,
      status: input.status || 'scheduled'
    }
  );

  const matchId = matchResult.recordset[0].match_id;
  const created = await getMatchById(matchId);
  
  if (!created) {
    throw new Error("Failed to retrieve newly created match");
  }

  return created;
};

export const listMatches = async (filters: MatchFilters = {}): Promise<PaginatedMatches> => {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit
    ? Math.min(Math.max(filters.limit, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: Record<string, unknown> = { offset, limit };

  if (filters.status) {
    conditions.push("m.status = @status");
    params.status = filters.status;
  }
  if (filters.seasonId) {
    conditions.push("m.season_id = @seasonId");
    params.seasonId = filters.seasonId;
  }
  if (filters.search) {
    conditions.push("(ht.name LIKE @search OR at.name LIKE @search)");
    params.search = `%${filters.search.trim()}%`;
  }
  if (filters.teamId) {
    conditions.push(`(
      EXISTS (SELECT 1 FROM season_team_participants stp1 
              WHERE stp1.season_team_id = m.home_season_team_id AND stp1.team_id = @teamId)
      OR
      EXISTS (SELECT 1 FROM season_team_participants stp2
              WHERE stp2.season_team_id = m.away_season_team_id AND stp2.team_id = @teamId)
    )`);
    params.teamId = filters.teamId;
  }
  if (filters.dateFrom) {
    conditions.push("m.scheduled_kickoff >= @dateFrom");
    params.dateFrom = filters.dateFrom;
  }
  if (filters.dateTo) {
    conditions.push("m.scheduled_kickoff <= @dateTo");
    params.dateTo = filters.dateTo;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataResult = await query(
    `
      SELECT
        m.match_id AS matchId,
        m.season_id AS seasonId,
        m.round_id AS roundId,
        m.matchday_number AS matchdayNumber,
        hstp.team_id AS homeTeamId,
        ht.name AS homeTeamName,
        astp.team_id AS awayTeamId,
        at.name AS awayTeamName,
        m.stadium_id AS stadiumId,
        s.name AS stadiumName,
        CONVERT(VARCHAR(33), m.scheduled_kickoff, 127) AS scheduledKickoff,
        m.status,
        m.home_score AS homeScore,
        m.away_score AS awayScore,
        m.attendance,
        m.match_code AS matchCode,
        CONVERT(VARCHAR(33), m.updated_at, 127) AS updatedAt
      FROM matches m
      INNER JOIN season_team_participants hstp ON m.home_season_team_id = hstp.season_team_id
      INNER JOIN teams ht ON hstp.team_id = ht.team_id
      INNER JOIN season_team_participants astp ON m.away_season_team_id = astp.season_team_id
      INNER JOIN teams at ON astp.team_id = at.team_id
      LEFT JOIN stadiums s ON m.stadium_id = s.stadium_id
      ${whereClause}
      ORDER BY m.scheduled_kickoff DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `,
    params
  );

  const countResult = await query<{ total: number }>(
    `
      SELECT COUNT(1) AS total
      FROM matches m
      INNER JOIN season_team_participants hstp ON m.home_season_team_id = hstp.season_team_id
      INNER JOIN season_team_participants astp ON m.away_season_team_id = astp.season_team_id
      ${whereClause};
    `,
    params
  );

  const total = countResult.recordset[0]?.total ?? 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  return {
    data: dataResult.recordset,
    total,
    page,
    limit,
    totalPages
  };
};

export const getMatchById = async (matchId: number): Promise<MatchRecord | null> => {
  const result = await query(
    `
      SELECT
        m.match_id AS matchId,
        m.season_id AS seasonId,
        m.round_id AS roundId,
        m.matchday_number AS matchdayNumber,
        hstp.team_id AS homeTeamId,
        ht.name AS homeTeamName,
        astp.team_id AS awayTeamId,
        at.name AS awayTeamName,
        m.stadium_id AS stadiumId,
        s.name AS stadiumName,
        CONVERT(VARCHAR(33), m.scheduled_kickoff, 127) AS scheduledKickoff,
        m.status,
        m.home_score AS homeScore,
        m.away_score AS awayScore,
        m.attendance,
        m.match_code AS matchCode,
        CONVERT(VARCHAR(33), m.updated_at, 127) AS updatedAt
      FROM matches m
      INNER JOIN season_team_participants hstp ON m.home_season_team_id = hstp.season_team_id
      INNER JOIN teams ht ON hstp.team_id = ht.team_id
      INNER JOIN season_team_participants astp ON m.away_season_team_id = astp.season_team_id
      INNER JOIN teams at ON astp.team_id = at.team_id
      LEFT JOIN stadiums s ON m.stadium_id = s.stadium_id
      WHERE m.match_id = @matchId;
    `,
    { matchId }
  );

  return result.recordset[0] || null;
};

export const updateMatch = async (
  matchId: number,
  payload: Partial<{
    status: string;
    homeScore: number | null;
    awayScore: number | null;
    attendance: number | null;
  }>
): Promise<MatchRecord | null> => {
  const fields: string[] = [];
  const params: Record<string, unknown> = { matchId };

  if (payload.status !== undefined) {
    fields.push("status = @status");
    params.status = payload.status;
  }
  if (payload.homeScore !== undefined) {
    fields.push("home_score = @homeScore");
    params.homeScore = payload.homeScore;
  }
  if (payload.awayScore !== undefined) {
    fields.push("away_score = @awayScore");
    params.awayScore = payload.awayScore;
  }
  if (payload.attendance !== undefined) {
    fields.push("attendance = @attendance");
    params.attendance = payload.attendance;
  }

  if (fields.length === 0) {
    return getMatchById(matchId);
  }

  fields.push("updated_at = SYSUTCDATETIME()");

  await query(
    `UPDATE matches SET ${fields.join(", ")} WHERE match_id = @matchId;`,
    params
  );

  const updatedMatch = await getMatchById(matchId);

  // Auto-update standings if match is completed and has scores
  if (updatedMatch && 
      payload.status === 'completed' && 
      payload.homeScore !== undefined && 
      payload.awayScore !== undefined) {
    try {
      console.log(`[updateMatch] Auto-calculating standings for season ${updatedMatch.seasonId}`);
      await calculateStandings(updatedMatch.seasonId);
    } catch (error) {
      console.error('[updateMatch] Failed to auto-calculate standings:', error);
      // Don't fail the match update if standings calculation fails
    }
  }

  return updatedMatch;
};

export const deleteMatch = async (matchId: number): Promise<boolean> => {
  const result = await query(
    "DELETE FROM matches WHERE match_id = @matchId;",
    { matchId }
  );
  
  return (result.rowsAffected?.[0] ?? 0) > 0;
};

export const listLiveMatches = async (): Promise<MatchRecord[]> => {
  const result = await query(
    `
      SELECT
        m.match_id AS matchId,
        m.season_id AS seasonId,
        m.round_id AS roundId,
        m.matchday_number AS matchdayNumber,
        hstp.team_id AS homeTeamId,
        ht.name AS homeTeamName,
        astp.team_id AS awayTeamId,
        at.name AS awayTeamName,
        m.stadium_id AS stadiumId,
        s.name AS stadiumName,
        CONVERT(VARCHAR(33), m.scheduled_kickoff, 127) AS scheduledKickoff,
        m.status,
        m.home_score AS homeScore,
        m.away_score AS awayScore,
        m.attendance,
        m.match_code AS matchCode,
        CONVERT(VARCHAR(33), m.updated_at, 127) AS updatedAt
      FROM matches m
      INNER JOIN season_team_participants hstp ON m.home_season_team_id = hstp.season_team_id
      INNER JOIN teams ht ON hstp.team_id = ht.team_id
      INNER JOIN season_team_participants astp ON m.away_season_team_id = astp.season_team_id
      INNER JOIN teams at ON astp.team_id = at.team_id
      LEFT JOIN stadiums s ON m.stadium_id = s.stadium_id
      WHERE m.status = 'in_progress'
      ORDER BY m.scheduled_kickoff DESC;
    `
  );

  return result.recordset;
};

// Generate random matches from active teams
export const generateRandomMatches = async (options: {
  count?: number;
  seasonId?: number;
  startDate?: string;
} = {}): Promise<{ created: number; matches: MatchRecord[] }> => {
  const seasonId = options.seasonId || await ensureDefaultSeason();
  const count = options.count || 10;
  
  // Get teams registered in this season
  const teamsResult = await query<{ team_id: number; season_team_id: number; name: string }>(
    `
      SELECT stp.team_id, stp.season_team_id, t.name
      FROM season_team_participants stp
      INNER JOIN teams t ON stp.team_id = t.team_id
      WHERE stp.season_id = @seasonId AND stp.status = 'active'
      ORDER BY NEWID();
    `,
    { seasonId }
  );

  const teams = teamsResult.recordset;
  
  if (teams.length < 2) {
    throw new Error(`Need at least 2 teams in season. Found: ${teams.length}`);
  }

  const stadiumId = await ensureDefaultStadium();
  const roundId = await ensureRoundForSeason(seasonId);
  const rulesetResult = await query<{ ruleset_id: number }>(
    `SELECT ruleset_id FROM seasons WHERE season_id = @seasonId`,
    { seasonId }
  );
  const rulesetId = rulesetResult.recordset[0].ruleset_id;

  const startDate = options.startDate ? new Date(options.startDate) : new Date();
  const createdMatches: MatchRecord[] = [];

  for (let i = 0; i < Math.min(count, Math.floor(teams.length / 2)); i++) {
    const homeTeam = teams[i * 2];
    const awayTeam = teams[i * 2 + 1];
    
    if (!homeTeam || !awayTeam) break;

    const kickoff = new Date(startDate.getTime() + i * 2 * 60 * 60 * 1000); // 2 hours apart

    const matchResult = await query<{ match_id: number }>(
      `
        INSERT INTO matches (
          season_id, round_id, matchday_number,
          home_season_team_id, away_season_team_id,
          stadium_id, ruleset_id, scheduled_kickoff, status
        )
        OUTPUT INSERTED.match_id
        VALUES (
          @seasonId, @roundId, @matchdayNumber,
          @homeSeasonTeamId, @awaySeasonTeamId,
          @stadiumId, @rulesetId, @scheduledKickoff, 'scheduled'
        );
      `,
      {
        seasonId,
        roundId,
        matchdayNumber: i + 1,
        homeSeasonTeamId: homeTeam.season_team_id,
        awaySeasonTeamId: awayTeam.season_team_id,
        stadiumId,
        rulesetId,
        scheduledKickoff: kickoff.toISOString()
      }
    );

    const match = await getMatchById(matchResult.recordset[0].match_id);
    if (match) {
      createdMatches.push(match);
    }
  }

  return {
    created: createdMatches.length,
    matches: createdMatches
  };
};

// Sync matches from Football-Data.org API to FootballMatches table
const upsertFootballMatch = async (match: MatchSummary): Promise<void> => {
  // Skip matches without required team data
  if (!match.homeTeam?.id || !match.homeTeam?.name || !match.awayTeam?.id || !match.awayTeam?.name) {
    console.warn(`Skipping match ${match.id}: missing required team data`);
    return;
  }

  // Skip matches without required base data
  if (!match.utcDate || !match.status) {
    console.warn(`Skipping match ${match.id}: missing required match data`);
    return;
  }

  const referee = match.referees?.find((r) => r.type === "REFEREE")?.name ?? null;
  
  await query(
    `
      MERGE FootballMatches AS target
      USING (
        SELECT 
          @externalId AS external_id,
          @utcDate AS utc_date,
          @status AS status,
          @stage AS stage,
          @groupName AS group_name,
          @matchday AS matchday,
          @season AS season,
          @competitionCode AS competition_code,
          @competitionName AS competition_name,
          @homeTeamId AS home_team_id,
          @homeTeamName AS home_team_name,
          @homeTeamTla AS home_team_tla,
          @awayTeamId AS away_team_id,
          @awayTeamName AS away_team_name,
          @awayTeamTla AS away_team_tla,
          @scoreHome AS score_home,
          @scoreAway AS score_away,
          @scoreHalfHome AS score_half_home,
          @scoreHalfAway AS score_half_away,
          @scoreEtHome AS score_et_home,
          @scoreEtAway AS score_et_away,
          @scorePkHome AS score_pk_home,
          @scorePkAway AS score_pk_away,
          @venue AS venue,
          @referee AS referee,
          @lastUpdated AS last_updated
      ) AS source
      ON target.external_id = source.external_id
      WHEN MATCHED THEN
        UPDATE SET
          utc_date = source.utc_date,
          status = source.status,
          stage = source.stage,
          group_name = source.group_name,
          matchday = source.matchday,
          season = source.season,
          competition_code = source.competition_code,
          competition_name = source.competition_name,
          home_team_id = source.home_team_id,
          home_team_name = source.home_team_name,
          home_team_tla = source.home_team_tla,
          away_team_id = source.away_team_id,
          away_team_name = source.away_team_name,
          away_team_tla = source.away_team_tla,
          score_home = source.score_home,
          score_away = source.score_away,
          score_half_home = source.score_half_home,
          score_half_away = source.score_half_away,
          score_et_home = source.score_et_home,
          score_et_away = source.score_et_away,
          score_pk_home = source.score_pk_home,
          score_pk_away = source.score_pk_away,
          venue = source.venue,
          referee = source.referee,
          last_updated = source.last_updated,
          updated_at = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (
          external_id, utc_date, status, stage, group_name, matchday, season,
          competition_code, competition_name,
          home_team_id, home_team_name, home_team_tla,
          away_team_id, away_team_name, away_team_tla,
          score_home, score_away, score_half_home, score_half_away,
          score_et_home, score_et_away, score_pk_home, score_pk_away,
          venue, referee, last_updated
        )
        VALUES (
          source.external_id, source.utc_date, source.status, source.stage, 
          source.group_name, source.matchday, source.season,
          source.competition_code, source.competition_name,
          source.home_team_id, source.home_team_name, source.home_team_tla,
          source.away_team_id, source.away_team_name, source.away_team_tla,
          source.score_home, source.score_away, source.score_half_home, source.score_half_away,
          source.score_et_home, source.score_et_away, source.score_pk_home, source.score_pk_away,
          source.venue, source.referee, source.last_updated
        );
    `,
    {
      externalId: match.id,
      utcDate: match.utcDate,
      status: match.status,
      stage: match.stage,
      groupName: match.group,
      matchday: match.matchday,
      season: match.season?.toString() ?? null,
      competitionCode: match.competition?.code ?? null,
      competitionName: match.competition?.name ?? null,
      homeTeamId: match.homeTeam.id,
      homeTeamName: match.homeTeam.name,
      homeTeamTla: match.homeTeam.tla,
      awayTeamId: match.awayTeam.id,
      awayTeamName: match.awayTeam.name,
      awayTeamTla: match.awayTeam.tla,
      scoreHome: match.score.fullTime?.home ?? null,
      scoreAway: match.score.fullTime?.away ?? null,
      scoreHalfHome: match.score.halfTime?.home ?? null,
      scoreHalfAway: match.score.halfTime?.away ?? null,
      scoreEtHome: match.score.extraTime?.home ?? null,
      scoreEtAway: match.score.extraTime?.away ?? null,
      scorePkHome: match.score.penalties?.home ?? null,
      scorePkAway: match.score.penalties?.away ?? null,
      venue: match.venue,
      referee,
      lastUpdated: match.lastUpdated,
    }
  );
};

// Get matches from FootballMatches (external API data)
export const listFootballMatches = async (filters: {
  status?: string;
  season?: string;
  dateFrom?: string;
  dateTo?: string;
  teamId?: number;
  search?: string;
  page?: number;
  limit?: number;
  showUnknown?: boolean;
} = {}): Promise<{
  data: Array<{
    id: number;
    externalId: number;
    utcDate: string;
    status: string;
    stage: string | null;
    groupName: string | null;
    matchday: number | null;
    season: string | null;
    competitionCode: string | null;
    competitionName: string | null;
    homeTeamId: number;
    homeTeamName: string;
    homeTeamTla: string | null;
    awayTeamId: number;
    awayTeamName: string;
    awayTeamTla: string | null;
    scoreHome: number | null;
    scoreAway: number | null;
    scoreHalfHome: number | null;
    scoreHalfAway: number | null;
    venue: string | null;
    referee: string | null;
    lastUpdated: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit ? Math.min(Math.max(filters.limit, 1), 100) : 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: Record<string, unknown> = { offset, limit };

  // By default, hide matches with unknown teams (teamId = 0)
  if (!filters.showUnknown) {
    conditions.push("home_team_id > 0 AND away_team_id > 0");
  }

  if (filters.status) {
    conditions.push("status = @status");
    params.status = filters.status;
  }
  if (filters.season) {
    conditions.push("season = @season");
    params.season = filters.season;
  }
  if (filters.dateFrom) {
    conditions.push("utc_date >= @dateFrom");
    params.dateFrom = filters.dateFrom;
  }
  if (filters.dateTo) {
    conditions.push("utc_date <= @dateTo");
    params.dateTo = filters.dateTo;
  }
  if (filters.teamId) {
    conditions.push("(home_team_id = @teamId OR away_team_id = @teamId)");
    params.teamId = filters.teamId;
  }
  if (filters.search) {
    conditions.push("(home_team_name LIKE @search OR away_team_name LIKE @search)");
    params.search = `%${filters.search.trim()}%`;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataResult = await query(
    `
      SELECT
        id,
        external_id AS externalId,
        CONVERT(VARCHAR(33), utc_date, 127) AS utcDate,
        status,
        stage,
        group_name AS groupName,
        matchday,
        season,
        competition_code AS competitionCode,
        competition_name AS competitionName,
        home_team_id AS homeTeamId,
        home_team_name AS homeTeamName,
        home_team_tla AS homeTeamTla,
        away_team_id AS awayTeamId,
        away_team_name AS awayTeamName,
        away_team_tla AS awayTeamTla,
        score_home AS scoreHome,
        score_away AS scoreAway,
        score_half_home AS scoreHalfHome,
        score_half_away AS scoreHalfAway,
        venue,
        referee,
        CONVERT(VARCHAR(33), last_updated, 127) AS lastUpdated
      FROM FootballMatches
      ${whereClause}
      ORDER BY utc_date DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `,
    params
  );

  const countResult = await query<{ total: number }>(
    `
      SELECT COUNT(1) AS total
      FROM FootballMatches
      ${whereClause};
    `,
    params
  );

  const total = countResult.recordset[0]?.total ?? 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  return {
    data: dataResult.recordset,
    total,
    page,
    limit,
    totalPages
  };
};

export const syncMatchesFromUpstream = async (options: {
  season?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): Promise<{
  season?: string;
  totalMatches: number;
  syncedMatches: number;
  skippedMatches: number;
}> => {
  const matches = await getCompetitionMatches(options);
  let syncedCount = 0;
  let skippedCount = 0;

  for (const match of matches) {
    // Check if match has required data before attempting to upsert
    if (!match.homeTeam?.id || !match.homeTeam?.name || !match.awayTeam?.id || !match.awayTeam?.name || !match.utcDate || !match.status) {
      skippedCount++;
      continue;
    }
    
    try {
      await upsertFootballMatch(match);
      syncedCount++;
    } catch (error) {
      console.error(`Failed to sync match ${match.id}:`, error);
      skippedCount++;
    }
  }

  console.log(`Synced ${syncedCount} matches, skipped ${skippedCount} matches out of ${matches.length} total`);

  return {
    season: options.season,
    totalMatches: syncedCount,
    syncedMatches: syncedCount,
    skippedMatches: skippedCount,
  };
};
