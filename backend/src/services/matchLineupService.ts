import { query } from "../db/sqlServer";

export interface MatchLineup {
    matchLineupId: number;
    matchId: number;
    seasonId: number;
    seasonTeamId: number;
    playerId: number;
    jerseyNumber?: number;
    position?: string;
    isStarting: boolean;
    isCaptain: boolean;
    minutesPlayed?: number;
    status: string; // 'active', 'subbed_out', 'subbed_in', 'bench'
}

export const getMatchLineups = async (matchId: number): Promise<MatchLineup[]> => {
    const result = await query(
        `
      SELECT 
        match_lineup_id as matchLineupId,
        match_id as matchId,
        season_id as seasonId,
        season_team_id as seasonTeamId,
        player_id as playerId,
        jersey_number as jerseyNumber,
        position,
        is_starting as isStarting,
        is_captain as isCaptain,
        minutes_played as minutesPlayed,
        status
      FROM match_lineups
      WHERE match_id = @matchId
    `,
        { matchId }
    );
    return result.recordset;
};

export const upsertMatchLineup = async (input: Partial<MatchLineup>): Promise<void> => {
    // Check if player already in lineup for this match, then update, else insert.
    const checkSql = `SELECT match_lineup_id FROM match_lineups WHERE match_id = @matchId AND player_id = @playerId`;
    const existing = await query(checkSql, { matchId: input.matchId, playerId: input.playerId });

    if (existing.recordset.length > 0) {
        // Update
        await query(`
      UPDATE match_lineups
      SET 
        season_team_id = @seasonTeamId,
        jersey_number = @jerseyNumber,
        position = @position,
        is_starting = @isStarting,
        is_captain = @isCaptain,
        status = @status,
        updated_at = GETDATE()
      WHERE match_lineup_id = @id
    `, {
            id: existing.recordset[0].match_lineup_id,
            seasonTeamId: input.seasonTeamId,
            jerseyNumber: input.jerseyNumber,
            position: input.position,
            isStarting: input.isStarting,
            isCaptain: input.isCaptain,
            status: input.status
        });
    } else {
        // Insert
        await query(`
      INSERT INTO match_lineups (
        match_id, season_id, season_team_id, player_id, 
        jersey_number, position, is_starting, is_captain, status
      ) VALUES (
        @matchId, @seasonId, @seasonTeamId, @playerId,
        @jerseyNumber, @position, @isStarting, @isCaptain, @status
      )
    `, {
            matchId: input.matchId,
            seasonId: input.seasonId,
            seasonTeamId: input.seasonTeamId,
            playerId: input.playerId,
            jerseyNumber: input.jerseyNumber,
            position: input.position,
            isStarting: input.isStarting,
            isCaptain: input.isCaptain,
            status: input.status
        });
    }
};
