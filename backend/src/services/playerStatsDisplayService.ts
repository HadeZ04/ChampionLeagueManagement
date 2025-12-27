import { query } from "../db/sqlServer";

export interface PlayerStatistics {
  player_id: number;
  player_name: string;
  team_id: number;
  team_name: string;
  height_cm: number | null;
  weight_kg: number | null;
  age: number | null;
  goals_scored: number;
  assists: number;
  matches_played: number;
  yellow_cards: number;
  red_cards: number;
  pom_count: number;
}

/**
 * Get player statistics for a season
 */
export async function getPlayerStatistics(
  seasonId: number,
  playerId?: number
): Promise<PlayerStatistics[]> {
  let whereClause = "WHERE m.season_id = @seasonId";
  const params: Record<string, unknown> = { seasonId };

  if (playerId) {
    whereClause += " AND p.player_id = @playerId";
    params.playerId = playerId;
  }

  const result = await query<PlayerStatistics>(
    `
    SELECT
      p.player_id,
      p.name AS player_name,
      p.team_id,
      t.name AS team_name,
      p.height_cm,
      p.weight_kg,
      YEAR(GETDATE()) - YEAR(p.date_of_birth) AS age,
      SUM(CASE WHEN (
        SELECT COUNT(*) FROM goals g WHERE g.player_id = p.player_id AND g.match_id = m.match_id
      ) > 0 THEN 1 ELSE 0 END) AS goals_scored,
      SUM(CASE WHEN (
        SELECT COUNT(*) FROM assists a WHERE a.player_id = p.player_id AND a.match_id = m.match_id
      ) > 0 THEN 1 ELSE 0 END) AS assists,
      COUNT(DISTINCT m.match_id) AS matches_played,
      (SELECT COUNT(*) FROM yellow_cards yc WHERE yc.player_id = p.player_id AND yc.match_id IN (SELECT match_id FROM matches WHERE season_id = @seasonId)) AS yellow_cards,
      (SELECT COUNT(*) FROM red_cards rc WHERE rc.player_id = p.player_id AND rc.match_id IN (SELECT match_id FROM matches WHERE season_id = @seasonId)) AS red_cards,
      (SELECT COUNT(*) FROM player_of_match pom WHERE pom.player_id = p.player_id AND pom.match_id IN (SELECT match_id FROM matches WHERE season_id = @seasonId)) AS pom_count
    FROM players p
    INNER JOIN teams t ON p.team_id = t.team_id
    LEFT JOIN matches m ON (m.home_team_id = p.team_id OR m.away_team_id = p.team_id) AND m.season_id = @seasonId
    ${whereClause}
    GROUP BY p.player_id, p.name, p.team_id, t.name, p.height_cm, p.weight_kg, p.date_of_birth
    ORDER BY goals_scored DESC
  `,
    params
  );

  return result.recordset;
}

/**
 * Get player physical statistics
 */
export async function getPlayerPhysicalStats(playerId: number): Promise<{
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  date_of_birth: string | null;
}> {
  const result = await query<{
    height_cm: number;
    weight_kg: number;
    date_of_birth: string;
  }>(
    `
    SELECT
      height_cm,
      weight_kg,
      CONVERT(VARCHAR(10), date_of_birth, 23) AS date_of_birth
    FROM players
    WHERE player_id = @playerId
  `,
    { playerId }
  );

  const player = result.recordset[0];
  if (!player) {
    return {
      height_cm: null,
      weight_kg: null,
      bmi: null,
      date_of_birth: null,
    };
  }

  // Calculate BMI: weight(kg) / (height(m))^2
  let bmi = null;
  if (player.height_cm && player.weight_kg) {
    const heightMeters = player.height_cm / 100;
    bmi = player.weight_kg / (heightMeters * heightMeters);
    bmi = Math.round(bmi * 100) / 100; // Round to 2 decimals
  }

  return {
    height_cm: player.height_cm,
    weight_kg: player.weight_kg,
    bmi,
    date_of_birth: player.date_of_birth,
  };
}

/**
 * Get top scorers in a season
 */
export async function getTopScorers(
  seasonId: number,
  limit: number = 10
): Promise<
  Array<{
    player_id: number;
    player_name: string;
    team_name: string;
    goals: number;
  }>
