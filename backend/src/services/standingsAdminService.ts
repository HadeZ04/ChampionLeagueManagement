import { query } from "../db/sqlServer";

export interface StandingsRecord {
  seasonTeamId: number;
  teamId: number;
  teamName: string;
  shortName: string | null;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  currentRank: number | null;
}

export interface UpdateStandingsInput {
  seasonTeamId: number;
  wins?: number;
  draws?: number;
  losses?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  points?: number;
}

/**
 * Calculate standings from match results for a specific season
 */
export async function calculateStandings(seasonId: number): Promise<void> {
  console.log(`[calculateStandings] Starting calculation for season ${seasonId}`);

  // First, ensure all participating teams have a statistics record
  await query(
    `
    INSERT INTO season_team_statistics (season_id, season_team_id)
    SELECT stp.season_id, stp.season_team_id
    FROM season_team_participants stp
    WHERE stp.season_id = @seasonId
      AND NOT EXISTS (
        SELECT 1 FROM season_team_statistics sts
        WHERE sts.season_team_id = stp.season_team_id
      )
    `,
    { seasonId }
  );

  // Calculate statistics from completed matches
  await query(
    `
    WITH MatchStats AS (
      SELECT 
        m.season_id,
        m.home_season_team_id AS season_team_id,
        COUNT(*) AS matches_played,
        SUM(CASE 
          WHEN m.home_score > m.away_score THEN 1 
          ELSE 0 
        END) AS wins,
        SUM(CASE 
          WHEN m.home_score = m.away_score THEN 1 
          ELSE 0 
        END) AS draws,
        SUM(CASE 
          WHEN m.home_score < m.away_score THEN 1 
          ELSE 0 
        END) AS losses,
        SUM(m.home_score) AS goals_for,
        SUM(m.away_score) AS goals_against,
        SUM(CASE 
          WHEN m.home_score > m.away_score THEN 3 
          WHEN m.home_score = m.away_score THEN 1 
          ELSE 0 
        END) AS points
      FROM matches m
      WHERE m.season_id = @seasonId
        AND m.status = 'completed'
        AND m.home_score IS NOT NULL
        AND m.away_score IS NOT NULL
      GROUP BY m.season_id, m.home_season_team_id
      
      UNION ALL
      
      SELECT 
        m.season_id,
        m.away_season_team_id AS season_team_id,
        COUNT(*) AS matches_played,
        SUM(CASE 
          WHEN m.away_score > m.home_score THEN 1 
          ELSE 0 
        END) AS wins,
        SUM(CASE 
          WHEN m.away_score = m.home_score THEN 1 
          ELSE 0 
        END) AS draws,
        SUM(CASE 
          WHEN m.away_score < m.home_score THEN 1 
          ELSE 0 
        END) AS losses,
        SUM(m.away_score) AS goals_for,
        SUM(m.home_score) AS goals_against,
        SUM(CASE 
          WHEN m.away_score > m.home_score THEN 3 
          WHEN m.away_score = m.home_score THEN 1 
          ELSE 0 
        END) AS points
      FROM matches m
      WHERE m.season_id = @seasonId
        AND m.status = 'completed'
        AND m.home_score IS NOT NULL
        AND m.away_score IS NOT NULL
      GROUP BY m.season_id, m.away_season_team_id
    ),
    AggregatedStats AS (
      SELECT 
        season_id,
        season_team_id,
        SUM(matches_played) AS total_matches,
        SUM(wins) AS total_wins,
        SUM(draws) AS total_draws,
        SUM(losses) AS total_losses,
        SUM(goals_for) AS total_goals_for,
        SUM(goals_against) AS total_goals_against,
        SUM(points) AS total_points
      FROM MatchStats
      GROUP BY season_id, season_team_id
    )
    UPDATE sts
    SET 
      sts.matches_played = ISNULL(agg.total_matches, 0),
      sts.wins = ISNULL(agg.total_wins, 0),
      sts.draws = ISNULL(agg.total_draws, 0),
      sts.losses = ISNULL(agg.total_losses, 0),
      sts.goals_for = ISNULL(agg.total_goals_for, 0),
      sts.goals_against = ISNULL(agg.total_goals_against, 0),
      sts.points = ISNULL(agg.total_points, 0),
      sts.last_updated_at = SYSUTCDATETIME()
    FROM season_team_statistics sts
    LEFT JOIN AggregatedStats agg ON sts.season_team_id = agg.season_team_id
    WHERE sts.season_id = @seasonId
    `,
    { seasonId }
  );

  // Update rankings
  await updateRankings(seasonId);

  console.log(`[calculateStandings] Completed calculation for season ${seasonId}`);
}

/**
 * Update rankings based on points, goal difference, and goals for
 */
async function updateRankings(seasonId: number): Promise<void> {
  await query(
    `
    WITH RankedTeams AS (
      SELECT 
        season_team_id,
        ROW_NUMBER() OVER (
          ORDER BY points DESC, goal_difference DESC, goals_for DESC
        ) AS rank_position
      FROM season_team_statistics
      WHERE season_id = @seasonId
    )
    UPDATE sts
    SET sts.current_rank = rt.rank_position
    FROM season_team_statistics sts
    INNER JOIN RankedTeams rt ON sts.season_team_id = rt.season_team_id
    WHERE sts.season_id = @seasonId
    `,
    { seasonId }
  );
}

/**
 * Get standings for a season
 */
