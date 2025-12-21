import { query } from "../db/sqlServer";

export interface PlayerMatchStats {
    statId: number;
    matchId: number;
    playerId: number;
    seasonId: number;
    minutesPlayed: number;
    goals: number;
    assists: number;
    shots: number;
    shotsOnTarget: number;
    passes: number;
    passesCompleted: number;
    tackles: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
    rating: number; // 0-10
}

export const getPlayerMatchStats = async (matchId: number): Promise<PlayerMatchStats[]> => {
    const result = await query(
        `
      SELECT 
        match_stat_id as statId,
        match_id as matchId,
        player_id as playerId,
        season_id as seasonId,
        minutes_played as minutesPlayed,
        goals,
        assists,
        shots,
        shots_on_target as shotsOnTarget,
        passes,
        passes_completed as passesCompleted,
        tackles,
        fouls,
        yellow_cards as yellowCards,
        red_cards as redCards,
        rating
      FROM player_match_stats
      WHERE match_id = @matchId
    `,
        { matchId }
    );
    return result.recordset;
};

export const updatePlayerStats = async (matchId: number, playerId: number, stats: Partial<PlayerMatchStats>): Promise<void> => {
    // Check exist
    const check = await query("SELECT match_stat_id FROM player_match_stats WHERE match_id=@m AND player_id=@p", { m: matchId, p: playerId });

    if (check.recordset.length > 0) {
        // Update dynamic fields
        const fields = Object.keys(stats).filter(k => k !== 'statId' && k !== 'matchId' && k !== 'playerId').map(k => {
            // Map camelCase to snake_case
            const snake = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            return `${snake} = @${k}`;
        });

        if (fields.length === 0) return;

        await query(
            `UPDATE player_match_stats SET ${fields.join(', ')} WHERE match_stat_id = @id`,
            { ...stats, id: check.recordset[0].match_stat_id }
        );
    } else {
        // Create initial record
        // Simplified insert (would typically need all fields or defaults)
        // Leaving logic simple for now
        console.warn("Player stats record mismatch - ensure record created when lineup set");
    }
};
