import { query } from "../db/sqlServer";

/**
 * Enhanced Standings Service with Head-to-Head Tie-Break Support
 * Supports both LIVE (in-season) and FINAL (end-of-season) rankings
 */

export type StandingsMode = "live" | "final";

export interface HeadToHeadRecord {
  opponentTeamId: number;
  opponentTeamName: string;
  teamGoals: number;
  opponentGoals: number;
}

export interface TieBreakInfo {
  usedHeadToHead: boolean;
  headToHeadRecords?: HeadToHeadRecord[];
  drawLotsRequired?: boolean;
  tieBreakNote?: string;
}

export interface TeamStanding {
  seasonTeamId: number;
  teamId: number;
  teamName: string;
  shortName: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  rank: number;
  tieBreakInfo?: TieBreakInfo;
}

/**
 * Main function to get season standings with specified mode
 */
export async function getSeasonStandings(
  seasonId: number,
  mode: StandingsMode = "live"
): Promise<TeamStanding[]> {
  console.log(`[getSeasonStandings] Season ${seasonId}, Mode: ${mode}`);

  // Step 1: Get raw standings data
  const rawStandings = await getRawStandings(seasonId);

  if (rawStandings.length === 0) {
    return [];
  }

  // Step 2: Apply tie-break logic based on mode
  let sortedStandings: TeamStanding[];
  
  if (mode === "live") {
    // LIVE mode: Only use points and goal difference
    sortedStandings = applyLiveTieBreak(rawStandings);
  } else {
    // FINAL mode: Apply full tie-break rules including head-to-head
    sortedStandings = await applyFinalTieBreak(rawStandings, seasonId);
  }

  // Step 3: Assign final ranks
  sortedStandings.forEach((team, index) => {
    team.rank = index + 1;
  });

  return sortedStandings;
}

/**
 * Get raw standings data from database
 */