export async function getStandingsForSeason(seasonId: number): Promise<StandingsRecord[]> {
  const result = await query<{
    season_team_id: number;
    team_id: number;
    team_name: string;
    short_name: string | null;
    matches_played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    points: number;
    current_rank: number | null;
  }>(
    `
    SELECT 
      sts.season_team_id,
      t.team_id,
      t.name AS team_name,
      t.short_name,
      sts.matches_played,
      sts.wins,
      sts.draws,
      sts.losses,
      sts.goals_for,
      sts.goals_against,
      sts.goal_difference,
      sts.points,
      sts.current_rank
    FROM season_team_statistics sts
    INNER JOIN season_team_participants stp ON sts.season_team_id = stp.season_team_id
    INNER JOIN teams t ON stp.team_id = t.team_id
    WHERE sts.season_id = @seasonId
    ORDER BY sts.points DESC, sts.goal_difference DESC, sts.goals_for DESC
    `,
    { seasonId }
  );

  return result.recordset.map(row => ({
    seasonTeamId: row.season_team_id,
    teamId: row.team_id,
    teamName: row.team_name,
    shortName: row.short_name,
    matchesPlayed: row.matches_played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    goalDifference: row.goal_difference,
    points: row.points,
    currentRank: row.current_rank,
  }));
}

/**
 * Manually update standings for a team (for admin corrections)
 */
export async function updateTeamStandings(
  seasonTeamId: number,
  updates: UpdateStandingsInput
): Promise<void> {
  const setClauses: string[] = [];
  const params: Record<string, any> = {
    seasonTeamId,
    winsValue: updates.wins ?? null,
    drawsValue: updates.draws ?? null,
    lossesValue: updates.losses ?? null,
  };

  if (updates.wins !== undefined) {
    setClauses.push("wins = @winsValue");
  }
  if (updates.draws !== undefined) {
    setClauses.push("draws = @drawsValue");
  }
  if (updates.losses !== undefined) {
    setClauses.push("losses = @lossesValue");
  }
  if (updates.goalsFor !== undefined) {
    setClauses.push("goals_for = @goalsFor");
    params.goalsFor = updates.goalsFor;
  }
  if (updates.goalsAgainst !== undefined) {
    setClauses.push("goals_against = @goalsAgainst");
    params.goalsAgainst = updates.goalsAgainst;
  }
  if (updates.points !== undefined) {
    setClauses.push("points = @points");
    params.points = updates.points;
  }

  if (setClauses.length === 0) {
    return;
  }

  // Update the record
  await query(
    `
    UPDATE season_team_statistics
    SET 
      ${setClauses.join(", ")},
      matches_played = COALESCE(@winsValue, wins) + COALESCE(@drawsValue, draws) + COALESCE(@lossesValue, losses),
      last_updated_at = SYSUTCDATETIME()
    WHERE season_team_id = @seasonTeamId
    `,
    params
  );

  // Get the season_id for this team to update rankings
  const seasonResult = await query<{ season_id: number }>(
    `SELECT season_id FROM season_team_statistics WHERE season_team_id = @seasonTeamId`,
    { seasonTeamId }
  );

  if (seasonResult.recordset.length > 0) {
    await updateRankings(seasonResult.recordset[0].season_id);
  }
}

/**
 * Delete standings record (reset)
 */
export async function resetTeamStandings(seasonTeamId: number): Promise<void> {
  await query(
    `
    UPDATE season_team_statistics
    SET 
      matches_played = 0,
      wins = 0,
      draws = 0,
      losses = 0,
      goals_for = 0,
      goals_against = 0,
      points = 0,
      current_rank = NULL,
      last_updated_at = SYSUTCDATETIME()
    WHERE season_team_id = @seasonTeamId
    `,
    { seasonTeamId }
  );
}

/**
 * Initialize standings for all teams in a season (create empty records)
 */
export async function initializeStandingsForSeason(seasonId: number): Promise<number> {
  const result = await query<{ count: number }>(
    `
    INSERT INTO season_team_statistics (season_id, season_team_id)
    SELECT stp.season_id, stp.season_team_id
    FROM season_team_participants stp
    WHERE stp.season_id = @seasonId
      AND stp.status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM season_team_statistics sts
        WHERE sts.season_team_id = stp.season_team_id
      );
    
    SELECT @@ROWCOUNT AS count;
    `,
    { seasonId }
  );

  return result.recordset[0]?.count || 0;
}

/**
 * Get standings by team
 */
export async function getTeamStandings(seasonTeamId: number): Promise<StandingsRecord | null> {
  const result = await query<{
    season_team_id: number;
    team_id: number;
    team_name: string;
    short_name: string | null;
    matches_played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    points: number;
    current_rank: number | null;
  }>(
    `
    SELECT 
      sts.season_team_id,
      t.team_id,
      t.name AS team_name,
      t.short_name,
      sts.matches_played,
      sts.wins,
      sts.draws,
      sts.losses,
      sts.goals_for,
      sts.goals_against,
      sts.goal_difference,
      sts.points,
      sts.current_rank
    FROM season_team_statistics sts
    INNER JOIN season_team_participants stp ON sts.season_team_id = stp.season_team_id
    INNER JOIN teams t ON stp.team_id = t.team_id
    WHERE sts.season_team_id = @seasonTeamId
    `,
    { seasonTeamId }
  );

  if (result.recordset.length === 0) {
    return null;
  }

  const row = result.recordset[0];
  return {
    seasonTeamId: row.season_team_id,
    teamId: row.team_id,
    teamName: row.team_name,
    shortName: row.short_name,
    matchesPlayed: row.matches_played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    goalDifference: row.goal_difference,
    points: row.points,
    currentRank: row.current_rank,
  };
}