> {
  const result = await query(
    `
    SELECT TOP @limit
      p.player_id,
      p.name AS player_name,
      t.name AS team_name,
      COUNT(*) AS goals
    FROM goals g
    INNER JOIN players p ON g.player_id = p.player_id
    INNER JOIN teams t ON p.team_id = t.team_id
    INNER JOIN matches m ON g.match_id = m.match_id
    WHERE m.season_id = @seasonId
    GROUP BY p.player_id, p.name, t.team_id, t.name
    ORDER BY goals DESC
  `,
    { seasonId, limit }
  );

  return result.recordset;
}

/**
 * Get assists leaders in a season
 */
export async function getAssistsLeaders(
  seasonId: number,
  limit: number = 10
): Promise<
  Array<{
    player_id: number;
    player_name: string;
    team_name: string;
    assists: number;
  }>
> {
  const result = await query(
    `
    SELECT TOP @limit
      p.player_id,
      p.name AS player_name,
      t.name AS team_name,
      COUNT(*) AS assists
    FROM assists a
    INNER JOIN players p ON a.player_id = p.player_id
    INNER JOIN teams t ON p.team_id = t.team_id
    INNER JOIN matches m ON a.match_id = m.match_id
    WHERE m.season_id = @seasonId
    GROUP BY p.player_id, p.name, t.team_id, t.name
    ORDER BY assists DESC
  `,
    { seasonId, limit }
  );

  return result.recordset;
}

/**
 * Get players by height range
 */
export async function getPlayersByHeightRange(
  minHeight: number,
  maxHeight: number
): Promise<PlayerStatistics[]> {
  const result = await query<PlayerStatistics>(
    `
    SELECT
      p.player_id,
      p.name AS player_name,
      p.team_id,
      t.name AS team_name,
      p.height_cm,
      p.weight_kg,
      YEAR(GETDATE()) - YEAR(p.date_of_birth) AS age,
      0 AS goals_scored,
      0 AS assists,
      0 AS matches_played,
      0 AS yellow_cards,
      0 AS red_cards,
      0 AS pom_count
    FROM players p
    INNER JOIN teams t ON p.team_id = t.team_id
    WHERE p.height_cm IS NOT NULL
    AND p.height_cm >= @minHeight
    AND p.height_cm <= @maxHeight
    ORDER BY p.height_cm DESC
  `,
    { minHeight, maxHeight }
  );

  return result.recordset;
}

/**
 * Get players by weight range
 */
export async function getPlayersByWeightRange(
  minWeight: number,
  maxWeight: number
): Promise<PlayerStatistics[]> {
  const result = await query<PlayerStatistics>(
    `
    SELECT
      p.player_id,
      p.name AS player_name,
      p.team_id,
      t.name AS team_name,
      p.height_cm,
      p.weight_kg,
      YEAR(GETDATE()) - YEAR(p.date_of_birth) AS age,
      0 AS goals_scored,
      0 AS assists,
      0 AS matches_played,
      0 AS yellow_cards,
      0 AS red_cards,
      0 AS pom_count
    FROM players p
    INNER JOIN teams t ON p.team_id = t.team_id
    WHERE p.weight_kg IS NOT NULL
    AND p.weight_kg >= @minWeight
    AND p.weight_kg <= @maxWeight
    ORDER BY p.weight_kg DESC
  `,
    { minWeight, maxWeight }
  );

  return result.recordset;
}

/**
 * Get average physical stats by team
 */
export async function getTeamPhysicalAverages(teamId: number): Promise<{
  average_height_cm: number;
  average_weight_kg: number;
  player_count: number;
}> {
  const result = await query<{
    average_height_cm: number;
    average_weight_kg: number;
    player_count: number;
  }>(
    `
    SELECT
      AVG(CAST(height_cm AS FLOAT)) AS average_height_cm,
      AVG(CAST(weight_kg AS FLOAT)) AS average_weight_kg,
      COUNT(*) AS player_count
    FROM players
    WHERE team_id = @teamId
    AND height_cm IS NOT NULL
    AND weight_kg IS NOT NULL
  `,
    { teamId }
  );

  return result.recordset[0] || {
    average_height_cm: 0,
    average_weight_kg: 0,
    player_count: 0,
  };
}
