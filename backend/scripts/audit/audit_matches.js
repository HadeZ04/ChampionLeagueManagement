const { query } = require('./src/db/sqlServer');

async function auditAllMatches() {
    try {
        console.log("Starting full database score audit...");

        // 1. Get all matches with their stored scores
        const matchesResult = await query(`
      SELECT match_id, home_score, away_score, 
             home_season_team_id, away_season_team_id
      FROM matches
    `); // Simple query, no joins needed for core logic logic, but maybe useful for logging names

        // 2. Get all valid goal events
        const eventsResult = await query(`
      SELECT match_id, event_type, season_team_id
      FROM match_events
      WHERE event_type IN ('GOAL', 'OWN_GOAL')
    `);

        const validGoals = eventsResult.recordset;
        const matches = matchesResult.recordset;

        let discrepancyCount = 0;
        const updates = [];

        console.log(`Auditing ${matches.length} matches...`);

        for (const match of matches) {
            // Calculate score from events
            let calcHome = 0;
            let calcAway = 0;

            const matchEvents = validGoals.filter(e => e.match_id === match.match_id);

            for (const event of matchEvents) {
                const isHome = event.season_team_id === match.home_season_team_id;
                if (event.event_type === 'GOAL') {
                    if (isHome) calcHome++; else calcAway++;
                } else if (event.event_type === 'OWN_GOAL') {
                    if (isHome) calcAway++; else calcHome++;
                }
            }

            // Compare
            // stored scores might be null, treat as 0 for comparison
            const storedHome = match.home_score || 0;
            const storedAway = match.away_score || 0;

            if (storedHome !== calcHome || storedAway !== calcAway) {
                console.log(`[MISMATCH] Match ${match.match_id}: Stored (${storedHome}-${storedAway}) vs Calc (${calcHome}-${calcAway})`);
                discrepancyCount++;
                updates.push({
                    matchId: match.match_id,
                    homeScore: calcHome,
                    awayScore: calcAway
                });
            }
        }

        if (discrepancyCount === 0) {
            console.log("✅ All matches are consistent!");
        } else {
            console.log(`⚠️ Found ${discrepancyCount} matches with incorrect scores.`);

            // Auto-fix
            console.log("Applying fixes...");
            for (const update of updates) {
                await query(`
          UPDATE matches 
          SET home_score = @homeScore, away_score = @awayScore, updated_at = SYSUTCDATETIME()
          WHERE match_id = @matchId
        `, update);
            }
            console.log("✅ All discrepancies fixed.");
        }

    } catch (err) {
        console.error("Audit failed:", err);
    }
}

auditAllMatches();
