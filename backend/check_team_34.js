const { sql, poolPromise } = require('./src/config/db');

async function checkTeamDependencies(teamId) {
    try {
        const pool = await poolPromise;
        console.log(`Checking dependencies for Team ID: ${teamId}`);

        const activeSeasons = await pool.request()
            .input('id', sql.Int, teamId)
            .query("SELECT COUNT(1) as count FROM season_team_participants WHERE team_id = @id");

        const activeMatches = await pool.request()
            .input('id', sql.Int, teamId)
            .query("SELECT COUNT(1) as count FROM dbo.Matches WHERE home_team_id = @id OR away_team_id = @id");

        const activePlayers = await pool.request()
            .input('id', sql.Int, teamId)
            .query("SELECT COUNT(1) as count FROM dbo.FootballPlayers WHERE team_id = @id");

        console.log({
            seasonRegistrations: activeSeasons.recordset[0].count,
            matches: activeMatches.recordset[0].count,
            players: activePlayers.recordset[0].count
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkTeamDependencies(34);
