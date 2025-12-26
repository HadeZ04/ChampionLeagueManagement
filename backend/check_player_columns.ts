import { query } from "./src/db/sqlServer";
import * as fs from 'fs';

const checkPlayerColumns = async () => {
    try {
        const sql = `
            SELECT 
                t.name AS TableName,
                c.name AS ColumnName
            FROM sys.columns c
            INNER JOIN sys.tables t ON c.object_id = t.object_id
            WHERE t.name IN (
                'FootballPlayers',
                'FootballTeamCompetitions'
            )
            ORDER BY t.name, c.name;
        `;
        const result = await query(sql);
        fs.writeFileSync('player_columns.json', JSON.stringify(result.recordset, null, 2), 'utf8');
        console.log("File written.");
    } catch (err) {
        console.error(err);
    }
};

checkPlayerColumns().then(() => process.exit());
