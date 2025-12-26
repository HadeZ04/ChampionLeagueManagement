import { query } from './src/db/sqlServer';

async function checkTeamDependencies(teamId: number) {
    try {
        console.log(`Checking dependencies for Team ID: ${teamId}`);

        const activeSeasons = await query<{ count: number }>(
            "SELECT COUNT(1) as count FROM season_team_participants WHERE team_id = @id",
            { id: teamId }
        );

        const activeMatches = await query<{ count: number }>(
            "SELECT COUNT(1) as count FROM dbo.Matches WHERE home_team_id = @id OR away_team_id = @id",
            { id: teamId }
        );

        const activePlayers = await query<{ count: number }>(
            "SELECT COUNT(1) as count FROM dbo.FootballPlayers WHERE team_id = @id",
            { id: teamId }
        );

        console.log('--- Dependency Report ---');
        console.log(`Season Registrations: ${activeSeasons.recordset[0]?.count ?? 0}`);
        console.log(`Matches: ${activeMatches.recordset[0]?.count ?? 0}`);
        console.log(`Players: ${activePlayers.recordset[0]?.count ?? 0}`);
        console.log('-------------------------');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkTeamDependencies(34);
