import { query } from "./src/db/sqlServer";
import * as fs from 'fs';

const checkLineupColumns = async () => {
    try {
        const sql = `
            SELECT 
                t.name AS TableName,
                c.name AS ColumnName
            FROM sys.columns c
            INNER JOIN sys.tables t ON c.object_id = t.object_id
            WHERE t.name IN (
                'match_lineups',
                'match_lineup_players'
            )
            ORDER BY t.name, c.name;
        `;
        const result = await query(sql);
        fs.writeFileSync('lineup_columns.json', JSON.stringify(result.recordset, null, 2), 'utf8');
        console.log("File written.");
    } catch (err) {
        console.error(err);
    }
};

checkLineupColumns().then(() => process.exit());
