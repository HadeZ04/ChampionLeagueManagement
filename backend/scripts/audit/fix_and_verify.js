const { query } = require('./src/db/sqlServer');

async function fixAndVerify() {
    try {
        // 1. Find the match
        console.log("Looking for match Liverpool vs Qarabağ...");
        const matchResult = await query(`
      SELECT m.match_id, m.home_score, m.away_score, m.home_season_team_id
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
        console.log(`[BEFORE] Match ID: ${match.match_id}, Score: ${match.home_score}-${match.away_score}`);

        // 2. Count valid goals (GOAL only, excluding disallowed which are type OTHER)
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

        console.log(`[CALC] Calculated Score: ${calculatedHomeScore}-${calculatedAwayScore}`);

        // 3. Update
        if (match.home_score !== calculatedHomeScore || match.away_score !== calculatedAwayScore) {
            console.log("Updating score in DB...");
            await query(`
        UPDATE matches 
        SET home_score = @homeScore, away_score = @awayScore, updated_at = SYSUTCDATETIME()
        WHERE match_id = @matchId
      `, {
                matchId: match.match_id,
                homeScore: calculatedHomeScore,
                awayScore: calculatedAwayScore
            });
            console.log("Update executed.");
        } else {
            console.log("Score is already consistent.");
        }

        // 4. Verify Immediate State
        const verifyResult = await query(`
      SELECT home_score, away_score FROM matches WHERE match_id = @matchId
    `, { matchId: match.match_id });
        const verified = verifyResult.recordset[0];
        console.log(`[AFTER] Score in DB: ${verified.home_score}-${verified.away_score}`);

    } catch (err) {
        console.error("Error:", err);
    }
}

fixAndVerify();
