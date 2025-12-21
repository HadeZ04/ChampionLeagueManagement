import { query } from "../db/sqlServer";

export interface CreatePlayerDto {
    full_name: string;
    date_of_birth: string;
    nationality?: string;
    preferred_position?: string;
}

export interface Player {
    player_id: number;
    full_name: string;
    date_of_birth: string;
    nationality: string | null;
    preferred_position: string | null;
    created_at?: string;
}

/**
 * Create a new player in the internal database
 */
export const createPlayer = async (data: CreatePlayerDto): Promise<Player> => {
    const { full_name, date_of_birth, nationality, preferred_position } = data;

    // Insert into players table
    // Note: relying on DB default for created_at if it exists, or ignoring it if not strictly required by schema logic visible so far.
    // Based on existing code, we insert basic fields.

    const result = await query<{ player_id: number }>(
        `
      INSERT INTO players (
        full_name,
        display_name,
        date_of_birth,
        nationality,
        preferred_position
      )
      VALUES (
        @full_name,
        @full_name, -- Default display_name to full_name
        @date_of_birth,
        @nationality,
        @preferred_position
      );
      
      SELECT SCOPE_IDENTITY() as player_id;
    `,
        {
            full_name: full_name.trim(),
            date_of_birth,
            nationality: nationality ? nationality.trim() : null,
            preferred_position: preferred_position ? preferred_position.trim() : null
        }
    );

    const playerId = result.recordset[0]?.player_id;

    if (!playerId) {
        throw new Error("Failed to create player");
    }

    return {
        player_id: playerId,
        full_name: full_name.trim(),
        date_of_birth,
        nationality: nationality || null,
        preferred_position: preferred_position || null
    };
};
