import { query } from "../db/sqlServer";

export interface RoundRobinMatch {
  match_id: number;
  round: number;
  home_team_id: number;
  home_team_name: string;
  away_team_id: number;
  away_team_name: string;
  match_date: string | null;
  status: string;
}

/**
 * Generate Round-Robin schedule for a season
 * Generates 18 rounds with 5 matches each for 10 teams
 */
export async function generateRoundRobinSchedule(
  seasonId: number,
  startDate: string
): Promise<RoundRobinMatch[]> {
  // Get all teams registered for the season
  const teamsResult = await query<{ team_id: number; name: string }>(
    `
    SELECT t.team_id, t.name
    FROM teams t
    INNER JOIN season_team_registrations str ON t.team_id = str.team_id
    WHERE str.season_id = @seasonId
    ORDER BY t.team_id ASC
  `,
    { seasonId }
  );

  const teams = teamsResult.recordset;
  const numTeams = teams.length;

  if (numTeams < 2) {
    throw new Error("Insufficient teams for scheduling");
  }

  // Generate round-robin pairings (18 rounds for 10 teams: 18 * 2 = 36 matches total)
  const matches: Array<{
    round: number;
    home_team_id: number;
    away_team_id: number;
  }> = [];

  // Round-robin algorithm: fix last team, rotate others
  const n = numTeams;
  const totalRounds = n % 2 === 0 ? n - 1 : n;

  for (let round = 0; round < totalRounds * 2; round++) {
    const currentRound = Math.floor(round / 2) + 1;
    const isReverse = round % 2 === 1;

    for (let i = 0; i < Math.floor(n / 2); i++) {
      let homeIdx = i;
      let awayIdx = n - 1 - i;

      if (isReverse) {
        [homeIdx, awayIdx] = [awayIdx, homeIdx];
      }

      matches.push({
        round: currentRound,
        home_team_id: teams[homeIdx].team_id,
        away_team_id: teams[awayIdx].team_id,
      });
    }

    // Rotate teams for next round (keep last team fixed)
    if (round < totalRounds * 2 - 1) {
      const rotated = [teams[n - 1], ...teams.slice(0, n - 1)];
      teams.splice(0, n, ...rotated);
    }
  }

  // Insert matches into database
  const date = new Date(startDate);
  const createdMatches: RoundRobinMatch[] = [];

  for (const match of matches) {
    const matchDate = new Date(date);
    matchDate.setDate(matchDate.getDate() + (match.round - 1) * 7); // One week per round

    const result = await query<RoundRobinMatch>(
      `
      INSERT INTO matches (
        season_id, round, home_team_id, away_team_id, match_date,
        status, created_at
      )
      OUTPUT INSERTED.*
      VALUES (
        @seasonId, @round, @homeTeamId, @awayTeamId, @matchDate,
        'scheduled', GETUTCDATE()
      )
    `,
      {
        seasonId,
        round: match.round,
        homeTeamId: match.home_team_id,
        awayTeamId: match.away_team_id,
        matchDate: matchDate.toISOString(),
      }
    );

    const homeTeam = teams.find((t) => t.team_id === match.home_team_id);
    const awayTeam = teams.find((t) => t.team_id === match.away_team_id);

    createdMatches.push({
      ...result.recordset[0],
      home_team_name: homeTeam?.name || "",
      away_team_name: awayTeam?.name || "",
    });
  }

  return createdMatches;
}

/**
 * Get round-robin schedule for a season
 */
export async function getSchedule(seasonId: number): Promise<RoundRobinMatch[]> {
  const result = await query<RoundRobinMatch>(
    `
    SELECT
      m.match_id,
      m.round,
      m.home_team_id,
      ht.name AS home_team_name,
      m.away_team_id,
      at.name AS away_team_name,
      CONVERT(VARCHAR(23), m.match_date, 126) AS match_date,
      m.status
    FROM matches m
    INNER JOIN teams ht ON m.home_team_id = ht.team_id
    INNER JOIN teams at ON m.away_team_id = at.team_id
    WHERE m.season_id = @seasonId
    ORDER BY m.round ASC, m.match_date ASC
  `,
    { seasonId }
  );

  return result.recordset;
}

/**
 * Get matches by round
 */
export async function getMatchesByRound(
  seasonId: number,
  round: number
): Promise<RoundRobinMatch[]> {
  const result = await query<RoundRobinMatch>(
    `
    SELECT
      m.match_id,
      m.round,
      m.home_team_id,
      ht.name AS home_team_name,
      m.away_team_id,
      at.name AS away_team_name,
      CONVERT(VARCHAR(23), m.match_date, 126) AS match_date,
      m.status
    FROM matches m
    INNER JOIN teams ht ON m.home_team_id = ht.team_id
    INNER JOIN teams at ON m.away_team_id = at.team_id
    WHERE m.season_id = @seasonId AND m.round = @round
    ORDER BY m.match_date ASC
  `,
    { seasonId, round }
  );

  return result.recordset;
}

/**
 * Calculate Tiebreaker: Head-to-head points + Goal difference + Goals scored
 */
export async function calculateTiebreaker(
  seasonId: number,
  teamIds: number[]
): Promise<
  Array<{
    team_id: number;
    team_name: string;
    points: number;
    h2h_points: number;
    h2h_goal_diff: number;
    h2h_goals: number;
    overall_goal_diff: number;
    overall_goals: number;
  }>
> {
  // Get standings with head-to-head stats
  const teamIdList = teamIds.join(",");

  const result = await query(
    `
    SELECT
      t.team_id,
      t.name AS team_name,
      s.points,
      s.goal_difference AS overall_goal_diff,
      s.goals_for AS overall_goals,
      -- Head to head calculations
      SUM(CASE
        WHEN (m.home_team_id = t.team_id AND m.home_team_score > m.away_team_score) THEN 3
        WHEN (m.away_team_id = t.team_id AND m.away_team_score > m.home_team_score) THEN 3
        WHEN (m.home_team_score = m.away_team_score) THEN 1
        ELSE 0
      END) AS h2h_points,
      SUM(CASE
        WHEN m.home_team_id = t.team_id THEN m.home_team_score - m.away_team_score
        WHEN m.away_team_id = t.team_id THEN m.away_team_score - m.home_team_score
        ELSE 0
      END) AS h2h_goal_diff,
      SUM(CASE
        WHEN m.home_team_id = t.team_id THEN m.home_team_score
        WHEN m.away_team_id = t.team_id THEN m.away_team_score
        ELSE 0
      END) AS h2h_goals
    FROM teams t
    INNER JOIN standings s ON t.team_id = s.team_id
    LEFT JOIN matches m ON (m.home_team_id = t.team_id OR m.away_team_id = t.team_id)
      AND m.season_id = @seasonId
      AND m.status = 'completed'
      AND (m.home_team_id IN (${teamIdList}) AND m.away_team_id IN (${teamIdList}))
    WHERE t.team_id IN (${teamIdList})
    AND s.season_id = @seasonId
    GROUP BY t.team_id, t.name, s.points, s.goal_difference, s.goals_for
    ORDER BY h2h_points DESC, h2h_goal_diff DESC, h2h_goals DESC
  `,
    { seasonId }
  );

  return result.recordset;
}
