import { query } from "../db/sqlServer";

export interface MatchEvent {
    matchEventId: number;
    matchId: number;
    seasonId: number;
    seasonTeamId: number;
    type: 'GOAL' | 'ASSIST' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'OWN_GOAL' | 'PENALTY_MISS' | 'OTHER';
    minute: number;
    description?: string;
    playerId?: number;
    assistPlayerId?: number;
    inPlayerId?: number; // For substitutions
    outPlayerId?: number; // For substitutions
    createdAt: string;
}

export const getMatchEvents = async (matchId: number): Promise<MatchEvent[]> => {
    const result = await query(
        `
      SELECT 
        match_event_id as matchEventId,
        match_id as matchId,
        season_id as seasonId,
        season_team_id as seasonTeamId,
        type,
        minute,
        description,
        player_id as playerId,
        assist_player_id as assistPlayerId,
        in_player_id as inPlayerId,
        out_player_id as outPlayerId,
        created_at as createdAt
      FROM match_events
      WHERE match_id = @matchId
      ORDER BY minute ASC, created_at ASC
    `,
        { matchId }
    );
    return result.recordset;
};

export const createMatchEvent = async (input: Partial<MatchEvent>): Promise<MatchEvent> => {
    // Logic to insert generic event
    // Note: Detailed goal score updating should technically happen here or trigger match update
    // For now, basic insert
    const querySql = `
    INSERT INTO match_events (
      match_id, season_id, season_team_id, type, minute, description, 
      player_id, assist_player_id, in_player_id, out_player_id
    )
    OUTPUT INSERTED.match_event_id
    VALUES (
      @matchId, @seasonId, @seasonTeamId, @type, @minute, @description,
      @playerId, @assistPlayerId, @inPlayerId, @outPlayerId
    );
  `;

    const result = await query(querySql, {
        matchId: input.matchId,
        seasonId: input.seasonId,
        seasonTeamId: input.seasonTeamId,
        type: input.type,
        minute: input.minute,
        description: input.description,
        playerId: input.playerId,
        assistPlayerId: input.assistPlayerId,
        inPlayerId: input.inPlayerId,
        outPlayerId: input.outPlayerId
    });

    const id = result.recordset[0].match_event_id;
    return { ...input, matchEventId: id } as MatchEvent;
};

export const deleteMatchEvent = async (eventId: number): Promise<boolean> => {
    const result = await query("DELETE FROM match_events WHERE match_event_id = @eventId", { eventId });
    return (result.rowsAffected?.[0] ?? 0) > 0;
};
