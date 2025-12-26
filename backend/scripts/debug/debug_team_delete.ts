import { query } from "../../src/db/sqlServer";

const deleteTeamDebug = async (id) => {
    console.log(`Attempting to delete team ${id}...`);
    try {
        // Try to replicate the delete logic step by step to see where it fails

        // 1. Match Details
        console.log("Deleting Match Details...");
        await query(`DELETE FROM match_events WHERE match_id IN (SELECT match_id FROM matches WHERE home_team_id = @id OR away_team_id = @id)`, { id });
        await query(`DELETE FROM match_mvps WHERE match_id IN (SELECT match_id FROM matches WHERE home_team_id = @id OR away_team_id = @id)`, { id });
        await query(`DELETE FROM match_team_statistics WHERE match_id IN (SELECT match_id FROM matches WHERE home_team_id = @id OR away_team_id = @id)`, { id });
        await query(`DELETE FROM match_audit_logs WHERE match_id IN (SELECT match_id FROM matches WHERE home_team_id = @id OR away_team_id = @id)`, { id });

        // 2. Matches
        console.log("Deleting Matches...");
        await query("DELETE FROM matches WHERE home_team_id = @id OR away_team_id = @id;", { id });

        // 3. Season Data
        console.log("Deleting Season Data...");
        await query(`DELETE FROM season_team_statistics WHERE season_team_id IN (SELECT season_team_id FROM season_team_participants WHERE team_id = @id)`, { id });
        await query(`DELETE FROM season_player_registrations WHERE season_team_id IN (SELECT season_team_id FROM season_team_participants WHERE team_id = @id)`, { id });

        // 4. Season Participants
        console.log("Deleting Season Participants...");
        await query("DELETE FROM season_team_participants WHERE team_id = @id;", { id });

        // 5. Players
        console.log("Deleting Players...");
        await query("DELETE FROM FootballPlayers WHERE team_id = @id;", { id });

        // 6. Competitions
        console.log("Deleting Competitions...");
        await query("DELETE FROM dbo.FootballTeamCompetitions WHERE team_id = @id;", { id });

        // 7. Team
        console.log("Deleting Team...");
        await query("DELETE FROM dbo.FootballTeams WHERE id = @id;", { id });

        console.log("Delete successful!");
    } catch (err) {
        console.error("DELETE FAILED!");
        console.error("Error Number:", err.number);
        console.error("Message:", err.message);
        if (err.originalError) {
            console.error("Original Error info:", err.originalError.info);
        }
    }
};

// id 34 as requested by user
deleteTeamDebug(34).then(() => process.exit());
