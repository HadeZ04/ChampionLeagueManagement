import { query } from "../db/sqlServer";

/**
 * Validate lineup - ensure max 3 foreign players on field
 */
export async function validateLineup(
  matchId: number,
  teamId: number,
  lineup: Array<{ playerId: number; position: string; isOnField: boolean }>
): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // Get foreign players in lineup
  const onFieldPlayers = lineup.filter((p) => p.isOnField);
  const playerIds = onFieldPlayers.map((p) => p.playerId);

  if (playerIds.length === 0) {
    errors.push("Lineup must have at least one player on field");
    return { isValid: false, errors };
  }

  // Check for foreign players
  const result = await query<{ foreign_count: number }>(
    `
    SELECT COUNT(*) as foreign_count
    FROM players
    WHERE player_id IN (${playerIds.join(",")})
    AND is_foreign = 1
  `,
    {}
  );

  const foreignCount = result.recordset[0]?.foreign_count || 0;
  if (foreignCount > 3) {
    errors.push(
      `Maximum 3 foreign players allowed on field. Found: ${foreignCount}`
    );
  }

  // Check for banned/suspended players
  const bannedResult = await query<{
    player_id: number;
    player_name: string;
  }>(
    `
    SELECT DISTINCT p.player_id, p.name as player_name
    FROM players p
    WHERE p.player_id IN (${playerIds.join(",")})
    AND (
      SELECT COUNT(*)
      FROM yellow_cards yc
      WHERE yc.player_id = p.player_id
      AND yc.match_id IN (
        SELECT match_id FROM matches
        WHERE season_id = (SELECT season_id FROM matches WHERE match_id = @matchId)
        AND match_date < (SELECT match_date FROM matches WHERE match_id = @matchId)
      )
    ) >= 2
    OR (
      SELECT COUNT(*)
      FROM red_cards rc
      WHERE rc.player_id = p.player_id
      AND rc.match_id IN (
        SELECT match_id FROM matches
        WHERE season_id = (SELECT season_id FROM matches WHERE match_id = @matchId)
        AND match_date < (SELECT match_date FROM matches WHERE match_id = @matchId)
      )
    ) > 0
  `,
    { matchId }
  );

  for (const player of bannedResult.recordset) {
    errors.push(`Player ${player.player_name} is banned due to disciplinary actions`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get suspended/banned players for a match
 */
export async function getSuspendedPlayersForMatch(
  matchId: number
): Promise<
  Array<{
    player_id: number;
    player_name: string;
    reason: string;
    suspension_matches: number;
  }>
> {
  const result = await query(
    `
    SELECT DISTINCT
      p.player_id,
      p.name as player_name,
      CASE
        WHEN (SELECT COUNT(*) FROM red_cards rc WHERE rc.player_id = p.player_id AND rc.match_id < @matchId) > 0
        THEN 'Red card suspension'
        WHEN (SELECT COUNT(*) FROM yellow_cards yc WHERE yc.player_id = p.player_id AND yc.match_id < @matchId) >= 2
        THEN 'Two yellow cards suspension'
        ELSE 'Unknown'
      END as reason,
      CASE
        WHEN (SELECT COUNT(*) FROM red_cards rc WHERE rc.player_id = p.player_id AND rc.match_id < @matchId) > 0
        THEN 1
        ELSE 0
      END as suspension_matches
    FROM players p
    WHERE (SELECT COUNT(*) FROM red_cards rc WHERE rc.player_id = p.player_id) > 0
    OR (SELECT COUNT(*) FROM yellow_cards yc WHERE yc.player_id = p.player_id) >= 2
  `,
    { matchId }
  );

  return result.recordset;
}

/**
 * Get foreign player count for team in match
 */
export async function getForeignPlayerCount(
  matchId: number,
  teamId: number,
  lineupPlayerIds: number[]
): Promise<number> {
  if (lineupPlayerIds.length === 0) return 0;

  const result = await query<{ count: number }>(
    `
    SELECT COUNT(*) as count
    FROM players
    WHERE player_id IN (${lineupPlayerIds.join(",")})
    AND team_id = @teamId
    AND is_foreign = 1
  `,
    { teamId }
  );

  return result.recordset[0]?.count || 0;
}
