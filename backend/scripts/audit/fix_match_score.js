const { query } = require('./src/db/sqlServer');

async function fixScore() {
    try {
        // 1. Find the match
        const matchResult = await query(`
      SELECT m.match_id, m.home_score, m.away_score, m.home_season_team_id, m.away_season_team_id
      FROM matches m
      JOIN season_team_participants hstp ON m.home_season_team_id = hstp.season_team_id
      JOIN teams ht ON hstp.team_id = ht.team_id
      JOIN season_team_participants astp ON m.away_season_team_id = astp.season_team_id
      JOIN teams at ON astp.team_id = at.team_id
      WHERE ht.name LIKE '%Liverpool%' AND at.name LIKE '%Qaraba%'
    `);

        if (matchResult.recordset.length === 0) {
            console.log("Match not found!");
            return;
        }

        const match = matchResult.recordset[0];
        console.log("Found match:", match);

        // 2. Count valid goals
        const eventsResult = await query(`
      SELECT event_type, season_team_id
      FROM match_events
      WHERE match_id = @matchId AND (event_type = 'GOAL' OR event_type = 'OWN_GOAL')
    `, { matchId: match.match_id });

        let calculatedHomeScore = 0;
        let calculatedAwayScore = 0;

        eventsResult.recordset.forEach(event => {
            const isHome = event.season_team_id === match.home_season_team_id;
            if (event.event_type === 'GOAL') {
                if (isHome) calculatedHomeScore++; else calculatedAwayScore++;
            } else if (event.event_type === 'OWN_GOAL') {
                if (isHome) calculatedAwayScore++; else calculatedHomeScore++;
            }
        });

        console.log(`Current DB Score: ${match.home_score}-${match.away_score}`);
        console.log(`Calculated Score: ${calculatedHomeScore}-${calculatedAwayScore}`);

        // 3. Update if different
        if (match.home_score !== calculatedHomeScore || match.away_score !== calculatedAwayScore) {
            console.log("Updating score...");
            await query(`
        UPDATE matches 
        SET home_score = @homeScore, away_score = @awayScore, updated_at = SYSUTCDATETIME()
        WHERE match_id = @matchId
      `, {
                matchId: match.match_id,
                homeScore: calculatedHomeScore,
                awayScore: calculatedAwayScore
            });
            console.log("Score updated successfully!");
        } else {
            console.log("Score is already correct.");
        }

    } catch (err) {
        console.error(err);
    }
}

fixScore();
