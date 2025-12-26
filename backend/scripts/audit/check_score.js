const { query } = require('./src/db/sqlServer');

async function checkScore() {
    try {
        const result = await query(`
      SELECT m.match_id, m.home_score, m.away_score, m.status, ht.name as home_team, at.name as away_team 
      FROM matches m
      JOIN season_team_participants hstp ON m.home_season_team_id = hstp.season_team_id
      JOIN teams ht ON hstp.team_id = ht.team_id
      JOIN season_team_participants astp ON m.away_season_team_id = astp.season_team_id
      JOIN teams at ON astp.team_id = at.team_id
      WHERE ht.name LIKE '%Liverpool%' AND at.name LIKE '%Qaraba%'
    `);
        console.log(result.recordset);
    } catch (err) {
        console.error(err);
    }
}

checkScore();
