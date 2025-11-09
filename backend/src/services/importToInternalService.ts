import { query } from "../db/sqlServer";

/**
 * Import data from Football* tables to internal database
 * This allows you to use Champions League data in your internal tournament system
 */

interface ImportResult {
  success: boolean;
  message: string;
  imported: {
    seasons: number;
    teams: number;
    players: number;
    matches: number;
  };
  errors: string[];
}

/**
 * Import Football* data to internal database
 */
export const importCLDataToInternal = async (options: {
  seasonName?: string;
  tournamentCode?: string;
  createTournament?: boolean;
}): Promise<ImportResult> => {
  const result: ImportResult = {
    success: true,
    message: "",
    imported: {
      seasons: 0,
      teams: 0,
      players: 0,
      matches: 0,
    },
    errors: [],
  };

  try {
    const seasonName = options.seasonName || "Champions League 2024/2025";
    const tournamentCode = options.tournamentCode || "UCL_2024";

    // Step 1: Create/Get Tournament
    let tournamentId: number;
    if (options.createTournament) {
      const existingTournament = await query<{ tournament_id: number }>(
        "SELECT tournament_id FROM tournaments WHERE code = @code",
        { code: tournamentCode },
      );

      if (existingTournament.recordset.length > 0) {
        tournamentId = existingTournament.recordset[0].tournament_id;
      } else {
        const newTournament = await query<{ tournament_id: number }>(
          `
            INSERT INTO tournaments (code, name, description, organizer, founded_year, region, is_active)
            OUTPUT INSERTED.tournament_id
            VALUES (@code, @name, @description, @organizer, @foundedYear, @region, 1);
          `,
          {
            code: tournamentCode,
            name: "UEFA Champions League",
            description: "Imported from Football-Data.org",
            organizer: "UEFA",
            foundedYear: 1955,
            region: "Europe",
          },
        );
        tournamentId = newTournament.recordset[0].tournament_id;
      }
    } else {
      const existingTournament = await query<{ tournament_id: number }>(
        "SELECT TOP 1 tournament_id FROM tournaments ORDER BY tournament_id DESC",
      );
      if (existingTournament.recordset.length === 0) {
        throw new Error("No tournament found. Set createTournament = true");
      }
      tournamentId = existingTournament.recordset[0].tournament_id;
    }

    // Step 2: Import Teams from FootballTeams
    const footballTeams = await query<{
      external_id: number;
      name: string;
      short_name: string | null;
      country: string | null;
      founded: number | null;
    }>(
      `
        SELECT DISTINCT 
          external_id, 
          name, 
          short_name, 
          country, 
          founded
        FROM dbo.FootballTeams
        WHERE season IS NULL OR season = '2024-2025'
      `,
    );

    const teamMapping = new Map<number, number>(); // external_id -> internal team_id

    for (const fbTeam of footballTeams.recordset) {
      try {
        // Check if team exists
        const existingTeam = await query<{ team_id: number }>(
          "SELECT team_id FROM teams WHERE name = @name",
          { name: fbTeam.name },
        );

        let teamId: number;
        if (existingTeam.recordset.length > 0) {
          teamId = existingTeam.recordset[0].team_id;
        } else {
          // Insert new team
          // Validate founded_year: must be between 1900 and 2100, or set to 2000 as default
          let foundedYear = fbTeam.founded;
          if (!foundedYear || foundedYear < 1900 || foundedYear > 2100) {
            foundedYear = 2000; // Default value if invalid
          }

          const newTeam = await query<{ team_id: number }>(
            `
              INSERT INTO teams (name, short_name, code, country, founded_year, status)
              OUTPUT INSERTED.team_id
              VALUES (@name, @shortName, @code, @country, @founded, 'active');
            `,
            {
              name: fbTeam.name,
              shortName: fbTeam.short_name,
              code: fbTeam.short_name || fbTeam.name.substring(0, 3).toUpperCase(),
              country: fbTeam.country,
              founded: foundedYear,
            },
          );
          teamId = newTeam.recordset[0].team_id;
          result.imported.teams++;
        }
        teamMapping.set(fbTeam.external_id, teamId);
      } catch (error) {
        result.errors.push(`Failed to import team ${fbTeam.name}: ${error}`);
      }
    }

    console.log(`Imported ${result.imported.teams} teams, mapping size: ${teamMapping.size}`);

    // Step 3: Import Players from FootballPlayers
    const footballPlayers = await query<{
      external_id: number | null;
      name: string;
      position: string | null;
      nationality: string | null;
      date_of_birth: string | null;
      shirt_number: number | null;
      team_external_id: number;
    }>(
      `
        SELECT 
          external_id, 
          name, 
          position, 
          nationality, 
          date_of_birth, 
          shirt_number, 
          team_external_id
        FROM dbo.FootballPlayers
        WHERE season IS NULL OR season = '2024'
      `,
    );

    for (const fbPlayer of footballPlayers.recordset) {
      try {
        const teamId = teamMapping.get(fbPlayer.team_external_id);
        if (!teamId) continue; // Skip if team not imported

        // Check if player exists
        const existingPlayer = await query<{ player_id: number }>(
          "SELECT player_id FROM players WHERE full_name = @name AND date_of_birth = @dob",
          {
            name: fbPlayer.name,
            dob: fbPlayer.date_of_birth || "2000-01-01",
          },
        );

        if (existingPlayer.recordset.length === 0) {
          await query(
            `
              INSERT INTO players (
                full_name, 
                display_name, 
                date_of_birth, 
                nationality, 
                preferred_position, 
                current_team_id
              )
              VALUES (@fullName, @displayName, @dob, @nationality, @position, @teamId);
            `,
            {
              fullName: fbPlayer.name,
              displayName: fbPlayer.name,
              dob: fbPlayer.date_of_birth || "2000-01-01",
              nationality: fbPlayer.nationality || "Unknown",
              position: fbPlayer.position,
              teamId,
            },
          );
          result.imported.players++;
        }
      } catch (error) {
        result.errors.push(`Failed to import player ${fbPlayer.name}: ${error}`);
      }
    }

    console.log(`Imported ${result.imported.players} players`);

    result.message = `Successfully imported ${result.imported.teams} teams and ${result.imported.players} players`;
    result.success = result.errors.length === 0;

    return result;
  } catch (error) {
    result.success = false;
    result.message = `Import failed: ${error}`;
    result.errors.push(String(error));
    return result;
  }
};

/**
 * Clear all imported data (for testing)
 */
export const clearImportedData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Note: Be careful with this! It will delete data
    await query("DELETE FROM players WHERE full_name LIKE '%imported%' OR nationality = 'Unknown'");
    await query("DELETE FROM teams WHERE code LIKE 'UCL%'");

    return {
      success: true,
      message: "Cleared imported data successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to clear: ${error}`,
    };
  }
};

