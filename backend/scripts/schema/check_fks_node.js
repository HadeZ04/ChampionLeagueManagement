const { sql, poolPromise } = require('./src/config/db');

async function checkFks() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
      SELECT 
        f.name AS ForeignKey,
        OBJECT_NAME(f.parent_object_id) AS TableName,
        COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
        OBJECT_NAME (f.referenced_object_id) AS ReferenceTableName,
        COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferenceColumnName
      FROM 
        sys.foreign_keys AS f
      INNER JOIN 
        sys.foreign_key_columns AS fc ON f.object_id = fc.constraint_object_id
      WHERE 
        OBJECT_NAME(f.referenced_object_id) = 'FootballTeams';
    `);

        console.log("Foreign Keys referencing FootballTeams:");
        console.table(result.recordset);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkFks();