async function getRawStandings(seasonId: number): Promise<TeamStanding[]> {
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
      sts.points
    FROM season_team_statistics sts
    INNER JOIN season_team_participants stp ON sts.season_team_id = stp.season_team_id
    INNER JOIN teams t ON stp.team_id = t.team_id
    WHERE sts.season_id = @seasonId
    ORDER BY sts.points DESC, sts.goal_difference DESC, sts.goals_for DESC
    `,
    { seasonId }
  );

  return result.recordset.map((row) => ({
    seasonTeamId: row.season_team_id,
    teamId: row.team_id,
    teamName: row.team_name,
    shortName: row.short_name,
    played: row.matches_played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    goalDifference: row.goal_difference,
    points: row.points,
    rank: 0, // Will be assigned later
  }));
}

/**
 * LIVE mode tie-break: Sort by points, goal difference, goals for
 */
function applyLiveTieBreak(standings: TeamStanding[]): TeamStanding[] {
  return [...standings].sort((a, b) => {
    // 1. Points (descending)
    if (a.points !== b.points) return b.points - a.points;
    
    // 2. Goal difference (descending)
    if (a.goalDifference !== b.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    
    // 3. Goals for (descending)
    if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
    
    // 4. Stable sort by team ID to ensure consistency
    return a.teamId - b.teamId;
  });
}

/**
 * FINAL mode tie-break: Apply full rules including head-to-head
 */
async function applyFinalTieBreak(
  standings: TeamStanding[],
  seasonId: number
): Promise<TeamStanding[]> {
  // First, sort by points and goal difference
  let sorted = [...standings].sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    return b.goalsFor - a.goalsFor;
  });

  // Group teams with same points and goal difference
  const groups = groupTeamsByTie(sorted);

  // Process each group with ties
  const processedStandings: TeamStanding[] = [];
  
  for (const group of groups) {
    if (group.length === 1) {
      // No tie, add as-is
      processedStandings.push(group[0]);
    } else if (group.length === 2) {
      // Two teams tied: Apply head-to-head
      const [teamA, teamB] = await resolveTwoTeamTie(
        group[0],
        group[1],
        seasonId
      );
      processedStandings.push(teamA, teamB);
    } else {
      // More than 2 teams tied: Mark for draw lots
      // In a full implementation, we could do mini-league calculations
      // For now, we'll keep goal-based order and flag them
      const sortedGroup = group.map(team => ({
        ...team,
        tieBreakInfo: {
          usedHeadToHead: false,
          drawLotsRequired: true,
          tieBreakNote: `${group.length} đội cùng điểm và hiệu số. Cần xử lý thủ công hoặc bốc thăm.`
        }
      }));
      processedStandings.push(...sortedGroup);
    }
  }

  return processedStandings;
}

/**
 * Group teams by points and goal difference
 */
function groupTeamsByTie(standings: TeamStanding[]): TeamStanding[][] {
  const groups: TeamStanding[][] = [];
  let currentGroup: TeamStanding[] = [];

  for (let i = 0; i < standings.length; i++) {
    const current = standings[i];
    
    if (currentGroup.length === 0) {
      currentGroup.push(current);
    } else {
      const prev = currentGroup[0];
      // Check if current team has same points AND goal difference as previous
      if (current.points === prev.points && current.goalDifference === prev.goalDifference) {
        currentGroup.push(current);
      } else {
        // Different points or goal difference, start new group
        groups.push(currentGroup);
        currentGroup = [current];
      }
    }
  }

  // Add last group
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Resolve tie between two teams using head-to-head record
 */
async function resolveTwoTeamTie(
  teamA: TeamStanding,
  teamB: TeamStanding,
  seasonId: number
): Promise<[TeamStanding, TeamStanding]> {
  console.log(
    `[resolveTwoTeamTie] Resolving tie between ${teamA.teamName} and ${teamB.teamName}`
  );

  // Get head-to-head matches between these two teams
  const h2hResult = await getHeadToHeadRecord(
    teamA.seasonTeamId,
    teamB.seasonTeamId,
    seasonId
  );

  const teamAGoals = h2hResult.teamAGoals;
  const teamBGoals = h2hResult.teamBGoals;

  console.log(
    `[resolveTwoTeamTie] H2H: ${teamA.teamName} ${teamAGoals} - ${teamBGoals} ${teamB.teamName}`
  );

  let firstTeam: TeamStanding;
  let secondTeam: TeamStanding;

  if (teamAGoals > teamBGoals) {
    // Team A wins head-to-head
    firstTeam = {
      ...teamA,
      tieBreakInfo: {
        usedHeadToHead: true,
        headToHeadRecords: [
          {
            opponentTeamId: teamB.teamId,
            opponentTeamName: teamB.teamName,
            teamGoals: teamAGoals,
            opponentGoals: teamBGoals,
          },
        ],
        tieBreakNote: `Xếp trên do tổng tỷ số đối đầu: ${teamAGoals}-${teamBGoals} vs ${teamB.teamName}`
      },
    };
    secondTeam = {
      ...teamB,
      tieBreakInfo: {
        usedHeadToHead: true,
        headToHeadRecords: [
          {
            opponentTeamId: teamA.teamId,
            opponentTeamName: teamA.teamName,
            teamGoals: teamBGoals,
            opponentGoals: teamAGoals,
          },
        ],
        tieBreakNote: `Xếp dưới do tổng tỷ số đối đầu: ${teamBGoals}-${teamAGoals} vs ${teamA.teamName}`
      },
    };
  } else if (teamBGoals > teamAGoals) {
    // Team B wins head-to-head
    firstTeam = {
      ...teamB,
      tieBreakInfo: {
        usedHeadToHead: true,
        headToHeadRecords: [
          {
            opponentTeamId: teamA.teamId,
            opponentTeamName: teamA.teamName,
            teamGoals: teamBGoals,
            opponentGoals: teamAGoals,
          },
        ],
        tieBreakNote: `Xếp trên do tổng tỷ số đối đầu: ${teamBGoals}-${teamAGoals} vs ${teamA.teamName}`
      },
    };
    secondTeam = {
      ...teamA,
      tieBreakInfo: {
        usedHeadToHead: true,
        headToHeadRecords: [
          {
            opponentTeamId: teamB.teamId,
            opponentTeamName: teamB.teamName,
            teamGoals: teamAGoals,
            opponentGoals: teamBGoals,
          },
        ],
        tieBreakNote: `Xếp dưới do tổng tỷ số đối đầu: ${teamAGoals}-${teamBGoals} vs ${teamB.teamName}`
      },
    };
  } else {
    // Still tied even after head-to-head -> draw lots required
    firstTeam = {
      ...teamA,
      tieBreakInfo: {
        usedHeadToHead: true,
        headToHeadRecords: [
          {
            opponentTeamId: teamB.teamId,
            opponentTeamName: teamB.teamName,
            teamGoals: teamAGoals,
            opponentGoals: teamBGoals,
          },
        ],
        drawLotsRequired: true,
        tieBreakNote: `Bằng cả tỷ số đối đầu với ${teamB.teamName}. Cần bốc thăm.`
      },
    };
    secondTeam = {
      ...teamB,
      tieBreakInfo: {
        usedHeadToHead: true,
        headToHeadRecords: [
          {
            opponentTeamId: teamA.teamId,
            opponentTeamName: teamA.teamName,
            teamGoals: teamBGoals,
            opponentGoals: teamAGoals,
          },
        ],
        drawLotsRequired: true,
        tieBreakNote: `Bằng cả tỷ số đối đầu với ${teamA.teamName}. Cần bốc thăm.`
      },
    };
  }

  return [firstTeam, secondTeam];
}

/**
 * Get head-to-head goal aggregate between two teams
 */
async function getHeadToHeadRecord(
  seasonTeamIdA: number,
  seasonTeamIdB: number,
  seasonId: number
): Promise<{ teamAGoals: number; teamBGoals: number }> {
  const result = await query<{
    team_a_goals: number;
    team_b_goals: number;
  }>(
    `
    SELECT 
      SUM(CASE 
        WHEN m.home_season_team_id = @teamA THEN m.home_score 
        WHEN m.away_season_team_id = @teamA THEN m.away_score 
        ELSE 0 
      END) AS team_a_goals,
      SUM(CASE 
        WHEN m.home_season_team_id = @teamB THEN m.home_score 
        WHEN m.away_season_team_id = @teamB THEN m.away_score 
        ELSE 0 
      END) AS team_b_goals
    FROM matches m
    WHERE m.season_id = @seasonId
      AND m.status = 'completed'
      AND m.home_score IS NOT NULL
      AND m.away_score IS NOT NULL
      AND (
        (m.home_season_team_id = @teamA AND m.away_season_team_id = @teamB)
        OR (m.home_season_team_id = @teamB AND m.away_season_team_id = @teamA)
      )
    `,
    {
      seasonId,
      teamA: seasonTeamIdA,
      teamB: seasonTeamIdB,
    }
  );

  const row = result.recordset[0];
  return {
    teamAGoals: row?.team_a_goals ?? 0,
    teamBGoals: row?.team_b_goals ?? 0,
  };
}
