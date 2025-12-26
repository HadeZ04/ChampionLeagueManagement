import { query } from "../../src/db/sqlServer";
import * as fs from 'fs';

const listDeepFks = async () => {
    try {
        const sql = `
            SELECT 
                fk.name AS ForeignKeyName,
                OBJECT_NAME(fk.parent_object_id) AS ParentTable,
                OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable
            FROM sys.foreign_keys fk
            WHERE OBJECT_NAME(fk.referenced_object_id) IN (
                'match_lineups',
                'match_events',
                'match_reports',
                'match_official_assignments',
                'player_match_stats',
                'season_player_registrations'
            )
            ORDER BY ReferencedTable, ParentTable;
        `;
        const result = await query(sql);
        fs.writeFileSync('fks_deep_clean.json', JSON.stringify(result.recordset, null, 2), 'utf8');
        console.log("Deep FKs written.");
    } catch (err) {
        console.error(err);
    }
};

listDeepFks().then(() => process.exit());
