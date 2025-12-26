import { query } from "./src/db/sqlServer";

const checkColumns = async () => {
    try {
        const sql = `
            SELECT 
                t.name AS TableName,
                c.name AS ColumnName
            FROM sys.columns c
            INNER JOIN sys.tables t ON c.object_id = t.object_id
            WHERE t.name IN (
                'match_official_assignments',
                'match_reports',
                'player_match_stats',
                'season_team_registrations',
                'season_invitations',
                'team_kits',
                'match_lineup_players'
            )
            AND (c.name = 'team_id' OR c.name = 'season_team_id' OR c.name = 'match_id')
            ORDER BY t.name, c.name;
        `;
        const result = await query(sql);
        console.table(result.recordset);
    } catch (err) {
        console.error(err);
    }
};

checkColumns().then(() => process.exit());
