import { query } from "../../src/db/sqlServer";
import * as fs from 'fs';

const listTeamsFks = async () => {
    try {
        const sql = `
            SELECT 
                fk.name AS ForeignKeyName,
                OBJECT_NAME(fk.parent_object_id) AS ParentTable,
                OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
                c.name AS ParentColumn
            FROM sys.foreign_keys fk
            INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
            INNER JOIN sys.columns c ON fkc.parent_column_id = c.column_id AND fkc.parent_object_id = c.object_id
            WHERE OBJECT_NAME(fk.referenced_object_id) = 'teams'
            ORDER BY ParentTable;
        `;
        const result = await query(sql);
        fs.writeFileSync('fks_teams.json', JSON.stringify(result.recordset, null, 2), 'utf8');
        console.log("Teams FKs written.");
    } catch (err) {
        console.error(err);
    }
};

listTeamsFks().then(() => process.exit());
