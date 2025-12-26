import { query } from "./src/db/sqlServer";

const listAllFks = async () => {
    try {
        const sql = `
            SELECT 
                fk.name AS ForeignKeyName,
                OBJECT_NAME(fk.parent_object_id) AS ParentTable,
                OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
                c_parent.name AS ParentColumn
            FROM sys.foreign_keys fk
            INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
            INNER JOIN sys.columns c_parent ON fkc.parent_column_id = c_parent.column_id AND fkc.parent_object_id = c_parent.object_id
            WHERE OBJECT_NAME(fk.referenced_object_id) IN (
                'FootballTeams', 
                'season_team_participants', 
                'FootballPlayers', 
                'matches',
                'seasons'
            )
            ORDER BY ReferencedTable, ParentTable;
        `;
        const result = await query(sql);
        console.log("JSON_START");
        console.log(JSON.stringify(result.recordset, null, 2));
        console.log("JSON_END");
    } catch (err) {
        console.error(err);
    }
};

listAllFks().then(() => process.exit());
